# Ruta Gamificada — Spec

## Goal

Transform the ruta view from a functional tree browser into a **visual content map** where teachers track what they've taught, what's next, and where each student stands in the learning path. Mobile-first, vertical, gamified with animations and clear visual feedback.

## Executive Summary

Teachers need to:
1. **See the complete content tree** (blocks → levels → nodes/indicators)
2. **Track what they've already taught** (manual mark + automatic from observations)
3. **See student progress** in the path visually (avatars on each node)
4. **Plan next class** by marking nodes to cover today
5. **Integrate with class observations** so registering obs auto-marks content

Current state: Functional tree explorer. Needed: Gamified content map with animations and class integration.

---

## Architecture

### Mobile-First, Vertical Layout

Content flows top-to-bottom on mobile (< 768px). Desktop: optional side-by-side (content tree + class list).

```
┌─────────────────────────────┐
│ Header: Route Name + Class  │
├─────────────────────────────┤
│                             │
│  BLOCK 1: RITMO             │
│  ┌──────────────────────┐   │
│  │ LEVEL 1: Básico      │   │
│  │ Progress: 62%        │   │
│  │ [Expand ▼]           │   │
│  └──────────────────────┘   │
│      ↓ (expanded)           │
│  ┌──────────────────────┐   │
│  │ 🟢 Pulso Regular     │   │
│  │ 👥 Juan, María       │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │ 🟡 Síncopa (today)   │   │
│  │ 👥 +1                │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │ LEVEL 2: Avanzado    │   │
│  │ 🔒 Bloqueado (80%)   │   │
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### Component Structure

```
RutaGameificadaView (main)
  ├── RutaHeader (route name, class selector, progress summary)
  ├── RutaTreeContainer (scrollable tree)
  │   └── BlockSection (repeating)
  │       ├── BlockHeader (name, expand/collapse)
  │       └── LevelGroup (repeating)
  │           ├── LevelHeader (name, % progress, lock status)
  │           └── NodeCard (repeating)
  │               ├── NodeIndicator (color, name)
  │               ├── StudentAvatars (who completed)
  │               └── NodeActions (mark, observe, details)
  └── NodeDetailPanel (sticky bottom, appears on node click)
      ├── NodeTitle & Breadcrumb
      ├── StudentList (who worked on this)
      ├── ActionButtons (Mark Today, Register Observation, Close)
      └── ClassLinkage (which class covered this)
