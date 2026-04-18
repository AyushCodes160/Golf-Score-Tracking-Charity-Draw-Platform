#!/bin/bash

# Ensure .env is ignored
echo ".env" >> .gitignore

# 1
git add package.json package-lock.json bun.lockb bunfig.toml .gitignore .prettierignore .prettierrc eslint.config.js
git commit -m "Initialize project structure and base configuration"

# 2
git add tsconfig.json vite.config.ts wrangler.jsonc components.json
git commit -m "Configure build tools and TypeScript for TanStack Start"

# 3
git add src/styles.css
git commit -m "Setup Tailwind CSS theme and global styles"

# 4
git add src/components/ui/button.tsx src/components/ui/badge.tsx src/components/ui/card.tsx src/components/ui/separator.tsx src/components/ui/skeleton.tsx
git commit -m "Add core UI fundamental components"

# 5
git add src/components/ui/drawer.tsx src/components/ui/sheet.tsx src/components/ui/dialog.tsx src/components/ui/alert-dialog.tsx src/components/ui/popover.tsx src/components/ui/hover-card.tsx
git commit -m "Establish UI layout overlay components"

# 6
git add src/components/ui/form.tsx src/components/ui/input.tsx src/components/ui/textarea.tsx src/components/ui/select.tsx src/components/ui/switch.tsx src/components/ui/checkbox.tsx src/components/ui/radio-group.tsx src/components/ui/slider.tsx
git commit -m "Build UI interactive form component library"

# 7
git add src/components/ui/menubar.tsx src/components/ui/navigation-menu.tsx src/components/ui/context-menu.tsx src/components/ui/dropdown-menu.tsx src/components/ui/breadcrumb.tsx src/components/ui/pagination.tsx src/components/ui/sidebar.tsx
git commit -m "Implement UI structural navigation components"

# 8
git add src/components/ui/accordion.tsx src/components/ui/alert.tsx src/components/ui/aspect-ratio.tsx src/components/ui/avatar.tsx src/components/ui/calendar.tsx src/components/ui/command.tsx src/components/ui/carousel.tsx src/components/ui/chart.tsx
git commit -m "Inject specialized UI presentation components"

# 9
git add src/components/ui/collapsible.tsx src/components/ui/input-otp.tsx src/components/ui/label.tsx src/components/ui/progress.tsx src/components/ui/resizable.tsx src/components/ui/scroll-area.tsx src/components/ui/sonner.tsx src/components/ui/table.tsx src/components/ui/tabs.tsx src/components/ui/toggle-group.tsx src/components/ui/toggle.tsx src/components/ui/tooltip.tsx
git commit -m "Finalize UI component library integration"

# 10
git add src/lib/utils.ts src/hooks/use-mobile.tsx
git commit -m "Add core utility logic and hooks"

# 11
git add src/components/site/Footer.tsx src/components/site/Header.tsx src/components/site/SiteShell.tsx
git commit -m "Structure responsive site shell boundaries"

# 12
git add src/router.tsx src/routes/__root.tsx src/routeTree.gen.ts
git commit -m "Configure TanStack routing layer"

# 13
git add src/assets/hero-links.jpg src/assets/charity-climate.jpg src/assets/charity-education.jpg src/assets/charity-food.jpg src/assets/charity-water.jpg
git commit -m "Integrate visual layout assets"

# 14
git add src/routes/index.tsx
git commit -m "Construct homepage marketing layout"

# 15
git add supabase/schema.sql
git commit -m "Design database schema and security policies"

# 16
git add src/lib/supabase.ts .env.example
git commit -m "Set up database connection infrastructure"

# 17
git add src/routes/charities.tsx
git commit -m "Build dynamic charity fetching directory"

# 18
git add src/routes/login.tsx
git commit -m "Implement secure user authentication flow"

# 19
git add src/routes/pricing.tsx
git commit -m "Integrate Stripe subscription tiers"

# 20
git add src/routes/api/webhooks/stripe.ts
git commit -m "Configure payment fulfillment webhooks"

# Catch-all for any trailing files
git add .
git commit -m "Finalize repository configuration" || true
