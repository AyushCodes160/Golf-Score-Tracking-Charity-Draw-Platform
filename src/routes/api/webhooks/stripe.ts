import { createAPIFileRoute } from "@tanstack/react-start/api";
import Stripe from "stripe";
import { supabase } from "../../../lib/supabase"; // We'll need a service role client here ultimately

export const APIRoute = createAPIFileRoute("/api/webhooks/stripe")({
  POST: async ({ request }) => {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecret || !webhookSecret) {
      return new Response("Webhook secrets missing", { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-02-24.acacia" });

    // The signature comes from Stripe and proves the event was sent by them
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    let event;
    try {
      const body = await request.text();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.user_id;
          
          if (userId) {
            // NOTE: In production, ideally use the Supabase Service Role Key here to bypass RLS
            await supabase
              .from("profiles")
              .update({ 
                subscription_status: "active",
                stripe_customer_id: session.customer?.toString()
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
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Webhook handler failed", { status: 500 });
    }
  },
});
