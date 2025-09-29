# Master Prompt & Checklist for Art09

The goal of this document is to serve as the single **master prompt** for CLIne (or another AI assistant) and as the **canonical checklist** of tasks required to fully fix, complete, and polish the Art09 repository.

---

## Prompt for CLIne

You are an expert full-stack engineer. Your job is to **audit, fix, and complete** the Art09 repository.

This repository currently has:
- Broken or inconsistent **role permissions**
- Nonfunctional **links and buttons** across several pages
- **Redirects** missing or not firing correctly after login/logout
- **Incomplete features** (Stripe, file upload, mentorship, assessments, analytics)
- **Bootstrap scripts** that don't fully configure PocketBase and dev environment
- UI/UX issues: missing loading/error states, nonresponsive layouts, accessibility gaps
- **Tests and CI** not configured or incomplete
- **Documentation** outdated and not reflecting real functionality

Your tasks are to **systematically identify, fix, and verify** all issues listed below.

---

## Audit Checklist & Tasks

### ✅ Core Project Health
- [ ] Run `npm run lint`, `npm run type-check`, and resolve all issues
- [ ] Ensure `npm run dev` boots a clean local instance with seeded data
- [ ] Add or fix tests; all should pass with at least 80% coverage
- [ ] Configure GitHub Actions to run lint, type-check, and tests automatically

### 🔒 Roles & Permissions
- [ ] Define clear roles: `guest`, `artist`, `volunteer`, `admin`
- [ ] Document allowed actions for each role (matrix in README)
- [ ] Enforce permissions on server routes (Next.js API, PocketBase rules)
- [ ] Guard client-side UI (disable or hide unauthorized actions)
- [ ] Redirect unauthorized users to correct pages (login, dashboard)
- [ ] Add automated tests for role-based flows

### 📦 Routing & Redirects
- [ ] Audit all routes in `app/` and ensure they exist & render
- [ ] Fix missing or broken redirects after login, logout, signup
- [ ] Add `404` and `catch-all` fallback routes
- [ ] Remove or replace hardcoded URLs with dynamic environment-safe values
- [ ] Verify active nav highlighting across pages

### 🔗 Links, Buttons & Forms
- [ ] Identify all nonfunctional links/buttons; implement missing handlers
- [ ] Fix navigation inconsistencies in header/sidebar
- [ ] Ensure forms (signup, login, upload, requests) validate input & handle errors
- [ ] Provide success/error feedback on every form action
- [ ] Add proper loading states for submit buttons

### 🛠️ Features to Implement/Complete
- [ ] **Stripe integration** for donations/subscriptions
- [ ] **File upload** (artwork images, documents) with proper storage and scaling
- [ ] **Assessments** (PHQ-9, GAD-7) with results tracking and trend charts
- [ ] **Mentorship system** (request, approval, matching, history)
- [ ] **Admin dashboards** (user management, reports, analytics)
- [ ] **Analytics pages** (usage metrics, donation summaries, charts)

### 🧱 Data & Scripts
- [ ] Fix `init-pb.sh` and `bootstrap-collections.sh` to work without errors
- [ ] Ensure initial seeding creates roles, demo users, and example data
- [ ] Add migration/versioning for PocketBase schema
- [ ] Write script to reset/reseed dev database cleanly

### 🚧 Error Handling & Edge Cases
- [ ] Wrap all data fetches with loading & error UI states
- [ ] Handle empty data gracefully (no crashes)
- [ ] Add retry logic for network/API failures
- [ ] Display user-friendly error messages throughout

### 💅 Styling & UX
- [ ] Ensure full responsiveness on mobile, tablet, desktop
- [ ] Fix broken layouts and spacing inconsistencies
- [ ] Add dark/light mode support where missing
- [ ] Ensure semantic HTML, ARIA labels, accessible color contrast
- [ ] Fix image scaling/cropping for artwork display

### 🧪 Tests & CI
- [ ] Write unit tests for core components and hooks
- [ ] Add integration/E2E tests for major flows (login, upload, donation, requests)
- [ ] Set code coverage minimum to 80% in CI
- [ ] Configure CI to fail on lint/type/test errors

### 📚 Documentation
- [ ] Rewrite README to match final features and flows
- [ ] Add setup instructions (PocketBase, env vars, seeding)
- [ ] Provide a "Developer Guide" (roles, architecture, deployment)
- [ ] Document API routes and schema
- [ ] Add troubleshooting and known issues section

---

## Acceptance Criteria
- No broken links, buttons, or routes
- Roles and permissions enforced both client and server side
- All pages redirect correctly based on state and role
- All features implemented and tested
- Dev environment bootstraps cleanly with seed data
- Tests pass with ≥80% coverage
- CI pipeline enforces quality gates
- README and docs fully up to date

---

## Execution Order (Suggested)
1. Core linting, type checks, and dev bootstrap
2. Roles/permissions enforcement and redirects
3. Fix nonfunctional links/buttons/forms
4. Implement missing features (Stripe, uploads, assessments, mentorship, analytics)
5. Add error handling, loading, empty states
6. UX/styling/accessibility polish
7. Tests (unit, integration, E2E)
8. CI pipeline setup
9. Documentation rewrite
10. Final acceptance test and release tag

---

## Output Expectation
When this prompt is executed against the repository, the assistant should produce:
1. A prioritized report of fixes applied
2. The updated codebase with all items checked off
3. Updated README and developer docs
4. Passing CI build with full feature set complete
