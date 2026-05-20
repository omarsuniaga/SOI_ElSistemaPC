# Automatic Notification Trigger for Pending/Vencida Classes - Design

**Date:** 2026-05-20  
**Status:** Design Approved  
**Owner:** Maestro Portal Team

---

## Goal

Enable maestros to receive automatic notifications when they have classes vencidas (overdue, >7 days without registering attendance) or pendientes (pending), even when the app is closed. Notifications trigger 3x daily at strategic times (9 AM, 3:15 PM, 8:45 PM) with smart deduplication to avoid alert fatigue.

---

## Requirements

### Functional

1. **Three Daily Trigger Points**
   - 9:00 AM — Morning check (what happened overnight)
   - 3:15 PM — Critical just-in-time (5 minutes before 3:30 PM classes start; maestros fill pending attendance)
   - 8:45 PM — Evening wind-down check (maestro should be resting)

2. **Smart Aggregation**
   - One notification per maestro per trigger: "Tienes X clases vencidas, Y pendientes"
   - Not one notification per class (avoids panel saturation)

3. **Smart Deduplication**
   - If class remains vencida >24 hours with no changes, don't create duplicate notification
   - If class changes state within 24h, create new notification
   - Track via `dedup_key = maestro_id:vencida|pendiente:date_bucket`

4. **Source Data**
   - Use existing `teacher_class_fill_metrics` VIEW to detect vencida/pendiente states
   - Minimize redundant queries; leverage aggregated metrics

5. **Notification Persistence**
   - Insert into `notificaciones` table in Supabase
   - Client-side `notificationService.js` consumes automatically
   - Maestros see in notification panel + receive push notifications (if enabled)

### Non-Functional

- **Reliability:** Must not fail silently; log errors for debugging
- **Performance:** Cron job completes in <10 seconds for all maestros
- **Idempotency:** Running trigger twice in same minute should not create duplicate notifications
- **Offline Resilience:** If Supabase is down, trigger silently fails (client notified next sync)

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Supabase Cron Job (pg_cron extension)                           │
│ Schedule: 9:00 AM, 3:15 PM, 8:45 PM (ES timezone)              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
       ┌─────────────────────────────┐
       │ Function: generate_pending_  │
       │ class_notifications()        │
       │ (PL/pgSQL or Edge Function) │
       └────────────┬────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
   ┌─────────────┐      ┌──────────────────────┐
   │ Query:      │      │ Smart Dedup Check:   │
   │ teacher_    │      │ Does notification    │
   │ class_fill_ │      │ exist + <24h old?    │
   │ metrics     │      │                      │
   │ (vencida/   │      │ No → Create new      │
   │ pendiente)  │      │ Yes → Skip           │
   └─────────────┘      └──────────┬───────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ Insert into:        │
                        │ notificaciones      │
                        │ (one per maestro)   │
                        └──────────┬──────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ Client-Side              │
                    │ notificationService.js   │
                    │ (via onNotificacionesC...|
                    │ ange listener)           │
                    └──────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌──────────────┐           ┌─────────────────┐
        │ Notification │           │ Push            │
        │ Panel        │           │ Notification    │
        │ (browser)    │           │ (if enabled)    │
        └──────────────┘           └─────────────────┘
```

### Component Breakdown

#### 1. Supabase Cron Job (pg_cron)
- **Framework:** PostgreSQL `pg_cron` extension (already in Supabase)
- **Schedule:** 3 cron expressions
  - `'0 9 * * *'` → 9:00 AM daily
  - `'15 15 * * *'` → 3:15 PM daily
  - `'45 20 * * *'` → 8:45 PM daily
  - (All times in ES timezone, configured in Supabase settings)
- **Calls:** Function `generate_pending_class_notifications()`

#### 2. Function: `generate_pending_class_notifications()` (PL/pgSQL)
**Location:** Supabase database function  
**Inputs:** None (runs for all maestros)  
**Logic:**

```sql
FOR each maestro IN (SELECT DISTINCT maestro_id FROM teacher_class_fill_metrics):
  1. Query teacher_class_fill_metrics where maestro_id = ? AND (estado = 'vencida' OR estado = 'pendiente')
  2. Count: vencida_count, pendiente_count
  3. IF counts > 0:
       a. Generate dedup_key = CONCAT(maestro_id, ':', 'vencidas_pendientes', ':', DATE(NOW()))
       b. Check: SELECT id FROM notificaciones WHERE dedup_key = ? AND created_at > NOW() - INTERVAL '24 hours'
       c. IF no recent notification:
            - INSERT INTO notificaciones (
                profile_id, tipo, mensaje, clase_id, created_at, dedup_key, leida
              ) VALUES (
                maestro_id, 'clase_vencida', 
                CONCAT('Tienes ', vencida_count, ' clases vencidas, ', pendiente_count, ' pendientes'),
                NULL,  -- no specific class_id (aggregated)
                NOW(),
                dedup_key,
                FALSE
              )
       d. ELSE: SKIP (avoid duplicate)
  4. ELSE: No action (no vencidas/pendientes)
