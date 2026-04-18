import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { supabase, type Charity } from "../lib/supabase";

// Fallback images if database image_url fails to load
import charityWater from "../assets/charity-water.jpg";
import charityEducation from "../assets/charity-education.jpg";
import charityClimate from "../assets/charity-climate.jpg";
import charityFood from "../assets/charity-food.jpg";

export const Route = createFileRoute("/charities")({
  head: () => ({
    meta: [
      { title: "Partner charities — Fairway & Cause" },
      {
        name: "description",
        content:
          "Every member chooses one of our vetted partner charities and allocates a minimum of 10% of their subscription. Meet the causes.",
      },
      { property: "og:title", content: "Partner charities — Fairway & Cause" },
      {
        property: "og:description",
        content:
          "Clean water, education, climate, food security. Choose your cause — we publish receipts monthly.",
      },
      { property: "og:image", content: charityWater },
      { name: "twitter:image", content: charityWater },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    // Determine whether to use mock data or real backend data
    const hasKeys = import.meta.env.VITE_SUPABASE_URL !== undefined;
    
    if (!hasKeys) {
      // Return static mock data if env vars are missing
      return {
        charities: [
          {
            id: 'mock-1',
            name: "Wellspring Initiative",
            tag: "Clean water",
            image_url: charityWater,
            description: "Funds community-maintained water points and sanitation training across rural Malawi and Kenya. Every point serves ~400 people for a decade.",
            active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            name: "Open Shelf Foundation",
            tag: "Education",
            image_url: charityEducation,
            description: "Builds classroom libraries and funds teacher stipends in regions where secondary education is rationed by distance, not ability.",
            active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-3',
            name: "Rooted Commons",
            tag: "Climate",
            image_url: charityClimate,
            description: "Community-led reforestation with native species. Every ₹600 plants and maintains a sapling to sequestering maturity — no carbon offset shell games.",
            active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-4',
            name: "The Long Table",
            tag: "Food security",
            image_url: charityFood,
            description: "Supports a network of community kitchens serving warm meals with dignity. No queues, no means-test, no forms. Just food.",
            active: true,
            created_at: new Date().toISOString()
          },
        ] as Charity[]
      };
    }

    // Fetch real data from Supabase
    const { data: charities, error } = await supabase
      .from("charities")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching charities:", error);
      return { charities: [] };
    }

    return { charities: charities as Charity[] };
  },
  component: CharitiesPage,
});

function CharitiesPage() {
  const { charities } = useLoaderData({ from: "/charities" });

  return (
    <>
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-12 pt-32 md:pt-40">
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
          <span className="h-px w-8 bg-primary/40" />
          The causes
        </span>
        <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl font-extrabold leading-[1.05] text-white md:text-6xl">
          Four partners.{" "}
          <span className="text-gradient-green">One choice.</span>{" "}
          <span className="text-white/60">Quiet, monthly impact.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/40">
          Every member picks one partner and sets their allocation — from the 10%
          minimum up to 100% of their subscription. We publish signed receipts every
          month. No marketing deductions, no vanity metrics.
        </p>
      </section>

      {/* Charities grid */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
        {charities.length === 0 ? (
          <div className="glass-card rounded-3xl py-20 text-center">
            <h2 className="font-display text-2xl font-semibold text-white/40">No active charities found.</h2>
            <p className="text-sm text-white/30 mt-2">Please ensure your database is seeded.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {charities.map((c, i) => (
              <article
                key={c.id}
                className="glass-card glass-card-hover group rounded-3xl overflow-hidden transition-all duration-500"
              >
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src={c.image_url}
                    alt={`${c.name} — ${c.tag}`}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    width={1200}
                    height={900}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-primary/60">
                        No. 0{i + 1} · {c.tag}
                      </p>
                      <h2 className="mt-2 font-display text-xl font-bold text-white">
                        {c.name}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                      Active
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/40">
                    {c.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-28">
        <div className="border-t border-white/5 pt-12">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-end">
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-white md:text-4xl">
              Pick the cause that moves you.{" "}
              <span className="text-white/50">Adjust your allocation any time.</span>
            </h2>
            <div className="md:justify-self-end flex flex-col md:flex-row gap-4">
              <button
                onClick={() => alert("Launching Stripe One-Time Donation Checkout...")}
                className="inline-flex h-13 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white transition-all duration-300 hover:border-primary/30 hover:bg-white/10"
              >
                Make a one-off donation
              </button>
              <Link
                to="/pricing"
                className="btn-green-gradient inline-flex h-13 items-center justify-center rounded-2xl px-7 text-sm font-bold"
              >
                Start your membership
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
