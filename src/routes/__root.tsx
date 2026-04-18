import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteShell } from "../components/site/SiteShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-extrabold text-gradient-green">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-white">Page not found</h2>
        <p className="mt-3 text-sm text-white/40">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="btn-green-gradient inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