```

---

## Visual Design

### Color Semaphore

| State | Color | Icon | Meaning |
|-------|-------|------|---------|
| **Covered** | 🟢 Green (#22c55e) | ✓ | Already taught in a class |
| **In Progress** | 🟡 Yellow (#f59e0b) | ⟳ | Some students working on it |
| **Not Started** | ⚫ Gray (#94a3b8) | ○ | Not yet covered |
| **Locked** | 🔐 Dark Gray (#64748b) | 🔒 | Requires 80% of previous level |

### Node Card Design

```
┌────────────────────────────────┐
│ 🟢 Pulso Regular               │ ← Color + name
│                                │
│ 👤 Juan  👤 María             │ ← Student avatars (max 3, +N)
│                                │
│ Covered May 10 in Grupo A      │ ← Metadata (when, where)
└────────────────────────────────┘
```

On tap/click → expands to detail panel with actions.

---

## Animations & Transitions

### 1. Page Load (Cascade)
- Tree loads top-to-bottom
- Each level fades in with 300ms stagger
- Avatars bounce-in (scaleY 0→1, duration 400ms)
- **Effect:** Sense of "unfolding" the content

### 2. Mark Node as Covered (Manual or Auto)
**Trigger:** User taps "Mark Today" OR observation registered against indicator

**Animation:**
1. Node background flashes (green color, 100ms)
2. Node scales up slightly (1.0 → 1.05, 200ms)
3. Confetti particles (small 🎵 icons, fall 500ms)
4. Student avatar appears in list with pulse effect (300ms)
5. Optional: Soft "ding" sound (80ms, low volume)
6. Level progress bar animates to new %
7. If level reaches 80%: Next level unlock animation

**Effect:** Clear visual & haptic reward. Makes teacher want to keep marking.

### 3. Unlock Level
**Trigger:** Level reaches 80% completion

**Animation:**
1. Locked level (🔒) glows with green outline (pulse, 600ms)
2. Icon rotates 360° (300ms)
3. Lock icon → unlock icon (fade)
4. Level background color changes to active (light green tint)
5. Subtle "level up" sound (optional)

**Effect:** Milestone celebration. Motivates teacher to keep going.

### 4. Expand/Collapse Level
- Chevron icon rotates 180° (300ms, smooth)
- Node list slides down (300ms, easeOut) or up (300ms, easeIn)
- Smooth, not jarring

### 5. Select Node (Open Detail Panel)
- Node highlights with border + slight scale (1.0 → 1.02)
- Detail panel slides up from bottom (300ms, easeOut)
- Overlay fade-in (200ms)

### 6. Planned Content (Mark for Today)
- Node gets a "📅 Today" badge
- Subtle yellow glow around border
- **Effect:** Visual reminder of what to cover

---

## Data Model

### Node Extended (beyond current rutaService)

```javascript
{
  id: "node-123",
  nombre: "Pulso Regular",
  semaphore: "green", // green|yellow|gray|locked
  
  // NEW: Coverage tracking
  coverageStatus: {
    covered: true,
    coveredDate: "2026-05-10",
    coveredInClaseId: "clase-456",
    coveredInClassName: "Grupo A",
  },
  
  // NEW: Student progress
  studentProgress: [
    {
      studentId: "student-789",
      studentName: "Juan",
      avatar: "https://...",
      progress: "completed", // completed|in-progress|not-started|locked
      lastObservationDate: "2026-05-10",
    },
    // ...
  ],
  
  // NEW: Planned for today
  plannedForToday: true,
  plannedInClaseId: "clase-456",
}
```

### Level Extended

```javascript
{
  id: "level-1",
  nombre: "Nivel 1: Básico",
  semaphore: "green",
  locked: false,
  
  // NEW: Progress calculation
  progress: {
    total: 8,
    covered: 5,
    percentage: 62.5,
  },
  
  nodes: [/* ... */]
}
```

### Block Extended

```javascript
{
  id: "block-1",
  nombre: "BLOQUE 1: RITMO",
  
  levels: [/* ... */]
}
```

---

## Class Integration

### Before Class: Plan Content

1. Teacher opens ruta view
2. Selects their class from dropdown
3. Sees the tree with current progress
4. Clicks "Mark for Today" on 2-3 nodes (optional, manual planning)
5. Those nodes show 📅 Today badge
6. **Data stored:** `plannedForToday: true, plannedInClaseId: "clase-id"`

### During Class: Register Observations

1. Teacher is in class view → clicks "Register Observation"
2. Opens observation editor
3. Sees dropdown: "Which indicator did you work on today?"
4. Dropdown shows:
   - Nodes marked as "for today" (if any)
   - OR all nodes from the ruta (if none marked)
5. Teacher selects "Pulso Regular"
6. Writes observation + optional AI enhancement
7. Saves observation
8. **Automatic triggers:**
   - Node "Pulso Regular" marked as 🟢 covered
   - Student avatar added to node's avatar list
   - Coverage date = today
   - Class linked to node
   - Level progress % updated
   - Animation: confetti + "Covered!" feedback

### After Class: View Updated Progress

1. Teacher returns to ruta view
2. Sees updates:
   - Nodes marked as 🟢 (with timestamps)
   - Student avatars on nodes
   - Progress % updated
   - If 80% reached: next level unlocked
3. Can click on covered node → see "Who participated" + observation snippets

---

## Student Progress Visualization

### Avatar List (on each node)

- **Max 3 avatars shown inline**
- If more than 3: "+N more" pill (e.g., "+5")
- Tapping avatar list → shows full student names + when they completed
- Avatar colors match student's learning status:
  - 🟢 Green circle: Completed
  - 🟡 Yellow circle: In progress
  - ⚫ Gray circle: Not started

### Hover/Long-Press (on avatar)

- Shows tooltip: "Juan · Completed May 10"
- On mobile: long-press → shows same tooltip

---

## Success Criteria

✅ **Visual Design**
- Tree renders vertically (mobile-first)
- Semaphore colors clear and consistent
- Animations smooth (60fps, no jank)
- Responsive design (mobile ≤ 768px, desktop > 768px)

✅ **Gamification**
- Animations on mark/unlock make teacher want to use it
- Confetti + visual feedback on progress
- Unlock animations celebrate milestones
- Progress % visible on each level

✅ **Class Integration**
- Manual mark + automatic mark both work
- Registering observation auto-marks node
- Node → class linkage stored and retrievable
- Multiple observations per node allowed

✅ **Performance**
- Tree with 50 nodes loads < 1s
- Animations smooth even on low-end mobile
- No jank on scroll or expand/collapse

✅ **Accessibility**
- All colors + icons (not just color)
- Touch targets ≥ 48px
- Keyboard navigation for desktop

---

## Out of Scope

- Backend push notifications (separate feature)
- Advanced analytics/reports (future)
- Multi-language (Spanish only, for now)
- Offline support (can add later with Service Worker)
- Teacher-student comparison view (future)

---

## File Structure (Post-Implementation)

```
src/portal-maestros/
├── views/
│   ├── rutaGameificadaView.js (NEW: main view, replaces rutaPlayerView)
│   └── __tests__/
│       └── rutaGameificadaView.test.js
├── components/
│   ├── RutaHeader.js (NEW)
│   ├── BlockSection.js (NEW)
│   ├── LevelGroup.js (NEW)
│   ├── NodeCard.js (NEW)
│   ├── StudentAvatars.js (NEW)
│   ├── NodeDetailPanel.js (NEW)
│   └── __tests__/ (for each)
├── services/
│   ├── rutaGameificadaService.js (NEW: extended rutaService)
│   └── __tests__/
│       └── rutaGameificadaService.test.js
├── styles/
│   ├── rutaGameificada.css (NEW: animations, layout, colors)
└── animations/
    └── rutaAnimations.js (NEW: shared animation helpers)
