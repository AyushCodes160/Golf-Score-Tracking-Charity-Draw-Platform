# ⛳ Fairway & Cause
### A Subscription-Driven Golf Platform Combining Performance Tracking, Prize Draws & Charitable Giving

> **Built for the Digital Heroes Full-Stack Development Trainee Assignment**  
> Every feature specified in the PRD has been implemented, including hidden edge cases.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://golf-score-tracking-charity-draw-pl.vercel.app/)
[![GitHub](https://img.shields.io/badge/Source%20Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/AyushCodes160/Golf-Score-Tracking-Charity-Draw-Platform)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com)

---

## 🎯 What Is This?

Fairway & Cause is a **premium SaaS web application** that deliberately avoids the aesthetics of a traditional golf website. It leads with *charitable impact, not sport*. Members subscribe, log their Stableford golf scores, enter automated monthly prize draws, and contribute to a charity of their choosing — all from a single modern interface.

---

## ✨ Feature Overview

### 👤 For Members
| Feature | Description |
|---|---|
| **Subscription Gateway** | Monthly & yearly Stripe-powered plans with real-time status validation |
| **Score Management** | Enter up to 5 rolling Stableford scores (1–45), with automatic oldest-score eviction |
| **Duplicate Date Guard** | Database-enforced constraint prevents two scores on the same date |
| **Score Deletion** | Hover over any score card to reveal a delete button |
| **Charity Selection** | Choose from vetted partner charities with a beautifully designed selector |
| **Charity Allocation Slider** | Set your contribution from the 10% minimum up to 100% of your subscription |
| **Independent Donation** | One-off donation option on the Charity page, completely independent of gameplay |
| **Draw History** | Full transparency page showing all past winning numbers and prize pool breakdowns |
| **Winner Proof Upload** | If you win a prize, upload a screenshot of your scorecard as verification |
| **Payment Status Tracking** | See live status of your winnings: Pending Upload → Under Review → Verified & Paid |

### 🛡️ For Administrators
| Feature | Description |
|---|---|
| **Strict Role Guard** | Admin route is protected — unauthorised users are redirected instantly |
| **Draw Algorithm Toggle** | Switch between pure Random selection or Algorithmic Weighted selection |
| **Simulation Mode** | Run the full draw engine mathematically without committing results to the database |
| **Publish Official Draw** | Permanently records winners, assigns prizes, and logs the jackpot payout |
| **Jackpot Rollover** | If no 5-match winner exists, the jackpot automatically carries forward to the next draw |
| **Verification Queue** | View all uploaded scorecard proofs and approve payouts with a single click |
| **Live Subscriber Stats** | See total active subscriber count at a glance |

### 🔐 Platform-Wide Security
| Feature | Description |
|---|---|
| **Subscription Gateway** | Non-subscribers are intercepted on every authenticated request and redirected to pricing |
| **Row Level Security** | All Supabase tables enforce RLS — users can only read/write their own data |
| **Serverless Backend** | All sensitive operations (Stripe, draw engine) run in Vercel Serverless Functions |
| **Service Role Bypass** | Admin-level operations use a server-side service key that never touches the client |

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                  Vercel (Hosting + Edge)                 │
│                                                         │
│  ┌──────────────────────┐  ┌────────────────────────┐  │
│  │   Vite + React SPA   │  │  Serverless Functions  │  │
│  │   (TypeScript)       │  │  /api/create-checkout  │  │
│  │   Tanstack Router    │  │  /api/execute-draw     │  │
│  │   Tailwind CSS       │  │  /api/stripe-webhook   │  │
│  └──────────────────────┘  └────────────────────────┘  │
└──────────────────┬──────────────────────┬───────────────┘
                   │                      │
         ┌─────────▼──────────┐  ┌────────▼────────┐
         │      Supabase       │  │     Stripe       │
         │  ┌──────────────┐  │  │  Subscriptions   │
         │  │  PostgreSQL  │  │  │  Webhooks        │
         │  │  Auth (JWT)  │  │  │  Checkout        │
         │  │  Row Security│  │  └─────────────────┘
         │  │  Storage     │  │
         │  └──────────────┘  │
         └────────────────────┘
```

### Core Libraries
- **[Vite](https://vitejs.dev/)** — Lightning-fast build tooling
- **[React 18](https://react.dev/)** — UI component framework
- **[Tanstack Router](https://tanstack.com/router)** — Type-safe file-based routing with loaders
- **[Supabase JS](https://supabase.com/docs/reference/javascript)** — Realtime database, auth, and storage client
- **[Stripe Node.js](https://stripe.com/docs/api)** — Subscription lifecycle management
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling

---

## 🗄️ Database Schema

The database is structured across 4 sequential migration files in the `/supabase` directory:

```
supabase/
├── schema.sql              # Core tables: profiles, charities
├── 01_scores.sql           # Scores table + 5-score rolling trigger
├── 02_draw_engine.sql      # Draws + draw_entries tables
├── 03_final_polish.sql     # Verification columns + unique date constraint
└── 04_seed_test_accounts.sql  # Seeds test user & admin credentials
```

### Key Design Decisions

**5-Score Rolling Trigger:** A PostgreSQL trigger automatically deletes the oldest score when a 6th score is inserted, enforcing the rolling window without requiring any frontend logic.

**Unique Date Constraint:** `UNIQUE(user_id, played_at)` on the `scores` table guarantees at the database level that no user can log two rounds on the same calendar day.

**Jackpot Rollover:** The draw engine queries the most recent previous draw. If it had zero tier-5 winners, the jackpot pool value is injected directly into the new draw's jackpot total before publishing.

---

## 💰 Prize Pool Logic (PRD Section 07)

| Match Type | Pool Share | Rollover? |
|---|---|---|
| 5-Number Match (Jackpot) | 40% + any rollover | ✅ Yes |
| 4-Number Match | 35% | ❌ No |
| 3-Number Match | 25% | ❌ No |
| Charity Portion | Individually set (min 10%) | N/A |

- Prize pools are split equally among multiple winners in the same tier
- Charity payout is calculated per-user based on their individual slider setting

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A Supabase project
- A Stripe account (test mode)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/AyushCodes160/Golf-Score-Tracking-Charity-Draw-Platform.git
cd Golf-Score-Tracking-Charity-Draw-Platform

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Fill in your .env values (see below)

# 5. Run the Supabase migrations in order via the SQL Editor

# 6. Start the dev server
npm run dev
```

### Required Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🧪 Test Credentials (Live Site)

| Role | Email | Password |
|---|---|---|
| Regular User | user@gmail.com | `user123` |
| Administrator | admin@gmail.com | `admin123` |

> The admin account has full access to the draw engine, simulation mode, and winner verification queue.

---

## 📋 PRD Compliance Checklist

All items from the Digital Heroes PRD have been implemented:

### Section 04 — Subscription & Payment
- ✅ Monthly and yearly Stripe plans
- ✅ Real-time subscription status check on every authenticated request
- ✅ Non-subscribers redirected to pricing

### Section 05 — Score Management
- ✅ 5-score rolling logic (database trigger)
- ✅ Score range 1–45 enforced (Stableford)
- ✅ Each score includes a date
- ✅ Duplicate date prevention (DB unique constraint)
- ✅ Score deletion UI

### Section 06 & 07 — Draw & Prize System
- ✅ 5/4/3 number match tiers
- ✅ Random draw mode
- ✅ Algorithmic weighted mode (by most frequent scores)
- ✅ Monthly admin-controlled cadence
- ✅ Simulation mode before official publish
- ✅ Jackpot rollover if no 5-match winner
- ✅ Prize splitting among multiple tier winners

### Section 08 — Charity System
- ✅ Charity selection at signup/dashboard
- ✅ Minimum 10% contribution
- ✅ Voluntary increase via slider (up to 100%)
- ✅ Independent donation option (not tied to gameplay)
- ✅ Charity directory with descriptions

### Section 09 — Winner Verification
- ✅ Proof upload (screenshot of scores)
- ✅ Admin review queue
- ✅ Approve/Reject submission flow
- ✅ Payment states: Pending → Under Review → Paid

### Section 10 — User Dashboard
- ✅ Subscription status display
- ✅ Score entry and edit interface
- ✅ Selected charity and contribution percentage
- ✅ Participation summary
- ✅ Winnings overview with payment status

### Section 11 — Admin Dashboard
- ✅ User management via Supabase
- ✅ Draw configuration (Random vs Algorithmic)
- ✅ Run simulations before publishing
- ✅ Publish official results
- ✅ Winners list and verification
- ✅ Mark payouts as completed

### Section 12 — UI/UX
- ✅ Deliberately non-traditional golf aesthetic
- ✅ Emotion-driven design leading with charitable impact
- ✅ Subtle animations and micro-interactions
- ✅ Clear CTA flow throughout
- ✅ Fully responsive (mobile-first)

### Section 13 — Technical Requirements
- ✅ Mobile-first responsive design
- ✅ Secure JWT authentication (Supabase Auth)
- ✅ HTTPS enforced (Vercel)
- ✅ One score per date enforced

---

## 🤝 Contact

**Ayush Kumar**  
📞 +91 9304919635  
GitHub: [@AyushCodes160](https://github.com/AyushCodes160)  
🔗 [GitHub Repository](https://github.com/AyushCodes160/Golf-Score-Tracking-Charity-Draw-Platform)  
🌐 [Live Site](https://golf-score-tracking-charity-draw-pl.vercel.app/)

---

<div align="center">
  <sub>Built with ❤️ for the Digital Heroes Trainee Selection · 2026</sub>
</div>
