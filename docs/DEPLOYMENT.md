---
doc_id: PORTAL-005
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\DEPLOYMENT.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-005
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Deployment Guide

Production deployment checklist and rollback procedures.

## Pre-Deployment Checklist

- [ ] **Code Review**: All PRs reviewed and approved
- [ ] **Tests Passing**: `npm run test` and `npm run test:e2e`
- [ ] **Coverage**: > 90% test coverage
- [ ] **Build**: `npm run build` succeeds
- [ ] **Bundle Size**: `npm run build --analyze` < 500KB gzipped
- [ ] **No Console Errors**: Check browser DevTools
- [ ] **Migrations**: All database migrations applied
- [ ] **Environment**: Production `.env` configured
- [ ] **Sentry DSN**: Error tracking enabled
- [ ] **Security Headers**: CSP, X-Frame-Options set

---

## Deployment Steps

### 1. Build

```bash
npm run build
```

Expected output:
```
✓ vite v4.x.x building for production...
✓ 1234 modules transformed
✓ built in 45.2s
```

### 2. Test Built Version Locally

```bash
npm run preview
# Open http://localhost:4173
# Verify app loads and functions work
```

### 3. Deploy to Production

**Using Vercel:**

```bash
vercel deploy --prod
```

**Using custom server:**

```bash
# Copy dist/ to production server
scp -r dist/* user@server:/var/www/portal-maestros/

# Restart service
ssh user@server 'systemctl restart portal-maestros'
```

**Using Docker:**

```bash
docker build -t portal-maestros:latest .
docker run -d -p 80:80 --env-file .env.production portal-maestros:latest
```

### 4. Verify Deployment

```bash
# Check app loads
curl https://portal-maestros.elsistema.pc

# Check security headers
curl -I https://portal-maestros.elsistema.pc
# Should see: Content-Security-Policy, X-Frame-Options, etc.

# Check Service Worker
curl https://portal-maestros.elsistema.pc/sw.js
```

### 5. Monitor

- **Sentry**: Check for errors https://sentry.io/...
- **Performance**: Check Core Web Vitals
- **Users**: Monitor login success rate
- **Audit Logs**: Check for unusual activity

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Supabase
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...

# API
VITE_API_BASE=https://api.elsistema.pc

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production

# Features
VITE_DEMO_MODE=false
```

### Security Headers Configuration

In `config/security-headers.js`:

```javascript
module.exports = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}
```

---

## Rollback Procedure

If issues detected within 1 hour:

### Quick Rollback (Vercel)

```bash
# See deployment history
vercel ls

# Rollback to previous version
vercel rollback
```

### Manual Rollback

```bash
# Restore previous build
scp -r /backups/dist.prev/* user@server:/var/www/portal-maestros/

# Restart
ssh user@server 'systemctl restart portal-maestros'

# Verify
curl https://portal-maestros.elsistema.pc
```

### Docker Rollback

```bash
# List previous images
docker images

# Rollback to previous version
docker run -d -p 80:80 portal-maestros:previous-tag
```

### Communication

1. Post in #status: "Deploying Portal Maestros v1.x.x"
2. After deploy: "✅ Portal Maestros v1.x.x deployed"
3. If rollback: "⚠️ Rolled back due to [issue]"

---

## Backup Procedure

**Before each deployment:**

```bash
# Backup current production build
ssh user@server 'cp -r /var/www/portal-maestros /backups/portal-$(date +%Y%m%d_%H%M%S)'

# Backup database
pg_dump -h db.elsistema.pc portal_maestros > backups/db_$(date +%Y%m%d).sql

# Verify backup
ls -lh /backups/
```

### Database Backup (Supabase)

```bash
# Export via Supabase CLI
supabase db dump > backup_$(date +%Y%m%d).sql

# Or via pg_dump
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

---

## Performance Targets

Post-deployment, verify:

| Metric | Target | Check |
|--------|--------|-------|
| **Page Load (LCP)** | < 2.5s | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Web Vitals |
| **Bundle Size** | < 500KB | `npm run build --analyze` |
| **Error Rate** | < 0.1% | Sentry dashboard |
| **API Response Time** | < 200ms | Server logs |

### Lighthouse Check

```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Or manual
npx lighthouse https://portal-maestros.elsistema.pc \
  --output=json \
  --output-path=./lighthouse-report.json
```

---

## Troubleshooting

### 404 on Routes

**Problem:** Refreshing page shows 404

**Solution:**
```bash
# Ensure all routes configured in server
# For SPA: all routes should serve index.html
# Vercel: automatic
# Custom server: configure fallback to index.html
```

**Nginx configuration:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Service Worker Not Updating

**Problem:** Users on old version after deploy

**Solution:**
```bash
# Invalidate cache
curl -X POST https://api.cloudflare.com/client/v4/zones/... \
  -H "Authorization: Bearer token" \
  -d '{"files":["/*"]}'
```

**Or in the Service Worker:**
```javascript
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate new SW
});
```

### Database Migrations Failed

**Problem:** Production database out of sync

**Solution:**
```bash
# Rollback immediately
vercel rollback

# Fix migration locally
npm run migrate:rollback
npm run migrate:up

# Re-deploy
vercel deploy --prod
```

### CORS Errors in Production

**Problem:** API calls fail with CORS errors

**Solution:**
1. Check `VITE_SUPABASE_URL` is correct in production env
2. Verify Supabase project settings allow your domain
3. Check security headers don't block needed origins

### Slow Initial Load

**Problem:** First visit takes > 5 seconds

**Solution:**
1. Enable gzip/brotli compression on server
2. Verify Service Worker caching is working
3. Check CDN is configured for static assets
4. Review bundle size with `npm run build --analyze`

---

## Post-Deployment Monitoring

### First Hour Checks

1. **Login flow**: Test login/logout works
2. **Notifications**: Verify polling and push work
3. **Data operations**: Create observation, save lesson plan
4. **Mobile**: Test on actual mobile device

### Daily Monitoring

- Check Sentry for new errors
- Review performance metrics
- Monitor user activity patterns
- Check database storage usage

### Weekly Tasks

- Review backup success
- Check security headers
- Update dependencies if needed
- Review audit logs for anomalies

---

## Support Contacts

- **DevOps**: devops@elsistema.pc
- **Backend**: backend@elsistema.pc
- **Security**: security@elsistema.pc
- **Emergency**: on-call: +1-XXX-XXX-XXXX

---

## Checklist Summary

Pre-deploy:
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Bundle < 500KB
- [ ] Env configured
- [ ] Backups created

Post-deploy:
- [ ] App loads
- [ ] Login works
- [ ] Notifications work
- [ ] No errors in Sentry

---

**Questions?** Contact DevOps team.

*Last updated: May 10, 2026*