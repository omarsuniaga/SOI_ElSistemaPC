# PRESERVE / REFACTOR / REBUILD — Matriz de Decisiones Técnicas

> **Decisiones Permitidas:** `PRESERVE` · `PRESERVE_AND_REFACTOR` · `MIGRATE` · `REBUILD` · `DEPRECATE` · `DELETE_CANDIDATE`

| COMPONENT | CURRENT QUALITY | USER VALUE | DATA VALUE | COUPLING | TESTABILITY | SECURITY | DECISION | RATIONALE |
|---|---|---|---|---|---|---|---|---|
| **Portal Maestros (Shell + Hoy + Asistencia)** | Alta | Muy Alto (Crítico) | Muy Alto | Medio | Alta (tests vitest) | Buena (RLS scoped) | `PRESERVE` | Es el núcleo operacional con mayor adopción del sistema. Funciona diariamente. |
| **Módulo Asistencias (`src/modules/asistencias`)** | Alta | Muy Alto | Muy Alto | Bajo | Alta | Buena | `PRESERVE` | 2.812 registros; DataAdapter sólido; lógica clara. |
| **Módulo Finanzas / Cobro FIFO** | Media | Alto | Alto | Alto (UI React aislada) | Media | Media | `PRESERVE_AND_REFACTOR` | Lógica de base de datos transaccional impecable, pero UI React desconectada del shell general. |
| **Módulo Lutería Taller** | Media | Medio | Bajo (1 orden) | Bajo | Baja | Buena | `PRESERVE_AND_REFACTOR` | Estructura de diagnóstico y órdenes bien diseñada; requiere integración UX y uso real. |
| **Motor Hermes / Event Spine** | Alta | Muy Alto | Muy Alto (2.579 eventos) | Medio | Alta | Alta | `PRESERVE_AND_IMPROVE` | Excelente observabilidad; requiere cerrar la Brecha B (vincular acciones a eventos). |
| **WhatsApp Runner (Baileys Service)** | Alta | Muy Alto | Medio | Bajo (Socket desacoplado) | Media | Alta | `PRESERVE` | Arquitectura aprobada en Judgment Day; sustituye limpiamente soluciones cloud costosas. |
| **Padrón de Alumnos y Fusión** | Alta | Muy Alto | Muy Alto | Medio | Alta | Media (RLS pública) | `PRESERVE_AND_REFACTOR` | Mantener UX y RPC de fusión; cerrar la fuga de lectura anónima en RLS. |
| **Árbol Curricular (Diseñador + 4.163 Indicadores)** | Alta | Muy Alto | Crítico | Bajo | Alta | Alta | `PRESERVE` | El mayor activo pedagógico del proyecto; no alterar su estructura relacional. |
| **Simulador (Sandbox `sim_*`)** | Media | Bajo (Dev only) | Bajo (Ficticio) | Bajo | Baja | N/A | `DEPRECATE` | Mantener aislado como herramienta de pruebas, pero no migrar al core productivo. |
| **Tablas Jerárquicas Legacy (`plan_*`, `clase_mapa_*`)** | Baja | Nulo | Nulo (0 filas) | Alto | Baja | N/A | `DELETE_CANDIDATE` | Marcadas explícitamente como deprecadas en BD 2026-09. Sujetas a confirmación humana. |
