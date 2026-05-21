# Intelligent Attendance Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a database-driven notification system that sends attendance reminders only after a maestro's workday ends, with direct deep links to specific class attendance views.

**Architecture:** Database-first approach using pg_cron for scheduling and PL/pgSQL for orchestration. When the daily cron fires (7 PM weekdays, 1 PM Saturdays), it checks which maestros have pending attendance records, then creates notifications with deep_link URLs that navigate directly to specific class attendance views. Frontend notification handlers parse the deep_link to enable one-click access.

**Tech Stack:** Supabase (PostgreSQL 15+), pg_cron, PL/pgSQL, Vitest (jsdom), existing notificationService and asistenciaView architecture

---

## File Structure

**Database (migration + functions):**
- Create: `supabase/migrations/[timestamp]_add_notification_deep_links.sql` — adds `clase_id` and `deep_link` columns to `notificaciones` table
- Create: `supabase/migrations/[timestamp]_create_fn_check_and_notify_pending_asistencias.sql` — PL/pgSQL function with day-specific scheduling logic
- Create: `supabase/migrations/[timestamp]_setup_cron_schedules.sql` — pg_cron job definitions (7 PM weekdays, 1 PM Saturdays)

**Frontend:**
- Modify: `src/portal-maestros/services/notificationService.js` — parse `deep_link` from notification payload, navigate to specific class view
- Modify: `src/portal-maestros/views/asistenciaView.js` — ensure `renderAsistenciaView` correctly handles direct class navigation
- Create: `src/portal-maestros/services/__tests__/notificationService.deep-link.test.js` — test deep_link parsing and navigation

**Testing:**
- Create: `src/__tests__/integration/attendance-notifications-e2e.test.js` — end-to-end test of notification → deep link → view navigation

---

## Tasks

### Task 1: Database Migration — Add Deep Link Columns

**Files:**
- Create: `supabase/migrations/20260521_add_notification_deep_links.sql`

- [ ] **Step 1: Write the migration file**

Create the migration with the following SQL:

```sql
-- Add new columns to notificaciones table for deep linking and class context
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS clase_id UUID REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS deep_link TEXT;

-- Create index on clase_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notificaciones_clase_id ON notificaciones(clase_id);

-- Add constraint: if deep_link exists, it must reference a valid class
ALTER TABLE notificaciones ADD CONSTRAINT check_deep_link_format 
  CHECK (deep_link IS NULL OR deep_link ~ '^/asistencia/[a-f0-9-]{36}/\d{4}-\d{2}-\d{2}$');
```

- [ ] **Step 2: Apply migration using Supabase MCP**

Run: 
```bash
npx supabase migration list --local
```

Expected: Migration `20260521_add_notification_deep_links` appears in local migration list.

- [ ] **Step 3: Test migration in Supabase**

Use Supabase MCP to execute the migration:
```bash
# Execute via supabase CLI
supabase db push --local
```

Expected: No errors, columns exist in notificaciones table.

- [ ] **Step 4: Verify schema changes**

Query the database to confirm:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'notificaciones' 
AND column_name IN ('clase_id', 'deep_link')
ORDER BY column_name;
```

Expected: Two rows — clase_id (UUID), deep_link (text).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260521_add_notification_deep_links.sql
git commit -m "db: add clase_id and deep_link columns to notificaciones table"
```

---

### Task 2: PL/pgSQL Function — Check and Notify Pending Asistencias

**Files:**
- Create: `supabase/migrations/20260521_create_fn_check_and_notify_pending_asistencias.sql`

- [ ] **Step 1: Write the migration file with the complete function**

