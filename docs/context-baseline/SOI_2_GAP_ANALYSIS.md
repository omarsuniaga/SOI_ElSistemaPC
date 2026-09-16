# SOI 2.0 GAP ANALYSIS — Informe de Brechas y Ruta de Evolución

> **Pregunta Fundamental:** ¿Qué parte del SOI 2.0 realmente hay que construir, qué parte ya existe, y cómo evolucionarla sin destruir datos ni UX útil?
> **Fecha:** 10 sep 2026

## 1. Resumen Cuantitativo del Estado del Sistema

- **Capacidades Analizadas:** 15 capacidades prioritarias del Master SPEC v2.0.
- **Capacidades IMPLEMENTADAS (Existen y operan):** 10 (66,7%)
- **Capacidades PARCIALES (Construidas pero incompletas o desconectadas):** 4 (26,7%)
- **Capacidades NUEVAS (Por construir):** 1 (6,6% - Radar CRM exterior)
- **Decisiones Técnicas:**
  - Preservar intactas (`PRESERVE`): 5 componentes críticos (Portal Maestros, Asistencias, Árbol Curricular, WhatsApp Baileys, Fusión de Duplicados).
  - Preservar con Refactor (`PRESERVE_AND_REFACTOR`): 3 componentes (Finanzas FIFO, Padrón Alumnos con cierre de RLS pública, Lutería Taller).
  - Reconstruir / Modernizar (`REBUILD`): 1 componente (Módulo CRM de oportunidades externas).
  - Deprecar / Candidatos a Poda (`DEPRECATE`): Tablas marcadas `-- DEPRECATED ... 2026-09` (19 tablas) y sandbox simulador.

## 2. Diagnóstico de las Tres Grandes Brechas

### Brecha A: Documentación vs Realidad (Mapa Falso)
- **Hallazgo:** `docs/database_schema.sql` y `ARCHITECTURE.md` describían un sistema de 65 tablas, mientras la base de datos real tiene **216 tablas base**, 2.532 columnas y 591 políticas RLS.
- **Resolución:** Se ha establecido el snapshot canónico `database/schema_reference_2026-09-10.sql` (686 KB) y `DATABASE_TRUTH.md` como la verdad incontrovertible.

### Brecha B: Observabilidad sin Cierre Operativo (El Bucle Abierto)
- **Hallazgo:** Hermes ha detectado 2.579 eventos en `soi_eventos`, pero no existe registro de acciones tomadas ni resolución de compromisos.
- **Resolución:** Implementar en Fase 1 el bucle proactivo cerrado: *Evento -> Caso -> Tarea Departamental -> Notificación WhatsApp -> Evidencia de Cierre*.

### Brecha C: Calidad de Escritura y Seguridad RLS
- **Hallazgo C1:** Mutaciones `.update()/.delete()` en frontend sin `.select()` post-escritura, lo que provoca falsos éxitos en pantalla cuando RLS rechaza la mutación.
- **Fuga de Lectura Pública:** La política `alumnos_read_all` permite SELECT irrestricto a usuarios anónimos en la tabla `alumnos`.
- **Resolución (Fase 0):** Remediar C1 en APIs clave y restringir `alumnos_read_all` a usuarios autenticados con rol legítimo.

## 3. Decisiones Humanas Pendientes (Para Omar / Dirección)

1. **Rama Canónica de Producción:** Confirmar si la rama base es `feat/planificacion-clases-rediseño` (donde apunta `origin/HEAD` y están los últimos commits) o reintegrar con `origin/master`.
2. **Poda Definitiva de Tablas Deprecadas:** Aprobar la eliminación o archivado a esquema histórico de las 19 tablas marcadas con comentario `-- DEPRECATED ... 2026-09` (ej. `plan_clases`, `rachas`, `accesorios`).
3. **Integración del Portal de Audiciones:** Confirmar si la PWA de audiciones se absorbe dentro del portal ACM o permanece como app satélite.
