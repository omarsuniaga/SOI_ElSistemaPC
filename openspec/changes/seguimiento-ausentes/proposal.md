# Proposal: Seguimiento de Alumnos Ausentes

## Intent

### Problem Statement

El Departamento Académico de El Sistema Punta Cana (FUNEYCA-PC) carece de un sistema de seguimiento estructurado para alumnos con inasistencias acumuladas. Actualmente:
- No existe mecanismo de escalamiento automático por umbrales de ausencias.
- No se registran contactos con representantes en respuesta a inasistencias.
- No hay control sobre retención de instrumentos como herramienta correctiva ante ausentismo severo.
- El motor de detección de riesgos existente (`studentRiskDetectorService`) contiene un bug que nunca detenta ausencias (filtra por `estado === 'A'` en lugar de `'ausente'`).
- El código de alertas de asistencia (`attendanceAlertsWidget`) está muerto: no montado en ruta alguna e importa funciones inexistentes.

**Impacto:** Alumnos desertan sin intervención institucional preventiva; representantes no se comunican; institucionalidad de seguimiento es inexistente.

### Vision

Implementar un sistema de seguimiento con 3 niveles de escalamiento (Nivel 1: aviso cálido; Nivel 2: comunicación institucional; Nivel 3: retención de instrumento + reacta de compromiso). El sistema registra todos los contactos, mantiene histórico, y habilita a ACM (Academic Coordinator Module) para ejecutar acciones y al ADM para consultar métricas.

## Scope

### In Scope
- **Corrección de bugs:** Reparar `studentRiskDetectorService` (filtro de `estado`); remover código muerto (`attendanceAlertsWidget`).
- **Helper compartido:** `resolverContactoAlumno(alumnoId)` que aplica cascada de teléfonos (representante → madre → padre → familiar de emergencia) con cobertura de 85%+ de alumnos activos.
- **Vista de lectura:** `vw_seguimiento_ausentes` (vista PostgreSQL); lectura de alumnos activos con ausencias acumuladas, nivel de escalamiento, último contacto, instrumento, maestro responsable.
- **Data service:** Adaptador que consume la vista y filtra por periodo activo.
- **Rutas y portales:** Registro en `pedagogico.router.js`; componente de lista/filtros en ACM; vista de consulta (solo lectura) + KPIs en ADM.
- **Acciones de contacto:** Botón WhatsApp con `wa.me` link (manual, NO automático); registro en `comunicaciones_seguimiento` (columnas nuevas: `nivel`, `origen`); estados pendiente/resuelto.
- **Mensajes:** 3 plantillas de comunicación (N1, N2, N3) almacenadas en `documentTemplateService`.
- **Retención de instrumento (Nivel 3):** Nueva tabla `retenciones_instrumento` (keyed por `alumno_id`); acción de coordinador con doble confirmación; mensaje automático al maestro; instrucciones al representante; reincorporación con acta de compromiso (reutilizar `CaseLetterModal`).
- **Período de acumulación:** Usar ventana de `periodo_id` activo; confirmar fuente autoritativa de asistencias (tabla `asistencias` vs. `sesiones_clase.asistencia` JSONB).
- **Historial y KPIs ADM:** Casos cerrados, resolutivos (justificación/reincorporación), tiempo de respuesta de familias, tendencia mensual, alumnos en retención.

### Out of Scope
- Envío automático por HERMES (`notificaciones_asistencia`); disponible a futuro como Phase 5+.
- Completar inventario `instrumentos` (campaña de datos aparte).
- Tardanzas (`estado ≠ 'ausente'`) en escalamiento; regla separada a futuro.
- Portal de representantes / auto-justificación.
- Cambios al flujo de toma de asistencia del maestro.

## Capabilities

### New Capabilities
- `absence-tracking-escalation`: Detección de ausencias acumuladas con 3 niveles de escalamiento (aviso → comunicación → retención).
- `automated-contact-registry`: Registro inmutable de todos los contactos intentados con familias por nivel y fecha.
- `instrument-retention-control`: Retención de instrumentos como medida correctiva ante ausentismo severo (Nivel 3).
- `absence-analytics-dashboard`: Consulta histórica de casos, métricas de respuesta, tendencias mensuales (ADM read-only).

