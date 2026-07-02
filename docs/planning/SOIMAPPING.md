---
doc_id: PORTAL-016
doc_type: indice
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\planning\SOIMAPPING.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-016
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Mapeo y Amarre de Implementaciones al Sistema Operativo Institucional (SOI)

## Código de Gobernanza: `SOI-BACKBONE-MAPPING-V1`
**Última Actualización:** 2026-06-29
**Responsable:** Arquitectura de Agentes (Antigravity) & Omar Suniaga

---

# 1. Propósito

Este documento establece el **Mapa de Amarres de la Columna Vertebral del SOI**. Su objetivo es garantizar la trazabilidad total entre la gobernanza institucional (procesos, manuales y directrices) y las implementaciones físicas de software (vistas, servicios de base de datos relacional y automatizaciones).

Cualquier agente de IA o desarrollador humano que trabaje en este repositorio **debe** consultar y actualizar este mapa antes de crear nuevas características o alterar el flujo de datos.

---

# 2. Mapa General de Trazabilidad (Código <--> Gobernanza)

| Código de Proceso | Proceso Institucional / Política | Propietario / Coordinador | Archivos Clave del Repositorio | Estado de Amarre Fáctico |
| :--- | :--- | :--- | :--- | :--- |
| **ACM-P02** | Asistencia y Contenido Académico-Musical | Manuel Marcano (ACM) | `src/portal-maestros/components/AsistenciaLista.js`, `src/modules/asistencias/` | **PARCIAL**: Registra asistencia física, pero el amarre del contenido semanal al indicador pedagógico está pendiente en el MVP1 de Ruta Académica. |
| **OPR-P10** | Taller de Lutería y Mantenimiento | Coordinador de Lutería (LUT) | `src/modules/luteria-taller/`, `opencode/luteria-taller` (branch) | **EN REVISIÓN**: Se crearon las tablas de base de datos y mocks. La interfaz del taller está acoplada al correlation_id de Hermes. |
| **ADM-P08** | Gestión de Justificaciones e Inasistencias | Administración (ADM) | `src/modules/asistencias/views/ausenciaModal.js` | **INTEGRADO**: El portal ACM y de Maestros derivan justificaciones a la bandeja de aprobación de ADM. |
| **FIN-P13** | Gestión de Mora y Cobranza | Financiero (FIN) | `src/modules/pedagogico/services/studentRiskDetectorService.js` | **INTEGRADO**: El detector de riesgo evalúa el estado de cuotas de Supabase y emite alertas combinadas. |
| **DIR-P05** | Gestión de Crisis e Incidencias | Dirección General (DIR) | `src/modules/hermes/views/dirDecisionCenterView.js` | **PROPUESTA**: Planificado en ramas para control y auditoría de incidentes graves de alumnos. |
| **AGT-P03** | Fábrica de Procesos e IA (Hermes) | Tecnología (TECNICO) | `src/modules/hermes/api/soiPolicyApi.js`, `hermesConsultaView.js` | **INTEGRADO**: Motor determinístico de Hermes que resuelve consultas sobre políticas y procesos institucionales de manera factual. |

---

# 3. Estado de Ramas y PRs Activos (Auditoría de Integración)

Para evitar colisiones de código y solapamiento entre carriles (`coordination/lanes`), auditamos el estado de las ramas en el repositorio:

### 3.1 Hermes Backbone & Cierre de Casos
*   **Ramas asociadas:** `feat/hermes-soi-contracts` y `feat/hermes-case-closure` (PR #9 y PR #10).
*   **Estado SOI:** **Completado y aplicado a Producción**. Se validó la base de datos de producción real (`fn_hermes_close_process_case` y `fn_hermes_force_close_process_case`) solucionando el error de casteo JSON a Boolean en el Postgres de Supabase.
*   **Acción requerida:** Merge final de estos PRs a `master` para liberar la lane de `backbone-process-contracts`.

### 3.2 Taller de Lutería (Proceso OPR-P10)
*   **Rama asociada:** `opencode/luteria-taller` (PR #11).
*   **Estado SOI:** **En Review**. Define las tablas de lutería, insumos, solicitudes y órdenes de reparación.
*   **Amarre al SOI:** Vincula cada reparación de instrumento a un `correlation_id` del flujo de Hermes. Las tareas de ACM pueden derivar violines o violas dañadas directamente a este flujo, y el sistema bloquea el cierre del caso hasta que Lutería suba el reporte del diagnóstico técnico.

### 3.3 UX/UI Refactor (Fase 2)
*   **Rama asociada:** `chore/maestros-dead-code-cleanup` y branches de refactor CSS.
*   **Estado SOI:** **Planificado en 4 PRs Stacked-to-main**. El objetivo es eliminar deuda técnica en el Portal de Maestros sacando 20+ inyecciones de CSS inline de componentes JS a archivos estáticos `.css`, reemplazar 53 `console.log` por un logger configurable y limpiar el código inactivo de Vue en `progresos/`.

---

# 4. Gaps Operativos (Vacíos de Amarre Detectados)

Como Senior Architect, identifico los siguientes puntos débiles donde el desarrollo de software actual no está alineado con el rigor exigido por los procesos del SOI:

1.  **Firma y Validación de Evidencias (SP-2)**:
    *   *El Gap:* La tabla `indicator_attempts` y `attendance_records` permiten registrar asistencias y marcas de avance sin exigir de forma obligatoria la carga de evidencias en `acm_evidence_files` para nodos críticos (como posturas o afinación).
    *   *La solución propuesta:* Agregar una validación en la API del maestro que impida guardar estados `achieved` (Verde) en indicadores críticos si el campo `evidence_url` está vacío.
2.  **Sincronización Offline de Auditoría (PWA)**:
    *   *El Gap:* El sistema de auditoría de ausencias (`public.attendance_records`) en modo offline no guarda el timestamp real del servidor, lo que puede ser alterado en el cliente para falsificar justificaciones de la política ADM-P08.
    *   *La solución propuesta:* Almacenar un timestamp inmutable en IndexedDB al capturar la firma offline y validar la delta de tiempo al sincronizar.
