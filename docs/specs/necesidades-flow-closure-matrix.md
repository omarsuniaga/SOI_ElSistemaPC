# Matriz de cierre — Flujo de solicitudes de necesidades

Fecha de corte: 2026-07-02

## Objetivo
Cerrar el flujo de `solicitudes_necesidades` para que el maestro pueda crear solicitudes, ACM pueda pre-aprobar o rechazar, FIN pueda presupuestar y resolver, y el sistema quede respaldado por Supabase + Hermes + UI + tests.

## Estado actual resumido
- La UI del maestro, ACM y FIN ya existe.
- La capa de datos ya fue desacoplada con mock y Supabase.
- Existe una migración para ampliar estados, columnas y RLS.
- Existe un contrato Hermes para abrir casos al crear solicitudes.
- Existen tests locales para la lógica y las vistas.

## Matriz de cierre

| Requisito | Evidencia actual | Estado | Falta para cerrar |
|---|---|---:|---|
| El maestro crea solicitudes desde su perfil | `src/portal-maestros/views/perfilView.js` usa `crearSolicitud()` y guarda `departamento_actual = 'ACM'` | Parcialmente verificado | Probar en runtime real con Supabase |
| ACM ve la cola de pendientes y decide | `src/modules/pedagogico/views/solicitudesAdminView.js` lista `pendiente`, `pre_aprobada_acm`, `rechazada_acm`, `en_presupuesto` | Verificado localmente | Probar permisos reales y persistencia |
| FIN ve la cola presupuestaria y resuelve | `src/modules/finanzas/views/solicitudesFinanzasView.js` y su ruta en `finanzas.router.js` | Verificado localmente | Validar en runtime real que FIN vea solo lo suyo |
| El flujo transita entre estados válidos | `src/portal-maestros/api/solicitudesNecesidadesMock.test.js` cubre `preAprobar`, `escalarAFin`, `cargarPresupuesto`, `resolver` | Verificado localmente | Confirmar transición real contra Supabase |
| Hermes abre casos automáticamente | `supabase/migrations/20260702_solicitudes_necesidades_flow.sql` crea trigger `trg_solicitudes_necesidades_open_case` | No verificado en producción | Ejecutar inserción real y confirmar `correlation_id` |
| RLS protege por rol y etapa | Migración `20260702_solicitudes_necesidades_flow.sql` reemplaza policies y restringe por `rol`/estado | No verificado en producción | Validar SELECT/INSERT/UPDATE con usuarios reales |
| El maestro recibe novedades/badge | `perfilView.js` muestra badge `pm-solicitudes-badge` y usa `contarNovedadesMaestro()` | Verificado localmente | Confirmar refresco en uso real |
| Los tests pasan | Vitest pasó para mock, vistas ACM/FIN y notificaciones | Verificado localmente | Ejecutar suite completa en CI/entorno objetivo |
| No se rompe el resto del portal | Cambios están aislados por API/vistas/ruta | Parcialmente verificado | Hacer smoke test de navegación |

## Pendientes críticos para declarar cierre
1. Aplicar la migración en el entorno real de Supabase.
2. Verificar que el trigger Hermes crea el caso `ACM-NEC`.
3. Probar el flujo completo con usuarios reales:
   - maestro crea solicitud,
   - ACM pre-aprueba o rechaza,
   - ACM escala a FIN,
   - FIN presupuestar y resuelve.
4. Probar RLS con un usuario maestro, uno admin ACM y uno FIN.
5. Hacer smoke test de la UI en el portal maestro, ACM y FIN.

## Criterio de cierre
El feature solo puede declararse cerrado cuando:
- la migración esté aplicada y validada,
- Hermes esté confirmando correlación/caso,
- las policies RLS estén comprobadas,
- el flujo Maestro → ACM → FIN funcione en runtime,
- y al menos un smoke test completo pase sin intervención manual.

## Observación técnica
Los tests actuales prueban la lógica y la estructura de la UI, pero **no sustituyen** la validación real contra Supabase/Hermes. Esa es la última brecha para cerrar correctamente.

