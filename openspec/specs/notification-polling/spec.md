# Delta for Notification System

> **Change**: actualizacion-portales | **Domains**: notification-polling (MODIFIED), web-push-settings (NEW)

## ADDED Requirements

### Requirement: NOTIF-01 — Web Push Subscription UI

The system SHALL expose a subscription management panel in `configView.js` that allows teachers to enable/disable Web Push notifications and see live subscription status.

#### Scenario: Enable push via settings toggle

- GIVEN the teacher is on the Config view
- WHEN toggling "Habilitar Web Push Notifications" ON
- THEN `pushService.subscribeToPush()` SHALL be called
- AND the status display SHALL update to "✅ Push habilitado" within 2 seconds
- AND the endpoint SHALL persist in the `push_subscriptions` table

#### Scenario: Disable push via settings toggle

- GIVEN the teacher is subscribed to Web Push
- WHEN toggling the same checkbox OFF
- THEN `pushService.unsubscribeFromPush()` SHALL be called
- AND the status SHALL update to "❌ Push deshabilitado"

#### Scenario: Push unsupported by browser

- GIVEN a browser that does NOT support the Push API
- WHEN the config view loads
- THEN the push toggle SHALL be grayed out
- AND the status SHALL show: "requiere configuración del servidor"

### Requirement: NOTIF-02 — Test Notification Button

The config view SHALL include a "🔔 Probar notificación" button that triggers a local test notification.

#### Scenario: Test notification succeeds

- GIVEN Web Push is enabled
- WHEN clicking "🔔 Probar notificación"
- THEN a local notification SHALL fire within 5 seconds
- AND the button text SHALL change to "✅ Notificación enviada" for 2 seconds

#### Scenario: Test notification without push

- GIVEN the browser does NOT support push
- WHEN clicking the test button
- THEN an alert SHALL display: "No se pudo enviar notificación de prueba. Verifica los permisos."

### Requirement: NOTIF-03 — Configurable Notification Preferences

The system SHALL persist per-teacher notification preferences: pre-class alerts, post-class reminders, and their lead/lag times.

#### Scenario: Save pre-class lead time

- GIVEN the teacher sets "Minutos antes" to 20
- WHEN clicking any other setting
- THEN `saveNotificationPreferences` SHALL persist `{ min_antes_clase: 20 }`
- AND subsequent alerts SHALL fire 20 minutes before class start

## MODIFIED Requirements

### Requirement: NOTIF-04 — Notification Polling Interval

The system SHALL poll for new notifications every 30 seconds (previously: 5 minutes). (Previously: `POLL_INTERVAL_MS` set to `5 * 60 * 1000`)

#### Scenario: New interval on startup

- GIVEN the notification service initializes
- THEN `setInterval(fetchNotificaciones, POLL_INTERVAL_MS)` SHALL be called
- AND `POLL_INTERVAL_MS` SHALL equal `30000`

#### Scenario: Network requests at 30-sec cadence

- GIVEN the app is open in a browser
- WHEN observing Network tab for `/api/notificaciones` or equivalent
- THEN requests SHALL appear every 30 seconds (± 5 seconds variance allowed)

### Requirement: NOTIF-05 — Notification Deduplication

The system SHALL prevent duplicate notifications when the same notification arrives via both polling and Web Push within a 2-minute window. (Previously: no deduplication existed)

#### Scenario: Same notification via polling then push

- GIVEN a notification arrives via polling (fetched)
- WHEN the same notification arrives via Web Push within 60 seconds
- THEN the push notification SHALL be filtered out as a duplicate
- AND the notification SHALL appear exactly ONCE in the notification panel

#### Scenario: Dedup key expiry

- GIVEN a notification was recorded 121 seconds ago
- WHEN checking `_isDuplicateNotification` with the same key
- THEN the function SHALL return `false` (key expired)

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | `POLL_INTERVAL_MS = 30000` | Unit test assertion |
| AC-02 | Push panel renders in configView | DOM test |
| AC-03 | Dedup filters within 2-min window | Unit test with fake timers |
| AC-04 | Subscription status displayed | `getSubscriptionStatus()` returns correct state |
| AC-05 | Preferences persist across reload | localStorage/Supabase readback |

### Cross-reference: Accessibility

WCAG AA accessibility requirements for this view are defined in `openspec/specs/accessibility-audit/spec.md`:
- **Requirement 14** — Push subscription status badge with `aria-live="polite"` and `aria-atomic="true"`, toggle `aria-describedby` linking to status badge
