Closes #TODO

## Type
- [ ] Bug fix
- [x] New feature
- [ ] Documentation only
- [ ] Code refactoring
- [ ] Maintenance/tooling
- [ ] Breaking change

## Summary
- Adds the SOI backbone from canonical process contracts to Hermes cases and departmental tasks.
- Adds executable process contracts for ACM-P02, FIN-P13, and OPR-P10, tied to `correlation_id` and `process_code`.
- Adds a generated SOI process/document index with 62 canonical documents from `01_DEPARTAMENTOS`.

## Changes

| File | Change |
|------|--------|
| `supabase/migrations/20260627_hermes_soi_process_contract_v1.sql` | Adds `soi_process_contracts`, `hermes_process_cases`, `process_code`, RPC, RLS, and seed contracts. |
| `src/modules/hermes/api/tareasSupabase.js` | Adds real API for listing process contracts and opening process cases. |
| `src/modules/hermes/api/tareasMock.js` | Adds mock process contracts and case/task generation. |
| `src/modules/hermes/views/procedimientosView.js` | Shows executable SOI contracts and opens cases from Dirección. |
| `src/modules/hermes/data/soiProcessIndex.js` | Adds generated canonical SOI process/document index. |
| `docs/superpowers/specs/2026-06-27-soi-backbone-spec-and-index.md` | Documents backbone spec and indexed process map. |

## Test Plan
- [x] `npm run test:run -- src/modules/hermes/__tests__/tareasApi.sp0.test.js`
- [x] `npm run build`
- [ ] Supabase migration applied in target environment
- [ ] Omar review/approval before merge

## Notes
- Base branch should be `opencode/luteria-taller` for this PR to avoid dragging Lutería base work into the diff.
- `Closes #TODO` must be replaced with an approved issue before merge if repository checks require issue linkage.
