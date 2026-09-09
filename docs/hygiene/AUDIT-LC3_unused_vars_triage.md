# AUDIT LC3 — Triage de Variables Asignadas pero Nunca Usadas (`no-unused-vars`)

## Contexto y Diagnóstico
En la auditoría SOI (`audit/soi-lila-2026-09` #3502), se identificó:
> 156 "assigned but never used" en prod (lint fresco). Triage; sospechosos: `adminNotifApi.js:420` `activeMaestrosRes` (query descartada), `alumnosView.js:40` `VALIDATION` (validación nunca aplicada).

Se auditaron detalladamente ambos casos sospechosos en el código fuente de producción:

### Caso 1: `adminNotifApi.js:420` — Query Descartada vs Redundante
- **Hallazgo:** En `fetchAdminFeed()`, la función ejecutaba un `Promise.allSettled` con 6 llamadas concurrentes, incluyendo `_fetchActiveMaestros()`, asignando el resultado a `activeMaestrosRes`. Sin embargo, inmediatamente después, la función ignoraba `activeMaestrosRes` y volvía a ejecutar una llamada síncrona separada `await _fetchActiveMaestros()` con un bloque try/catch.
- **Riesgo:** Doble consulta innecesaria a la base de datos de maestros y desaprovechamiento de la ejecución paralela previa.
- **Corrección:** Se modificó `fetchAdminFeed` para inspeccionar directamente `activeMaestrosRes.value` si su estado es `'fulfilled'`. Si fue rechazada, se ejecuta la llamada de respaldo con manejo de error. Se eliminó la variable huérfana y el doble fetch redundante.

### Caso 2: `alumnosView.js:40` — Constante `VALIDATION` Muerta
- **Hallazgo:** La constante `VALIDATION` definía límites de caracteres (`nombreMax: 100`, `emailMax: 100`, etc.), pero no era leída en ninguna parte de `alumnosView.js`. La validación activa del módulo fue encapsulada previamente dentro de la clase `AlumnoForm.js` (`src/modules/alumnos/components/AlumnoForm.js`), dejando `VALIDATION` y más de 10 funciones/constantes importadas como código muerto.
- **Riesgo:** Confusión para desarrolladores y agentes al buscar dónde se configuran las reglas de negocio de validación de estudiantes.
- **Corrección:** Se removió la constante `VALIDATION` no utilizada y se limpiaron los imports no consumidos (`renderPageHeader`, `renderFilterPanel`, `NIVEL_COLOR`, `NIVEL_LABEL`, `normalizePhone`, `PARENTESCOS`, `calcularEdad`, `isValidEmail`, `getGeneroIcon`, `getEstadoClass`, `getEstadoLabel`, `getInitials`).

---

## Verificación Automatizada
- **Lint:** De 16 advertencias en estos archivos, se redujo a 2 advertencias menores restantes en `alumnosView.js` (`openViewModal` legacy para ficha alternativa y `currentContainer` prefer-const).
- **Tests Alumnos:** 25 archivos de prueba / 139 tests pasados (`npx vitest run src/modules/alumnos/`).
- **Tests Admin Notificaciones:** 2 archivos de prueba / 9 tests pasados (`npx vitest run src/modules/admin-notificaciones/`).
- Total: **148 tests verdes, 0 fallos**.
