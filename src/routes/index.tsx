import { createFileRoute, Link } from "@tanstack/react-router";
import heroDark from "../assets/hero-dark.png";
import charityWater from "../assets/charity-water.jpg";

export const Route = createFileRoute("/")(  {
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
      { property: "og:image", content: heroDark },
      { name: "twitter:image", content: heroDark },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-screen flex items-end">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroDark}
            alt="Dramatic golf course at twilight"
            className="h-full w-full object-cover scale-105"
            width={1600}
            height={1100}
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/70 via-[#070707]/50 to-[#070707]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707]/60 to-transparent" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 lg:px-10 pb-28 pt-44">
          {/* Badge */}
          <div className="animate-fade-up mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
              Members&rsquo; club with a conscience
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 max-w-5xl text-balance font-display text-5xl font-extrabold leading-[1.05] text-white md:text-7xl lg:text-8xl">
            Play a round.{" "}
            <span className="text-gradient-green">Fund a cause.</span>{" "}
            <span className="text-white/70">Maybe win the month.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up-delay-2 mt-8 max-w-2xl text-lg leading-relaxed text-white/45 md:text-xl">
            Log your Stableford scores. Your five best become your numbers in our
            monthly draw. A minimum of 10% of every subscription goes to the charity
            you choose — transparently, every single month.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/pricing"
              className="btn-green-gradient inline-flex h-14 items-center rounded-2xl px-8 text-sm font-bold"
            >
              Join the draw — from ₹900/mo
            </Link>
            <Link
              to="/charities"
              className="inline-flex h-14 items-center rounded-2xl border border-white/10 bg-white/5 px-8 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/10 hover:text-white"
            >
              Meet the charities
            </Link>
          </div>

          {/* Floating stats row */}
          <div className="animate-fade-up-delay-4 mt-16 grid grid-cols-3 gap-4 max-w-xl">
            {[
              { value: "10%+", label: "to charity" },
              { value: "5", label: "scores per entry" },
              { value: "₹0", label: "extra to enter" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl px-5 py-4 text-center transition-all duration-300 hover:border-primary/20"
              >
                <div className="font-display text-2xl font-bold text-primary md:text-3xl">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-28">
        {/* Subtle bg gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070707] via-[#0a0f0a] to-[#070707] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
            {/* Left */}
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
                <span className="h-px w-8 bg-primary/40" />
                The ritual
              </span>
              <h2 className="mt-6 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Five scores. Five numbers.{" "}
                <span className="text-white/50">One monthly draw.</span>
              </h2>
            </div>

            {/* Right — Step cards */}
            <div className="grid gap-5 sm:grid-cols-2">
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
                <div
                  key={step.n}
                  className="glass-card glass-card-hover group rounded-2xl p-6 transition-all duration-500"
                >
                  <div className="font-display text-sm font-bold text-primary/60 transition-colors duration-300 group-hover:text-primary">
                    {step.n}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">
                    {step.t}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/40">
                    {step.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT / NUMBERS */}
      <section className="relative border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#0d1a0f] to-[#070707] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary/60">
            By the numbers
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { big: "10%", small: "minimum of every subscription to charity" },
              { big: "5", small: "scores in your rolling draw window" },
              { big: "₹0", small: "to enter if you're already a subscriber" },
            ].map((s) => (
              <div
                key={s.big}
                className="glass-card rounded-2xl p-8 text-center transition-all duration-500 hover:border-primary/15"
              >
                <div className="font-display text-7xl font-extrabold text-gradient-green">
                  {s.big}
                </div>
                <p className="mt-4 text-sm text-white/40">{s.small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITY SPOTLIGHT */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-28">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Image */}
          <div className="overflow-hidden rounded-3xl border border-white/5">
            <img
              src={charityWater}
              alt="Clean water pouring from a simple tap"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              width={1200}
              height={900}
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
              <span className="h-px w-8 bg-primary/40" />
              Featured cause · April
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
              Clean water, quietly,{" "}
              <span className="text-white/50">every month.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/40">
              Our April partner funds community-maintained water points in rural
              communities. Every subscription routed here is published, signed, and
              receipted. No marketing budget, no deductions — the allocation you
              choose is the allocation that&rsquo;s sent.
            </p>
            <Link
              to="/charities"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all duration-300 hover:gap-3"
            >
              See all partner charities
              <span aria-hidden className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-[#0d1a0f] via-[#0a150c] to-[#070707] px-8 py-20 md:px-16 md:py-24">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

          <div className="relative grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/50">
                <span className="h-px w-8 bg-primary/30" />
                An invitation
              </span>
              <h2 className="mt-6 max-w-xl text-balance font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Your next round could fund a school. Or a well.{" "}
                <span className="text-white/50">Or a meal.</span>
              </h2>
            </div>
            <div className="flex md:justify-end">
              <Link
                to="/pricing"
                className="btn-green-gradient inline-flex h-14 items-center rounded-2xl px-8 text-sm font-bold"
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
