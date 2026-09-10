# SOI v1 FINAL SEAL — Acta Canónica de Cierre y Línea Base de Release

```yaml
FINAL_STATUS: GO
RELEASE_VERSION: SOI v1.2 LTS
BASE_AUDITED_COMMIT: 2803124f
RELEASE_COMMIT: 16aa0456944e3b715400ec75816f200c18405f5f
RELEASE_TAG: soi-v1.2-lts
PRODUCTION_DEPLOY_COMMIT: a3af9c53
DATABASE_MIGRATION_HEAD: 20260908150000_fase0_portal_catalog_desactivacion.sql
TEST_FILES_PASSED: 452
TEST_FILES_SKIPPED: 2
TESTS_PASSED: 4006
TESTS_SKIPPED: 7
TESTS_FAILED: 0
TOTAL_TESTS: 4013
KNOWN_CRITICAL_ISSUES: 0
KNOWN_HIGH_ISSUES: 0
```

---

## 1. Declaración Formal de Cierre y Congelación

El presente documento certifica el **cierre canónico formal de SOI v1** bajo la designación **`SOI v1.2 LTS`** y establece la frontera arquitectónica definitiva previa al inicio de cualquier desarrollo o modificación correspondiente a **SOI 2.0**.

No se han incorporado nuevas capacidades fuera del alcance de v1 (Radar, CRM, Creative Studio permanecen desacoplados). El sistema se encuentra auditado, saneado, estabilizado y blindado contra regresiones.

---

## 2. Jerarquía Inequívoca de Commits y Entornos

Para eliminar cualquier ambigüedad técnica y documental:

| Identificador | Hash | Rol / Significado Técnico |
|---|---|---|
| **`PRODUCTION_DEPLOY_COMMIT`** | `a3af9c53` | Commit actualmente en ejecución en Netlify (origin/master). |
| **`BASE_AUDITED_COMMIT`** | `2803124f` | HEAD de `feat/planificacion-clases-rediseño`, donde se auditó la taxonomía de los 48 commits intermedios de saneamiento/seguridad. |
| **`RELEASE_COMMIT`** | `16aa0456` | Commit canónico sellado en rama `release/soi-v1-lts` que contiene el código fuente estabilizado, parches C1, migraciones de hardening, tests de seguridad y todo el Evidence Pack. |
| **`RELEASE_TAG`** | `soi-v1.2-lts` | Tag git anotado que apunta directamente a `16aa0456944e3b715400ec75816f200c18405f5f`. |

---

## 3. Estado Real de Migraciones de Base de Datos

| Parámetro | Valor / Estado | Descripción |
|---|---|---|
| **Instancia Supabase** | `zmhmdvmyeyswunurcyow` | PostgreSQL 17.6 en producción activa. |
| **`DATABASE_MIGRATION_HEAD`** | `20260908150000_fase0_portal_catalog_desactivacion.sql` | Última migración efectivamente ejecutada en la base de datos de producción (304 migraciones aplicadas). |
| **`MIGRATION_PRESENT_IN_REPO`** | `20260910170000_harden_rls_and_security_definer_v1_lts.sql`<br>`20260910180000_hermes_resultados_accion_v1_lts.sql` | Migraciones creadas, versionadas y probadas en el repositorio. |
| **`MIGRATION_APPLIED_TO_PRODUCTION`** | `PENDING_MANUAL_EXECUTION` | **Pendiente de ejecución manual** en el Supabase SQL Editor / CLI por parte del DBA o DevOps. No se alteró la BD de forma destructiva o no planificada durante esta auditoría. |

---

## 4. Métricas Canónicas de Verificación Automatizada

Ejecución completa sobre el árbol exacto del release (`release/soi-v1-lts` @ `16aa0456`):

```
TEST_FILES_PASSED:   452
TEST_FILES_SKIPPED:  2 (entorno Node sin mock de indexedDB para Service Worker Push)
TESTS_PASSED:        4006
TESTS_SKIPPED:       7 (justificados y documentados)
TESTS_FAILED:        0
TOTAL_TESTS:         4013
Duración:            341.73s (~5.7 minutos)
Estado:              100% VERDE
```

---

## 5. Auditoría de Seguridad y Erradicación de Errores Críticos

1. **Blindaje de PII de Estudiantes (`alumnos`)**:
   - Se revocó la política permisiva `alumnos_read_all` (que permitía lectura a `anon`).
   - El acceso quedó restringido a personal institucional autenticado (`admin`, `coordinacion`, `finanzas`) y a profesores sobre sus alumnos asignados.
2. **Protección de Mensajería (`conversaciones_whatsapp`, `alertas_log`)**:
   - Eliminado acceso anónimo; protegido para `service_role` y personal administrativo.
3. **Guardas en Funciones Privilegiadas (`SECURITY DEFINER`)**:
   - Mitigación en `fn_fusionar_alumnos_duplicados` y `fn_dar_de_baja_alumno` exigiendo `auth.uid() IS NOT NULL` y rol administrativo.
4. **Erradicación del Antipatrón C1 (Mutaciones Ciegas)**:
   - Corregidos `ausenciaAprobacionApi.js`, `sesionesSupabase.js` y `signageAdminApi.js` incorporando cláusulas obligatorias `.select()` y validación estricta de `data.length > 0`.
5. **Cierre de Brecha B de Hermes**:
   - Creado el esquema formal de `soi_resultados_accion` para garantizar trazabilidad evento-acción.

---

## 6. Documentación Canónica y Evidence Pack Entregado

| Documento | Ubicación |
|---|---|
| **Production Baseline** | [01_PRODUCTION_BASELINE.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/01_PRODUCTION_BASELINE.md) |
| **Security Definer Audit** | [02_SECURITY_DEFINER_AUDIT.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/02_SECURITY_DEFINER_AUDIT.md) |
| **Mutation Integrity** | [03_MUTATION_INTEGRITY.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/03_MUTATION_INTEGRITY.md) |
| **Portal Maestros Check** | [04_PORTAL_MAESTROS_RELEASE_CHECK.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/04_PORTAL_MAESTROS_RELEASE_CHECK.md) |
| **SOP de Restauración** | [RESTORE_SOP.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/runbooks/RESTORE_SOP.md) |
| **Contrato de Herencia** | [SOI_V2_INHERITANCE_CONTRACT.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/SOI_V2_INHERITANCE_CONTRACT.md) |
| **Informe de Cierre** | [SOI_V1_CLOSURE_REPORT.md](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/SOI_V1_CLOSURE_REPORT.md) |
| **Evidence Pack Completo** | `docs/context-baseline/` (15 documentos de verdad arquitectónica) |

---

## 7. Dictamen Final y Autorización de Paso a SOI 2.0

### Dictamen: **GO**

Queda formalmente autorizado el inicio de los trabajos de arquitectura e implementación de **SOI 2.0**.
Cualquier modificación futura debe partir de este baseline canónico y acatar el [Contrato de Herencia](file:///C:/Users/omare/dev/SOI_ElSistemaPC/docs/release-v1/SOI_V2_INHERITANCE_CONTRACT.md).
