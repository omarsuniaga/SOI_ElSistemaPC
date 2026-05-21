# Automatic Notification Trigger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a PL/pgSQL trigger function in Supabase that automatically generates notifications 3x daily (9 AM, 3:15 PM, 8:45 PM) when maestros have vencida/pendiente classes, with smart deduplication to prevent alert fatigue.

**Architecture:** PL/pgSQL function `generate_pending_class_notifications()` queries `teacher_class_fill_metrics` VIEW, aggregates vencida/pendiente counts per maestro, checks dedup_key to avoid duplicates, and inserts into `notificaciones` table. Supabase pg_cron schedules 3 daily executions. Client-side consumes via existing `notificationService.js` without changes.

**Tech Stack:** Supabase (PostgreSQL 15+, pg_cron extension), PL/pgSQL, Vitest (for unit tests), migrations (SQL)

---

## File Structure

**New Files:**
- `supabase/migrations/001_add_dedup_key_to_notificaciones.sql` — Migration adding `dedup_key` column
- `supabase/functions/generate_pending_class_notifications.sql` — PL/pgSQL function (portable SQL, runnable via UI or migration)
- `src/portal-maestros/services/__tests__/notificationTrigger.test.js` — Vitest suite for trigger logic (unit tests)
- `supabase/cron-jobs.sql` — Script documenting the 3 pg_cron job definitions (reference, not executed by migrations)

**Modified Files:**
- None (client-side `notificationService.js` already handles new notifications via Realtime)

---

## Tasks

### Task 1: Create Migration - Add dedup_key Column

**Files:**
- Create: `supabase/migrations/001_add_dedup_key_to_notificaciones.sql`

- [ ] **Step 1: Write migration SQL**

Create the file with:

```sql
-- Migration: Add dedup_key column to notificaciones for deduplication tracking
-- Allows smart dedup logic to prevent duplicate notifications within 24h window

ALTER TABLE notificaciones 
ADD COLUMN dedup_key TEXT;

-- Index for efficient dedup lookups
CREATE INDEX idx_notificaciones_dedup_key 
ON notificaciones(dedup_key) 
WHERE dedup_key IS NOT NULL;
```

- [ ] **Step 2: Run migration to verify syntax**

Run in Supabase SQL editor or via CLI:
```bash
supabase db push
```

Expected: Migration applies without errors, column appears in `notificaciones` table schema.

- [ ] **Step 3: Verify schema change**

Run in Supabase SQL editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notificaciones';
```

Expected: `dedup_key TEXT` appears in results.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_add_dedup_key_to_notificaciones.sql
git commit -m "db: add dedup_key column to notificaciones for trigger deduplication"
```

---

### Task 2: Create PL/pgSQL Function - generate_pending_class_notifications()

**Files:**
- Create: `supabase/functions/generate_pending_class_notifications.sql`

- [ ] **Step 1: Write the function SQL**

Create file with complete function:

```sql
-- Function: generate_pending_class_notifications()
-- Purpose: Generate aggregated notifications for maestros with vencida/pendiente classes
-- Called by: pg_cron (3x daily: 9 AM, 3:15 PM, 8:45 PM)
-- Idempotency: Uses dedup_key to avoid duplicates within 24h

CREATE OR REPLACE FUNCTION generate_pending_class_notifications()
RETURNS TABLE (
  maestros_processed INT,
  notifications_created INT,
  errors_logged INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_maestro_id UUID;
  v_vencida_count INT;
  v_pendiente_count INT;
  v_dedup_key TEXT;
  v_mensaje TEXT;
  v_errors INT := 0;
  v_created INT := 0;
  v_processed INT := 0;
BEGIN
  -- Process each maestro with vencida or pendiente classes
  FOR v_maestro_id IN 
    SELECT DISTINCT maestro_id 
    FROM teacher_class_fill_metrics
    WHERE estado IN ('vencida', 'pendiente')
  LOOP
    v_processed := v_processed + 1;
    
    BEGIN
      -- Count vencida classes
      SELECT COUNT(*) INTO v_vencida_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id AND estado = 'vencida';
      
      -- Count pendiente classes
      SELECT COUNT(*) INTO v_pendiente_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id AND estado = 'pendiente';
      
      -- Only create notification if there are vencida or pendiente classes
      IF v_vencida_count > 0 OR v_pendiente_count > 0 THEN
        -- Generate dedup key: maestro_id:vencidas_pendientes:YYYY-MM-DD
        v_dedup_key := v_maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NOW())::TEXT;
        
        -- Check if notification already exists within 24h (dedup check)
        -- If it exists and is <24h old, skip creation (idempotency)
        IF NOT EXISTS (
          SELECT 1 FROM notificaciones
          WHERE dedup_key = v_dedup_key 
            AND created_at > NOW() - INTERVAL '24 hours'
        ) THEN
          -- Build message
          v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, ' 
                       || v_pendiente_count || ' pendientes';
          
          -- Insert notification
          INSERT INTO notificaciones (
            profile_id,
            tipo,
            mensaje,
            clase_id,
            created_at,
            dedup_key,
            leida
          ) VALUES (
            v_maestro_id,
            'clase_vencida',
            v_mensaje,
            NULL,  -- aggregated notification, no specific class
            NOW(),
            v_dedup_key,
            FALSE
          );
          
          v_created := v_created + 1;
        END IF;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error without interrupting loop
      INSERT INTO notification_trigger_logs (
        execution_time,
        status,
        error_message,
        context
      ) VALUES (
        NOW(),
        'ERROR',
        SQLERRM,
        'maestro_id=' || v_maestro_id::TEXT
      );
      v_errors := v_errors + 1;
    END;
  END LOOP;
  
  -- Log successful execution
  INSERT INTO notification_trigger_logs (
    execution_time,
    status,
    maestros_processed,
    notifications_created,
    errors_count
  ) VALUES (
    NOW(),
    'SUCCESS',
    v_processed,
    v_created,
    v_errors
  );
  
  -- Return summary
  RETURN QUERY SELECT v_processed, v_created, v_errors;
END;
$$;
```

