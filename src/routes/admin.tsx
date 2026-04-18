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
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 pb-32">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Admin Controls</h1>
          <p className="text-sm text-white/30 mt-2">Manage settings, algorithms, and winner verifications.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2.5fr]">
        <aside>
          <nav className="flex flex-col gap-2">
             <span className="bg-primary/10 text-primary rounded-xl px-4 py-2.5 text-sm font-medium border border-primary/10">Draw Engine</span>
             <span className="text-white/30 px-4 py-2.5 text-sm">Active Subs: <span className="text-white font-medium">{totalUsers}</span></span>
          </nav>
        </aside>

        <div className="space-y-8">
          
          {/* Draw Engine */}
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-white">Execute Draw Engine</h2>
            
            <div className="grid gap-4 mt-6 mb-8 border-b border-white/5 pb-8">
              <label className="flex items-center gap-4 cursor-pointer glass-card rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04]">
                <input 
                  type="checkbox" 
                  checked={useAlgorithm} 
                  onChange={(e) => setUseAlgorithm(e.target.checked)}
                  className="w-4 h-4 accent-[#4ADE80] rounded" 
                />
                <div>
                  <p className="text-sm font-medium text-white">Algorithmic Weighted Selection</p>
                  <p className="text-xs text-white/30 mt-0.5">Turn OFF for standard lottery random selection. Turn ON to skew towards most frequently played scores across platform.</p>
                </div>
              </label>

              <label className="flex items-center gap-4 cursor-pointer glass-card rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04]">
                <input 
                  type="checkbox" 
                  checked={simulateMode} 
                  onChange={(e) => setSimulateMode(e.target.checked)}
                  className="w-4 h-4 accent-[#4ADE80] rounded" 
                />
                <div>
                  <p className="text-sm font-medium text-white">Simulate Output Before Publishing</p>
                  <p className="text-xs text-white/30 mt-0.5">Calculate economics without committing to Database.</p>
                </div>
              </label>
            </div>

            <button
              onClick={handleRunDraw}
              disabled={isRunning}
              className={`inline-flex h-12 px-8 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 ${
                simulateMode 
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' 
                  : 'btn-green-gradient'
              }`}
            >
              {isRunning ? "Calculating Math..." : (simulateMode ? "Run Simulation" : "PUBLISH OFFICIAL DRAW")}
            </button>

            {simulatedData && (
              <div className="mt-8 bg-primary/5 border border-primary/10 p-6 rounded-2xl">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Simulation Results</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div>
                     <p className="text-xs text-white/20">Numbers</p>
                     <p className="font-mono text-lg text-primary font-bold">{simulatedData.winning_numbers.join("-")}</p>
                   </div>
                   <div>
                     <p className="text-xs text-white/20">Total Charity</p>
                     <p className="font-display text-lg font-bold text-white">₹{Math.floor(simulatedData.stats.charityPayout)}</p>
                   </div>
                   <div>
                     <p className="text-xs text-white/20">Jackpot Winners</p>
                     <p className="font-display text-lg font-bold text-white">{simulatedData.stats.tier5Winners}</p>
                   </div>
                   <div>
                     <p className="text-xs text-white/20">Tier 4 Winners</p>
                     <p className="font-display text-lg font-bold text-white">{simulatedData.stats.tier4Winners}</p>
                   </div>
                </div>
              </div>
            )}

            {resultMessage && !simulatedData && (
              <div className={`mt-6 p-4 rounded-xl text-sm border font-medium ${resultMessage.startsWith("Error") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                {resultMessage}
              </div>
            )}
          </section>

          {/* Verification Queue Section from PRD */}
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Winner Verification</h2>
            <p className="text-sm text-white/30 mb-6">Verify physical scorecard proofs uploaded by tier winners before approving payout.</p>

            {verifications.length === 0 ? (
               <p className="text-sm italic text-white/20">No verification proofs uploaded yet.</p>
            ) : (
               <div className="space-y-4">
                 {verifications.map((v: any) => (
                   <div key={v.id} className="flex flex-col md:flex-row items-center justify-between border border-white/5 rounded-2xl p-4 bg-white/[0.02] transition-all duration-300 hover:border-white/10">
                     <div>
                       <p className="text-sm font-medium text-white">{v.profiles?.full_name || v.profiles?.email || "User"}</p>
                       <p className="text-xs text-white/30">Payout: ₹{v.reward_won}</p>
                       <p className="text-xs font-mono text-white/20 mt-1">Ticket: {v.score_snapshot.join("-")}</p>
                     </div>
                     <div className="flex items-center gap-4 mt-4 md:mt-0">
                       <a 
                         href={v.proof_image_url} 
                         target="_blank" 
                         rel="noreferrer"
                         className="text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                       >
                         View Attachment
                       </a>
                       {v.verification_status === "approved" ? (
                         <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">Paid out</span>
                       ) : (
                         <button 
                           onClick={() => handleApprove(v.id)}
                           className="btn-green-gradient px-4 py-1.5 rounded-xl text-xs font-bold"
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

          {/* Past Draws */}
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Past Draws</h2>
            {draws.length === 0 ? (
              <p className="text-sm text-white/20 italic">No draws have been executed yet.</p>
            ) : (
              <div className="space-y-4">
                {draws.map(draw => (
                  <div key={draw.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0 font-mono text-sm flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">Pool: ₹{draw.total_pool}</p>
                      <p className="text-white/30 text-xs mt-1">Winning Sequence: <span className="text-primary">{draw.winning_numbers.join(" - ")}</span></p>
                    </div>
                    <div className="text-right text-white/20 text-xs">
                      <p>{new Date(draw.ran_at).toLocaleDateString()}</p>
                      <p className="mt-1">Charity: <span className="text-primary/70">₹{Math.floor(draw.charity_payout)}</span></p>
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
