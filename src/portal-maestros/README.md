# Portal Maestros PWA 🎵

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://codecov.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Last Updated](https://img.shields.io/badge/last%20updated-2026--05--10-blue)](https://github.com)

Enterprise-grade teacher portal for El Sistema Punta Cana. Streamlined lesson planning, smart observation recording, evaluation, and student progress tracking.

## ✨ Features

| Feature | Status | Tier |
|---------|--------|------|
| Lesson Planning | ✅ | Core |
| Observation Recording | ✅ | Core |
| Evaluation Engine | ✅ | Core |
| Student Progress Tracking | ✅ | Core |
| Real-time Notifications | ✅ | Core |
| Web Push Support | ✅ | Enhanced |
| Error Tracking | ✅ | Enterprise |
| Audit Logging | ✅ | Enterprise |
| GDPR Compliance | ✅ | Enterprise |
| Performance Monitoring | ✅ | Enterprise |

## 🚀 Quick Start

### Installation

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Environment Setup

```bash
cp .env.example .env.local
```

Configure:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
```

### Running Tests

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

## 📚 Documentation

- [User Guide](./docs/USER_GUIDE.md) — Step-by-step for teachers
- [Developer Guide](./docs/DEVELOPER.md) — Setup and architecture
- [API Reference](./docs/API_REFERENCE.md) — All endpoints
- [Deployment Guide](./docs/DEPLOYMENT.md) — Production checklist
- [Architecture Overview](./docs/ARCHITECTURE.md) — System design
- [Security Model](./docs/SECURITY.md) — RBAC and compliance
- [Compliance Checklist](./docs/COMPLIANCE.md) — GDPR and regulations

## 🏗️ Architecture

Portal Maestros is built on a modular, PWA-first architecture:

- **Frontend**: Vue 3 + Vite (< 500KB gzipped)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Real-time**: Web Push + Service Worker + Supabase Realtime
- **Notifications**: Web Push + PWA reminders + inbox realtime + polling fallback
- **Testing**: Vitest + Playwright
- **Monitoring**: Sentry + Web Vitals

## 🔒 Security

- Granular RBAC (Teacher, Admin, Observer)
- CSRF protection on all mutations
- Input validation (DOMPurify client, joi server)
- Rate limiting (100 req/min per user)
- GDPR right-to-be-forgotten
- Data export on demand
- Security headers (CSP, X-Frame-Options, etc.)

## 📊 Performance

- **Bundle Size**: < 500KB (gzipped)
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Route Lazy Loading**: All non-critical routes split
- **Service Worker Caching**: Offline-first strategy
- **Database Indexing**: Optimized for fast queries

## 🎯 Development

### Project Structure

```
src/
├── portal-maestros/          # Teacher portal
│   ├── views/                # Page components
│   ├── components/           # Reusable UI components
│   ├── services/             # Business logic
│   ├── auth/                 # Authentication
│   └── styles/               # Scoped CSS
├── services/                 # Cross-app services
│   ├── errorReporter.js      # Error tracking
│   ├── auditService.js       # Data mutations
│   ├── analyticsService.js   # User behavior
│   └── database.js           # DB interactions
└── middleware/               # Request/response
    ├── permissionCheck.js    # RBAC
    ├── inputValidation.js    # Data validation
    └── rateLimit.js          # Rate limiting

config/
├── security-headers.js       # CSP, X-Frame-Options
└── cors.js                   # CORS policy
```

### Key Files

| File | Purpose |
|------|---------|
| `src/main-maestros.js` | App entry point |
| `src/portal-maestros/auth/maestroAuth.js` | Login logic |
| `src/portal-maestros/services/notificationService.js` | Inbox + realtime + dedup + toast |
| `src/portal-maestros/services/pushService.js` | Web Push + preferences + local reminders |
| `src/portal-maestros/views/` | All page routes |

## ⚗️ Testing

- **Unit Tests**: Vitest (src/**/*.test.js)
- **Integration Tests**: Vitest with Supabase mock
- **E2E Tests**: Playwright (tests/e2e/*.spec.js)
- **Coverage Target**: > 90%

Run tests:

```bash
npm run test                  # All tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:e2e             # E2E only
```

## 📈 Monitoring

Portal Maestros integrates:

- **Sentry**: Error tracking and alerting
- **Web Vitals**: Performance metrics (LCP, FID, CLS)
- **Audit Logs**: All data mutations logged
- **Analytics**: User behavior tracking (consent-based)

View dashboards:

- Sentry: [sentry.io/...](https://sentry.io)
- Performance: See `Monitoring` section in Admin panel
- Audit Log: Admin → Settings → Audit Log

## 🚀 Deployment

### Production Checklist

```bash
# 1. Test
npm run test && npm run test:e2e

# 2. Build
npm run build

# 3. Analyze bundle
npm run build --analyze

# 4. Deploy
vercel deploy --prod
```

See [Deployment Guide](./docs/DEPLOYMENT.md) for full checklist.

## 🐛 Bug Reports

Found a bug? Create an issue on GitHub or contact the dev team.

## 📝 License

MIT © El Sistema Punta Cana

## 🤝 Contributing

See [Contributing Guide](./CONTRIBUTING.md)

---

**Last Updated:** May 10, 2026  
**Maintained by:** Dev Team  
**Version:** 1.0.0
