import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function Header() {
  const [hasSession, setHasSession] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#070707]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary transition-shadow duration-300 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.5)]" />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Fairway & Cause
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 text-sm md:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "!text-primary" }}
            className="relative text-white/60 transition-colors duration-300 hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </Link>
          <Link
            to="/charities"
            activeProps={{ className: "!text-primary" }}
            className="relative text-white/60 transition-colors duration-300 hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Charities
          </Link>
          <Link
            to="/pricing"
            activeProps={{ className: "!text-primary" }}
            className="relative text-white/60 transition-colors duration-300 hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Pricing
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {hasSession ? (
            <>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="hidden text-sm text-white/50 transition-colors hover:text-white sm:block"
              >
                Sign out
              </button>
              <Link
                to="/dashboard"
                className="btn-green-gradient inline-flex h-10 items-center rounded-xl px-6 text-sm font-semibold"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm text-white/50 transition-colors hover:text-white sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/pricing"
                className="btn-green-gradient inline-flex h-10 items-center rounded-xl px-6 text-sm font-semibold"
              >
                Join the draw
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 md:hidden p-2"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 animate-fade-up">
          <nav className="flex flex-col gap-1 px-6 py-6">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-primary py-3 text-lg font-medium transition-colors">Home</Link>
            <Link to="/charities" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-primary py-3 text-lg font-medium transition-colors">Charities</Link>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-primary py-3 text-lg font-medium transition-colors">Pricing</Link>
            <div className="h-px bg-white/5 my-3" />
            {hasSession ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-green-gradient inline-flex h-12 items-center justify-center rounded-xl text-sm font-semibold">Dashboard</Link>
            ) : (
              <Link to="/pricing" onClick={() => setMobileOpen(false)} className="btn-green-gradient inline-flex h-12 items-center justify-center rounded-xl text-sm font-semibold">Join the draw</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
