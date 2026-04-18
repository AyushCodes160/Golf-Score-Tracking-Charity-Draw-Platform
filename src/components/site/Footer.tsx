import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative mt-0 border-t border-white/5 bg-[#070707]">
      {/* Subtle green glow line at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px line-gradient-green opacity-40" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Fairway & Cause
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/40">
              A members&rsquo; club where every round you log feeds a monthly
              prize draw — and a charity you choose.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              Explore
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-white/40">
              <li>
                <Link to="/" className="transition-colors duration-300 hover:text-primary">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/charities" className="transition-colors duration-300 hover:text-primary">
                  Charities
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="transition-colors duration-300 hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              Legal
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-white/40">
              <li className="transition-colors duration-300 hover:text-white/60 cursor-pointer">Terms</li>
              <li className="transition-colors duration-300 hover:text-white/60 cursor-pointer">Privacy</li>
              <li className="transition-colors duration-300 hover:text-white/60 cursor-pointer">Responsible play</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-8 text-xs text-white/25 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Fairway &amp; Cause. Play well. Give well.</p>
          <p className="font-display">
            Est. 2026 · Stableford league &amp; giving collective
          </p>
        </div>
      </div>
    </footer>
  );
}
