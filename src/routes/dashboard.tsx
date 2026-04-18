import { createFileRoute, redirect, useLoaderData, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, type Charity } from "../lib/supabase";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
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
    <div className="mx-auto max-w-4xl px-6 py-20 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-light">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Signed in as {userEmail}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        
        {/* Sidebar Nav (Static for now) */}
        <aside className="hidden md:block border-r border-border/40 pr-8">
          <nav className="flex flex-col gap-2">
            <Link to="/charities" className="text-muted-foreground hover:bg-accent/10 rounded-sm px-4 py-2 text-sm font-medium">Partner Charities</Link>
            <Link to="/draw-history" className="text-muted-foreground hover:bg-accent/10 rounded-sm px-4 py-2 text-sm font-medium">Draw History</Link>
            {profile?.is_admin && (
              <Link to="/admin" className="text-destructive hover:bg-destructive/10 rounded-sm px-4 py-2 text-sm font-medium mt-4 border border-destructive/20">Admin Panel</Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Score Management Section */}
          <section className="rounded-sm border border-border bg-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl">Stableford Scores</h2>
                <p className="mt-2 text-sm text-muted-foreground">
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
                    className={`flex flex-col items-center justify-center rounded-sm border p-4 aspect-square transition-all ${
                      scoreRecord ? 'border-primary bg-primary/5 shadow-inner' : 'border-dashed border-border/50 bg-accent/20'
                    }`}
                  >
                    {scoreRecord ? (
                      <div className="relative group w-full h-full flex flex-col items-center justify-center">
                        <span className="font-serif text-3xl font-light text-foreground">{scoreRecord.score}</span>
                        <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest text-center leading-tight">
                          {new Date(scoreRecord.played_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                        
                        {/* Hover Overlay Delete Button */}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            onClick={() => handleDeleteScore(scoreRecord.id)}
                            className="text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-sm border border-destructive/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30 text-sm font-medium">Empty</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Score Entry Form */}
            <form onSubmit={handleScoreSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pt-6 border-t border-border">
              <div className="flex-1 w-full">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
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
                    className="flex h-10 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    required
                  />
                  <input
                    type="date"
                    value={playedAt}
                    onChange={(e) => setPlayedAt(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="flex h-10 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingScore || !newScore}
                className="inline-flex h-10 items-center justify-center rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50 whitespace-nowrap w-full sm:w-auto mt-2 sm:mt-0"
              >
                {isSubmittingScore ? "Submitting..." : "Log Score"}
              </button>
            </form>
            
            {scoreMessage && (
              <p className={`mt-4 text-sm font-medium ${scoreMessage.startsWith("Error") ? "text-destructive" : "text-primary"}`}>
                {scoreMessage}
              </p>
            )}
          </section>
          
          <section className="rounded-sm border border-border bg-card p-6 md:p-8">
            <h2 className="font-serif text-2xl">Your Charitable Impact</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose where your contribution goes. A minimum of 10% of your subscription is committed automatically. You can always give more.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              {/* Dropdown for charities */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
                  Selected Partner
                </label>
                <div className="grid gap-3">
                  {charities.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No charities found in database.</p>
                  )}
                  {charities.map((charity) => (
                    <label 
                      key={charity.id} 
                      className={`relative flex cursor-pointer items-start gap-4 rounded-sm border p-4 transition-colors ${selectedCharity === charity.id ? "border-foreground bg-accent/20" : "border-border hover:bg-accent/10"}`}
                    >
                      <input 
                        type="radio" 
                        name="charity" 
                        value={charity.id}
                        checked={selectedCharity === charity.id}
                        onChange={(e) => setSelectedCharity(e.target.value)}
                        className="mt-1 h-4 w-4 border-primary text-primary focus:ring-primary"
                        required
                      />
                      <div className="flex-1">
                        <p className="font-medium">{charity.name}</p>
                        <p className="text-xs text-muted-foreground tracking-wide mt-0.5">{charity.tag}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Slider for allocation */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-end justify-between mb-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Contribution Portion
                  </label>
                  <span className="font-serif text-2xl">{allocation}%</span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={allocation}
                  onChange={(e) => setAllocation(parseInt(e.target.value))}
                  className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-foreground"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Minimum (10%)</span>
                  <span>Maximum (100%)</span>
                </div>
              </div>

              {saveMessage && (
                <div className={`p-3 text-sm rounded-sm ${saveMessage.startsWith("Error") ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  {saveMessage}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground disabled:opacity-50"
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
