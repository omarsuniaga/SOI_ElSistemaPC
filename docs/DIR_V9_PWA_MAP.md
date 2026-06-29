# Mapa DIR V9 vs PWA

## Fuente verificada
- `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR_EJEC_V9.md`
- `00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9.md`
- `09_SOI_WEB_PORTAL/sistema-academico-pwa/src/main.js`

## Hallazgo
La PWA ya tenía capacidades útiles para Dirección, pero estaban repartidas entre otras zonas del portal. Eso no representaba bien el rol V9 de `DIR-EJEC` como articulador de capas, aprobador y lector operativo de Hermes.

## Mapeo operativo aplicado
- Vista global de carga institucional -> `dir-score`
- Centro de decisiones DIR -> `dir-decision-center`
- Seguimiento por procedimiento -> `dir-procedimientos`
- Consulta factual a Hermes -> `dir-hermes-consulta`
- Reportería institucional -> `admin-dashboard-reportes`
- Tendencias institucionales -> `admin-dashboard-tendencias`
- Alertas y actividad crítica -> `admin-notificaciones`
- Aprobaciones operativas -> `admin-aprobacion`
- Gobernanza básica de permisos -> `permisos`

## Cambio ejecutado
Se actualizó `src/main.js` para exponer esas capacidades dentro del grupo `Dirección`.

Se creó `src/modules/hermes/views/dirDecisionCenterView.js` con playbooks operativos para:
- Standup de Dirección
- Comité de Cierre Semanal
- Coordinación Institucional
- Reporte para Junta Directiva

Cada playbook dispara tareas estructuradas en Hermes usando APIs ya existentes.

También se agregó una capa explícita de gobernanza para:
- registrar flujo de actas de Junta / Comité / Standup
- registrar flujo seguro de orden de pago

## Persistencia formal agregada
- Se reutiliza la tabla real `minutas` ya existente para actas/minutas.
- Se agregó la migración `20260628_dir_governance.sql` con la tabla `dir_decisions`.
- `dir_decisions` persiste:
  - tipo de decisión
  - estado
  - monto
  - necesidad de firma dual
  - necesidad de revisión de Junta
  - referencias documentales
  - vínculo a `minutas`
  - `correlation_id` para trazabilidad con Hermes

## Conflicto documental detectado
Hay una inconsistencia vigente que impide automatizar el umbral de doble firma:
- `DIR_EJEC_V9.md` -> doble firma para pagos > RD$50,000
- `FIN-P15_Emision_Cheques_V9.md` -> firma dual desde RD$5,000

Por seguridad, la PWA quedó en modo conservador:
- NO decide automáticamente el umbral
- SÍ crea tareas de revisión DIR + ADM + FIN con huella Hermes

## Gap todavía abierto
Falta una capa formal para:
- actas/minutas versionadas
- doble firma financiera > RD$50,000
- veto/decisión con huella documental
- tablero formal de Junta Directiva
- gestión de talento DIR
