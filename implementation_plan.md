# JobPilot AI: Production-Ready AI Job Search & Application Automation Platform
## Implementation Plan & Architectural Specification

### 1. Architectural Overview & Design Principles
JobPilot AI is an autonomous, reliable, traceable, and human-in-the-loop Job Search and Application Automation Platform built with Next.js (App Router), TypeScript, Tailwind CSS, and a pluggable database layer supporting PostgreSQL (production Supabase/Vercel) and SQLite (zero-config local runtime & CI tests).

#### Core Tenets (Ponytail & GSD Alignment):
- **Truth Invariance**: The AI never fabricates candidate details (employment, degree, skills, dates, salary). Missing information halts the application and routes to the **Human Action Center**.
- **Deterministic First**: Rules and exclusions (e.g. Chemical Engineering exclusion, experience cap, duplicate hashing) are deterministic before invoking LLM logic.
- **Full Traceability**: Every transition creates an immutable `ApplicationEvent`. Original job descriptions are preserved byte-for-byte and never replaced.
- **Pluggable & Vendor-Neutral**: `AIProvider` and `JobSourceAdapter` abstractions allow seamless switching between mock providers, Google Gemini, and custom adapters without code churn.
- **SaaS-Grade UI**: Desktop-first responsive dashboard with real-time stats, timeline auditing, interactive CV viewer/customizer, and full job description search.

---

### 2. High-Level Pipeline Architecture
```
[Job Sources (Adapters)]
       │
       ▼
1. DISCOVERY & EXTRACTION ──► Normalize Schema (preserve raw description & content hash)
       │
       ▼
2. DEDUPLICATION ──────────► Match URL / Company+Title+Location / Description Hash
       │
       ▼
3. AI ANALYSIS & EXTRACTION ─► Extract Seniority, Skills, Requirements, Route, Eligibility
       │
       ▼
4. EXCLUSION ENGINE ───────► Deterministic Exclusions (e.g., Chemical Eng, Over-experience)
       │
       ▼
5. MATCHING ENGINE ────────► Factor-by-factor transparent score: AUTO_APPLY_ELIGIBLE, REVIEW_REQUIRED, NOT_ELIGIBLE
       │
       ▼
6. CV & COVER LETTER ──────► ATS Tailoring based exclusively on verified Master Profile (versioned)
       │
       ▼
7. ROUTE DETERMINATION ────► WEBSITE | EMAIL | MANUAL_REVIEW
       │
       ├──► WEBSITE: Inspect & map fields -> Answer verified info -> Stop on unknown -> Mock Submit
       ├──► EMAIL: Prepare email + tailored CV -> Send via Email Service -> Log Message ID
       └──► MANUAL / UNKNOWN QUESTION: Route to HUMAN_ACTION_REQUIRED queue
       │
       ▼
8. VERIFY & AUDIT ─────────► Confirm submission, store confirmation ID/screenshot ref, log ApplicationEvent
       │
       ▼
9. DASHBOARD & FOLLOW-UP ──► Update funnel analytics, schedule approval-controlled follow-up tasks
```

---

### 3. Phased Implementation Breakdown

#### Phase 1: Foundation, Database & Candidate Profile
- **Project Setup**: Next.js App Router, TypeScript, Tailwind CSS, Lucide icons.
- **Database Schema (Prisma & PostgreSQL DDL)**:
  - `users`, `candidate_profiles`, `candidate_education`, `candidate_experience`, `candidate_skills`, `candidate_projects`
  - `job_sources`, `jobs`, `job_source_links`, `job_requirements`, `job_matches`
  - `cv_templates`, `cv_versions`, `generated_cvs`
  - `applications`, `application_answers`, `application_documents`, `application_events`
  - `emails`, `email_templates`
  - `agent_runs`, `agent_tasks`, `agent_errors`
  - `interviews`, `offers`, `automation_rules`, `settings`
- **Default Master Candidate Profile**:
  - Fresher in Kolkata, can join within 5 days, salary ₹30,000–₹40,000/month.
  - Target roles: Data Analyst, IT, Supply Chain, Operations, Business Analyst.
  - Excluded: Chemical Engineering.
  - Verified education, internships, skills (SQL, Python, Excel, Power BI, Operations), projects, certifications.
  - Editable via Admin Profile UI.

