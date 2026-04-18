import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              <span className="font-serif text-xl font-semibold tracking-tight">
                Fairway &amp; Cause
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A members&rsquo; club where every round you log feeds a monthly
              prize draw — and a charity you choose.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/charities" className="hover:text-foreground">
                  Charities
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Terms</li>
              <li>Privacy</li>
              <li>Responsible play</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Fairway &amp; Cause. Play well. Give well.</p>
          <p className="font-serif italic">Est. 2026 · Stableford league &amp; giving collective</p>
        </div>
      </div>
    </footer>
  );
}
