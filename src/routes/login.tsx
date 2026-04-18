import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate({ from: "/login" });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data?.session) {
          navigate({ to: "/dashboard" });
        } else {
          alert("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // If login successful, go to the dashboard
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-24 pt-32">
      <div className="glass-card rounded-3xl p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-white/40">
            {isSignUp ? "Create account" : "Welcome back"}
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-white">
          {isSignUp ? "Join Fairway & Cause" : "Sign In"}
        </h1>
        <p className="mt-3 text-sm text-white/40">
          {isSignUp
            ? "Create an account to track your scores and fund a cause."
            : "Enter your credentials to access your dashboard."}
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="mt-8 flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-[0.15em] text-white/30 mb-2 block"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-[0.15em] text-white/30 mb-2 block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-green-gradient mt-3 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/30">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-primary font-medium hover:text-primary/80 transition-colors"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </section>
  );
}
