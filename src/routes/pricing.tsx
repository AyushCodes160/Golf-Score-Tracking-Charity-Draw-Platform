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

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-20 md:pt-28">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Membership
        </p>
        <h1 className="mt-4 max-w-3xl text-balance font-serif text-5xl font-light leading-[1.05] md:text-6xl">
          Two plans.{" "}
          <em className="italic text-accent-foreground/90">One promise:</em> at least
          10% to charity.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          No tiers, no feature gates. Every member gets the full experience. The only
          difference is how often you&rsquo;d like to be billed — and how much you&rsquo;d
          like to save.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly */}
          <article className="flex flex-col rounded-sm border border-border bg-card p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Monthly
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-6xl font-light">₹900</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Cancel any time. Full access to scoring, monthly draws, and charity
              allocation.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Stableford score tracking",
                "Automatic monthly draw entry",
                "Choose &amp; change your charity anytime",
                "Minimum 10% to charity — up to 100%",
                "Signed monthly receipts",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-accent"
                  />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loadingPlan === "monthly"}
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full border border-border text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {loadingPlan === "monthly" ? "Processing..." : "Start monthly"}
            </button>
          </article>

          {/* Yearly */}
          <article className="relative flex flex-col rounded-sm border border-primary bg-primary p-8 text-primary-foreground md:p-10">
            <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              Save ₹1,800
            </span>
            <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/60">
              Yearly
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-6xl font-light">₹9,000</span>
              <span className="text-sm text-primary-foreground/70">/ year</span>
            </div>
            <p className="mt-3 text-sm text-primary-foreground/70">
              ₹750/mo billed annually. Two months on us. Everything in monthly,
              plus a founder&rsquo;s mark on your profile.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Everything in monthly",
                "Two months free",
                "Founder&rsquo;s mark (first 500 members)",
                "Early access to new partner charities",
                "Annual impact statement",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-accent"
                  />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loadingPlan === "yearly"}
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground disabled:opacity-50 hover:bg-accent/90 transition-colors"
            >
              {loadingPlan === "yearly" ? "Processing..." : "Start yearly"}
            </button>
          </article>
        </div>
      </section>

      {/* Split breakdown */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-12 border-t border-border pt-16 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Where your money goes
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              The prize pool, split in public.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              After your charity allocation and platform costs, the remainder of the
              monthly subscription pool becomes that month&rsquo;s prize pool — split
              across three tiers.
            </p>
          </div>
          <div className="space-y-6">
            {split.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-6 border-b border-border pb-4"
              >
                <div>
                  <p className="font-serif text-2xl">{s.label}</p>
                </div>
                <p className="font-serif text-4xl font-light text-foreground">
                  {s.pct}
                </p>
              </div>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
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

