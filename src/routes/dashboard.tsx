import { createFileRoute, redirect, useLoaderData, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, type Charity } from "../lib/supabase";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    
    // Strict subscription check mandated by PRD Section 04
    const { data: profile } = await supabase
       .from("profiles")
       .select("subscription_status")
       .eq("id", session.user.id)
       .single();
       
    if (profile?.subscription_status !== 'active') {
       throw redirect({ to: "/pricing" });
    }

    return { session };
  },
  loader: async ({ context }) => {
    const userId = context.session?.user.id;
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Fetch active charities
    const { data: charities } = await supabase
      .from("charities")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });

    // Fetch user scores
    const { data: scores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false });

    return { 
      profile: profile || null, 
      charities: (charities || []) as Charity[],
      scores: scores || [],
      userEmail: context.session?.user.email
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, charities, scores, userEmail } = useLoaderData({ from: "/dashboard" });
  const navigate = useNavigate();
  const router = useRouter();
  
  // State for forms
  const [selectedCharity, setSelectedCharity] = useState<string>(profile?.chosen_charity_id || "");
  const [allocation, setAllocation] = useState<number>(profile?.charity_allocation_pct || 10);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [newScore, setNewScore] = useState<string>("");
  const [playedAt, setPlayedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreMessage, setScoreMessage] = useState("");

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore) return;
    
    setIsSubmittingScore(true);
    setScoreMessage("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const numScore = parseInt(newScore, 10);
      
      if (isNaN(numScore) || numScore < 0 || numScore > 54) {
        throw new Error("Score must be between 0 and 54.");
      }

      const { error } = await supabase
        .from("scores")
        .insert({
          user_id: session?.user.id,
          score: numScore,
          played_at: playedAt
        });

      if (error) throw error;
      
      setNewScore("");
      setScoreMessage("Score logged successfully!");
      router.invalidate(); // instantly fetch the updated array including the trigger drop
    } catch (error: any) {
      setScoreMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmittingScore(false);
      setTimeout(() => setScoreMessage(""), 4000);
    }
  };

  const handleDeleteScore = async (scoreId: number) => {
    try {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) throw error;
      setScoreMessage("Score deleted.");
      router.invalidate();
    } catch (err: any) {
      setScoreMessage(`Error: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("profiles")
        .update({
          chosen_charity_id: selectedCharity || null,
          charity_allocation_pct: allocation
        })
        .eq("id", session?.user.id);

      if (error) throw error;
      setSaveMessage("Charity preferences updated successfully.");
    } catch (error: any) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 5000); // clear message after 5 seconds
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-28 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/30 mt-2">Signed in as {userEmail}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-white/30 transition-colors hover:text-white"
        >
          Sign out
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2.5fr]">
        
        {/* Sidebar Nav */}
        <aside className="hidden md:block">
          <nav className="flex flex-col gap-2">
            <Link to="/charities" className="text-white/40 hover:text-primary hover:bg-white/5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300">Partner Charities</Link>
            <Link to="/draw-history" className="text-white/40 hover:text-primary hover:bg-white/5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300">Draw History</Link>
            {profile?.is_admin && (
              <Link to="/admin" className="text-red-400/70 hover:text-red-400 hover:bg-red-500/5 rounded-xl px-4 py-2.5 text-sm font-medium mt-4 border border-red-500/10 transition-all duration-300">Admin Panel</Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Score Management Section */}
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Stableford Scores</h2>
                <p className="mt-2 text-sm text-white/30">
                  Your 5 most recent scores qualify for the monthly draw. Entering a 6th automatically pushes the oldest out.
                </p>
              </div>
            </div>

            {/* Visual 5-Score Array */}
            <div className="grid grid-cols-5 gap-3 mb-8">
              {Array.from({ length: 5 }).map((_, i) => {
                const scoreRecord = scores[i];
                return (
                  <div 
                    key={scoreRecord?.id || i}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 aspect-square transition-all duration-500 ${
                      scoreRecord 
                        ? 'border-primary/20 bg-primary/5 glow-green-sm' 
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    {scoreRecord ? (
                      <div className="relative group w-full h-full flex flex-col items-center justify-center">
                        <span className="font-display text-3xl font-bold text-white">{scoreRecord.score}</span>
                        <span className="text-[10px] text-white/30 mt-2 uppercase tracking-widest text-center leading-tight">
                          {new Date(scoreRecord.played_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                        
                        {/* Hover Overlay Delete Button */}
                        <div className="absolute inset-0 bg-[#070707]/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                          <button
                            onClick={() => handleDeleteScore(scoreRecord.id)}
                            className="text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/10 text-sm font-medium">Empty</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Score Entry Form */}
            <form onSubmit={handleScoreSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pt-6 border-t border-white/5">
              <div className="flex-1 w-full">
                <label className="text-xs font-medium uppercase tracking-[0.15em] text-white/30 mb-2 block">
                  Add New Score
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="Score (0-45)"
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-300"
                    required
                  />
                  <input
                    type="date"
                    value={playedAt}
                    onChange={(e) => setPlayedAt(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-300 [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingScore || !newScore}
                className="btn-green-gradient inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold disabled:opacity-50 whitespace-nowrap w-full sm:w-auto mt-2 sm:mt-0"
              >
                {isSubmittingScore ? "Submitting..." : "Log Score"}
              </button>
            </form>
            
            {scoreMessage && (
              <p className={`mt-4 text-sm font-medium ${scoreMessage.startsWith("Error") ? "text-red-400" : "text-primary"}`}>
                {scoreMessage}
              </p>
            )}
          </section>
          
          {/* Charity Impact Section */}
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-white">Your Charitable Impact</h2>
            <p className="mt-2 text-sm text-white/30">
              Choose where your contribution goes. A minimum of 10% of your subscription is committed automatically. You can always give more.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              {/* Charity selection */}
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.15em] text-white/30 mb-3 block">
                  Selected Partner
                </label>
                <div className="grid gap-3">
                  {charities.length === 0 && (
                    <p className="text-sm text-white/30 italic">No charities found in database.</p>
                  )}
                  {charities.map((charity) => (
                    <label 
                      key={charity.id} 
                      className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                        selectedCharity === charity.id 
                          ? "border-primary/30 bg-primary/5 glow-green-sm" 
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="charity" 
                        value={charity.id}
                        checked={selectedCharity === charity.id}
                        onChange={(e) => setSelectedCharity(e.target.value)}
                        className="mt-1 h-4 w-4 accent-[#4ADE80]"
                        required
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{charity.name}</p>
                        <p className="text-xs text-white/30 tracking-wide mt-0.5">{charity.tag}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allocation Slider */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-end justify-between mb-4">
                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-white/30">
                    Contribution Portion
                  </label>
                  <span className="font-display text-2xl font-bold text-gradient-green">{allocation}%</span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={allocation}
                  onChange={(e) => setAllocation(parseInt(e.target.value))}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-white/20 mt-2">
                  <span>Minimum (10%)</span>
                  <span>Maximum (100%)</span>
                </div>
              </div>

              {saveMessage && (
                <div className={`p-3.5 text-sm rounded-xl border ${saveMessage.startsWith("Error") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                  {saveMessage}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-green-gradient inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </section>
          
        </div>
      </div>
    </div>
  );
}
