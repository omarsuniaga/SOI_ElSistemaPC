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

### Communication

1. Post in #status: "Deploying Portal Maestros v1.x.x"
2. After deploy: "✅ Portal Maestros v1.x.x deployed"
3. If rollback: "⚠️ Rolled back due to [issue]"

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

## Performance Targets

Post-deployment, verify:

| Metric | Target | Check |
|--------|--------|-------|
| **Page Load (LCP)** | < 2.5s | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Web Vitals |
| **Bundle Size** | < 500KB | `npm run build --analyze` |
| **Error Rate** | < 0.1% | Sentry dashboard |

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

### Service Worker Not Updating

**Problem:** Users on old version after deploy

**Solution:**
```bash
# Invalidate cache
curl -X POST https://api.cloudflare.com/client/v4/zones/... \
  -H "Authorization: Bearer token" \
  -d '{"files":["/*"]}'
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

---

**Questions?** Contact DevOps team.
