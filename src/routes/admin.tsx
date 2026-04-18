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
    // Metrics
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    
    // Past Draws
    const { data: draws } = await supabase
      .from("draws")
      .select("*")
      .order("ran_at", { ascending: false });

    // Pending Authentications
    const { data: verifications } = await supabase
      .from("draw_entries")
      .select("*, draws(ran_at), profiles(email, full_name)")
      .in("verification_status", ["pending_review", "approved"])
      .order("verification_status", { ascending: false }); // pending first

    return { 
      totalUsers: usersCount || 0,
      draws: draws || [],
      verifications: verifications || []
    };
  },
  component: AdminPage,
});

function AdminPage() {
  const { totalUsers, draws, verifications } = useLoaderData({ from: "/admin" });
  const [isRunning, setIsRunning] = useState(false);
  const [simulateMode, setSimulateMode] = useState(true);
  const [useAlgorithm, setUseAlgorithm] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [simulatedData, setSimulatedData] = useState<any>(null);

  const handleRunDraw = async () => {
    if (!simulateMode && !confirm("WARNING: Publishing the Draw will permanently insert tickets and assign prizes. Continue?")) return;
    
    setIsRunning(true);
    setResultMessage("");
    setSimulatedData(null);

    try {
      const resp = await fetch("/api/execute-draw", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate: simulateMode, algorithm: useAlgorithm })
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Failed to execute draw");
      }

      if (data.simulated) {
        setSimulatedData(data);
        setResultMessage(`Simulation completed mathematically.`);
      } else {
        setResultMessage(`Draw published! Winning Sequence: ${data.winning_numbers.join(" - ")}`);
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err: any) {
      setResultMessage(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprove = async (entryId: number) => {
    try {
      await supabase.from("draw_entries").update({ verification_status: "approved" }).eq("id", entryId);
      window.location.reload();
    } catch(err) {
      alert("Failed to approve");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 pb-32">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-serif text-4xl font-light">Admin Controls</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage settings, algorithms, and winner verifications.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2.5fr]">
        <aside className="border-r border-border/40 pr-8">
          <nav className="flex flex-col gap-2">
             <span className="bg-accent/50 text-foreground rounded-sm px-4 py-2 text-sm font-medium">Draw Engine</span>
             <span className="text-muted-foreground px-4 py-2 text-sm">Active Subs: {totalUsers}</span>
          </nav>
        </aside>

        <div className="space-y-8">
          
          <section className="rounded-sm border border-border bg-card p-6 md:p-8">
            <h2 className="font-serif text-2xl">Execute Engine Engine</h2>
            
            <div className="grid gap-4 mt-6 mb-8 border-b border-border pb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useAlgorithm} 
                  onChange={(e) => setUseAlgorithm(e.target.checked)}
                  className="w-4 h-4 accent-primary" 
                />
                <div>
                  <p className="text-sm font-medium">Algorithmic Weighted Selection</p>
                  <p className="text-xs text-muted-foreground">Turn OFF for standard lottery random selection. Turn ON to skew towards most frequently played scores across platform.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={simulateMode} 
                  onChange={(e) => setSimulateMode(e.target.checked)}
                  className="w-4 h-4 accent-primary" 
                />
                <div>
                  <p className="text-sm font-medium">Simulate Output Before Publishing</p>
                  <p className="text-xs text-muted-foreground">Calculate economics without committing to Database.</p>
                </div>
              </label>
            </div>

            <button
              onClick={handleRunDraw}
              disabled={isRunning}
              className={`inline-flex h-12 px-8 items-center justify-center rounded-sm text-sm font-medium transition-colors disabled:opacity-50 ${simulateMode ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              {isRunning ? "Calculating Math..." : (simulateMode ? "Run Simulation" : "PUBLISH OFFICIAL DRAW")}
            </button>

            {simulatedData && (
              <div className="mt-8 bg-accent/20 border border-primary/20 p-6 rounded-sm">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Simulation Results</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div>
                     <p className="text-xs text-muted-foreground">Numbers</p>
                     <p className="font-mono text-lg">{simulatedData.winning_numbers.join("-")}</p>
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground">Total Charity</p>
                     <p className="font-serif text-lg">₹{Math.floor(simulatedData.stats.charityPayout)}</p>
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground">Jackpot Winners</p>
                     <p className="font-serif text-lg">{simulatedData.stats.tier5Winners}</p>
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground">Tier 4 Winners</p>
                     <p className="font-serif text-lg">{simulatedData.stats.tier4Winners}</p>
                   </div>
                </div>
              </div>
            )}

            {resultMessage && !simulatedData && (
              <div className={`mt-6 p-4 rounded-sm text-sm border font-medium ${resultMessage.startsWith("Error") ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                {resultMessage}
              </div>
            )}
          </section>

          {/* Verification Queue Section from PRD */}
          <section className="rounded-sm border border-border bg-card p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-4">Winner Verification</h2>
            <p className="text-sm text-muted-foreground mb-6">Verify physical scorecard proofs uploaded by tier winners before approving payout.</p>

            {verifications.length === 0 ? (
               <p className="text-sm italic text-muted-foreground">No verification proofs uploaded yet.</p>
            ) : (
               <div className="space-y-4">
                 {verifications.map((v: any) => (
                   <div key={v.id} className="flex flex-col md:flex-row items-center justify-between border border-border/60 rounded p-4">
                     <div>
                       <p className="text-sm font-medium">{v.profiles?.full_name || v.profiles?.email || "User"}</p>
                       <p className="text-xs text-muted-foreground">Payout: ₹{v.reward_won}</p>
                       <p className="text-xs font-mono text-muted-foreground mt-1">Ticket: {v.score_snapshot.join("-")}</p>
                     </div>
                     <div className="flex items-center gap-4 mt-4 md:mt-0">
                       <a 
                         href={v.proof_image_url} 
                         target="_blank" 
                         rel="noreferrer"
                         className="text-xs font-medium underline text-primary underline-offset-4"
                       >
                         View Attachment
                       </a>
                       {v.verification_status === "approved" ? (
                         <span className="text-xs font-medium text-green-600 bg-green-500/10 px-3 py-1.5 rounded-sm">Paid out</span>
                       ) : (
                         <button 
                           onClick={() => handleApprove(v.id)}
                           className="bg-accent text-accent-foreground px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-accent/80 transition"
                         >
                           Approve Payout
                         </button>
                       )}
                     </div>
                   </div>
                 ))}
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
                      <p className="mt-1">Charity: ₹{Math.floor(draw.charity_payout)}</p>
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