### Modified Capabilities
- `student-risk-detection`: Bug fix en `studentRiskDetectorService` (filtro de estado); reactivar alertas de asistencia.
- `contact-resolution`: Reutilizar `comunicaciones_seguimiento` con columnas `nivel` y `origen` para seguimiento unificado.

## Approach

**Fased 4-phasing (HYBRID) — ~1,400 líneas de código:**

### Fase 0 — Cimientos (LOW RISK — ~120 líneas)
- Reparar `studentRiskDetectorService`: cambiar filtro `estado === 'A' / 'J' / 'T' / 'P'` → `estado === 'ausente'`.
- Crear helper `resolverContactoAlumno(alumnoId)` con cascada de teléfonos (tests incluidos en Vitest).
- Seed `seguimiento_reglas` con tipo `'ausentismo_acumulado'` y config `{periodo, nivel1:1, nivel2:2, nivel3:3, contar_justificadas:false}`.
- **Sin UI.** Verificación: tests de helper; seed confirmado en DB.

### Fase 1 — Vista de Lectura (MEDIUM RISK — ~400 líneas)
- Migración: crear `vw_seguimiento_ausentes` (read model: 1 fila por alumno activo con `n_ausencias`, `ultima_ausencia`, `nivel`, `instrumento`, `maestro`, teléfono resuelto).
- Data service: `seguimiento-ausentes-data.adapter.js` que consume la vista, filtra por `periodo_id` activo, deduce nivel según regla.
- Ruta: registrar en `pedagogico.router.js` como `GET /api/pedagogico/seguimiento-ausentes`.
- Componente ACM: lista con filtros (nivel, maestro, estado de contacto), panel de detalles por alumno, visualización de histórico de contactos.
- Componente ADM: tabla read-only + KPIs (alumnos por nivel, % contactados <72h).
- **Riesgo de línea:** ~400 líneas; candidato a chained PR.

### Fase 2 — Acción de Contacto (MEDIUM RISK — ~200 líneas)
- Botón WhatsApp: genera `wa.me/{telefono}?text={template_N1_o_N2}` (manual; operador revisa + envía desde teléfono).
- Action handler: registra contacto en `comunicaciones_seguimiento` (alumno, nivel, fecha, telefono, canal='whatsapp', resultado='pendiente', notas del operador).
- Estados: pendiente → resuelto (cuando representante justifica o alumno se reincorpora).
- Plantillas N1 & N2 (almacenar en `documentTemplateService`).
- Tests: acción de contacto → inserción en `comunicaciones_seguimiento`; validación de teléfono; deducción de nivel.

### Fase 3 — Retención de Instrumento (MEDIUM RISK — ~300 líneas)
- Migración: tabla `retenciones_instrumento` (alumno_id, motivo='ausentismo_acumulado', fecha_inicio, fecha_fin, estado='activa'/'resuelta', notas).
- Acción Nivel 3: diálogo de doble confirmación (¿está seguro?); solo coordinador (`role='ACM'`); envía mensaje al maestro (`wa.me` con instrucciones); plantilla N3.
- Reincorporación: alumno firma acta de compromiso (reutilizar `CaseLetterModal`); coordinador levanta retención; contador de período reinicia.
- Task/badge en maestro portal: "Instrumento retenido — alumno X" (visible si retención activa).
- Tests: creación de retención → validación de permisos; levantamiento de retención → reseteo de contador.

### Fase 4 — Consulta y KPIs ADM (LOW RISK — ~200 líneas)
- Vistas agregadas: alumnos por nivel (N1, N2, N3), % contactados dentro de 72h, retenciones activas, retenciones resueltas, tendencia mensual, tasa de reincidencia.
- Histórico de casos cerrados: filtro por rango de fechas, exportar a CSV.
- Tablero read-only: sin botones de acción; solo consulta y análisis.
- Tests: querys agregadas; validación de periodos; desglose por maestro.

| Fase | Líneas | Riesgo | Hito |
|------|--------|--------|------|
| 0    | ~120   | LOW    | Cimientos + tests + seed |
| 1    | ~400   | MEDIUM | Vista + data + ACM + ADM read-only |
| 2    | ~200   | MEDIUM | WhatsApp contact + registro |
| 3    | ~300   | MEDIUM | Retención de instrumento + reincorporación |
| 4    | ~200   | LOW    | KPIs + histórico |
| **Total** | **~1,400** | — | — |

