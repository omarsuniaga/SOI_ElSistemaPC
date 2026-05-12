# System Architecture

Portal Maestros is a Progressive Web App (PWA) with a modern, scalable architecture.

## Overall Design

```
┌─────────────────────────────────────────────────────┐
│           Browser (PWA)                              │
│  ┌────────────────────────────────────────────────┐  │
│  │ Vue 3 + Vite (Reactive UI)                     │  │
│  │ - Portal Maestros (Teacher Interface)          │  │
│  │ - Admin Panel                                  │  │
│  └────────────────────────────────────────────────┘  │
│           ↓                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Service Worker (Offline + Caching)             │  │
│  │ - Local notification scheduling                │  │
│  │ - Cache-first strategy for assets              │  │
│  │ - Web Push handling                            │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
           ↓ (HTTPS)
┌─────────────────────────────────────────────────────┐
│        Supabase Backend                              │
│  ┌────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                            │  │
│  │ - Teachers table                               │  │
│  │ - Students table                               │  │
│  │ - Observations, Evaluations, etc.              │  │
│  │ - Audit logs (all mutations)                   │  │
│  └────────────────────────────────────────────────┘  │
│           ↓                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Supabase Auth (JWT)                            │  │
│  │ - Email/password login                         │  │
│  │ - Session management                           │  │
│  │ - WebAuthn support                             │  │
│  └────────────────────────────────────────────────┘  │
│           ↓                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Supabase Realtime (WebSocket)                  │  │
│  │ - Live notifications                           │  │
│  │ - Multi-user updates                           │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Layers

### 1. Presentation Layer

**Files:** `src/portal-maestros/views/`, `src/portal-maestros/components/`

- Vanilla JS (no framework) with semantic HTML
- Responsive design (mobile-first)
- Accessible (WCAG 2.1 AA)
- Error Boundary component catches crashes

### 2. Business Logic Layer

**Files:** `src/portal-maestros/services/`

Services encapsulate core logic:
- `notificationService.js` — polling + deduplication
- `lessonPlanService.js` — CRUD for lesson plans
- `observationService.js` — recording and storage
- `authService.js` — authentication flows

### 3. Data Layer

**Files:** `src/services/database.js`

- Supabase client
- Query builders
- Row-level security (RLS)
- Real-time subscriptions

### 4. Cross-Cutting Concerns

**Files:** `src/services/`, `src/middleware/`

- `errorReporter.js` — Sentry integration
- `auditService.js` — Mutation logging
- `analyticsService.js` — User tracking
- `permissionCheck.js` — RBAC enforcement
- `inputValidation.js` — Data validation
- `rateLimit.js` — Rate limiting

## Data Flow

### Lesson Planning Workflow

```
User clicks "Nueva Planificación"
    ↓
renderNewLessonView() called
    ↓
Form displayed with route/level selectors
    ↓
User fills objectives, activities, duration
    ↓
User clicks "Crear"
    ↓
inputValidation checks (client-side):
  - Required fields present
  - Duration is number > 0
  - Text length reasonable
    ↓
lessonPlanService.createPlan() called
    ↓
HTTP POST /api/lessons/plans
    ↓
Server-side validation:
  - Joi schema check
  - User has permission (teacher role)
  - Route/level exist
    ↓
auditService.log('CREATE', 'lesson_plan', id, changes)
    ↓
Database INSERT
    ↓
Response with plan ID
    ↓
UI updates: "Plan created ✅"
```

### Observation Recording Workflow

```
User clicks student name
    ↓
observationEditor displays
    ↓
User types observation
    ↓
@Mention detected: show student dropdown
    ↓
#Indicator detected: show indicator picker
    ↓
User clicks "Estructurar con IA" (optional)
    ↓
Text sent to Groq API
    ↓
AI response: structured [context, behavior, skill]
    ↓
User clicks "Guardar"
    ↓
inputValidation checks:
  - Text not empty
  - DOMPurify cleans HTML
    ↓
observationService.save()
    ↓
HTTP POST /api/observations
    ↓
Server validation + audit log
    ↓
Database INSERT
    ↓
notificationService updates UI
```

## Scaling Considerations

### Database Indexing

**Current indexes:**
- `observations (student_id, created_at)` — queries by student over time
- `observations (maestro_id, created_at)` — queries by teacher
- `evaluations (student_id, route_id)` — progress tracking
- `audit_logs (user_id, created_at)` — audit queries

### Caching Strategy

- **Browser**: Service Worker caches assets (cache-first)
- **HTTP Headers**: max-age=3600 for static assets
- **Database Queries**: Results cached in localStorage for 5 minutes (with clear on mutation)

### Real-Time Updates

- Supabase Realtime for multi-user scenarios
- WebSocket subscriptions on notification table
- Client-side deduplication to prevent duplicates

## Error Handling

```javascript
// Global error boundary
window.addEventListener('error', (event) => {
  errorReporter.captureException(event.error)
  // Don't crash: show user-friendly message
})

// API errors
try {
  await api.post('/observations', data)
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 429) {
    // Rate limited: show message, retry later
  } else {
    // Generic error: log and show to user
    reportError(error)
  }
}
```

---

Detailed diagrams and sequence charts in `/docs/architecture/` subdirectory.