```sql
-- Function to check pending asistencias and send notifications after workday ends
CREATE OR REPLACE FUNCTION fn_check_and_notify_pending_asistencias()
RETURNS TABLE (notification_count INT) AS $$
DECLARE
  v_maestro_id UUID;
  v_ultima_hora_fin TIME;
  v_clases_pendientes RECORD;
  v_deep_link TEXT;
  v_notification_count INT := 0;
  v_current_time TIME;
  v_day_of_week INT;
BEGIN
  -- Get current time in Buenos Aires timezone
  v_current_time := NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires'::TEXT;
  v_day_of_week := EXTRACT(ISODOW FROM NOW());

  -- Determine if we should run today
  -- ISODOW: 1=Monday, ..., 5=Friday, 6=Saturday, 7=Sunday
  -- Run on weekdays (1-5) AND Saturdays (6) — skip Sundays (7)
  IF v_day_of_week = 7 THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  -- Iterate through maestros who have classes today
  FOR v_maestro_id IN 
    SELECT DISTINCT m.id
    FROM profiles m
    INNER JOIN clases c ON c.maestro_id = m.id
    INNER JOIN horarios h ON h.clase_id = c.id
    WHERE h.dia_semana = CASE 
                          WHEN v_day_of_week = 6 THEN 'sabado'::TEXT
                          WHEN v_day_of_week = 5 THEN 'viernes'::TEXT
                          WHEN v_day_of_week = 4 THEN 'jueves'::TEXT
                          WHEN v_day_of_week = 3 THEN 'miercoles'::TEXT
                          WHEN v_day_of_week = 2 THEN 'martes'::TEXT
                          WHEN v_day_of_week = 1 THEN 'lunes'::TEXT
                        END
    AND m.rol = 'maestro'
    AND m.activo = TRUE
  LOOP
    -- Get the last class end time for this maestro today
    SELECT MAX(h.hora_fin)::TIME
    INTO v_ultima_hora_fin
    FROM horarios h
    INNER JOIN clases c ON c.id = h.clase_id
    WHERE c.maestro_id = v_maestro_id
    AND h.dia_semana = CASE 
                        WHEN v_day_of_week = 6 THEN 'sabado'::TEXT
                        WHEN v_day_of_week = 5 THEN 'viernes'::TEXT
                        WHEN v_day_of_week = 4 THEN 'jueves'::TEXT
                        WHEN v_day_of_week = 3 THEN 'miercoles'::TEXT
                        WHEN v_day_of_week = 2 THEN 'martes'::TEXT
                        WHEN v_day_of_week = 1 THEN 'lunes'::TEXT
                      END
    AND h.hora_inicio IS NOT NULL
    AND h.hora_fin IS NOT NULL;

    -- Check if current time >= last class end time (allow 5 min buffer)
    IF v_ultima_hora_fin IS NULL THEN
      CONTINUE; -- No classes found, skip
    END IF;

    IF v_current_time >= (v_ultima_hora_fin + INTERVAL '5 minutes') THEN
      -- Maestro's workday is over. Create notifications for each pending class today.
      FOR v_clases_pendientes IN
        SELECT c.id, c.nombre, CURRENT_DATE::TEXT AS fecha
        FROM clases c
        INNER JOIN horarios h ON h.clase_id = c.id
        LEFT JOIN asistencias a ON a.clase_id = c.id AND a.fecha = CURRENT_DATE
        WHERE c.maestro_id = v_maestro_id
        AND h.dia_semana = CASE 
                            WHEN v_day_of_week = 6 THEN 'sabado'::TEXT
                            WHEN v_day_of_week = 5 THEN 'viernes'::TEXT
                            WHEN v_day_of_week = 4 THEN 'jueves'::TEXT
                            WHEN v_day_of_week = 3 THEN 'miercoles'::TEXT
                            WHEN v_day_of_week = 2 THEN 'martes'::TEXT
                            WHEN v_day_of_week = 1 THEN 'lunes'::TEXT
                          END
        AND (a.id IS NULL OR a.estado = 'draft') -- No record or draft = pending
        AND NOT EXISTS ( -- Dedup: no notification in last 24 hours
          SELECT 1 FROM notificaciones n
          WHERE n.profile_id = v_maestro_id
          AND n.clase_id = c.id
          AND n.created_at > NOW() - INTERVAL '24 hours'
        )
      LOOP
        v_deep_link := '/asistencia/' || v_clases_pendientes.id::TEXT || '/' || v_clases_pendientes.fecha;
        
        INSERT INTO notificaciones (
          profile_id,
          tipo,
          titulo,
          mensaje,
          deep_link,
          clase_id,
          estado,
          created_at
        ) VALUES (
          v_maestro_id,
          'sistema',
          'Asistencia Pendiente',
          'Debes llenar la asistencia de ' || v_clases_pendientes.nombre,
          v_deep_link,
          v_clases_pendientes.id,
          'pendiente',
          NOW()
        );
        
        v_notification_count := v_notification_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 2: Save the migration file**

Save as `supabase/migrations/20260521_create_fn_check_and_notify_pending_asistencias.sql`

- [ ] **Step 3: Apply migration and test function exists**

Run:
```bash
supabase db push --local
```

Expected: No errors, function created.

- [ ] **Step 4: Verify function signature**

Query:
```sql
SELECT routine_name, routine_type, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'fn_check_and_notify_pending_asistencias';
```

Expected: One row showing function definition with SECURITY DEFINER.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260521_create_fn_check_and_notify_pending_asistencias.sql
git commit -m "db: create fn_check_and_notify_pending_asistencias function with day-specific scheduling"
```

