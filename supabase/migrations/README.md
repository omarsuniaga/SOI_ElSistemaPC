# Migrations — Sistema Académico PWA

## Quick Reference

| Category | Date Range | Files | Description |
|----------|-----------|-------|-------------|
| Core Schema | — | 001–005 | Base tables: students, clases, maestros, planificaciones, profiles |
| Academic Routes | — | 006–012 | Curriculum routes, levels, nodes, indicators, weekly plans |
| Auth & RLS | 2026-05-13 → 2026-05-19 | ~10 | Profile auto-creation, role-based RLS, admin policies |
| Planification | 2026-05-07 → 2026-05-11 | ~5 | Planning documents, indicator attempts, coverage fields |
| Attendance & Ausencias | 2026-05-19 → 2026-06-06 | ~8 | Ausencias workflow, notification triggers, escalation |
| Notifications | 2026-05-20 → 2026-05-23 | ~6 | Push notifications, deep links, cron schedules |
| Maestro Registration | 2026-05-26 → 2026-05-30 | ~10 | Signup flow fixes, instrument handling, pre-existence linking |
| Pedagógico | 2026-06-07 → 2026-06-28 | ~6 | Institutional follow-up, segumiento, plan-indicator links |
| Hermes (Telegram) | 2026-06-22 → 2026-06-30 | ~10 | Core Hermes, WhatsApp integration, bot hardening |
| Simulador & Tools | 2026-07-04 → 2026-07-13 | ~6 | Simulator core, tool catalog, tool gateway |
| Lutería | 2026-06-27 → 2026-07-12 | ~3 | Workshop schema, FK inventario activos |
| Rediseño Planificación | 2026-07-22 | 4 | Bridge table, objetivo linking, evaluation, cleanup |
| Cierre de Semestre | 2026-07-26 | 6 | Asistencia docente, calendario lectivo, cierre validado |
| Other | Various | ~10 | Hermes governance, ACM governance, misc fixes |

## Naming Conventions

Two naming patterns coexist:

1. **Numbered** (`001_*.sql` → `012_*.sql`) — original migrations, no timestamp prefix
2. **Date-stamped** (`YYYYMMDD_*.sql` or `YYYYMMDDHHMMSS_*.sql`) — added as project grew

**Rule for new migrations:** Use `YYYYMMDD_description.sql` format. Example: `20260727_add_feature.sql`

## How to Apply

1. Open **Supabase Dashboard → SQL Editor**
2. Run each `.sql` file in order (date-stamped files are already chronological)
3. Verify in **Table Editor** that tables/columns were created
4. Check `supabase migration list` for applied vs pending status

## Troubleshooting

| Error | Fix |
|-------|-----|
| `relation already exists` | Normal if re-running — files use `IF NOT EXISTS` |
| `foreign key constraint fails` | Run migrations in order; dependent tables must exist first |
| `column already exists` | Check if a later migration already added this column |
| `permission denied for table` | RLS policy may be blocking — check with service role key |

## Notes

- **DO NOT rename or reorder existing files** — Supabase tracks applied migrations by filename
- **DO NOT squash** unless you're sure the remote DB state matches
- `schema_reference.sql` and `seed-*.sql` are reference/seed files, NOT proper migrations
- Last updated: 2026-07-26
