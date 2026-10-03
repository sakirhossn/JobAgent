# JobPilot AI — Autonomous AI Job Search & Application Platform

JobPilot AI is a production-ready, autonomous ATS job search, matching, and application automation platform engineered for reliability, absolute data integrity, and complete human-in-the-loop auditability.

---

## 🌟 Key Features

1. **Deterministic Master Candidate Profile**:
   - Stores ground-truth candidate facts (fresher in Kolkata, 5 days joining availability, ₹30k–₹40k/month expectation, target roles, excluded roles).
   - **Absolute Data Integrity**: The AI never fabricates or invents details. If an unverified question arises, the platform strictly halts and routes it to the **Human Action Center**.
2. **Pluggable Job Source Architecture**:
   - `JobSourceAdapter` interface (`searchJobs`, `fetchJobDetails`, `normalizeJob`).
   - Pluggable source registry with mock feed, career portal integrations, and future adapters.
   - Preserves complete original job description byte-for-byte; never overwrites it with AI summaries.
3. **Robust Deduplication**:
   - SHA-256 content hashing and fuzzy composite matching (company + title + location).
   - Links multiple source listings to a single canonical job without duplicate applications.
4. **10-Factor Transparent Matching Engine**:
   - Evaluates: Role Relevance, Mandatory Skills, Preferred Skills, Education, Experience, Location, Salary, Joining Availability, Employment Type, and Candidate Exclusions.
   - Classifies jobs into `AUTO_APPLY_ELIGIBLE`, `REVIEW_REQUIRED`, and `NOT_ELIGIBLE`.
   - Hard deterministic exclusions (e.g. Chemical Engineering exclusion, experience cap).
5. **Truthful ATS CV Tailoring & Versioning**:
   - Master CV is permanently immutable.
   - Each application generates an ATS-tailored CV version emphasizing verified skills, matching keywords, and relevant projects.
   - Every version is archived with content hash and AI prompt version.
6. **Multi-Route Application Execution**:
   - **Website Portals**: Automatically inspects form fields, answers only verified questions, stops on unknown questions/CAPTCHA, and captures submission confirmation ID.
   - **Email Applications**: Direct email dispatch with tailored CV attachment and provider message ID logging.
   - **Manual Review**: Flags complex portals for administrator review in the Human Action Center.
7. **Complete State Machine & Observability**:
   - Immutable `ApplicationEvent` ledger per status transition.
   - Full KPI overview, funnel charts, and system logs.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js >= 18 (Tested on v22.19.0)
- npm >= 10

### 1. Installation
```bash
git clone <repo-url>
cd JobAgent
npm install
```

### 2. Database Setup (SQLite for zero-config local run)
```bash
npx prisma db push
npm run db:seed
```

### 3. Run Automated Tests
```bash
npm test
```
Runs the full Vitest suite covering deduplication, profile integrity, matching and deterministic exclusions, CV tailoring, and the end-to-end 12-step recruitment pipeline.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Admin Operations Dashboard.

---

## ☁️ Free / Low-Cost Production Deployment

### 1. Database: Supabase (Free Tier PostgreSQL)
1. Create a free project at [supabase.com](https://supabase.com).
2. Copy the PostgreSQL connection URI from **Project Settings → Database → Connection string (URI)**.
3. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Push schema to Supabase:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   *(Alternatively, execute `prisma/schema.sql` directly in Supabase SQL Editor).*

### 2. Web & API: Vercel (Free Tier)
1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set Environment Variables in Vercel project settings:
   - `DATABASE_URL`: `postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `AI_PROVIDER`: `mock` (or `gemini` with `GEMINI_API_KEY`)
   - `DEFAULT_APPLICATION_POLICY`: `APPROVAL_REQUIRED`
   - `MAX_DAILY_APPLICATIONS`: `10`
4. Deploy!
