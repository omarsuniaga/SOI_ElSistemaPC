# SOI v1.x LTS RELEASE BASELINE — Manifiesto Canónico de Versión Estable

> **Versión:** `SOI v1.2 LTS`  
> **Fecha de Emisión:** 10 de Septiembre de 2026  
> **Rama de Release:** `release/soi-v1-lts`  
> **Commit Base Auditado:** `2803124f` (HEAD de `feat/planificacion-clases-rediseño`)  
> **Commit Anteriormente Desplegado en Producción (Netlify):** `a3af9c53`  
> **Estado Operativo:** Producción Estable / Release Candidate Sellado  
> **Base de Datos:** Supabase PostgreSQL 17.6 (`zmhmdvmyeyswunurcyow`)  
> **Head de Migraciones en Producción (Live DB):** `20260908150000_fase0_portal_catalog_desactivacion.sql` (304 migraciones aplicadas)  
> **Migraciones LTS en Repositorio (Pendiente Ejecución Manual en Supabase):** `20260910170000` y `20260910180000`  

---

## 1. Identidad y Alcance de la Versión

`SOI v1.x LTS` representa la congelación formal de la primera generación del Sistema Operativo Institucional (SOI) de El Sistema Punta Cana. 

Esta versión garantiza:
1. **Cero Regresiones**: 4.006 pruebas automatizadas pasando en verde (7 omitidas legítimamente, 0 fallos de 4.013 pruebas en 452 archivos).
2. **Seguridad Endurecida**: Revocación de accesos anónimos a datos de estudiantes (PII), protección de logs de mensajería y blindaje de funciones `SECURITY DEFINER`.
3. **Integridad de Mutación**: Eliminación de mutaciones ciegas en DataAdapters y verificación obligatoria de filas modificadas.
4. **Ergonomía Preservada**: Flujos de toma de asistencia, semáforo de ausentismo (`AUS1d`), gestión de cobranzas y comodatos de inventario plenamente operacionales.
5. **Cero Alcance 2.0**: No se incorporaron nuevas capacidades fuera del alcance de v1 (Radar, CRM, Creative Studio permanecen desacoplados para SOI 2.0).

---

## 2. Inventario de Entregables de la Release

| Documento / Artefacto | Ubicación | Descripción |
|---|---|---|
| **Resolución de Línea Base** | `docs/release-v1/01_PRODUCTION_BASELINE.md` | Dictamen de rama y auditoría taxonómica de los 48 commits intermedios. |
| **Auditoría de Funciones** | `docs/release-v1/02_SECURITY_DEFINER_AUDIT.md` | Clasificación de 127 funciones privilegiadas y mitigación de llamadas anónimas. |
| **Integridad de Mutación** | `docs/release-v1/03_MUTATION_INTEGRITY.md` | Estándar `MutationResult` y corrección de adaptadores críticos. |
| **Checklist Portal Maestros** | `docs/release-v1/04_PORTAL_MAESTROS_RELEASE_CHECK.md` | Congelación y verificación funcional de la experiencia docente. |
| **Procedimiento de Desastres** | `docs/runbooks/RESTORE_SOP.md` | Protocolo estándar de respaldo y restauración ante contingencias. |
| **Contrato de Herencia** | `docs/release-v1/SOI_V2_INHERITANCE_CONTRACT.md` | Reglas vinculantes: MUST PRESERVE, MAY REFACTOR, MUST NOT INHERIT. |
| **Migración de Hardening** | `supabase/migrations/20260910170000_harden_rls_and_security_definer_v1_lts.sql` | Script SQL para cerrar brechas de RLS y permisos en Supabase. |
| **Migración Hermes Brecha B** | `supabase/migrations/20260910180000_hermes_resultados_accion_v1_lts.sql` | Creación de `soi_resultados_accion` para trazabilidad de eventos. |
| **Suite de Pruebas de Seguridad** | `tests/security/rls_hardening_v1_lts.test.js` | Test suite en Vitest validando restricciones de acceso y guards. |

---

## 3. Estado de la Base de Datos Canónica

- **Total Tablas Base:** 216
  - **Tablas Activas:** 118
  - **Tablas con Referencia en Código:** 4
  - **Tablas Vacías Referenciadas:** 74 (Mantenidas intactas para estabilidad de vistas y foreign keys)
  - **Tablas Legacy Confirmadas:** 19 (En proceso de deprecación formal, aisladas)
  - **Total Vistas Activas:** 28
  - **Total Funciones RPC:** 263
  - **Políticas RLS:** 591
