import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";


export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Fairway & Cause" },
      {
        name: "description",
        content:
          "Monthly or yearly membership. Every subscription funds the prize pool and your chosen charity. See the exact split.",
      },
      { property: "og:title", content: "Pricing — Fairway & Cause" },
      {
        property: "og:description",
        content:
          "₹900/mo or ₹9,000/yr. 10% minimum to charity. Full breakdown of where every rupee goes.",
      },
    ],
  }),
  component: PricingPage,
});

const split = [
  { label: "5-match jackpot (rolls over)", pct: "40%" },
  { label: "4-match tier", pct: "35%" },
  { label: "3-match tier", pct: "25%" },
];

function PricingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      // Unauthenticated users must log in first
      navigate({ to: "/login" });
      return;
    }

    setLoadingPlan(plan);
    try {
      // Ideally these Price IDs come from your .env as written in the task plan
      const priceId = plan === "monthly" 
        ? import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || "price_monthly_placeholder"
        : import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || "price_yearly_placeholder";

      // Call the newly created backend endpoint
      const resp = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email })
      });
      
      if (!resp.ok) {
         throw new Error("Formulate checkout failed");
      }
      const result = await resp.json();

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Reminder: You need to put your actual Stripe Price IDs in the .env file.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const features = [
    "Stableford score tracking",
    "Automatic monthly draw entry",
    "Choose & change your charity anytime",
    "Minimum 10% to charity — up to 100%",
    "Signed monthly receipts",
  ];

  return (
    <>
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-12 pt-32 md:pt-40">
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
          <span className="h-px w-8 bg-primary/40" />
          Membership
        </span>
        <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl font-extrabold leading-[1.05] text-white md:text-6xl">
          Two plans.{" "}
          <span className="text-gradient-green">One promise:</span>{" "}
          <span className="text-white/60">at least 10% to charity.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/40">
          No tiers, no feature gates. Every member gets the full experience. The only
          difference is how often you&rsquo;d like to be billed — and how much you&rsquo;d
          like to save.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly */}
          <article className="glass-card glass-card-hover flex flex-col rounded-3xl p-8 md:p-10 transition-all duration-500">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/30">
              Monthly
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-6xl font-extrabold text-white">₹900</span>
              <span className="text-sm text-white/30">/ month</span>
            </div>
            <p className="mt-4 text-sm text-white/40">
              Cancel any time. Full access to scoring, monthly draws, and charity
              allocation.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-white/60">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loadingPlan === "monthly"}
              className="mt-10 inline-flex h-13 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition-all duration-300 hover:border-primary/30 hover:bg-white/10 disabled:opacity-50"
            >
              {loadingPlan === "monthly" ? "Processing..." : "Start monthly"}
            </button>
          </article>

          {/* Yearly */}
          <article className="relative flex flex-col rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-10 transition-all duration-500 hover:border-primary/30 glow-green-sm">
            <span className="absolute right-6 top-6 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-[#070707]">
              Save ₹1,800
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/60">
              Yearly
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-6xl font-extrabold text-white">₹9,000</span>
              <span className="text-sm text-white/30">/ year</span>
            </div>
            <p className="mt-4 text-sm text-white/40">
              ₹750/mo billed annually. Two months on us. Everything in monthly,
              plus a founder&rsquo;s mark on your profile.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Everything in monthly",
                "Two months free",
                "Founder's mark (first 500 members)",
                "Early access to new partner charities",
                "Annual impact statement",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-white/60">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loadingPlan === "yearly"}
              className="btn-green-gradient mt-10 inline-flex h-13 items-center justify-center rounded-2xl text-sm font-bold disabled:opacity-50"
            >
              {loadingPlan === "yearly" ? "Processing..." : "Start yearly"}
            </button>
          </article>
        </div>
      </section>

      {/* Split breakdown */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-28">
        <div className="grid gap-12 border-t border-white/5 pt-20 md:grid-cols-[1fr_2fr] md:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
              <span className="h-px w-8 bg-primary/40" />
              Where your money goes
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
              The prize pool,{" "}
              <span className="text-white/50">split in public.</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/40">
              After your charity allocation and platform costs, the remainder of the
              monthly subscription pool becomes that month&rsquo;s prize pool — split
              across three tiers.
            </p>
          </div>
          <div className="space-y-6">
            {split.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-6 border-b border-white/5 pb-5"
              >
                <div>
                  <p className="font-display text-xl font-semibold text-white/80">{s.label}</p>
                </div>
                <p className="font-display text-4xl font-extrabold text-gradient-green">
                  {s.pct}
                </p>
              </div>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-white/30">
              Multiple winners in a tier split that tier equally. If no member
              matches all five numbers, the jackpot rolls into next month&rsquo;s
              pool — no skim, no expiry.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
