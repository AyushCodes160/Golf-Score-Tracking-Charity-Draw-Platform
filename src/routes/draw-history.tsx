import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/draw-history")({
  loader: async () => {
    // 1. Fetch all past draws to show transparency
    const { data: draws } = await supabase
      .from("draws")
      .select("*")
      .order("ran_at", { ascending: false });

    // 2. Fetch the user's historical entries if they are logged in
    const { data: { session } } = await supabase.auth.getSession();
    let userEntries: any[] = [];
    
    if (session) {
      const { data: entries } = await supabase
        .from("draw_entries")
        .select("*")
        .eq("user_id", session.user.id)
        .order("id", { ascending: false });
        
      userEntries = entries || [];
    }

    return { 
      draws: draws || [],
      userEntries
    };
  },
  component: DrawHistoryPage
});

function DrawHistoryPage() {
  const { draws, userEntries } = useLoaderData({ from: "/draw-history" });

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 pb-32">
      <div className="mb-12">
        <h1 className="font-serif text-4xl font-light">Draw History</h1>
        <p className="text-sm text-muted-foreground mt-2">Complete transparency of all past sweepstakes, winning numbers, and prize pool sizing.</p>
      </div>

      <div className="space-y-12">
        
        {/* The Users personal tickets */}
        {userEntries.length > 0 && (
          <section className="rounded-sm border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-6">Your Past Tickets</h2>
            <div className="space-y-4">
              {userEntries.map(entry => (
                <div key={entry.id} className="flex flex-col md:flex-row justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-mono text-sm tracking-widest bg-background px-3 py-1 rounded inline-block border border-border">
                      {entry.score_snapshot.join(" - ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                      Matches: <span className="font-medium text-foreground">{entry.matched_count}/5</span>
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Prize</p>
                    <p className="font-serif text-xl">{entry.reward_won > 0 ? `₹${entry.reward_won}` : "No Win"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Global Draw History */}
        <section className="rounded-sm border border-border bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl mb-8">Platform Records</h2>
          
          {draws.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No draws have been executed yet.</p>
          ) : (
            <div className="grid gap-6">
              {draws.map(draw => (
                <article key={draw.id} className="border border-border rounded-sm p-6 bg-background/50">
                  <div className="flex flex-col md:flex-row justify-between mb-6 border-b border-border pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Winning Numbers</p>
                      <p className="font-mono text-xl tracking-[0.5em] text-foreground">{draw.winning_numbers.join("-")}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Executed On</p>
                      <p className="text-sm font-medium">{new Date(draw.ran_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Gross Pool</p>
                      <p className="font-serif text-lg">₹{draw.total_pool}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Charity Payout</p>
                      <p className="font-serif text-lg text-accent-foreground">₹{draw.charity_payout}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Jackpot (5/5)</p>
                      <p className="font-serif text-lg font-semibold">₹{draw.jackpot_payout}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tier 3 & 4</p>
                      <p className="font-serif text-lg">₹{draw.tier_4_payout + draw.tier_3_payout}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