---

### Task 3: pg_cron Setup — Schedule Daily Notification Checks

**Files:**
- Create: `supabase/migrations/20260521_setup_cron_schedules.sql`

- [ ] **Step 1: Write the migration file with cron schedules**

```sql
-- Enable pg_cron extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule for 7:00 PM (19:00) on weekdays (Mon-Fri)
-- Cron format: minute hour day month day_of_week
-- 0 19 * * 1-5 = 19:00 on Monday(1) through Friday(5)
SELECT cron.schedule(
  'notify_pending_asistencias_weekdays',
  '0 19 * * 1-5',
  'SELECT fn_check_and_notify_pending_asistencias();'
);

-- Schedule for 1:00 PM (13:00) on Saturdays
-- 0 13 * * 6 = 13:00 on Saturday(6)
SELECT cron.schedule(
  'notify_pending_asistencias_saturday',
  '0 13 * * 6',
  'SELECT fn_check_and_notify_pending_asistencias();'
);
```

- [ ] **Step 2: Save the migration file**

Save as `supabase/migrations/20260521_setup_cron_schedules.sql`

- [ ] **Step 3: Apply migration**

Run:
```bash
supabase db push --local
```

Expected: No errors, cron jobs scheduled.

- [ ] **Step 4: Verify cron jobs exist**

Query:
```sql
SELECT jobname, schedule, command 
FROM cron.job 
WHERE jobname LIKE 'notify_pending_asistencias%' 
ORDER BY jobname;
```

Expected: Two rows — `notify_pending_asistencias_weekdays` (0 19 * * 1-5) and `notify_pending_asistencias_saturday` (0 13 * * 6).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260521_setup_cron_schedules.sql
git commit -m "db: set up pg_cron schedules for 7 PM (weekdays) and 1 PM (Saturdays)"
```

---

### Task 4: Frontend — Parse Deep Links in Notification Service

**Files:**
- Modify: `src/portal-maestros/services/notificationService.js`
- Create: `src/portal-maestros/services/__tests__/notificationService.deep-link.test.js`

- [ ] **Step 1: Write failing test for deep_link parsing**

```javascript
// src/portal-maestros/services/__tests__/notificationService.deep-link.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseDeepLink, navigateToDeepLink } from '../notificationService.js'

