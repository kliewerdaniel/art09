# MASTER PROMPT 2 — ArtSaaS Implementation Completion for CLIne

You are CLIne, a code completion agent tasked with implementing the remaining incomplete features of the ArtSaaS platform. This prompt continues from masterprompt.md and focuses on completing the persistent checklist items. ArtSaaS is a comprehensive platform connecting artists with volunteers and supporters, providing mentorship, mental health resources, and financial support for creative communities.

---

## Project Purpose & Context

ArtSaaS empowers creative communities by:
- **Connecting Artists**: Rich profiles, portfolio management, and community building
- **Facilitating Mentorship**: Structured guidance from experienced volunteers
- **Supporting Mental Health**: PHQ-9/GAD-7 assessments with trend tracking
- **Enabling Financial Support**: Donations and recurring support from patrons
- **Providing Analytics**: Impact measurement and progress tracking for all users

The platform serves artists, volunteers, administrators, and supporters with role-based access and tailored experiences.

---

## Current State Assessment

Based on the existing codebase and masterprompt.md checklist, the following items remain **INCOMPLETE**:

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

## Implementation Priority & Dependencies

### Phase 1: Foundation (Prerequisites)
1. **Base Infrastructure**: Complete saas01 scaffolding and project structure
2. **Authentication System**: Role-based auth with Artist, Volunteer, Admin, Guest roles
3. **Environment Setup**: .env configuration and development scripts

### Phase 2: Core Features (User-Facing)
4. **Artist Profiles**: Profile creation, editing, and portfolio management
5. **Artwork Management**: Image upload, gallery display, and artwork metadata
6. **User Dashboards**: Role-specific dashboards with relevant metrics and actions

### Phase 3: Advanced Features (Interactions)
7. **Mentorship System**: Request/offering workflow and session logging
8. **Mental Health Tools**: Assessment forms, results storage, and trend visualization
9. **Financial Support**: Donation flows and payment processing

### Phase 4: Polish & Production (Quality)
10. **UI/UX Enhancement**: Component polish, responsive design, accessibility
11. **Data Visualization**: Charts and analytics for impact metrics
12. **Testing & Documentation**: Comprehensive testing and documentation

---

## Detailed Implementation Guide

### Phase 1: Foundation

#### 1.1 Base Infrastructure
- **Files to Create/Modify**:
  - `package.json`: Ensure all required dependencies (Next.js, PocketBase, Stripe, etc.)
  - `next.config.js`: Optimize for images, configure environment
  - `tailwind.config.ts`: Complete theme configuration
  - `lib/`: Database connections, utilities, configurations

- **Key Dependencies**:
  ```json
  {
    "next": "^14.0.0",
    "pocketbase": "^0.19.0",
    "stripe": "^14.0.0",
    "recharts": "^2.8.0",
    "lucide-react": "^0.292.0"
  }
  ```

#### 1.2 Authentication & Roles
- **Database Schema** (PocketBase collections):
  ```javascript
  // Users collection with role field
  {
    name: "users",
    fields: [
      { name: "role", type: "select", options: ["artist", "volunteer", "admin", "guest"] },
      { name: "profile_complete", type: "bool", default: false }
    ]
  }
  ```

- **Auth Components**:
  - Role-based route protection middleware
  - Sign-up flow with role selection
  - Profile completion wizard

#### 1.3 Environment & Scripts
- **Environment Variables** (.env.example):
  ```env
  POCKETBASE_URL=http://localhost:8090
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  NEXTAUTH_SECRET=your-secret-key
  NEXTAUTH_URL=http://localhost:3000
  ```

- **Development Scripts**:
  - `init-pb.sh`: PocketBase server initialization
  - `bootstrap-collections.sh`: Database schema and seed data
  - `start-local.sh`: Complete development environment

### Phase 2: Core Features

#### 2.1 Artist Profiles
- **Database Schema**:
  ```javascript
  // Artists collection (extends users)
  {
    name: "artists",
    fields: [
      { name: "user", type: "relation", collection: "users" },
      { name: "bio", type: "text" },
      { name: "location", type: "text" },
      { name: "website", type: "url" },
      { name: "artistic_focus", type: "select", options: ["painting", "sculpture", "digital", "photography", "mixed_media"] },
      { name: "experience_level", type: "select", options: ["beginner", "intermediate", "advanced", "professional"] }
    ]
  }
  ```

- **Components**:
  - `app/artists/profile/page.tsx`: Profile editing interface
  - `components/artist-profile.tsx`: Display component
  - `components/portfolio-gallery.tsx`: Artwork grid display

#### 2.2 Artwork Management
- **Database Schema**:
  ```javascript
  // Artworks collection
  {
    name: "artworks",
    fields: [
      { name: "artist", type: "relation", collection: "users" },
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "image", type: "file" },
      { name: "medium", type: "text" },
      { name: "dimensions", type: "text" },
      { name: "year_created", type: "number" },
      { name: "price", type: "number" },
      { name: "is_for_sale", type: "bool", default: false },
      { name: "featured", type: "bool", default: false }
    ]
  }
  ```

- **Components**:
  - `app/artists/portfolio/page.tsx`: Portfolio management
  - `components/artwork-upload.tsx`: Image upload with metadata
  - `components/artwork-card.tsx`: Individual artwork display

#### 2.3 User Dashboards
- **Dashboard Components**:
  - `app/dashboard/page.tsx`: Main dashboard router
  - `components/dashboard/artist-dashboard.tsx`: Artist-specific metrics
  - `components/dashboard/volunteer-dashboard.tsx`: Volunteer activity tracking
  - `components/dashboard/admin-dashboard.tsx`: Platform analytics

### Phase 3: Advanced Features

