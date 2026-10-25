# SmartCRM — Proactive Retention & Relationship Management Platform

SmartCRM is a modern, responsive customer relationship management web application designed for small and mid-sized businesses (SMBs). It proactively surfaces customer engagement trends, churn risks, overdue complaint SLAs, and recommended follow-up actions with transparent, explainable decision logic.

---

## 🌟 Key Features

### 1. Executive Dashboard
- **Key Metrics:** Total active customers, retention rate, open sales pipeline value, and complaint inbox health.
- **Visual Analytics:** Interactive customer base growth and recognized revenue charts with responsive date-range filtering.
- **Customers to Watch:** Early warning cards detailing account health scores, contributing churn signals, owners, and last activity timestamps.
- **Recommended Actions:** Prioritized follow-ups (e.g. check-in calls, deal progression, SLA tickets) that can be marked done, scheduled, or dismissed with outcomes recorded.

### 2. Customers Directory & Detailed Profiles
- **Directory:** Searchable, filterable, and paginated customer list by name, company, email, status, and health band.
- **Customer Profiles:** 360-degree view containing customer contact info, health score breakdown, purchase history, communication timeline, associated pipeline deals, and complaints.
- **Activity Logging:** Quick modal to log phone calls, emails, meetings, and internal notes.
- **Duplicate Prevention:** Normalized email comparison with instant duplicate detection warnings before creation.

### 3. Leads & Sales Pipeline (Kanban & List)
- **Visual Kanban Board:** Drag or select stages: *New*, *Qualified*, *Proposal*, *Negotiation*, *Won*, and *Lost*.
- **Metrics:** Real-time tracking of active pipeline volume, closed-won totals, and deal conversion rates.
- **Deal Management:** Record contact details, opportunity values, expected close dates, sources, and internal deal notes.

### 4. Complaints & SLA Inbox
- **Master-Detail Inbox:** Triage customer issues with real-time severity levels, sentiment tags, and SLA countdowns.
- **Transparent Priority Score:** Computed from issue severity (0-30 pts), negative sentiment (0-20 pts), customer tier (0-25 pts), and time remaining to SLA (0-25 pts).
- **Internal Notes:** Private collaboration thread for staff to coordinate resolution without exposing internal dialogue.

### 5. Explainable AI Insights
- **Churn Risk Detection:** Evaluates purchase recency, order frequency, unresolved complaints, and activity intervals to categorize accounts into *Healthy*, *At-Risk*, or *Critical*.
- **Sentiment Classification:** Fast, deterministic sentiment parsing with confidence scores and keyword extraction. Staff can manually verify or override any label.
- **Action Triggers:** Suggests concrete next steps (e.g., schedule catch-up, resolve invoice dispute).
- **Graceful Fallback:** Operates without third-party API keys using transparent, explainable rule-based heuristics.

### 6. Data Import & Quality Control
- **CSV Import Wizard:** 4-step wizard (File Upload &rarr; Column Mapping &rarr; Validation Preview &rarr; Completion).
- **Quality Checks:** Identifies missing values, validates email syntax, and flags duplicate emails both within the file and against existing CRM records.
- **No Silent Overwrites:** Explicit choice to either skip duplicates or import as distinct profiles.
- **Rejected Rows Report:** One-click download of invalid rows with descriptive error columns.

### 7. Role-Based Access Control (RBAC) & Governance
- **Roles:**
  - **Admin:** Complete access to workspace settings, user management, and all records.
  - **Manager:** Team-wide access across records, complaints, pipeline, and analytics.
  - **Employee:** Focused access on assigned customer accounts, leads, and complaints.
- **Interactive Role Simulator:** One-click role switcher in the sidebar to test UI and data access restrictions in demo mode.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) & React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Components:** Accessible primitives with Radix UI & CVA
- **Charts:** Recharts
- **Data Validation & Parsing:** Zod & PapaParse
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node 20 / Node 24)
- npm or pnpm

### 1. Installation
Clone the repository and install dependencies:
```bash
cd smartcrm
npm install
```

### 2. Run Locally in Demo Mode
SmartCRM comes configured with an in-memory sample database so you can test all features immediately without setting up external accounts:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Connect to Supabase (Optional for Production)
To connect a live Supabase PostgreSQL database:
1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
2. Set your Supabase project URL and keys in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
3. Run migrations and seed data in your Supabase SQL editor:
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/seed.sql`

---

## 🔐 Security & Row Level Security (RLS)

All business records are strictly scoped to a `workspace_id`. Security policies defined in `supabase/migrations/001_initial_schema.sql` enforce:
- Workspace membership verification (`is_workspace_member(workspace_id)`)
- Admins & Managers can modify team records
- Employees can update assigned customers and deals
- All privileged actions validate authorization on the server

---

## 📊 AI Heuristics vs. ML Models

SmartCRM does not rely on opaque third-party AI endpoints to function:
- **Demo / Fallback Mode:** Employs deterministic, explainable rule-based heuristics. The exact logic and weights (e.g., purchase recency thresholds, sentiment keyword dictionaries) are visibly documented directly in the UI.
- **Future Integration:** Server handlers in `src/lib/ai/` are architected to seamlessly plug into OpenAI, Anthropic, or Gemini endpoints when API keys are configured.
