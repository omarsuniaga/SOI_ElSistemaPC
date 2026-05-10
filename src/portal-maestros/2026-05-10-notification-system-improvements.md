# Notification System Improvements — Spec

## Goal
Improve the notification system reactivity and implement proper Web Push support with three key enhancements: faster polling, Web Push subscription UI, and deduplication logic.

## Executive Summary

Currently the notification system is partially reactive:
- **Local alerts (Service Worker)**: Work well for pre/post-class scheduling
- **In-app polling**: Reactive but SLOW (5-minute intervals)
- **Web Push infrastructure**: Built but UNUSED (no subscription UI, no backend push sending)

This spec addresses three critical gaps:

1. **Accelerate polling** from 5 min → 30-60 sec for real-time classroom alerts
2. **Add Web Push subscription UI** in settings so users can enable push notifications
3. **Implement deduplication** to prevent duplicate notifications if both polling + push active

## Problem Statement

### Current State
- Polling interval: 300 seconds (5 minutes) — too slow for classroom scenarios
- Web Push API: Fully implemented but never called (no UI button)
- Backend: Sends nothing via push (only polling-based notifications work)
- User experience: Delayed alerts, missing pre-class windows, no push option

### Why This Matters
- Teacher gets "class starting in 15 min" alert → but only after 5-minute poll delay
- 30-50% of the notification window is lost
- Teachers can't enable push notifications (UI doesn't exist)
- If backend ever sends push, duplicates occur (no deduplication)

## Architecture

### Component Changes

**1. Notification Service (faster polling)**
- File: `src/portal-maestros/services/notificationService.js`
- Change: `setInterval` from 5 min → 30 sec
- Add: `POLL_INTERVAL_MS = 30000` constant (configurable)
- Rationale: 30-sec lag is acceptable for classroom context; trades some battery for reactivity

**2. Push Service (subscription + deduplication)**
- File: `src/portal-maestros/services/pushService.js`
- Add: `getSubscriptionStatus()` method to check if user is subscribed
- Add: Deduplication key generation for push + polling notifications
- Modify: `subscribeToPush()` to emit events for UI feedback

**3. Settings Panel (Web Push UI)**
- File: `src/portal-maestros/views/configView.js` (or new `notificationSettingsView.js`)
- Add: Notification preferences section:
  - Toggle: "Habilitar Web Push Notifications"
  - Toggle: "Alertas pre-clase"
  - Input: Minutes before class to alert (default: 15)
  - Toggle: "Alertas post-clase sin registrar"
  - Input: Minutes after class to alert (default: 60)
  - Display: Current subscription status (active/inactive)
  - Button: "Test Notification" (calls `testNotification()`)

**4. Notification Panel (deduplication)**
- File: `src/portal-maestros/components/notificacionesPanel.js`
- Add: `deduplicationKey` comparison before adding to list
- Logic: Don't show duplicate if same notification received via push + polling within 60 seconds

**5. Notification Service (backend signal)**
- File: `src/portal-maestros/services/notificationService.js`
- Add: `onPushReceived()` callback hook for deduplication
- Allows Web Push to signal received notifications before polling finds them

### Data Flow

```
┌─────────────────────────────────────┐
│ User enables Web Push (Settings UI) │
└────────────┬────────────────────────┘
             ↓
    subscribeToPush()
             ↓
    Store endpoint in push_subscriptions table
             ↓
    notificationService detects subscription
             ↓
    onPushReceived() callback registered
             ↓
┌────────────┴────────────────────────┐
│ Two channels now active:            │
│ • Polling (30-sec intervals)        │
│ • Web Push (server-triggered)       │
└───────────────────────────────────┬─┘
                                    ↓
                    notificationService._deduplicateNotification()
                                    ↓
                    showNotification (only once)
```

### Deduplication Strategy

**Key**: `${notification.tipo}:${notification.related_id}:${Math.floor(Date.now() / 60000)}`
- Notification type (e.g., "recordatorio_clase", "sesion_sin_registrar")
- Related ID (clase_id, alumno_id, etc.)
- 1-minute bucket (prevents duplicates within same minute)

**Logic**: 
- Push arrives → calculate key → store in `_recentPushKeys` Set
- Polling arrives → calculate key → check if in set
- If found: skip duplicate, remove from set
- If not found: show notification, add key to set
- Auto-expire keys after 2 minutes

### Configuration

**notificationService.js:**
```javascript
const POLL_INTERVAL_MS = 30 * 1000;  // 30 seconds
const DEDUP_WINDOW_MS = 60 * 1000;   // 1 minute
const DEDUP_EXPIRY_MS = 120 * 1000;  // 2 minutes
```

**pushService.js:**
```javascript
const DEFAULT_PREFS = {
  alerta_pre_clase: true,
  min_antes_clase: 15,
  alerta_post_clase: true,
  min_post_clase_sin_registro: 60,
  push_activo: false,
  recordatorios_activos: true,
}
```

## Testing

**Unit Tests (Vitest):**
- Test deduplication key generation with edge cases
- Test DEDUP_WINDOW logic with mock timers
- Test polling + push ordering scenarios
- Test subscription status transitions

**Integration Tests:**
- Subscribe to push, verify endpoint stored in DB
- Unsubscribe, verify activo=false flag
- Test notification arrives within 30 seconds
- Simulate push + polling at same time, verify no duplicates

**Manual Testing:**
- Enable Web Push in settings
- Create a class starting in 15 minutes
- Verify alert shows at ~15-min mark (not 20 min)
- Test "Test Notification" button
- Disable push, verify polling still works
- Re-enable push, verify no duplicate notifications

## File Structure

```
src/portal-maestros/
├── services/
│   ├── notificationService.js       (MODIFY: polling interval, deduplication)
│   └── pushService.js                (MODIFY: subscription feedback, dedup hooks)
├── components/
│   └── notificacionesPanel.js        (MODIFY: deduplication logic)
└── views/
    ├── configView.js                 (MODIFY: add notification settings section)
    └── (or create: notificationSettingsView.js)

tests/
└── services/
    ├── notificationService.test.js   (NEW: dedup tests)
    └── pushService.test.js           (NEW: subscription tests)
```

## Success Criteria

✅ Polling interval: 30 seconds (configurable)
✅ Web Push UI: Settings panel with subscribe button, status display, test button
✅ Deduplication: No duplicate notifications if push + polling both active
✅ User can enable/disable push from settings
✅ Pre-class alerts arrive within 2 minutes of target time (not 5+ minutes)
✅ All existing functionality preserved (backward compatible)
✅ Tests pass: unit + integration
✅ No console errors related to notifications

## Risks

**Low**: Polling more frequently uses more battery
- Mitigation: Configurable interval, can reduce to 60sec on mobile

**Low**: If backend never sends push, subscription endpoints unused
- Mitigation: Still works as polling fallback; can implement backend push later

**Low**: Deduplication window might miss edge cases (clock skew between client/server)
- Mitigation: 60-sec window + 2-min expiry is safe for classroom context

## Out of Scope

- Backend push notification sending (depends on backend team)
- Mobile app integration (PWA only)
- Advanced notification channels (SMS, email)
- Notification history/archive
- Scheduled/recurring notifications
