# 04 PORTAL MAESTROS RELEASE CHECK — Verificación Operativa y Congelación de UX

> **Fecha:** 10 de Septiembre de 2026  
> **Ámbito:** SOI v1.x LTS Stabilization (Bloque 5)  
> **Objetivo:** Auditar y blindar el Portal de Maestros (`src/portal-maestros/`), la interfaz operativa de mayor adopción real del ecosistema (2.812 asistencias registradas, 46 clases activas).

---

## 1. Ergonomía Docente Innegociable

El Portal de Maestros es una PWA móvil y de escritorio con principios de usabilidad orientados a docentes en el aula:
- **Toma de Asistencia en Menos de 30 Segundos**: Clic en la clase $\rightarrow$ grid de alumnos $\rightarrow$ toque en Presente/Ausente/Justificado $\rightarrow$ Guardado inmediato.
- **Acceso Offline / Tolerancia a Conexión Intermitente**: Sincronización local en IndexedDB cuando el docente no dispone de WiFi en el aula.
- **Transparencia en Suplencias**: Un maestro suplente puede marcar asistencia de una clase ajena si está debidamente autorizado, dejando un rastro auditable en `substituteAuditService`.

---

## 2. Checklist de Verificación de Vistas (Release Gates)

| Vista | Ruta | Componentes Clave | Estado en v1 LTS | Dictamen |
|---|---|---|---|---|
| **Hoy / Clases del Día** | `#hoy` | `hoyView.js`, `clasesHoyApi.js` | Muestra tarjetas de clases con horario, aula y estado de asistencia. Cero bloqueos. | ✅ PASS (PRESERVE) |
| **Toma de Asistencia** | `#asistencia` | `asistenciaView.js`, `asistenciasSupabase.js` | Matriz de estados P/A/J con modales de justificación y bitácora pedagógica. Blindado contra mutaciones ciegas. | ✅ PASS (PRESERVE) |
| **Mis Clases** | `#mis-clases` | `clasesView.js`, `claseModal.js` | Acordeón con desglose de alumnos inscritos y horarios asignados. | ✅ PASS (PRESERVE) |
| **Ficha 360 del Alumno** | `#alumno` | `alumnoPerfilView.js`, `fn_alumno_ficha_360` | Lectura de datos médicos, contactos de emergencia y asistencias históricas. | ✅ PASS (PRESERVE) |
| **Solicitud de Permiso** | `#ausencias` | `ausenciaModal.js`, `ausencias_maestros` | Envío de fechas y motivos con verificación de campos obligatorios. | ✅ PASS (PRESERVE) |
| **Diseñador Curricular** | `#planificacion-disenador` | `DisenadorCurricularView.js` | Navegación de unidades, objetivos e indicadores curriculares por cátedra. | ✅ PASS (PRESERVE) |

---

## 3. Pruebas Automatizadas de Caracterización (Maestros)

Se validaron las pruebas unitarias y de integración que resguardan el comportamiento del Portal de Maestros:
- `tests/portal-maestros/asistenciaView.test.js` (8 tests pasando).
- `src/portal-maestros/views/__tests__/asistenciaView.toastReplace.test.js` (4 tests pasando).
- `src/portal-maestros/views/__tests__/asistenciaView.improveText.test.js` (4 tests pasando).
- `src/portal-maestros/services/__tests__/suplenciaService.test.js` (8 tests pasando).
- `src/portal-maestros/services/__tests__/ausenciaValidator.test.js` (6 tests pasando).
- `src/portal-maestros/services/__tests__/pushService.test.js` (11 tests pasando).

**Resultado:** 100% de los tests del Portal de Maestros pasan exitosamente sin fallos ni regresiones de UX.
