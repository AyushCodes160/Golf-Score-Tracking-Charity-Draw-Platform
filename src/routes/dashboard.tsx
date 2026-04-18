import { createFileRoute, redirect, useLoaderData, useNavigate } from "@tanstack/react-router";
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

    return { 
      profile: profile || null, 
      charities: (charities || []) as Charity[],
      userEmail: context.session?.user.email
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, charities, userEmail } = useLoaderData({ from: "/dashboard" });
  const navigate = useNavigate();
  
  // State for form
  const [selectedCharity, setSelectedCharity] = useState<string>(profile?.chosen_charity_id || "");
  const [allocation, setAllocation] = useState<number>(profile?.charity_allocation_pct || 10);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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
            <a href="#" className="bg-accent/50 text-foreground rounded-sm px-4 py-2 text-sm font-medium">Charity Rules</a>
            <a href="#" className="text-muted-foreground hover:bg-accent/10 rounded-sm px-4 py-2 text-sm font-medium">Score Entry (Coming Soon)</a>
            <a href="#" className="text-muted-foreground hover:bg-accent/10 rounded-sm px-4 py-2 text-sm font-medium">Draw History (Coming Soon)</a>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-8">
          
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
