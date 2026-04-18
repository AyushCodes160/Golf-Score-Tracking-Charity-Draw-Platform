import { createFileRoute, useLoaderData, useRouter } from "@tanstack/react-router";
import { useState } from "react";
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
  const router = useRouter();
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const handleUploadProof = async (entryId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(entryId);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${entryId}-${Math.random()}.${fileExt}`;
      
      // Upload explicitly to the winner_proofs public bucket
      const { error: uploadError } = await supabase.storage
        .from('winner_proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('winner_proofs')
        .getPublicUrl(filePath);

      // Update the ticket entry with the proof and trigger state 'pending_review'
      const { error: updateError } = await supabase.from('draw_entries').update({
        verification_status: 'pending_review',
        proof_image_url: publicUrlData.publicUrl
      }).eq('id', entryId);
      
      if (updateError) throw updateError;

      router.invalidate();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-28 pb-32">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold text-white">Draw History</h1>
        <p className="text-sm text-white/30 mt-3">Complete transparency of all past sweepstakes, winning numbers, and prize pool sizing.</p>
      </div>

      <div className="space-y-10">
        
        {/* The Users personal tickets */}
        {userEntries.length > 0 && (
          <section className="glass-card rounded-3xl border-primary/10 bg-primary/[0.03] p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Your Past Tickets</h2>
            <div className="space-y-4">
              {userEntries.map(entry => (
                <div key={entry.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-mono text-sm tracking-widest bg-white/5 px-3 py-1.5 rounded-lg inline-block border border-white/5 text-white/70">
                      {entry.score_snapshot.join(" - ")}
                    </p>
                    <p className="text-xs text-white/30 mt-2 uppercase tracking-widest">
                      Matches: <span className="font-medium text-white">{entry.matched_count}/5</span>
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:text-right flex flex-col items-start md:items-end w-full md:w-auto">
                    <p className="text-xs uppercase tracking-widest text-white/20 mb-1">Prize</p>
                    <p className="font-display text-xl font-bold text-white">{entry.reward_won > 0 ? `₹${entry.reward_won}` : "No Win"}</p>
                    
                    {entry.reward_won > 0 && (!entry.verification_status || entry.verification_status === 'pending_upload') && (
                      <label className="mt-3 cursor-pointer btn-green-gradient inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-bold">
                        {uploadingId === entry.id ? 'Uploading...' : 'Upload Scorecard Proof'}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => handleUploadProof(entry.id, e)}
                          disabled={uploadingId === entry.id}
                        />
                      </label>
                    )}
                    {entry.verification_status === 'pending_review' && (
                      <span className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-yellow-500/10 px-4 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                        Proof Under Review
                      </span>
                    )}
                    {entry.verification_status === 'approved' && (
                      <span className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-primary/10 px-4 text-xs font-medium text-primary border border-primary/20">
                        Verified & Paid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Global Draw History */}
        <section className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-white mb-8">Platform Records</h2>
          
          {draws.length === 0 ? (
            <p className="text-white/30 text-sm italic">No draws have been executed yet.</p>
          ) : (
            <div className="grid gap-6">
              {draws.map(draw => (
                <article key={draw.id} className="border border-white/5 rounded-2xl p-6 bg-white/[0.02] transition-all duration-300 hover:border-white/10">
                  <div className="flex flex-col md:flex-row justify-between mb-6 border-b border-white/5 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/20 mb-2">Winning Numbers</p>
                      <p className="font-mono text-xl tracking-[0.5em] text-primary font-bold">{draw.winning_numbers.join("-")}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/20 mb-2">Executed On</p>
                      <p className="text-sm font-medium text-white/70">{new Date(draw.ran_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-xs text-white/20 mb-1">Gross Pool</p>
                      <p className="font-display text-lg font-bold text-white">₹{draw.total_pool}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/20 mb-1">Charity Payout</p>
                      <p className="font-display text-lg font-bold text-primary">₹{draw.charity_payout}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/20 mb-1">Jackpot (5/5)</p>
                      <p className="font-display text-lg font-bold text-white">₹{draw.jackpot_payout}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/20 mb-1">Tier 3 & 4</p>
                      <p className="font-display text-lg font-bold text-white/70">₹{draw.tier_4_payout + draw.tier_3_payout}</p>
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
