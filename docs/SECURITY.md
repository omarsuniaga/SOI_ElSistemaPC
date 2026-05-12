# Security Model

Portal Maestros implements multi-layered security for teacher data and student privacy.

## Authentication

### Login

1. Teacher enters email + password
2. Supabase Auth verifies credentials
3. JWT token issued (valid 1 hour)
4. Token stored in localStorage
5. Refresh token used for renewal

### Session Management

- **Default**: 1 hour (auto-logout)
- **"Mantener Sesión"**: 30 days
- **Biometric**: WebAuthn with local PIN
- **Logout**: Clears token and session

### Token Format (JWT)

```
Header: { alg: HS256, typ: JWT }
Payload: {
  sub: "user_id",
  email: "maestro@elsistema.pc",
  role: "teacher",
  exp: 1234567890,
  iat: 1234567800
}
Signature: HMAC-SHA256
```

---

## Authorization (RBAC)

### Roles

| Role | Permissions |
|------|-------------|
| **Teacher** | Own classes, own students, own observations |
| **Admin** | All data, settings, user management |
| **Observer** | Read-only view of assigned classes |

### Role Enforcement

1. Token contains role
2. Server checks role on every API call
3. Row-level security (RLS) in database enforces boundaries

Example:
```sql
-- Teachers can only see their own observations
CREATE POLICY teacher_observations
ON observations FOR SELECT
USING (maestro_id = auth.uid());
```

---

## Input Validation

### Client-Side (User Feedback)

**DOMPurify** removes XSS attempts:
```javascript
import DOMPurify from 'dompurify'

const safeText = DOMPurify.sanitize(userInput)
// Removes: <script>, onclick=, etc.
```

### Server-Side (Data Integrity)

**Joi** schema validation:
```javascript
import Joi from 'joi'

const schema = Joi.object({
  texto: Joi.string().max(5000).required(),
  student_id: Joi.string().guid().required(),
  indicators: Joi.array().items(Joi.string()),
})

const { error, value } = schema.validate(data)
if (error) throw new ValidationError(error)
```

### Validation Rules

| Field | Rule |
|-------|------|
| `texto` | Max 5000 chars, no HTML |
| `student_id` | Valid UUID |
| `email` | Valid email format |
| `password` | Min 8 chars |
| `indicators` | Max 10 items |

---

## CSRF Protection

All state-changing requests (POST, PUT, DELETE) require a CSRF token:

```html
<form>
  <input type="hidden" name="csrf" value="{token}">
  <textarea name="observation"></textarea>
</form>
```

Server verifies token before processing.

---

## Rate Limiting

**100 requests per minute per user**

After 100 requests: 429 Too Many Requests

Applies to all API endpoints.

```javascript
// src/middleware/rateLimit.js
const limiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                   // 100 req/min
  keyGenerator: (req) => req.user.id, // Per user
})
```

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retry_after": 30
  }
}
```

---

## Data Privacy (GDPR)

### Right to Be Forgotten

Teacher can request all their data deleted:

1. Go to Settings → "Solicitar Eliminación"
2. Confirm deletion
3. All observations, evaluations, plans deleted
4. Audit log retained (anonymized)

Implementation:
```javascript
// Cascade delete
await db.observations.deleteWhere({ maestro_id })
await db.lesson_plans.deleteWhere({ maestro_id })
await db.evaluations.deleteWhere({ maestro_id })
```

### Data Export

Teacher can export personal data as JSON:

1. Go to Settings → "Exportar Mis Datos"
2. Select date range
3. Download JSON file

File contains:
- Profile info
- All observations
- All evaluations
- All lesson plans
- Login history

### Data Retention

- **Active data**: Kept while account active
- **Inactive 2 years**: Auto-deleted
- **Audit logs**: Retained 7 years (legally required)

---

## Security Headers

All API responses include:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### Implementation

In `config/security-headers.js`:
```javascript
module.exports = {
  'Content-Security-Policy': "default-src 'self';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}
```

---

## Audit Logging

All data mutations logged:

```javascript
// Every CREATE, UPDATE, DELETE tracked
auditLog('CREATE', 'observation', id, {
  user_id,
  changes: { texto, indicators },
  timestamp: new Date(),
  ip_address,
  user_agent,
})
```

Audit log includes:
- **Action**: CREATE, UPDATE, DELETE
- **Entity**: Table name
- **Entity ID**: Record affected
- **User**: Who made change
- **Changes**: What changed (before/after)
- **Timestamp**: When
- **IP Address**: From where
- **User Agent**: What device/browser

---

## Third-Party Security

| Service | Security Measures |
|---------|-------------------|
| **Sentry** | Error tracking, no sensitive data logged |
| **Groq API** | AI text enhancement, HTTPS only |
| **Supabase** | Trusted backend provider, RLS enforced |
| **Vercel** | Edge network, DDoS protection |

---

## Secure Development

### Secrets Management

- Never commit `.env` files
- Use environment variables for all secrets
- Rotate keys quarterly
- Use different keys for dev/staging/prod

### Code Scanning

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit --audit-level=high
```

---

## Incident Response

### Reporting

1. **Internal**: security@elsistema.pc
2. **GitHub**: Private security advisory

### Response Timeline

| Severity | Response Time |
|----------|---------------|
| Critical | 1 hour |
| High | 4 hours |
| Medium | 24 hours |
| Low | 1 week |

---

## Security Checklist

- [ ] All inputs sanitized (client + server)
- [ ] JWT tokens expire after 1 hour
- [ ] Rate limiting enforced (100 req/min)
- [ ] CSRF tokens on all mutations
- [ ] RLS policies on all tables
- [ ] Security headers configured
- [ ] Audit logs enabled
- [ ] HTTPS enforced
- [ ] GDPR features implemented

---

## Security Contacts

- **Report vulnerability**: security@elsistema.pc
- **Security issues**: GitHub private security advisory
- **Emergency**: on-call: +1-XXX-XXX-XXXX

---

*Last updated: May 10, 2026*