#### Phase 2: Job Source Architecture, Normalization & Deduplication
- `JobSourceAdapter` interface: `searchJobs()`, `fetchJobDetails()`, `normalizeJob()`.
- Source registry with:
  - `MockJobSourceAdapter`: realistic seed jobs in Kolkata/Remote across Data Analyst, IT, Supply Chain, and Chemical Engineering (exclusion test).
  - Web/API/Career Page Adapter interface.
- Normalization into common canonical schema, keeping full original job description and content hashes.
- Deterministic Deduplication: canonical jobs with multi-source links.

#### Phase 3: AI Job Analysis, Matching Engine & Exclusion Engine
- `AIProvider` abstraction:
  - `MockAIProvider` (deterministic, reliable for local tests and zero-cost operation).
  - `GeminiAIProvider` (Google Gemini API integration via `GEMINI_API_KEY`).
- `JobAnalysisAgent`: extracts role, seniority, skills, joining constraints, application method.
- Deterministic `ExclusionEngine`:
  - Excludes banned terms (e.g. Chemical Engineering).
  - Experience mismatch for freshers.
  - Missing mandatory education.
- Transparent `JobMatchingEngine`:
  - Evaluates 10 factors: Role relevance, Mandatory skills, Preferred skills, Education, Experience, Location, Salary, Joining availability, Employment type, Candidate exclusions.
  - Factor-by-factor explanation table.
  - Classification: `AUTO_APPLY_ELIGIBLE`, `REVIEW_REQUIRED`, `NOT_ELIGIBLE`.

#### Phase 4: Master CV, ATS Tailoring & Cover Letter Agents
- Immutable Master CV reference.
- `CVTailoringAgent`: ATS keyword alignment, re-ordering, verified profile emphasis. Zero fabrication guarantee.
- `CoverLetterAgent`: Role-specific, factual, professional letter generation.
- Versioned storage in `generated_cvs` with hash and AI prompt version.
- HTML/Print-ready ATS CV template with instant PDF export preview.

#### Phase 5: Application Route Detection, Email Engine & Human Action Center
- `ApplicationRouteAgent`: classifies into `WEBSITE`, `EMAIL`, or `MANUAL_REVIEW`.
- `EmailApplicationAgent`: generates application emails, tracks delivery status, recipient, message ID.
- `HumanActionCenter`: queue for unknown questions, CAPTCHA, salary/eligibility ambiguity with Resolve, Skip, Reject, Retry actions.
- Application Policy: `AUTO`, `APPROVAL_REQUIRED` (default), `MANUAL`, plus daily limits.

#### Phase 6: Application Automation, Verification & State Machine
- State Machine with full transitions:
  `DISCOVERED -> ANALYZED -> MATCHED -> REVIEW_REQUIRED -> APPROVED -> CV_GENERATED -> APPLICATION_STARTED -> SUBMITTED -> CONFIRMED -> FOLLOW_UP -> INTERVIEW -> OFFER`
  (plus `REJECTED`, `FAILED`, `DUPLICATE`, `HUMAN_ACTION_REQUIRED`).
- Mock Application Portal endpoint (`/api/mock-portal/apply`) to simulate real website application forms, field inspection, profile auto-fill, question verification, and confirmation receipt.
- Immutable `ApplicationEvent` log per transition.

#### Phase 7: Orchestrator, Scheduler, Analytics & Logs
- `AgentOrchestrator`: coordinates runs, logs `AgentRun` and `AgentError` with exponential backoff handling.
- Scheduler runner for discovery, analysis, matching, batch processing.
- Full Admin Dashboard UI:
  - Overview Dashboard with stats and funnel metrics.
  - Jobs table with multi-criteria filters and Full Job Description modal/drawer.
  - Job Details page with factor breakdown and complete original text.
  - Applications list & Application Details with timeline, CV version used, and submitted payloads.
  - Human Action queue.
  - Candidate Profile editor.
  - CV Manager and Email Manager.
  - Settings (daily limit, approval policy, target titles, excluded keywords).
  - System Logs viewer.
  - Global Search across jobs, companies, skills, and IDs.

#### Phase 8: Verification, Test Suite & Documentation
- Unit tests: Deduplication, Matching, Exclusion rules, Profile integrity, Policy check.
- Integration tests: Complete end-to-end flow from discovery to submission and audit logging.
- Low-cost deployment guide (Vercel + Supabase).
- Final review with `/ponytail-review` and `/gsd-code-review`.