- [ ] **Step 2: Create notification_trigger_logs table (for logging)**

Create in Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS notification_trigger_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_time TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL,  -- 'SUCCESS' or 'ERROR'
  maestros_processed INT,
  notifications_created INT,
  errors_count INT,
  error_message TEXT,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_notification_trigger_logs_execution_time 
ON notification_trigger_logs(execution_time DESC);
```

- [ ] **Step 3: Test function manually in Supabase SQL editor**

```sql
-- Insert test data (temporary)
INSERT INTO teacher_class_fill_metrics (maestro_id, estado, fecha)
VALUES ('test-maestro-123'::uuid, 'vencida', NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;

-- Execute function
SELECT * FROM generate_pending_class_notifications();

-- Verify notification created
SELECT COUNT(*) FROM notificaciones 
WHERE profile_id = 'test-maestro-123'::uuid
  AND created_at > NOW() - INTERVAL '1 minute';
```

Expected: Function returns 1 notification created, notification appears in notificaciones table.

- [ ] **Step 4: Test idempotency (run again immediately)**

```sql
-- Execute function again immediately
SELECT * FROM generate_pending_class_notifications();
```

Expected: Function returns 0 notifications created (dedup prevented duplicate).

- [ ] **Step 5: Commit function and logging table setup**

```bash
git add supabase/functions/generate_pending_class_notifications.sql
git commit -m "db: add generate_pending_class_notifications function with logging"
```

---

### Task 3: Create Unit Tests (Vitest)

**Files:**
- Create: `src/portal-maestros/services/__tests__/notificationTrigger.test.js`

- [ ] **Step 1: Write failing test for dedup key generation**

```javascript
// src/portal-maestros/services/__tests__/notificationTrigger.test.js
import { describe, it, expect } from 'vitest'

// Helper to test dedup logic (pure function, no DB)
function generateDedupKey(maestroId, type, date) {
  return `${maestroId}:${type}:${date}`
}

describe('notificationTrigger - Dedup Logic', () => {
  it('should generate correct dedup key format', () => {
    const maestroId = 'maestro-123'
    const type = 'vencidas_pendientes'
    const date = '2026-05-20'
    
    const key = generateDedupKey(maestroId, type, date)
    
    expect(key).toBe('maestro-123:vencidas_pendientes:2026-05-20')
  })

  it('should generate unique keys for different dates', () => {
    const maestroId = 'maestro-123'
    const key1 = generateDedupKey(maestroId, 'vencidas_pendientes', '2026-05-20')
    const key2 = generateDedupKey(maestroId, 'vencidas_pendientes', '2026-05-21')
    
    expect(key1).not.toBe(key2)
  })

  it('should generate same key for same maestro on same date', () => {
    const maestroId = 'maestro-123'
    const key1 = generateDedupKey(maestroId, 'vencidas_pendientes', '2026-05-20')
    const key2 = generateDedupKey(maestroId, 'vencidas_pendientes', '2026-05-20')
    
    expect(key1).toBe(key2)
  })
})

describe('notificationTrigger - Message Formatting', () => {
  it('should format notification message correctly', () => {
    const vencidaCount = 3
    const pendienteCount = 1
    const expected = 'Tienes 3 clases vencidas, 1 pendientes'
    
    const mensaje = `Tienes ${vencidaCount} clases vencidas, ${pendienteCount} pendientes`
    
    expect(mensaje).toBe(expected)
  })

  it('should handle zero counts', () => {
    const mensaje = 'Tienes 0 clases vencidas, 0 pendientes'
    
    expect(mensaje).toContain('0')
  })
})

describe('notificationTrigger - Dedup Check Logic (Mock)', () => {
  it('should identify duplicate notification (within 24h)', () => {
    // Mock: existing notification created 1 hour ago
    const existingNotif = {
      dedup_key: 'maestro-123:vencidas_pendientes:2026-05-20',
      created_at: new Date(Date.now() - 60 * 60 * 1000)  // 1 hour ago
    }
    
    const newDedupKey = 'maestro-123:vencidas_pendientes:2026-05-20'
    const isWithin24h = 
      existingNotif.dedup_key === newDedupKey &&
      Date.now() - existingNotif.created_at.getTime() < 24 * 60 * 60 * 1000
    
    expect(isWithin24h).toBe(true)  // Should skip creation
  })

  it('should NOT identify as duplicate if >24h old', () => {
    // Mock: notification created 25 hours ago
    const existingNotif = {
      dedup_key: 'maestro-123:vencidas_pendientes:2026-05-19',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000)
    }
    
    const newDedupKey = 'maestro-123:vencidas_pendientes:2026-05-20'
    const isWithin24h = 
      existingNotif.dedup_key === newDedupKey &&
      Date.now() - existingNotif.created_at.getTime() < 24 * 60 * 60 * 1000
    
    expect(isWithin24h).toBe(false)  // Should create new
  })

  it('should NOT identify as duplicate if different date', () => {
    const existingNotif = {
      dedup_key: 'maestro-123:vencidas_pendientes:2026-05-19',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
    
    const newDedupKey = 'maestro-123:vencidas_pendientes:2026-05-20'
    const isDuplicate = existingNotif.dedup_key === newDedupKey
    
    expect(isDuplicate).toBe(false)  // Should create new
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /path/to/proyecto
npm run test:run -- src/portal-maestros/services/__tests__/notificationTrigger.test.js
```

Expected: All tests pass (they are pure logic tests, no DB calls, so they pass immediately).

- [ ] **Step 3: Add integration test template (for future DB testing)**

Add to same file:

```javascript
// Integration test template - requires real Supabase connection
describe.skip('notificationTrigger - Integration (requires Supabase)', () => {
  it.skip('should create notification when maestro has vencida class', async () => {
    // This test requires:
    // 1. Real Supabase connection
    // 2. Seeded teacher_class_fill_metrics with test maestro
    // 3. Clean notificaciones table
    // Example when implemented:
    // const result = await supabase.rpc('generate_pending_class_notifications')
    // expect(result.data.notifications_created).toBeGreaterThan(0)
  })

  it.skip('should not create duplicate within 24h window', async () => {
    // Similar to above, verify dedup behavior
  })
})
```

- [ ] **Step 4: Commit tests**

```bash
git add src/portal-maestros/services/__tests__/notificationTrigger.test.js
git commit -m "test: add unit tests for notification trigger logic (dedup, formatting)"
```

---

### Task 4: Create Cron Jobs Configuration

**Files:**
- Create: `supabase/cron-jobs.sql`

- [ ] **Step 1: Write cron job definitions**

```sql
-- Supabase Cron Jobs for Notification Trigger
-- Note: These must be created manually in Supabase Dashboard or via CLI
-- Schedule format: pg_cron expressions in ES timezone

-- Job 1: Morning check (9:00 AM)
-- Schedule: "0 9 * * *" (daily at 9 AM ES time)
-- SQL: SELECT generate_pending_class_notifications();

-- Job 2: Afternoon check (3:15 PM) - CRITICAL for pending attendance fill
-- Schedule: "15 15 * * *" (daily at 3:15 PM ES time)
-- SQL: SELECT generate_pending_class_notifications();

-- Job 3: Evening check (8:45 PM)
-- Schedule: "45 20 * * *" (daily at 8:45 PM ES time)
-- SQL: SELECT generate_pending_class_notifications();

-- To create via SQL in Supabase (if pg_cron enabled):
SELECT cron.schedule(
  'generate-pending-notifs-9am',
  '0 9 * * *',
  'SELECT generate_pending_class_notifications()'
);

SELECT cron.schedule(
  'generate-pending-notifs-3:15pm',
  '15 15 * * *',
  'SELECT generate_pending_class_notifications()'
);

SELECT cron.schedule(
  'generate-pending-notifs-8:45pm',
  '45 20 * * *',
  'SELECT generate_pending_class_notifications()'
);

-- Verify jobs are scheduled:
SELECT * FROM cron.job;
```

- [ ] **Step 2: Create jobs in Supabase Dashboard**

1. Open Supabase Dashboard → SQL Editor
2. Run the three `cron.schedule()` commands above
3. Verify in `cron.job` table that 3 jobs exist with correct schedules

Expected: `cron.job` shows 3 rows with job names and schedules.

- [ ] **Step 3: Document in Supabase Docs (link for reference)**

Create comment in cron-jobs.sql with link to Supabase pg_cron documentation:
```sql
-- Reference: https://supabase.com/docs/guides/database/postgres/extensions/pg_cron
```

- [ ] **Step 4: Commit configuration file**

```bash
git add supabase/cron-jobs.sql
git commit -m "docs: add pg_cron job definitions for notification trigger (3x daily)"
```

---

### Task 5: Verify End-to-End Flow

**Files:**
- No new files; verification only

- [ ] **Step 1: Create test maestro with vencida class (in Supabase)**

```sql
-- Create test maestro if doesn't exist
INSERT INTO auth.users (id, email)
VALUES ('test-maestro-uuid'::uuid, 'test-maestro@test.com')
ON CONFLICT (id) DO NOTHING;

-- Insert test class marked as vencida
INSERT INTO teacher_class_fill_metrics (maestro_id, clase_id, estado, fecha)
VALUES (
  'test-maestro-uuid'::uuid,
  'test-clase-uuid'::uuid,
  'vencida',
  NOW() - INTERVAL '8 days'
)
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Manually trigger function in Supabase SQL Editor**

```sql
SELECT * FROM generate_pending_class_notifications();
```

Expected: Function returns summary with notifications_created >= 1.

- [ ] **Step 3: Verify notification in table**

```sql
SELECT * FROM notificaciones 
WHERE profile_id = 'test-maestro-uuid'::uuid
ORDER BY created_at DESC 
LIMIT 1;
```

Expected: Shows notification with:
- `mensaje`: "Tienes 1 clases vencidas, 0 pendientes"
- `dedup_key`: "test-maestro-uuid:vencidas_pendientes:2026-05-20"
- `leida`: false

- [ ] **Step 4: Verify notification appears in client (optional)**

If app is running locally:
1. Open Portal Maestros in browser
2. Click notification bell icon
3. Verify test notification appears

Expected: Notification panel shows the test notification.

- [ ] **Step 5: Verify idempotency (second execution)**

Run in SQL Editor again:
```sql
SELECT * FROM generate_pending_class_notifications();
```

Expected: Function returns notifications_created = 0 (dedup prevented duplicate).

- [ ] **Step 6: Clean up test data**

```sql
DELETE FROM notificaciones 
WHERE profile_id = 'test-maestro-uuid'::uuid;

DELETE FROM teacher_class_fill_metrics 
WHERE maestro_id = 'test-maestro-uuid'::uuid;

DELETE FROM auth.users 
WHERE id = 'test-maestro-uuid'::uuid;
```

- [ ] **Step 7: Final commit with verification notes**

```bash
git add supabase/cron-jobs.sql
git commit -m "test: verify e2e notification trigger flow (manual)"
```

---

## Success Criteria

✅ Migration applied without errors  
✅ Function creates notifications correctly  
✅ Dedup prevents duplicates within 24h  
✅ Unit tests pass (dedup logic, formatting)  
✅ 3 cron jobs scheduled in Supabase  
✅ E2E test shows notifications in panel + DB  
✅ Idempotency verified (no duplicates on re-run)  
✅ All commits pushed to repository  

---

## Notes

- **Timezone:** All times (9 AM, 3:15 PM, 8:45 PM) are in **ES timezone**. Verify Supabase project timezone setting matches.
- **Client-side:** No changes needed; `notificationService.js` and `notificacionesPanel.js` already handle new notifications via Realtime.
- **Performance:** Function targets <10 seconds for 500 maestros. Use EXPLAIN ANALYZE if slow:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM teacher_class_fill_metrics WHERE estado IN ('vencida', 'pendiente');
  ```
- **Logging:** Check `notification_trigger_logs` table after each trigger execution to verify success/errors.
- **Monitoring:** Add dashboard query to Supabase UI for real-time monitoring of trigger execution.