END FOR;
```

**Error Handling:**
- Log all errors to `error_logs` table or Sentry
- Don't raise exception (silent failure acceptable; client will check next sync)

#### 3. Smart Deduplication Strategy
**Goal:** Prevent alert fatigue when a class remains vencida for days

**Mechanism:**
- **Dedup Key Format:** `maestro_id:vencidas_pendientes:YYYY-MM-DD`
  - Example: `maestro_123:vencidas_pendientes:2026-05-20`
- **Window:** 24 hours from `created_at`
- **Check:** Before INSERT, verify no existing notification with same dedup_key created in last 24h
- **Reset:** Daily (different date in key = new opportunity to notify)

**Scenario:**
```
Day 1 (9 AM):  Class A vencida detected → Create notif (dedup_key = M1:vp:2026-05-20)
Day 1 (3:15 PM): Class A still vencida → Skip (same key, <24h) ✓
Day 1 (8:45 PM): Class A still vencida → Skip (same key, <24h) ✓
Day 2 (9 AM):  Class A still vencida → Create notif (dedup_key = M1:vp:2026-05-21) ✓
```

#### 4. Client-Side (No Changes)
- **notificationService.js** already has `fetchNotificaciones()` and `onNotificacionesChange()`
- Trigger's INSERT automatically flows through Realtime subscription
- **notificacionesPanel.js** renders notifications

### Data Model

**Table: `notificaciones`**
```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id),
  tipo TEXT NOT NULL,  -- 'clase_vencida', 'clase_pendiente', etc.
  mensaje TEXT NOT NULL,  -- "Tienes 3 clases vencidas, 1 pendiente"
  clase_id UUID,  -- NULL for aggregated notifications
  created_at TIMESTAMP DEFAULT NOW(),
  leida BOOLEAN DEFAULT FALSE,
  dedup_key TEXT,  -- For deduplication tracking
  
  -- Indexes
  INDEX idx_profile_created (profile_id, created_at DESC),
  INDEX idx_dedup_key (dedup_key)
);
```

**New Column:** `dedup_key` (TEXT, nullable) — tracks notification grouping for dedup logic

---

## Testing Strategy

### Unit Tests (Vitest + jsdom)

1. **Dedup Key Generation**
   - Test: `_generateDedupKey(maestro_id, type, date)` returns correct format
   - Edge cases: null inputs, special chars in maestro_id

2. **Notification Count Logic**
   - Mock `teacher_class_fill_metrics` VIEW
   - Test: Function correctly counts vencida vs. pendiente
   - Test: Correct mensaje format ("Tienes X vencidas, Y pendientes")

3. **Dedup Check**
   - Mock DB query for recent notifications
   - Test: Returns true if notification exists within 24h
   - Test: Returns false if >24h old or doesn't exist

### Integration Tests (Supabase + Vitest)

1. **End-to-End Trigger Flow**
   - Mock cron execution
   - Insert test data into `teacher_class_fill_metrics`
   - Call `generate_pending_class_notifications()`
   - Assert: Correct notification inserted into `notificaciones`
   - Assert: No duplicates created on second run (same minute)

2. **Realtime Sync**
   - Call trigger function
   - Verify `notificationService.onNotificacionesChange()` fires with new notification
   - Assert: Panel updates with new notification

3. **Dedup Behavior Across Hours**
   - Insert class_vencida at 9 AM
   - Call trigger at 3:15 PM → Assert no new notification
   - Call trigger at 8:45 PM → Assert no new notification
   - Call trigger at 9 AM next day → Assert new notification created

### Manual Test Checklist

- [ ] Create test maestro with 3 vencida classes
- [ ] Trigger function manually → verify notification in panel
- [ ] Trigger again immediately → verify no duplicate
- [ ] Wait 25 hours, trigger again → verify new notification
- [ ] Push notification appears on device (if enabled)
- [ ] Mark notification as leída → persists in DB

---

## Performance & Reliability

### Performance Targets
- Trigger execution: <10 seconds for 500 maestros
- Query optimization: Use `teacher_class_fill_metrics` VIEW (pre-aggregated)
- Dedup check: O(1) via indexed `dedup_key`

### Error Scenarios & Handling
| Scenario | Action |
|----------|--------|
| Supabase down | Trigger fails silently; logged to error table |
| Maestro deleted mid-execution | Foreign key constraint prevents orphaned notif |
| Realtime disabled | Notifications persist; pulled on next app sync |
| Dedup logic fails | Worst case: duplicate notifications (user sees same twice) — acceptable |

### Logging
- All trigger executions logged to `notification_trigger_logs` table
- Include: timestamp, maestros_processed, notifications_created, errors
- Retention: 30 days

---

## Rollout & Monitoring

### Phase 1: Deploy Function + Cron
1. Create PL/pgSQL function in Supabase
2. Create `dedup_key` column in `notificaciones` table
3. Add cron jobs (starts at next scheduled time)
4. Monitor logs for 1 week

### Phase 2 (Future): Edge Function Alternative
- If performance issues: migrate to Supabase Edge Function (TypeScript)
- Same logic, different deployment

### Monitoring Queries
```sql
-- Recent notifications generated
SELECT COUNT(*), tipo FROM notificaciones 
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY tipo;

-- Dedup effectiveness
SELECT dedup_key, COUNT(*) 
FROM notificaciones 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY dedup_key HAVING COUNT(*) > 1;
```

---

## Success Criteria

✅ Maestros receive 3 notifications daily at correct times  
✅ No duplicate notifications within 24h window  
✅ Notifications appear in panel + push notification (if enabled)  
✅ Client-side code requires zero changes  
✅ 99% trigger execution success rate  
✅ <5 second execution for 500+ maestros  

---

## Future Enhancements (Out of Scope)

- Customizable notification times per maestro
- Granular notifications (one per class instead of aggregated)
- SMS/email fallback if push disabled
- Analytics: which maestros respond fastest to notifications
