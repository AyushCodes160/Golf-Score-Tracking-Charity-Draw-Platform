import { createFileRoute, Link } from "@tanstack/react-router";
import heroLinks from "../assets/hero-links.jpg";
import charityWater from "../assets/charity-water.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fairway & Cause — Play a round, fund a cause" },
      {
        name: "description",
        content:
          "A members' club where your Stableford scores enter a monthly prize draw — and at least 10% of every subscription goes to the charity you choose.",
      },
      { property: "og:title", content: "Fairway & Cause — Play a round, fund a cause" },
      {
        property: "og:description",
        content:
          "Log Stableford scores. Win monthly prizes. Fund real charities — every single month.",
      },
      { property: "og:image", content: heroLinks },
      { name: "twitter:image", content: heroLinks },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroLinks}
            alt="Misty links golf course at sunrise"
            className="h-full w-full object-cover"
            width={1600}
            height={1100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-40">
          <p className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-10 bg-accent" />
            Vol. I · A members&rsquo; club with a conscience
          </p>
          <h1 className="max-w-4xl text-balance font-serif text-5xl font-light leading-[1.05] text-foreground md:text-7xl">
            Play a round.{" "}
            <em className="font-serif italic text-accent-foreground/90">Fund a cause.</em>{" "}
            Maybe win the month.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Log your Stableford scores. Your five best become your numbers in our
            monthly draw. A minimum of 10% of every subscription goes to the charity
            you choose — transparently, every single month.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/pricing"
              className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Join the draw — from ₹900/mo
            </Link>
            <Link
              to="/charities"
              className="inline-flex h-12 items-center rounded-full border border-border px-7 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Meet the charities
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              The ritual
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              Five scores. Five numbers. One monthly draw.
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            {[
              {
                n: "01",
                t: "Log your round",
                d: "After your round, enter your Stableford score (1–45) for the date. Only one score per date. We keep your last five.",
              },
              {
                n: "02",
                t: "Those are your numbers",
                d: "Your five most recent scores are your entry into this month's draw. Every round refreshes the set.",
              },
              {
                n: "03",
                t: "The draw",
                d: "On the 1st, five numbers are drawn. Match 3, 4, or all 5 to win a share of the prize pool. Jackpots roll over.",
              },
              {
                n: "04",
                t: "The cause",
                d: "Whether you win or not, at least 10% of your subscription goes to the charity you picked. Receipts published monthly.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t border-border pt-6">
                <div className="font-serif text-sm italic text-accent-foreground/70">
                  {step.n}
                </div>
                <h3 className="mt-2 font-serif text-xl">{step.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT / NUMBERS */}
      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            By the numbers
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              { big: "10%", small: "minimum of every subscription to charity" },
              { big: "5", small: "scores in your rolling draw window" },
              { big: "₹0", small: "to enter if you're already a subscriber" },
            ].map((s) => (
              <div key={s.big} className="text-center">
                <div className="font-serif text-6xl font-light text-foreground">
                  {s.big}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITY SPOTLIGHT */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-sm">
            <img
              src={charityWater}
              alt="Clean water pouring from a simple tap"
              className="h-full w-full object-cover"
              width={1200}
              height={900}
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Featured cause · April
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              Clean water, quietly, every month.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Our April partner funds community-maintained water points in rural
              communities. Every subscription routed here is published, signed, and
              receipted. No marketing budget, no deductions — the allocation you
              choose is the allocation that&rsquo;s sent.
            </p>
            <Link
              to="/charities"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              See all partner charities
              <span aria-hidden className="text-accent">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-sm border border-border bg-primary px-8 py-16 text-primary-foreground md:px-16 md:py-20">
          <div className="grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/60">
                An invitation
              </p>
              <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl font-light leading-tight md:text-5xl">
                Your next round could fund a school. Or a well. Or a meal.
              </h2>
            </div>
            <div className="flex md:justify-end">
              <Link
                to="/pricing"
                className="inline-flex h-12 items-center rounded-full bg-accent px-7 text-sm font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Become a member
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