describe('Deep Link Handling', () => {
  beforeEach(() => {
    // Mock window.location or router as needed for your app
    global.mockNavigate = vi.fn()
  })

  it('should parse deep_link and extract claseId and fecha', () => {
    const deepLink = '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21'
    const result = parseDeepLink(deepLink)

    expect(result).toEqual({
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21',
      isValid: true
    })
  })

  it('should return isValid false for malformed deep_link', () => {
    const deepLink = '/asistencia/invalid'
    const result = parseDeepLink(deepLink)

    expect(result.isValid).toBe(false)
  })

  it('should navigate to asistenciaView with claseId and fecha', () => {
    const deepLink = '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21'
    navigateToDeepLink(deepLink)

    expect(global.mockNavigate).toHaveBeenCalledWith({
      view: 'asistencia',
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: 
```bash
npm run test:run -- src/portal-maestros/services/__tests__/notificationService.deep-link.test.js
```

Expected: FAIL — `parseDeepLink is not exported` / `navigateToDeepLink is not exported`

- [ ] **Step 3: Add deep link parsing functions to notificationService**

Open `src/portal-maestros/services/notificationService.js` and add:

```javascript
/**
 * Parse deep_link to extract claseId and fecha
 * Deep link format: /asistencia/{claseId}/{fecha}
 * Example: /asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21
 */
export function parseDeepLink(deepLink) {
  if (!deepLink || typeof deepLink !== 'string') {
    return { claseId: null, fecha: null, isValid: false }
  }

  const match = deepLink.match(/^\/asistencia\/([a-f0-9-]{36})\/(\d{4}-\d{2}-\d{2})$/)
  
  if (!match) {
    return { claseId: null, fecha: null, isValid: false }
  }

  return {
    claseId: match[1],
    fecha: match[2],
    isValid: true
  }
}

/**
 * Navigate to asistenciaView with deep link parameters
 */
export function navigateToDeepLink(deepLink) {
  const { claseId, fecha, isValid } = parseDeepLink(deepLink)

  if (!isValid) {
    console.warn('[notificationService] Invalid deep link:', deepLink)
    return
  }

  // Use your app's navigation system (adjust based on your router)
  // Example: if using router or navigation state
  window.appNavigate?.({
    view: 'asistencia',
    claseId,
    fecha
  })
}
```

Then update the `onPushReceived` handler to use deep_link:

```javascript
/**
 * Handle incoming push notification
 * If notification has deep_link, navigate directly to it
 */
export async function onPushReceived(notification) {
  if (!notification) return

  // Mark as received and cache
  _cacheNotification(notification, 'received')

  // If deep_link exists, navigate to it
  if (notification.data?.deep_link) {
    navigateToDeepLink(notification.data.deep_link)
  } else if (notification.data?.deep_link_url) {
    // Fallback for URL-based deep links
    navigateToDeepLink(notification.data.deep_link_url)
  }

  // Continue with existing notification handling
  // ... rest of onPushReceived logic
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/portal-maestros/services/__tests__/notificationService.deep-link.test.js
```

Expected: PASS — all three tests pass

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/services/notificationService.js \
        src/portal-maestros/services/__tests__/notificationService.deep-link.test.js
git commit -m "feat: add deep link parsing and navigation in notificationService"
```

---

### Task 5: Frontend — Verify Asistencia View Direct Navigation

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`
- Create: `src/portal-maestros/views/__tests__/asistenciaView.deep-link.test.js`

- [ ] **Step 1: Write failing test for direct class load**

```javascript
// src/portal-maestros/views/__tests__/asistenciaView.deep-link.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderAsistenciaView } from '../asistenciaView.js'

vi.mock('../../api/asistenciaApi.js', () => ({
  obtenerAsistenciaClase: vi.fn().mockResolvedValue({
    clase_id: '550e8400-e29b-41d4-a716-446655440000',
    fecha: '2026-05-21',
    estudiantes: [
      { id: '1', nombre: 'Estudiante 1', asistio: null },
      { id: '2', nombre: 'Estudiante 2', asistio: true }
    ]
  })
}))

describe('Asistencia View Direct Navigation', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'asistencia-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('should load and render specific class asistencia when claseId and fecha are provided', async () => {
    const params = {
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    }

    await renderAsistenciaView('asistencia-container', params)

    expect(container.innerHTML).toContain('Estudiante 1')
    expect(container.innerHTML).toContain('Estudiante 2')
    expect(container.innerHTML).toContain('2026-05-21')
  })

  it('should have title showing class date', async () => {
    const params = {
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    }

    await renderAsistenciaView('asistencia-container', params)

    const titleElement = container.querySelector('h2, h3, [data-testid="asistencia-title"]')
    expect(titleElement?.textContent).toContain('2026-05-21')
  })
})
```

- [ ] **Step 2: Run test to verify current implementation**

Run:
```bash
npm run test:run -- src/portal-maestros/views/__tests__/asistenciaView.deep-link.test.js
```

Expected: May PASS or FAIL depending on current renderAsistenciaView implementation. If FAIL, read the actual error to understand what's needed.

- [ ] **Step 3: Update asistenciaView function signature (if needed)**

Open `src/portal-maestros/views/asistenciaView.js` and verify/update the `renderAsistenciaView` function:

```javascript
/**
 * Render attendance view for a specific class
 * Can be called with or without deep link parameters
 * @param {string} containerId - DOM container ID
 * @param {Object} params - Optional parameters
 * @param {string} params.claseId - UUID of class (for direct navigation)
 * @param {string} params.fecha - Date in YYYY-MM-DD format (for direct navigation)
 */
export async function renderAsistenciaView(containerId, params = {}) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error('[asistenciaView] Container not found:', containerId)
    return
  }

  const { claseId, fecha } = params

  // If claseId and fecha provided, load that specific class directly
  if (claseId && fecha) {
    try {
      const asistencia = await obtenerAsistenciaClase(claseId, fecha)
      _renderAsistenciaTable(container, asistencia, { claseId, fecha })
      return
    } catch (err) {
      console.error('[asistenciaView] Error loading direct class:', err)
      container.innerHTML = '<div class="error">Error cargando asistencia</div>'
      return
    }
  }

  // Otherwise, render default/list view (existing behavior)
  _renderDefaultView(container)
}

/**
 * Internal: Render the asistencia table
 */
function _renderAsistenciaTable(container, asistencia, metadata = {}) {
  const { claseId, fecha } = metadata
  
  const html = `
    <div class="asistencia-view">
      <div class="asistencia-header">
        <h2 data-testid="asistencia-title">
          Asistencia ${fecha ? '- ' + fecha : ''}
        </h2>
      </div>
      <table class="asistencia-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Asistió</th>
          </tr>
        </thead>
        <tbody>
          ${(asistencia.estudiantes || []).map(est => `
            <tr>
              <td>${est.nombre}</td>
              <td>
                <input type="checkbox" ${est.asistio ? 'checked' : ''} />
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `

  container.innerHTML = html
}
```

- [ ] **Step 4: Run test again to verify it passes**

Run:
```bash
npm run test:run -- src/portal-maestros/views/__tests__/asistenciaView.deep-link.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/views/asistenciaView.js \
        src/portal-maestros/views/__tests__/asistenciaView.deep-link.test.js
git commit -m "feat: add direct navigation support to asistenciaView via claseId and fecha"
```

---

### Task 6: Integration Test — End-to-End Deep Link Flow

**Files:**
- Create: `src/__tests__/integration/attendance-notifications-e2e.test.js`

- [ ] **Step 1: Write integration test**

```javascript
// src/__tests__/integration/attendance-notifications-e2e.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseDeepLink, navigateToDeepLink } from '../../portal-maestros/services/notificationService.js'
import { renderAsistenciaView } from '../../portal-maestros/views/asistenciaView.js'

// Mock API
vi.mock('../../portal-maestros/api/asistenciaApi.js', () => ({
  obtenerAsistenciaClase: vi.fn().mockResolvedValue({
    clase_id: '550e8400-e29b-41d4-a716-446655440000',
    fecha: '2026-05-21',
    estudiantes: [
      { id: '1', nombre: 'Estudiante A', asistio: null }
    ]
  })
}))

describe('End-to-End: Notification Deep Link Flow', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app-container'
    document.body.appendChild(container)

    // Mock app navigation
    global.appNavigate = vi.fn((params) => {
      if (params.view === 'asistencia') {
        renderAsistenciaView('app-container', {
          claseId: params.claseId,
          fecha: params.fecha
        })
      }
    })
  })

  afterEach(() => {
    container?.remove()
    delete global.appNavigate
  })

  it('should parse notification deep_link, navigate, and render correct class', async () => {
    // Simulate notification with deep_link
    const notification = {
      data: {
        deep_link: '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21',
        titulo: 'Asistencia Pendiente',
        mensaje: 'Debes llenar la asistencia'
      }
    }

    // User clicks notification → parseDeepLink
    const parsed = parseDeepLink(notification.data.deep_link)
    expect(parsed.isValid).toBe(true)
    expect(parsed.claseId).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(parsed.fecha).toBe('2026-05-21')

    // Navigate via deep link
    navigateToDeepLink(notification.data.deep_link)

    // Verify app navigated correctly
    expect(global.appNavigate).toHaveBeenCalledWith({
      view: 'asistencia',
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    })

    // Wait for render and verify view shows the class
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(container.innerHTML).toContain('Estudiante A')
    expect(container.innerHTML).toContain('2026-05-21')
  })

  it('should handle multiple notifications with different classes', async () => {
    const notifications = [
      '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21',
      '/asistencia/660f9511-f30c-52e5-b827-557766551111/2026-05-21'
    ]

    // Parse both
    const parsed1 = parseDeepLink(notifications[0])
    const parsed2 = parseDeepLink(notifications[1])

    expect(parsed1.claseId).not.toBe(parsed2.claseId)
    expect(parsed1.fecha).toBe(parsed2.fecha)
    expect(parsed1.isValid && parsed2.isValid).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails initially (if mocks don't match)**

Run:
```bash
npm run test:run -- src/__tests__/integration/attendance-notifications-e2e.test.js
```

Expected: PASS (or diagnostic failures showing what needs adjustment)

- [ ] **Step 3: If test fails, fix mismatches**

If the test fails due to mock mismatches or implementation gaps:
- Adjust mock response to match `obtenerAsistenciaClase` expectations
- Verify `renderAsistenciaView` uses the correct container
- Ensure `appNavigate` mock is called with expected params

Re-run and verify PASS.

- [ ] **Step 4: Run all notification tests**

Run:
```bash
npm run test:run -- src/portal-maestros/services/__tests__/notificationService.deep-link.test.js src/portal-maestros/views/__tests__/asistenciaView.deep-link.test.js src/__tests__/integration/attendance-notifications-e2e.test.js
```

Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/integration/attendance-notifications-e2e.test.js
git commit -m "test: add end-to-end integration test for notification deep link flow"
```

---

## Plan Complete

All 6 tasks defined with complete TDD steps, migrations, and integration tests. Ready for subagent-driven execution.