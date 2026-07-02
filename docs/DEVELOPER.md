---
doc_id: PORTAL-009
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\DEVELOPER.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-009
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Developer Guide

For developers: setup instructions, project architecture, key files, testing strategy.

## Table of Contents

1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [Key Services](#key-services)
4. [Adding Features](#adding-features)
5. [Testing](#testing)
6. [Debugging](#debugging)

---

## Setup

### Prerequisites

```bash
node -v      # >= 18.0.0
npm -v       # >= 9.0.0
git --version
```

### Clone & Install

```bash
git clone https://github.com/sistema-punta-cana/sistema-academico-pwa.git
cd sistema-academico-pwa
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

Configure in `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
VITE_API_BASE=http://localhost:3000
SENTRY_DSN=https://...@sentry.io/...
```

### Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Project Structure

### Directories

```
src/
├── portal-maestros/            # Teacher portal (PWA)
│   ├── views/                  # Page components (routing)
│   │   ├── loginView.js
│   │   ├── planificacionView.js
│   │   ├── observacionView.js
│   │   ├── evaluacionView.js
│   │   ├── configView.js
│   │   └── ...
│   ├── components/             # Reusable UI components
│   │   ├── notificacionesPanel.js
│   │   ├── studentList.js
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── notificationService.js
│   │   ├── pushService.js
│   │   ├── lessonPlanService.js
│   │   ├── observationService.js
│   │   └── ...
│   ├── auth/                   # Authentication
│   │   ├── maestroAuth.js
│   │   ├── usePortalAuth.js
│   │   └── ...
│   ├── styles/                 # Scoped CSS
│   │   ├── portal.css
│   │   └── ...
│   └── router/                 # SPA routing
│       └── portalRouter.js
├── services/                   # Cross-app services
│   ├── errorReporter.js        # Sentry integration
│   ├── auditService.js         # Data mutation logging
│   ├── analyticsService.js     # User tracking
│   ├── database.js             # Supabase client
│   └── ...
├── middleware/                 # Request/response
│   ├── permissionCheck.js      # RBAC enforcement
│   ├── inputValidation.js      # Data validation
│   ├── rateLimit.js            # Rate limiting
│   └── ...
├── core/                       # Shared core
│   ├── router.js
│   ├── auth.js
│   └── config.js
├── lib/                        # Supabase client
├── shared/                     # Shared components
├── main.js                     # App entry point (legacy)
└── main-maestros.js            # App entry point (portal)

config/
├── security-headers.js         # CSP, X-Frame-Options
├── rateLimit.js                # Rate limit config
├── cors.js                     # CORS policy
└── vite.config.js              # Build config

tests/
├── unit/
│   ├── services/               # Service tests
│   ├── components/             # Component tests
│   └── ...
├── integration/                # Integration tests
│   └── ...
└── e2e/                        # End-to-end tests
    └── ...

docs/
├── README.md
├── USER_GUIDE.md
├── DEVELOPER.md                # This file
├── API_REFERENCE.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
├── SECURITY.md
└── COMPLIANCE.md
```

---

## Key Services

### Authentication (`src/portal-maestros/auth/maestroAuth.js`)

```javascript
import { loginMaestro } from './maestroAuth.js'

// Login
const result = await loginMaestro(email, password)
if (result.success) {
  // Store maestro in auth state
  usePortalAuth.setMaestro(result.maestro)
}
```

### Notifications (`src/portal-maestros/services/notificationService.js`)

```javascript
import { notificationService } from './notificationService.js'

// Start polling (30-second intervals)
notificationService.startPolling()

// Listen for new notifications
notificationService.on('notification', (notification) => {
  console.log('New notification:', notification)
})

// Deduplication: prevents push + polling duplicates
// Key format: `${tipo}:${relatedId}:${minuteBucket}`
```

### Error Reporting (`src/services/errorReporter.js`)

```javascript
import { reportError } from './errorReporter.js'

try {
  // Code that might error
} catch (error) {
  reportError(error, { context: 'lesson-plan', userId: '123' })
}
```

### Audit Logging (`src/services/auditService.js`)

```javascript
import { auditLog } from './auditService.js'

// Log data mutations
await auditLog('CREATE', 'observation', observationId, {
  user_id: maestroId,
  changes: { texto: newText },
})
```

---

## Adding Features

### Adding a New View (Page)

1. **Create the view component:**

```javascript
// src/portal-maestros/views/newFeatureView.js
export function renderNewFeatureView(container) {
  container.innerHTML = `
    <div class="feature-container">
      <h1>New Feature</h1>
      <!-- Content here -->
    </div>
  `
  
  // Event listeners
  container.querySelector('.button').addEventListener('click', () => {
    // Handle click
  })
}
```

2. **Register in router:**

```javascript
// src/portal-maestros/router/portalRouter.js
import { renderNewFeatureView } from '../views/newFeatureView.js'

const routes = {
  '/new-feature': {
    component: renderNewFeatureView,
    protected: true, // Requires login
  },
}
```

3. **Add test:**

```javascript
// src/portal-maestros/views/__tests__/newFeatureView.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderNewFeatureView } from '../newFeatureView.js'

describe('NewFeatureView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
  })

  it('renders content', () => {
    renderNewFeatureView(container)
    expect(container.querySelector('h1').textContent).toBe('New Feature')
  })
})
```

### Adding a New Service

1. **Create service:**

```javascript
// src/portal-maestros/services/newService.js
const newService = {
  async doSomething(param) {
    // Implementation
    return result
  },
}

export { newService }
```

2. **Add test:**

```javascript
// src/portal-maestros/services/__tests__/newService.test.js
import { describe, it, expect, vi } from 'vitest'
import { newService } from '../newService.js'

describe('newService', () => {
  it('does something', async () => {
    const result = await newService.doSomething('test')
    expect(result).toBe('expected')
  })
})
```

3. **Use in component/view:**

```javascript
import { newService } from '../services/newService.js'

const result = await newService.doSomething(param)
```

---

## Testing

### Running Tests

```bash
# All tests
npm run test

# Watch mode (rerun on file change)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E only
npm run test:e2e
```

### Writing Tests (Vitest + TDD)

**Pattern: Test → Implement → Verify**

```javascript
// Before: write failing test
import { describe, it, expect } from 'vitest'
import { calculateProgress } from '../progressService.js'

describe('calculateProgress', () => {
  it('calculates progress percentage', () => {
    const result = calculateProgress(7, 10) // 7 of 10
    expect(result).toBe(70)
  })
})

// Then: implement to pass test
export function calculateProgress(completed, total) {
  return (completed / total) * 100
}

// Then: verify test passes
// $ npm run test -- progressService.test.js
// ✓ calculateProgress (1 test passed)
```

### Test Organization

- **Unit**: Single function/component in isolation
- **Integration**: Multiple components working together
- **E2E**: Full user flows

### Mocking

```javascript
import { vi } from 'vitest'

// Mock function
const mockFetch = vi.fn().mockResolvedValue({ ok: true })

// Mock module
vi.mock('./database.js', () => ({
  db: {
    query: vi.fn().mockResolvedValue([]),
  },
}))
```

---

## Debugging

### Browser DevTools

1. **Open DevTools:** F12 or Ctrl+Shift+I
2. **Console:** View logs and errors
3. **Network:** Inspect API calls
4. **Sources:** Breakpoints and step debugging
5. **Application:** View local storage, service worker

### Using Debugger

```javascript
// Add breakpoint
debugger;

// Or in DevTools: set breakpoint on line

// Then inspect variables in console
```

### Common Issues

| Problem | Solution |
|---------|----------|
| Service Worker not updating | Clear Cache Storage (DevTools → Application) |
| Notifications not triggering | Check `notificationService.startPolling()` is called |
| CORS errors | Check `.env.local` VITE_SUPABASE_URL is correct |
| Login not working | Check email/password in console logs |

---

## DataAdapter Pattern

This project follows the **DataAdapter Pattern** for data access:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UI Layer  │ ──▶ │ DataAdapter │ ──▶ │ Data Source │
│             │     │             │     │              │
│  - Views    │     │ - Mock mode │     │ - JSON files│
│  - Components│    │ - Real mode │     │ - Supabase  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Using DataAdapter

```javascript
import { dataAdapter } from '../services/dataAdapter.js'

// Auto-switches between Mock (demo) and Supabase (production)
const students = await dataAdapter.students.getAll()

// Force specific mode
const mockOnly = await dataAdapter.withMode('mock').students.getAll()
```

### Adding New Data Sources

1. Create adapter method in `dataAdapter.js`
2. Implement both `mock` and `real` versions
3. Add tests for both modes

---

## Code Style

- **Variables & Functions**: English (camelCase)
- **UI Labels & Documentation**: Spanish
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`)
- **CSS**: CSS Modules with semantic tokens

### Example

```javascript
// Service (English)
async function fetchStudents(maestroId) {
  return await database.query('students', { maestro_id: maestroId })
}

// UI Label (Spanish)
const html = `
  <button class="btn-primary">
    <i class="bi bi-plus"></i>
    Agregar Alumno
  </button>
`
```

---

## Need Help?

- Check [Architecture Guide](./ARCHITECTURE.md) for system design
- Check [API Reference](./API_REFERENCE.md) for endpoints
- Check [Security Model](./SECURITY.md) for permissions
- Contact the development team

---

**Need help?** Check [Architecture Guide](./ARCHITECTURE.md) or contact the team.