---
doc_id: PORTAL-007
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\COMPLIANCE.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-007
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Compliance Checklist

Portal Maestros compliance with regulations and standards.

---

## GDPR (General Data Protection Regulation)

### Lawful Basis

✅ **Legitimate Interest**: Teacher portal for educational use

### Data Processing

| Data Type | Stored | Processed | Deleted |
|-----------|--------|-----------|---------|
| Email | Yes | Auth only | On request |
| Name | Yes | Admin panel | On request |
| Observations | Yes | Analysis | On request |
| Student IDs | Yes | Linking | On request |
| Audit logs | Yes | Compliance | 7 years |

### Rights Implemented

- ✅ **Access** (Article 15): Download data
- ✅ **Rectification** (Article 16): Edit profile
- ✅ **Erasure** (Article 17): Delete account
- ✅ **Data Portability** (Article 20): Export as JSON
- ✅ **Right to Object** (Article 21): Email security@elsistema.pc

### Consent

- ✅ Explicit consent for notifications (Web Push)
- ✅ Explicit consent for analytics (optional)
- ✅ Consent withdrawal available in Settings

### Privacy Notice

Teachers see privacy policy at:
- First login
- Settings → Privacy
- Footer link on all pages

---

## WCAG 2.1 AA (Accessibility)

### Keyboard Navigation

- ✅ All interactive elements focusable
- ✅ Tab order follows visual order
- ✅ Skip links for main content
- ✅ No keyboard traps

### Screen Reader Support

- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Form labels associated with inputs
- ✅ Error messages announced

### Visual

- ✅ Color contrast 4.5:1 minimum
- ✅ Text resizable to 200%
- ✅ Focus indicators visible
- ✅ No color-only information

### Implementation

```html
<!-- Example: Accessible form -->
<form>
  <label for="email">Email</label>
  <input type="email" id="email" aria-required="true">
  
  <button type="submit">Enviar</button>
</form>
```

---

## Data Protection

### Encryption

- **At Rest**: Supabase encrypts all data at rest
- **In Transit**: TLS 1.3 required
- **Backups**: Encrypted with separate key

### Data Minimization

- Only collect necessary data
- Clear collected data when no longer needed
- Regular audit of data fields

### Breach Notification

- 72-hour notification to authorities
- Affected users notified immediately
- Incident report within 24 hours

---

## Audit Requirements

### Logging

- ✅ All data access logged
- ✅ All data modifications logged
- ✅ Log retention: 7 years
- ✅ Logs include: user, action, timestamp, IP

### Review

- Monthly security review
- Quarterly compliance audit
- Annual penetration testing

---

## Industry Standards

### OWASP Top 10

Mitigations in place:
- ✅ Injection: Parameterized queries
- ✅ Broken Auth: JWT + rate limiting
- ✅ Sensitive Data: Encryption at rest
- ✅ XXE: No XML parsing
- ✅ Broken Access Control: RLS policies
- ✅ Security Misconfig: Hardened headers
- ✅ XSS: DOMPurify sanitization
- ✅ Insecure Deserialization: JSON only
- ✅ Using Components: Regular audits
- ✅ Insufficient Logging: Full audit trail

---

## Compliance Checklist

### Pre-Production

- [ ] Privacy policy posted
- [ ] Terms of service updated
- [ ] Cookie consent implemented
- [ ] Data processing agreement signed
- [ ] Security assessment completed

### On-Going

- [ ] Annual penetration test
- [ ] Quarterly security review
- [ ] Monthly access audit
- [ ] Weekly backup verification

### Data Subject Requests

- [ ] Access request process
- [ ] Deletion request process
- [ ] Portability export process
- [ ] Response within 30 days

---

## Certifications

### Current

- GDPR Compliant (Self-certified)
- WCAG 2.1 AA (Internal audit)

### Target (Next Year)

- ISO 27001
- SOC 2 Type II

---

## Documentation

Maintained documents:
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Data Processing Agreement
- [ ] Security Incident Response Plan
- [ ] Data Retention Policy
- [ ] Consent Management Policy

---

## Training

### Staff Training

- Annual GDPR training
- Quarterly security awareness
- Phishing simulation monthly

### User Education

- Privacy tips in onboarding
- Data export instructions
- Consent management guide

---

## Third-Party Compliance

| Vendor | Compliance |
|--------|------------|
| Supabase | GDPR, SOC 2 |
| Vercel | GDPR, SOC 2 |
| Sentry | GDPR, Security |
| Groq | Data processing agreement |

---

## Regular Reviews

| Review | Frequency |
|--------|-----------|
| Privacy Policy | Annual |
| Security Assessment | Quarterly |
| Access Audit | Monthly |
| Backup Test | Weekly |
| Penetration Test | Annual |

---

## Contact

For compliance questions:
- **Data Protection Officer**: dpo@elsistema.pc
- **Privacy**: privacy@elsistema.pc
- **Legal**: legal@elsistema.pc

---

*Last updated: May 10, 2026*