**Reutilización:** `seguimiento_reglas` (existente), `comunicaciones_seguimiento` (extender con `nivel`, `origen`), `documentTemplateService` (plantillas), `phoneUtils.buildWhatsAppLink`, módulo `pedagogico`, `CaseLetterModal`, `caseActionsService`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/pedagogico/services/studentRiskDetectorService.js` | Modified | Fix estado filter bug: `'A'/'J'/'T'/'P'` → `'ausente'`. |
| `src/modules/pedagogico/services/seguimiento-ausentes-data.adapter.js` | New | Data service: consume `vw_seguimiento_ausentes`, filtrar por periodo activo, deducir nivel. |
| `src/modules/pedagogico/views/SeguimientoAusentesView.js` | New | Vista ACM: lista de alumnos con filtros, panel de detalles, histórico de contactos. |
| `src/modules/pedagogico/components/SeguimientoAusentesCard.js` | New | Card ADM: KPIs + tabla read-only de alumnos por nivel. |
| `src/modules/admin-dashboard/widgets/AusenciasKPIsWidget.js` | New | Widget ADM: cards de métricas (N1+, % contactados, retenciones). |
| `src/modules/pedagogico/routes/pedagogico.router.js` | Modified | Registrar ruta `GET /api/pedagogico/seguimiento-ausentes`. |
| `src/shared/utils/phoneUtils.js` | Modified | Helper `resolverContactoAlumno(alumnoId)` con cascada de teléfonos (si no existe, crear). |
| `src/modules/config/services/documentTemplateService.js` | Modified | Agregar 3 plantillas: `template_ausentismo_nivel_1`, `_nivel_2`, `_nivel_3`. |
| `supabase/migrations/` | New | Migración: `vw_seguimiento_ausentes` (view), tabla `retenciones_instrumento`, índices. |
| `supabase/migrations/` | Modified | Seed: insertar regla `ausentismo_acumulado` en `seguimiento_reglas`. |
| `supabase/migrations/*comunicaciones_seguimiento*` | Modified | Agregar columnas `nivel` (INT, default NULL) y `origen` (VARCHAR, default 'manual'). |
| `src/modules/pedagogico/actions/ContactoAusentismoAction.js` | New | Action handler: registrar contacto en `comunicaciones_seguimiento`. |
| `src/modules/pedagogico/actions/RetencionInstrumentoAction.js` | New | Action handler: crear retención, enviar mensaje maestro, levantarla. |
| `src/portales/maestros/` | Modified | Task/badge: mostrar si alumno tiene retención activa. |
| `src/modules/admin-dashboard/views/AusentismoDashboardView.js` | New | Dashboard ADM: histórico + exportación CSV. |
| Tests (Vitest) | New | Unit + integration: `phoneUtils.resolverContactoAlumno`, `seguimiento-ausentes-data.adapter`, action handlers, agregaciones. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fuente de asistencias ambigua (tabla `asistencias` vs `sesiones_clase.asistencia` JSONB) | Medium | **Open Question:** Definir en Spec fase cuál es autoritativa. Asumir tabla `asistencias` por ahora; validar en integration test. |
| Período NULL en histórico de `asistencias` (1,922 filas) → deducción incorrecta de nivel | Medium | Migración: asignar `periodo_id` a filas NULL usando fecha de `marked_at` + tabla `periodos`; triggger futuro previene NULL. |
| Teléfono no resuelto para 42/278 alumnos activos (15%) | Low | UI muestra "sin contacto" en lista; acción de contacto deshabilitada; requiere actualización manual de alumno o representante. |
| `comunicaciones_seguimiento` sin TTL → crecimiento ilimitado (~10k/año) | Low | Mantener histórico completo (auditoria); considerar partición por periodo en Spec fase. |
| Retención Nivel 3 ejecutada sin intención (diálogo NO es suficiente) | Low | Doble confirmación UI (modal de "¿está seguro?"); solo role ACM; audit log en `comunicaciones_seguimiento`. |
| Maestro no ve task/badge de retención en tiempo real | Low | Badge hardcoded en vista; refresco manual o polling c/5min; actualizar en Spec si se requiere real-time. |
| Reincorporación manual (acta) NO automatizada → riesgo de olvido | Medium | Acta se genera pero requiere coordinador signature; workflow manual aceptable para MVP; automatización a futuro. |
| Línea count Fase 1 (~400) dispara chained PR requirement | Medium | Implementar como 2 PRs: vista + data (Fase 1a), componentes UI (Fase 1b). |

## Rollback Plan

1. **Fase 0:** Revert migrations (regla `ausentismo_acumulado` deleted); revert code fix en `studentRiskDetectorService`. **Efecto:** alertas se reactivan pero con bug (0 ausencias). Aceptable para MVP rollback.
2. **Fase 1:** Drop view `vw_seguimiento_ausentes`, rutas, componentes. Remover helper `resolverContactoAlumno`. **Efecto:** vista desaparece; ADM pierde KPIs.
3. **Fase 2:** Disable WhatsApp buttons; marcar todos los contactos como `origen='deshabilitado'`. **Efecto:** sin nuevos contactos registrados; histórico persiste.
4. **Fase 3:** Drop tabla `retenciones_instrumento`; remover task/badge maestro. **Efecto:** retenciones activas se pierden; reincorporación manual requiere coordinador follow-up.
5. **Fase 4:** Disable ADM dashboard; queries siguen disponibles vía API pero sin UI. **Efecto:** ADM sigue usando filtros de nivel en vista Fase 1.

## Dependencies

- **Supabase project:** zmhmdvmyeyswunurcyow (tablas existentes: asistencias, alumnos, representantes, seguimiento_reglas, comunicaciones_seguimiento, maestros, clases, periodos).
- **PostgreSQL 15+** (Supabase default; no requisitos de versión especiales).
- **Existentes:** módulo `pedagogico`, `documentTemplateService`, `phoneUtils`, `CaseLetterModal`, `caseActionsService`.
- **Externas:** None (no nuevas librerías requeridas).
- **Período activo debe estar disponible** en contexto de request (`req.periodo` o via data adapter).

## Success Criteria

- [ ] **Fase 0:** Bug en `studentRiskDetectorService` corregido (filtro estado matchea `'ausente'`); helper `resolverContactoAlumno` resuelve teléfono correcto en 85%+ de casos; tests Vitest en verde; seed de regla confirmada en DB.
- [ ] **Fase 1:** View `vw_seguimiento_ausentes` retorna 1 fila/alumno activo con campos correctos (n_ausencias, nivel, etc.); data adapter filtra por periodo activo; lista ACM renderiza + filtros funcionales; panel de detalles muestra histórico; KPIs ADM calculan correctamente.
- [ ] **Fase 2:** Botón WhatsApp genera link correcto (`wa.me/...`); contacto registrado en `comunicaciones_seguimiento` (nivel, fecha, telefono, canal); estado pendiente/resuelto; tests cubre insertion.
- [ ] **Fase 3:** Tabla `retenciones_instrumento` creada; Nivel 3 action crea retención + envía mensaje maestro; diálogo de doble confirmación no bypaseable; task/badge visible en maestro portal; reincorporación con acta levanta retención; contador reinicia.
- [ ] **Fase 4:** Dashboard ADM muestra 5 KPIs (N1/N2/N3, contactados <72h, retenciones); histórico filtrable por fecha; exportación CSV funciona; tablas reflejan datos con <5min de latencia.
- [ ] **Integration test:** End-to-end: alumno con 3+ ausencias → Nivel 3 → acción de contacto → retención → reincorporación. Verificar estado en DB post-cada acción.
- [ ] **Bug-free:** Código muerto `attendanceAlertsWidget` removido; sin console errors en ACM/ADM; permisos RLS respetados (solo ACM puede ejecutar acciones, ADM solo lectura).
- [ ] **SLA de línea:** Fase 1 se implementa en 2 chained PRs si suma ~400 líneas.

## Metrics & Validation

**Cobertura contacto:** % de inasistencias Nivel 1+ contactadas dentro de 72h (meta: 80%).
**Respuesta familia:** % de contactos N1-2 que terminan en justificación o reincorporación (meta: 60%).
**Reincidencia:** % de alumnos que vuelven a Nivel 3 post-reincorporación (meta: <30%).
**Retención promedio:** días desde Nivel 3 hasta reincorporación (meta: <14 días).
**Deserción:** tasa de bajas en alumnos con Nivel 3 vs período anterior (meta: reducción >20%).
