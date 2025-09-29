# MASTER PROMPT — ArtSaaS (saas01 + art04 fusion) for CLIne

You are CLIne, a code generation / scaffolding agent. Your goal is to generate a complete, working SaaS project called “ArtSaaS” that starts from the **saas01** boilerplate and integrates the key features of **art04**. Use this prompt to guide your work. Maintain a persistent checklist of tasks; mark them DONE as you implement them. Generate code, config, docs, and examples.

---

## Goals & Requirements

1. **Base Starting Point**  
   - Clone or scaffold the structure and tooling of **saas01** as the foundation.  
   - Retain its auth, payments, LLM/local inference, design system, theme switcher, and layout features.

2. **Incorporate Art04 Features**  
   - User roles: Artist, Volunteer, Admin (and possibly Guest).  
   - Artist Profiles / Portfolios: Artists can sign up, add profile information, upload artworks/images, have galleries.  
   - Mentorship System: Volunteers can offer mentorship; artists can request; log mentorship sessions.  
   - Mental Health Assessments: Provide forms (PHQ-9, GAD-7 or equivalent), store assessment results per user, show trends.  
   - Dashboards: For artists, volunteers, and admins to see metrics (e.g. number of mentors, assessment stats, donations, portfolio views).  
   - Financial Support / Donations: Either via Stripe (one-off donations) or recurring support; reporting of contributions.  

3. **Technical Stack & Local-First**  
   - Next.js + TypeScript (App Router).  
   - Tailwind CSS + shadcn/ui with Radix.  
   - Backend: PocketBase for local dev; optionally Prisma + SQLite/PostgreSQL if needed for more relational features.  
   - LLM / inference hooks (mock + real) as in saas01.  
   - Payments: Stripe example + PayPal.  
   - Charts / Data Visualization (e.g. Recharts).  

4. **UX / UI / Accessibility**  
   - Responsive design.  
   - Theme switching (light/dark).  
   - Accessible components.  
   - Good onboarding flows: registration, profile setup, upload flow, assessment UI, etc.  
   - Proper form validation, errors, loading states.  

5. **Developer Tools / DX**  
   - Scripts: `init-dev.sh`, `bootstrap`/`seed` scripts, start scripts.  
   - `.env.example` with required env variables.  
   - Tests: at least smoke tests, UI test for dashboard, backend wrappers.  
   - CI skeleton (GitHub Actions or similar).  
   - Documentation: README, usage, contrib.  

---

## Persistent Checklist

- [ ] Clone / scaffold saas01 base (retain design, components, theme)  
- [ ] Setup roles: Artist, Volunteer, Admin authentication and role enforcement  
- [ ] Artist profile & portfolio feature (upload images, gallery pages)  
- [ ] Mentorship: request/offering system + session logging UI & models  
- [ ] Mental health assessment forms + results + trends charting  
- [ ] Payment / financial support flows (donations, optional subscriptions)  
- [ ] Dashboards for each user type (artist, volunteer, admin)  
- [ ] Chart components for impact metrics  
- [ ] Local inference / LLM hooks (mock + real)  
- [ ] Tailwind + shadcn UI theming, dark mode, component polish  
- [ ] Scripts: setup, seed, start local  
- [ ] Environment variables & example file  
- [ ] Tests & CI workflow  
- [ ] Documentation (README, contributing, deployment)  

---

## File & Feature Map to Implement

For each item in checklist, plan out the files and features needed. Example mapping:

- **Roles & Auth**: update backend schema (PocketBase or Prisma) → role field; frontend auth logic; role-guarded pages.  
- **Profile & Portfolio**: new collections / tables for `artists`, `artworks`; image upload endpoint or PB storage; frontend pages: profile edit, gallery view.  
- **Mentorship**: collections/tables for `mentorship_requests`, `sessions`; UI pages for request form, session log; Volunteer / Artist dashboards.  
- **Assessments**: assessment schema; form component(s); store results; chart/trends UI.  
- **Payments**: example API route or PB hook; Stripe checkout example; possible donation component; reports.  
- **Charts**: integrate a chart library; mock data then real data; frontend components.  

---

## Generation Instructions

- Begin by producing updated `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`, directory scaffold based on saas01 but adding new folders as required.  
- Generate backend schema or collection definitions (for PocketBase or Prisma) for all new models.  
- Generate frontend pages/components for new features.  
- Generate mock seed data.  
- Insert comments / TODOs for things requiring secrets (Stripe keys etc).  
- For each feature, produce at least minimal working code.  

---

## Output Format & Expectations

- You must produce the files in repo structure. For each file, include top-comment describing purpose.  
- For every piece of functionality matching an item in the persistent checklist, mark it DONE when you create or wire up the code.  
- After initial scaffold, provide a summary of what is done vs what remains.  

---

## Developer Actions Required (start-up)

At end of generation, show commands:

1. `./scripts/init-dev.sh`  
2. `./scripts/bootstrap-collections.sh` (or equivalent seed)  
3. `./scripts/start-local.sh`  

Then verify in browser:

- Frontend at `localhost:3000`  
- Backend / PocketBase Admin at `localhost:8090/_/`  
- Access key features: Artist profile, assessment form, donation page, mentor session log  

---

## Constraints / Caveats

- If using PocketBase, many relational queries or joins might be limited; plan accordingly or use Prisma + Postgres for production.  
- Managing file uploads for portfolios can be large; handle storage & performance.  
- Stripe webhooks for local dev require tunneling (ngrok etc).  
- Mental health assessment data is sensitive — plan for privacy / encryption / secure storage if needed.  

---

# End of master prompt
