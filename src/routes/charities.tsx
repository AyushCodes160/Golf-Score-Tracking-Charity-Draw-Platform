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
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-20 md:pt-28">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          The causes
        </p>
        <h1 className="mt-4 max-w-3xl text-balance font-serif text-5xl font-light leading-[1.05] md:text-6xl">
          Four partners. <em className="italic text-accent-foreground/90">One choice.</em>{" "}
          Quiet, monthly impact.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Every member picks one partner and sets their allocation — from the 10%
          minimum up to 100% of their subscription. We publish signed receipts every
          month. No marketing deductions, no vanity metrics.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {charities.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-sm">
            <h2 className="font-serif text-2xl text-muted-foreground">No active charities found.</h2>
            <p className="text-sm text-muted-foreground mt-2">Please ensure your database is seeded.</p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2">
            {charities.map((c, i) => (
              <article key={c.id} className="group">
                <div className="overflow-hidden rounded-sm">
                  <img
                    src={c.image_url}
                    alt={`${c.name} — ${c.tag}`}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    width={1200}
                    height={900}
                    loading="lazy"
                  />
                </div>
                <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <p className="font-serif text-xs italic text-accent-foreground/70">
                      No. 0{i + 1} · {c.tag}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl">{c.name}</h2>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Active
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="border-t border-border pt-10">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-end">
            <h2 className="max-w-xl font-serif text-3xl font-light leading-tight md:text-4xl">
              Pick the cause that moves you. Adjust your allocation any time.
            </h2>
            <div className="md:justify-self-end flex flex-col md:flex-row gap-4">
              <button
                onClick={() => alert("Launching Stripe One-Time Donation Checkout...")}
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-7 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Make a one-off donation
              </button>
              <Link
                to="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
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

