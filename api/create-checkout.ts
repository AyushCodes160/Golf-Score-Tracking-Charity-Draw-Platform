import Stripe from "stripe";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(500).json({ error: "Stripe is not configured in the backend yet." });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2025-02-24.acacia" as any, 
  });

  const body = req.body || {};
  const { priceId, userId, email } = typeof body === 'string' ? JSON.parse(body) : body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_SITE_URL || req.headers.origin || 'http://localhost:8080'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_SITE_URL || req.headers.origin || 'http://localhost:8080'}/pricing`,
      customer_email: email,
      metadata: {
        user_id: userId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Failed to formulate checkout session." });
  }
}
