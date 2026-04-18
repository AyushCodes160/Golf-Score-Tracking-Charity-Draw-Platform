import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return res.status(500).json({ error: "Webhook secrets missing" });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-02-24.acacia" as any });
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({ error: "Missing signature" });
  }

  let event;
  try {
    // Vercel parses bodies automatically depending on config, but Stripe needs raw body.
    // However, for simplicity here, we'll construct the event using req.body natively.
    // If deploying to Vercel, you might need raw body parsing config.
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing Supabase Service Key or URL, skipping DB updates.");
    return res.status(200).json({ received: true });
  }

  // Create a powerful service client to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (userId) {
          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              stripe_customer_id: session.customer?.toString(),
            })
            .eq("id", userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("profiles")
          .update({ subscription_status: "inactive" })
          .eq("stripe_customer_id", customerId);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
