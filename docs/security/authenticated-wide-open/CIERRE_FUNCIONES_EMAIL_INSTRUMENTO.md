# Cierre de dos funciones SECURITY DEFINER (hallazgos L1 y L2 del bloque 5)

**Migración:** `20261020132000_close_secdef_email_departamento_and_instrument_report.sql` · **Rollback:** `supabase/rollback/20261020132000_…rollback.sql` · **Estado:** nada aplicado en producción.
Cerrar RLS no afecta a estas funciones: se ejecutan como propietario. Complementa al bloque 5; es independiente de él (solo exige `tiene_capacidad_academica`, ya en producción).

| Función | Antes (producción, 20-oct-2026) | Después |
|---|---|---|
| `fn_email_departamento(text)` | `EXECUTE` para `PUBLIC`, `anon`, `authenticated`: sin sesión se obtiene el correo de cualquier departamento por su código | solo `service_role`. Único llamador real: la edge function `send-email` con la clave de servicio; ningún código de `src/`, cron ni otra función la llama |
| `fn_reportar_instrumento_danado(uuid,text,uuid,text)` | `EXECUTE` para cualquier cuenta autenticada, sin comprobación de rol: marca cualquier instrumento como dañado y abre cinco tareas Hermes (LUT/LOG/FIN/ACM/COM) | el cuerpo original se conserva intacto como `_impl` (sin `EXECUTE` para nadie salvo el propietario); el nombre público pasa a ser un envoltorio con la misma firma que exige `tiene_capacidad_academica('catalogo:escribir')` (admin, superadmin, coordinación académica). Único llamador: la pantalla de instrumentos |

## Condiciones antes de aplicar
1. **`SUPABASE_SERVICE_ROLE_KEY` presente en la edge function `send-email`.** Su código cae a la clave anónima si falta; con este cambio esa rama dejaría de resolver correos. Comprobarlo (solo el nombre del secreto, no su valor) y probar «enviar correo de prueba» desde Correos Departamentos tras aplicar.
2. Probar «Reportar instrumento dañado» como admin (funciona) y, si existe, como maestro/alumno de prueba (debe dar `42501`).
3. `service_role` ya no puede llamar a `fn_reportar_instrumento_danado` (la guarda usa `auth.uid()`); nadie lo hace hoy (verificado en `src/` y `supabase/functions/`).
4. Colisión de versiones: la rama `claude/secdef-anon-audit-41edbb` usa `20261020130000`; el bloque 5 se renumeró a `20261020131000` y este cierre usa `20261020132000`. Ninguna de las funciones de aquí está en su «grupo 1».

## Pruebas (PostgreSQL 17 aislado, funciones capturadas de producción en solo lectura)
`npm run test:db:secdef-email-instrument`: antes 8/8, después 120/120 (matriz de 20 actores, flujos con el cuerpo original, llamadores `SECURITY DEFINER`), idempotencia 2/2, ACL y cuerpo original idéntico por hash 2/2, precondición 2/2, rollback exacto 11/11: **145/145**. Mutación (`mutation_check.mjs`): 7 de 7 mutantes detectados (guarda neutralizada pero aún mencionada, guarda solo-admin, `anon` o `authenticated` recuperan `EXECUTE`, `_impl` expuesta, envoltorio sin guarda para `service_role`, envoltorio sin `SECURITY DEFINER`).

## Riesgos residuales
- `p_actor_id` y `p_actor_nombre` siguen siendo datos que aporta el llamador (como antes): un coordinador podría atribuir el reporte a otra persona.
- Quedan las demás funciones `SECURITY DEFINER` ejecutables por `anon`: ver la auditoría de la rama `secdef-anon-audit`.