```

---

## Animations Library

Reusable helpers:

```javascript
// src/portal-maestros/animations/rutaAnimations.js

export const animations = {
  cascadeIn: (element, delay = 0) => { /* fade + stagger */ },
  bounceIn: (element, delay = 0) => { /* scaleY bounce */ },
  markCovered: (element) => { /* flash + scale */ },
  confetti: (position) => { /* particle effects */ },
  levelUnlock: (element) => { /* glow + rotate */ },
  levelExpand: (element) => { /* slideDown */ },
  levelCollapse: (element) => { /* slideUp */ },
  selectNode: (element) => { /* scale + highlight */ },
  pulseProgress: (element, percent) => { /* progress bar animation */ },
}
```

All animations use CSS transitions + requestAnimationFrame for 60fps.

---

## Testing Strategy

### Unit Tests
- Component rendering (RutaHeader, NodeCard, etc.)
- Color semaphore calculation
- Progress % calculation
- Lock/unlock logic (80% threshold)

### Integration Tests
- Tree loads with correct structure
- Marking node updates progress %
- Registering observation auto-marks node
- Avatar list updates correctly
- Level unlocks at 80%

### E2E Tests
- Full flow: Load ruta → Mark content → Register observation → See animation
- Mobile responsiveness
- Animations play smoothly

### Performance Tests
- Tree with 50 nodes loads < 1s
- Animations maintain 60fps
- Scroll performance smooth

---

## Future Enhancements

- **Streak tracking:** Days in a row the teacher marked content
- **Class comparison:** See which class is ahead
- **Prediction:** "At this pace, you'll finish by June 15"
- **Notifications:** "Time to mark content for today"
- **Export reports:** "Content covered vs scheduled"
- **Mobile app:** Native iOS/Android (if needed)