#### 3.1 Mentorship System
- **Database Schema**:
  ```javascript
  // Mentorship requests
  {
    name: "mentorship_requests",
    fields: [
      { name: "artist", type: "relation", collection: "users" },
      { name: "volunteer", type: "relation", collection: "users" },
      { name: "status", type: "select", options: ["pending", "accepted", "declined", "completed"] },
      { name: "message", type: "text" },
      { name: "requested_at", type: "date" },
      { name: "responded_at", type: "date" }
    ]
  }

  // Mentorship sessions
  {
    name: "mentorship_sessions",
    fields: [
      { name: "request", type: "relation", collection: "mentorship_requests" },
      { name: "session_date", type: "date" },
      { name: "notes", type: "text" },
      { name: "goals_discussed", type: "text" },
      { name: "next_steps", type: "text" },
      { name: "rating", type: "number" }
    ]
  }
  ```

- **Components**:
  - `app/mentorship/requests/page.tsx`: Request management
  - `app/mentorship/sessions/page.tsx`: Session logging
  - `components/mentorship-request-form.tsx`: Request creation
  - `components/session-logger.tsx`: Session documentation

#### 3.2 Mental Health Assessments
- **Database Schema**:
  ```javascript
  // Mental health assessments
  {
    name: "mental_health_assessments",
    fields: [
      { name: "user", type: "relation", collection: "users" },
      { name: "assessment_type", type: "select", options: ["phq9", "gad7", "combined"] },
      { name: "responses", type: "json" },
      { name: "total_score", type: "number" },
      { name: "risk_level", type: "select", options: ["minimal", "mild", "moderate", "severe"] },
      { name: "completed_at", type: "date" },
      { name: "requires_review", type: "bool", default: false }
    ]
  }
  ```

- **Components**:
  - `app/assessments/page.tsx`: Assessment interface
  - `components/assessment-form.tsx`: PHQ-9/GAD-7 forms
  - `components/assessment-results.tsx`: Score display and trends
  - `components/trend-chart.tsx`: Progress visualization

#### 3.3 Financial Support
- **Database Schema**:
  ```javascript
  // Donations
  {
    name: "donations",
    fields: [
      { name: "donor", type: "relation", collection: "users" },
      { name: "artist", type: "relation", collection: "users" },
      { name: "amount", type: "number", required: true },
      { name: "currency", type: "text", default: "usd" },
      { name: "is_recurring", type: "bool", default: false },
      { name: "message", type: "text" },
      { name: "stripe_payment_id", type: "text" },
      { name: "status", type: "select", options: ["pending", "completed", "failed", "refunded"] }
    ]
  }
  ```

- **Components**:
  - `app/donate/page.tsx`: Donation interface
  - `components/donation-form.tsx`: Stripe integration
  - `components/donation-history.tsx`: Transaction history

### Phase 4: Polish & Production

#### 4.1 UI/UX Enhancement
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Loading States**: Skeleton loaders, progress indicators
- **Error Handling**: User-friendly error messages and recovery

#### 4.2 Data Visualization
- **Chart Components**:
  - `components/charts/impact-metrics.tsx`: Community impact data
  - `components/charts/assessment-trends.tsx`: Mental health progress
  - `components/charts/financial-overview.tsx`: Donation analytics

#### 4.3 Testing & Documentation
- **Test Files**:
  - `__tests__/dashboard.test.tsx`: Dashboard functionality
  - `__tests__/auth.test.tsx`: Authentication flows
  - `__tests__/assessments.test.tsx`: Assessment forms

- **Documentation**:
  - Update README.md with implementation details
  - API documentation for all endpoints
  - User guides for each role type

---

## Implementation Checklist

- [ ] **Phase 1: Foundation**
  - [ ] Complete saas01 base scaffolding
  - [ ] Implement role-based authentication
  - [ ] Set up environment variables and scripts

- [ ] **Phase 2: Core Features**
  - [ ] Create artist profile system
  - [ ] Build artwork upload and management
  - [ ] Develop role-specific dashboards

- [ ] **Phase 3: Advanced Features**
  - [ ] Implement mentorship request/offering system
  - [ ] Create mental health assessment tools
  - [ ] Build donation and payment flows

- [ ] **Phase 4: Polish & Production**
  - [ ] Enhance UI/UX with responsive design
  - [ ] Add data visualization components
  - [ ] Implement comprehensive testing
  - [ ] Complete documentation updates

---

## Success Criteria

Each phase should result in:
1. **Working Code**: Functional components and pages
2. **Database Integration**: Proper PocketBase schema and relations
3. **User Experience**: Intuitive interfaces for each user role
4. **Data Flow**: Complete CRUD operations for all features
5. **Error Handling**: Graceful failure states and user feedback

---

## Development Workflow

1. **Implement Phase by Phase**: Complete each phase before moving to the next
2. **Test Incrementally**: Verify functionality at each step
3. **Update Checklist**: Mark items complete as implemented
4. **Documentation**: Keep README and code comments current
5. **Environment Testing**: Ensure all features work in development

---

## Final Verification

After completing all phases, verify:
- [ ] All user roles can register and access appropriate features
- [ ] Artists can create profiles and upload artworks
- [ ] Mentorship requests and sessions function properly
- [ ] Mental health assessments are functional and secure
- [ ] Donations process correctly through Stripe
- [ ] All dashboards display relevant metrics
- [ ] Mobile responsiveness works across devices
- [ ] Dark/light theme switching functions
- [ ] All tests pass
- [ ] Documentation is complete and accurate

---

## Commands for Final Testing

```bash
# Start complete development environment
./scripts/start-local.sh

# Run tests
npm run test

# Build for production
npm run build

# Start production build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) and verify all features work as expected for each user role.

---

# End of master prompt 2
