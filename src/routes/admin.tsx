import { createFileRoute, redirect, useLoaderData } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    
    // Check if user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();
      
    if (!profile?.is_admin) {
      throw redirect({ to: "/dashboard" });
    }
    
    return { session };
  },
  loader: async () => {
    // Fetch system overview metrics
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    
    const { data: draws } = await supabase
      .from("draws")
      .select("*")
      .order("ran_at", { ascending: false });

    return { 
      totalUsers: usersCount || 0,
      draws: draws || []
    };
  },
  component: AdminPage,
});

function AdminPage() {
  const { totalUsers, draws } = useLoaderData({ from: "/admin" });
  const [isRunning, setIsRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleRunDraw = async () => {
    if (!confirm("Are you sure you want to execute the Monthly Draw? This cannot be undone and will permanently record all matching tickets.")) return;
    
    setIsRunning(true);
    setResultMessage("");

    try {
      const resp = await fetch("/api/execute-draw", { method: "POST" });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Failed to execute draw");
      }

      setResultMessage(`Draw executed successfully! Winning Numbers: ${data.winning_numbers.join(", ")}`);
      // Reload window to refresh data
      setTimeout(() => window.location.reload(), 3000);
    } catch (err: any) {
      setResultMessage(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 pb-32">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-serif text-4xl font-light">Admin Controls</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage the platform, users, and charity allocations.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <aside className="border-r border-border/40 pr-8">
          <nav className="flex flex-col gap-2">
             <span className="bg-accent/50 text-foreground rounded-sm px-4 py-2 text-sm font-medium">Draw Engine</span>
             <span className="text-muted-foreground px-4 py-2 text-sm">Members ({totalUsers})</span>
          </nav>
        </aside>

        <div className="space-y-8">
          
          <section className="rounded-sm border border-border bg-card p-6 md:p-8">
            <h2 className="font-serif text-2xl">Execute Monthly Draw</h2>
            <p className="mt-2 text-sm text-muted-foreground mb-6">
              This triggers the serverless algorithm to calculate the prize pool (simulated at ₹50,000 baseline) and match all active subscriber tickets to 5 generated numbers.
            </p>

            <button
              onClick={handleRunDraw}
              disabled={isRunning}
              className="inline-flex h-12 px-8 items-center justify-center rounded-sm bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isRunning ? "Executing Algorithm..." : "Run Monthly Draw Now"}
            </button>

            {resultMessage && (
              <div className={`mt-6 p-4 rounded-sm text-sm border font-medium ${resultMessage.startsWith("Error") ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                {resultMessage}
              </div>
            )}
          </section>

          <section className="rounded-sm border border-border bg-card p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-4">Past Draws</h2>
            {draws.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No draws have been executed yet.</p>
            ) : (
              <div className="space-y-4">
                {draws.map(draw => (
                  <div key={draw.id} className="border-b border-border pb-4 last:border-0 last:pb-0 font-mono text-sm flex justify-between items-start">
                    <div>
                      <p className="text-foreground font-semibold">Pool: ₹{draw.total_pool}</p>
                      <p className="text-muted-foreground text-xs mt-1">Winning Sequence: {draw.winning_numbers.join(" - ")}</p>
                    </div>
                    <div className="text-right text-muted-foreground text-xs">
                      <p>{new Date(draw.ran_at).toLocaleDateString()}</p>
                      <p className="mt-1">Charity: ₹{draw.charity_payout}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
