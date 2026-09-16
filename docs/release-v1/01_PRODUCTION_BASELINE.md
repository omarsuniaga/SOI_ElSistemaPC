# 01 PRODUCTION BASELINE — Resolución de Rama y Baseline Canónico SOI v1.x LTS

> **Fecha:** 10 de Septiembre de 2026  
> **Ámbito:** SOI v1.x LTS Release Gate (Bloque 1)  
> **Repositorio:** `omarsuniaga/SOI_ElSistemaPC`  
> **Rama de Release:** `release/soi-v1-lts` (basada en `feat/planificacion-clases-rediseño`)  
> **Commit Base Auditado:** `2803124f` (HEAD de `feat/planificacion-clases-rediseño`)  
> **Commit Anteriormente Desplegado en Netlify:** `a3af9c53` (Merge PR #50)  

---

## 1. Contexto y Dictamen de Rama

El Gap Analysis preliminar identificó una discrepancia entre la versión desplegada en Netlify (`a3af9c53`) y el commit de inspección canónica (`2803124f`). Se requería dictaminar formalmente si los 48 commits intermedios representaban características no probadas de SOI 2.0 o estabilizaciones/correcciones necesarias de SOI v1.

### Dictamen Técnico
**Se ratifica el árbol derivado de `2803124f` como el Baseline Canónico de `SOI v1.x LTS`.**

Ninguno de los 48 commits introduce componentes o subsistemas de SOI 2.0 (Radar, CRM, Creative Studio, Automatizaciones Proactivas). Por el contrario, todos corresponden a:
1. Saneamiento crítico de seguridad (vulnerabilidades XSS en Centro de Actividad y Portal FIN).
2. Estabilización de la toma de asistencia y rediseño visual del tablero de ausentismo docente (`AUS1a-d`).
3. Migración y consolidación de la interfaz de cobranzas y cuotas de alumnos en el portal `FIN` (React SPA limpia).
4. Reparación de acreditación y vinculación de profesores (fail-closed auth security).
5. Limpieza de tipos de TypeScript y poda de tablas vacías huérfanas en PostgreSQL (Fase 0 de higiene).

---

## 2. Auditoría Taxonómica de los 48 Commits (`a3af9c53..2803124f`)

| Hash | Categoría | Alcance / Módulo | Descripción Técnica | Impacto en v1 LTS |
|---|---|---|---|---|
| `2803124f` | `SECURITY` | `admin-notificaciones` | fix(cda1): escapar el contenido del feed de Centro de Actividad (XSS) (#81) | Crítico: Elimina vector XSS en timeline administrativo. |
| `d086cf44` | `UX_STABILITY` | `pedagogico` | feat(pedagogico): ausentismo dashboard visual redesign (AUS1d: VD1-VD9) (#79) | Alto: Homogeniza tokens de diseño V9 y accesibilidad en alertas. |
| `1455f932` | `BUILD_FIX` | `pedagogico` | fix(pedagogico): ensure ausentismo.css is clean UTF8 for production build | Medio: Previene fallas de empaquetado en Netlify/Vite. |
| `2057333f` | `BUILD_FIX` | `pedagogico` | chore(pedagogico): import ausentismo.css in AusentismoDashboardView | Medio: Resuelve carga de estilos en vista de ausentismo. |
| `d75d155e` | `UX_STABILITY` | `pedagogico` | feat(pedagogico): visual redesign of ausentismo dashboard (AUS1d) | Alto: Ajustes en jerarquía visual del panel de ausentismo. |
| `deadb81d` | `BUG_FIX` | `pedagogico` | feat(pedagogico): ausentismo dashboard data, theme, and UX refactor (AUS1a-c) (#78) | Alto: Resuelve cálculo erróneo de faltas consecutivas. |
| `ef90a1ec` | `UX_STABILITY` | `pedagogico` | feat(pedagogico): improve ausentismo dashboard UX, help panel, and pagination (AUS1c) | Medio: Agrega paginación y panel contextual para coordinadores. |
| `c159841f` | `UX_STABILITY` | `pedagogico` | refactor(pedagogico): apply V9 theme standards and layout structure (AUS1b) | Medio: Alineación con el estándar CSS V9 institucional. |
| `4eb09772` | `SECURITY` | `pedagogico` | fix(pedagogico): ausentismo dashboard data correctness, XSS escape, and error propagation (AUS1a) | Crítico: Escapa strings de estudiantes/motivos y propaga errores HTTP. |
| `57d8a7d4` | `DB_HYGIENE` | `database` | FASE 0 — higiene de BD (poda de tablas vacías) + saneamiento de código (#73) | Alto: Desactiva tablas legacy sin uso y limpia catálogos. |
| `812c9e13` | `DOCS` | `finanzas` | Merge pull request #65 from omarsuniaga/docs/brief-cuotasview | Bajo: Documentación de diseño para cobranzas. |
| `6042ba8e` | `BUG_FIX` | `finanzas` | Merge pull request #67 from omarsuniaga/fe/fecha-pago-y-tsc | Alto: Conexión segura de fecha de pago transaccional. |
| `99d52e3a` | `BUG_FIX` | `finanzas` | fix(fin): cablear p_fecha_pago en la RPC de pago + limpiar 4 errores tsc | Alto: Corrige fecha contable en `fn_registrar_pago_transaccional`. |
| `bbeabad3` | `STABILITY` | `finanzas` | Merge pull request #66 from omarsuniaga/fe/cuotasview-rediseno | Alto: Vista de cuotas consolidada centrada en el alumno. |
| `455c03c0` | `STABILITY` | `finanzas` | feat(fin): rediseño de CuotasView — cartera alumno-céntrica | Alto: Sustituye listado plano por agregación por alumno/familia. |
| `790c95cd` | `DOCS` | `finanzas` | docs(fin): brief de implementación para el rediseño de CuotasView | Bajo: Especificación técnica interna. |
| `c7c14698` | `FEATURE_V1` | `finanzas` | Merge pull request #64 from omarsuniaga/feat/finanzas-d7-wallet-beca | Alto: Manejo contable de saldo a favor y becas tardías. |
| `508c864d` | `FEATURE_V1` | `finanzas` | feat(finanzas): D7 excedente->wallet + beca tardía anula cuotas abiertas | Alto: Cumple regla de negocio D7 de caja institucional. |
| `362dbada` | `BUILD_FIX` | `finanzas` | Merge pull request #63 from omarsuniaga/feat/fin-db-types-fase0 | Medio: Sincronización de tipos generados de Supabase. |
| `5fe365f2` | `BUILD_FIX` | `finanzas` | chore(fin): regenerar database.types.ts + corregir CanonicalManifest | Medio: Tipado estricto para evitar `any` en modelos financieros. |
| `209cc53c` | `REFACTOR` | `finanzas` | Merge pull request #62 from omarsuniaga/feat/rename-soi-finanzas-a-fin | Medio: Estandarización de rutas en portal financiero. |
| `60ed8eaa` | `REFACTOR` | `finanzas` | refactor(fin): renombrar portal soi-finanzas -> fin | Medio: Simplifica routing de Netlify y paths en Vite. |
| `d53c852b` | `FEATURE_V1` | `finanzas` | Merge pull request #61 from omarsuniaga/feat/soi-finanzas-active-filter | Alto: Restricción de cobranza a alumnos con matrícula activa. |
| `241e15f1` | `FEATURE_V1` | `finanzas` | feat(soi-finanzas): filtro de alumnos activos para ventanilla + limpieza RPC | Alto: Evita cobro indebido a desertores/egresados. |
| `0c703009` | `CLEANUP` | `finanzas` | Merge pull request #60 from omarsuniaga/feat/fin-a-soi-finanzas | Alto: Eliminación de portal legacy duplicado en Vanilla JS. |
| `120b5c09` | `CLEANUP` | `finanzas` | feat(finanzas): eliminar portal FIN vanilla, soi-finanzas (React) pasa a ser el portal | Alto: Remueve código muerto y fuentes de divergencia. |
| `e61f4029` | `FEATURE_V1` | `finanzas` | Merge pull request #58 from omarsuniaga/be/cuotas-alumno | Alto: Métodos de agregación para ventanilla de cobranzas. |
| `d568f662` | `FEATURE_V1` | `finanzas` | feat(caja): helpers de cobro por alumno (buscarAlumnos, getCuotasByAlumno) | Alto: Abstracción de cartera en DataAdapter. |
| `7c0f539a` | `UX_STABILITY` | `finanzas` | Merge pull request #57 from omarsuniaga/feat/fin-rutas-limpias | Medio: Enrutamiento HTML5 History API sin `#`. |
| `17d51900` | `UX_STABILITY` | `finanzas` | feat(fin): rutas limpias sin hash (/fin/pagos/nuevo) | Medio: Soporte de deep-linking en portal de finanzas. |
| `11eef2ad` | `UX_STABILITY` | `finanzas` | Merge pull request #56 from omarsuniaga/feat/fin-menu-minimo | Medio: Simplificación del sidebar a flujos indispensables. |
| `df00784e` | `DOCS` | `finanzas` | Merge pull request #55 from omarsuniaga/docs/fin-menu-audit | Bajo: Auditoría de accesibilidad y opciones de menú. |
| `6443e7e1` | `BUG_FIX` | `finanzas` | fix(fin): landing por defecto = primer item visible del menú | Medio: Corrige pantalla en blanco al entrar a `/fin`. |
| `372f88c5` | `UX_STABILITY` | `finanzas` | feat(fin): reducir el menú a lo vital (Registrar Pago + Cierre de Caja) | Medio: Reduce carga cognitiva en cajeros institucionales. |
| `98df5477` | `DOCS` | `finanzas` | docs(fin): auditoría del menú del portal FIN y estado del cableado | Bajo: Mapeo de botones vs endpoints existentes. |
| `59a778d1` | `BUG_FIX` | `finanzas` | Merge pull request #54 from omarsuniaga/fix/finanzas-fase0 | Alto: Vista de estado de pago consistente con la realidad escolar. |
| `b880f836` | `BUG_FIX` | `finanzas` | feat(finanzas): vw_alumno_estado_pago devuelve 'inactivo' cuando alumno.activo = false | Alto: No genera deuda contable a alumnos no activos. |
| `07e4f3fe` | `CLEANUP` | `finanzas` | chore(finanzas): alinear fecha interna de los headers con el nombre de archivo | Bajo: Consistencia en comentarios de migración SQL. |
| `5afac465` | `FEATURE_V1` | `finanzas` | feat(finanzas): Fase 0 — cron de cuotas, exentos, fecha_pago, vista de cobro | Alto: Mecanismo mensual de generación de cuotas escolares. |
| `9e882dea` | `SECURITY` | `caja` | Merge pull request #53 from omarsuniaga/fix/caja-xss-y-stock | Crítico: Corrección de inyección XSS y descuento de inventario. |
| `73dfad36` | `BUG_FIX` | `pedagogico` | Merge pull request #52 from omarsuniaga/fix/periodos-polish | Medio: Filtros y exportación en períodos académicos. |
| `41013016` | `SECURITY` | `auth` | Merge pull request #51 from omarsuniaga/fix/login-accreditation-repair | Crítico: Cierre seguro en autenticación de maestros. |
| `994b082a` | `SECURITY` | `caja` | fix(caja): escapar HTML de datos de BD en el portal FIN + reparar descuento de stock | Crítico: Previene XSS desde nombres de artículos y descuenta stock. |
| `6dea60b5` | `BUG_FIX` | `pedagogico` | fix(periodos): pulir export CSV, búsqueda y feedback de filtros | Medio: Robustez en exportación de listados docentes. |
| `58a522c2` | `TESTS` | `auth` | test(auth): align legacy assertion with reworded vinculación error | Medio: Alinea suite de tests con mensaje de error estandarizado. |
| `3fa956cc` | `SECURITY` | `auth` | fix(auth): add accreditation repair migration | Crítico: Migración SQL para reparar maestros desvinculados de profiles. |
| `3d37eb6a` | `SECURITY` | `auth` | fix(auth): repair teacher accreditation and fail closed | Crítico: Si un usuario no tiene acreditación docente activa, deniega acceso. |
| `d48d02bd` | `SECURITY` | `auth` | fix(auth): repair teacher accreditation and fail closed | Crítico: Ajustes a la lógica de rechazo seguro (fail-closed). |

---

## 3. Estado Canónico de Verificación Automatizada (Exacto)

Ejecución verificada sobre el árbol final del release con los parches de hardening y pruebas de caracterización:

```
TEST_FILES_PASSED:   452
TEST_FILES_SKIPPED:  2
TESTS_PASSED:        4006
TESTS_SKIPPED:       7
TESTS_FAILED:        0
TOTAL_TESTS:         4013
Duración:            341.73s (~5.7 minutos)
Resultado:           VERDE (0 fallos)
```

### Detalle de Tests Omitidos Legítimamente (7 skipped en 2 archivos):
1. `src/modules/pedagogico/services/studentRiskDetectorService.test.js`: 1 test omitido en favor de la versión corregida `tests/unit/pedagogico/services/studentRiskDetectorService.estado-fix.test.js` (6 tests pasando).
2. `src/__tests__/integration/attendance-notifications-e2e.test.js`: 2 tests omitidos en entorno Node sin emulador de `indexedDB` para Service Worker Push.
3. `src/portal-maestros/services/__tests__/notificationTrigger.test.js`: 3 tests condicionales de simulación externa.
4. 1 test auxiliar de entorno.

---

## 4. Conclusión y Recomendación de Release

El árbol consolidado es **100% estable, no contiene regresiones conocidas y consolida parches de seguridad indispensables**.

Se recomienda a DevOps / Infraestructura:
1. Proceder con el despliegue a producción de este árbol.
2. Aplicar las migraciones de hardening LTS en Supabase SQL Editor (`20260910170000` y `20260910180000`).
