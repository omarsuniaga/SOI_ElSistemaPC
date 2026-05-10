# Skill Registry - portal-maestros

## Compact Rules

### Vanilla JS Components
- Use `export async function create[Name](container, props)` pattern.
- Avoid `innerHTML` for user data; use `escHTML` utility.
- Styles should follow Apple/Design System tokens.
- No `alert()`, `confirm()`, or `prompt()`.

### Testing
- Use Vitest.
- Mock external services and Supabase.
- Test files live in `__tests__` directories adjacent to source.

### Architecture
- View Registry for navigation.
- Service layer for data and AI logic.
- Offline-first approach with `offlineQueue`.

## User Skills

| Trigger | Skill | Description |
|---|---|---|
| `js`, `vanilla` | sdd-apply | Standard JS implementation |
| `test`, `vitest` | sdd-verify | Vitest execution |
| `design`, `ux` | sdd-design | UI/UX planning |
