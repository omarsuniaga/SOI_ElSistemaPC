# Diagnóstico: Integración del Spec Ruta Gamificada

**Fecha:** 2026-05-10  
**Status:** ✅ **VIABLE CON CAMBIOS MENORES**

---

## Resumen Ejecutivo

La arquitectura actual **SOPORTA el spec** en un 85%. Los flujos de datos existen, pero faltan algunos campos de tracking y optimizaciones. No hay blockers críticos.

---

## Análisis Detallado

### ✅ QUÉ YA EXISTE (Funcional)

#### 1. **Semáforo por Node + Clase**
- ✅ `rutaService.js`: `loadSemaphoresInBatch(nodeIds, claseId)` carga semáforos
- ✅ `evaluationService.js`: `getSemaphoreForNode(nodoId, claseId)` calcula color
- ✅ Lógica: Cuenta evaluaciones en `indicator_attempts` y calcula 🟢/🟡/⚫
- ✅ Cache en memoria (60s TTL) para performance

**Implicación:** El árbol puede mostrar semáforos sin cambios de BD.

---

#### 2. **Vinculación Observación ↔ Indicador**
- ✅ `evaluationService.saveEvaluaciones()` guarda:
  ```javascript
  {
    session_id: sesionId,
    indicator_id: indicadorId,      // ✅ Vínculo directo
    student_id: e.alumno_id,        // ✅ Quién lo hizo
    nota: e.nota,
    observations: e.observacion,    // ✅ Texto
    tarea: e.tarea,
  }
  ```
- ✅ Tabla: `indicator_attempts` (con índices)

**Implicación:** Cuando un maestro registra observación contra un indicador, ya se guarda todo lo necesario.

---

#### 3. **Resolución Ruta ↔ Clase**
- ✅ `rutaService.resolveRutaIdForClase(claseId)` determina qué ruta va con clase
- ✅ Fuzzy matching en instrumentos
- ✅ Cached

**Implicación:** No hay ambigüedad sobre qué árbol mostrar.

---

#### 4. **Dropdown de Indicadores en Clase**
- ✅ `ContentSelectionPanel.js` ya existe
- ✅ Permite seleccionar indicador antes de registrar obs

**Implicación:** El maestro ya puede "elegir indicador" durante clase.

---

### ⚠️ QUÉ FALTA (Cambios Menores)

#### 1. **Coverage Date (Cuándo se cubrió)**
**Problema:** indicator_attempts NO guarda cuándo se cubrió el nodo.

**Actual:**
```javascript
// indicator_attempts: session_id, indicator_id, student_id, nota, observations, tarea
// Falta: coverage_date, covered_date
```

**Solución:** Agregar campos a tabla `indicator_attempts`:
```sql
-- Migración: agregar a indicator_attempts
ALTER TABLE indicator_attempts ADD COLUMN covered_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE indicator_attempts ADD COLUMN covered_by_clase_id UUID REFERENCES clases(id);

-- Index para queries rápidas
CREATE INDEX idx_indicator_covered_date ON indicator_attempts(indicator_id, covered_date);
```

**Esfuerzo:** 15 minutos (1 migración + 2 índices)

---

#### 2. **Planned Content Tracking**
**Problema:** No hay tabla/campo para "nodos planeados para hoy".

**Actual:** Ningún almacenamiento de "voy a dar estos 3 nodos hoy"

**Solución:** Crear tabla `planned_content`:
```sql
CREATE TABLE planned_content (
  id UUID PRIMARY KEY,
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  clase_id UUID NOT NULL REFERENCES clases(id),
  node_id UUID NOT NULL REFERENCES nodes(id),
  planned_date DATE DEFAULT CURRENT_DATE,
  covered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(maestro_id, clase_id, node_id, planned_date)
);
```

**Esfuerzo:** 20 minutos (1 migración + table definition)

---

#### 3. **Student Avatar List per Node**
**Problema:** No hay query optimizada para "quién trabajó en este nodo".

**Actual:** Hay datos en `indicator_attempts`, pero no hay una view/query que devuelva:
```json
{
  "nodeId": "123",
  "studentsWhoCompleted": [
    { "id": "s1", "nombre": "Juan", "completedDate": "2026-05-10" },
    { "id": "s2", "nombre": "María", "completedDate": "2026-05-10" }
  ]
}
```

**Solución:** Crear una view o query en `rutaGameificadaService.js`:
```sql
-- Query to get students who worked on a node
SELECT DISTINCT
  s.id,
  s.nombre_completo,
  MAX(ia.created_at) as last_attempt_date,
  COUNT(*) as attempt_count
FROM indicator_attempts ia
JOIN indicators i ON ia.indicator_id = i.id
JOIN students s ON ia.student_id = s.id
WHERE i.node_id = $1
  AND ia.created_at >= (SELECT DATE_TRUNC('year', CURRENT_DATE))
GROUP BY s.id, s.nombre_completo
ORDER BY last_attempt_date DESC;
```

**Esfuerzo:** 30 minutos (1 SQL view + wrapper service)

---

#### 4. **Auto-Mark on Observation Save**
**Problema:** Cuando se guarda observación, no hay lógica que marque el nodo como "cubierto".

**Actual:** Se guarda en `indicator_attempts`, pero el UI no sabe que debe animar/marcar como 🟢

**Solución:** En `asistenciaView.js`, después de `saveEvaluaciones`:
```javascript
// Después de guardar observación
await saveEvaluaciones(sesionId, indicadorActivo.id, resolved.evaluaciones)

// NEW: Marcar como cubierto + animación
notifyRutaGameificada({
  action: 'node-covered',
  nodeId: indicadorActivo.node_id,  // Obtener de indicador
  claseId: claseActiva.id,
  studentIds: resolved.evaluaciones.map(e => e.alumno_id),
  coveredDate: new Date(),
})

// Esto dispara:
// 1. Animación confetti en ruta view
// 2. Recalcula semáforo del nodo
// 3. Si 80% completo: anima desbloqueo del siguiente nivel
```

**Esfuerzo:** 45 minutos (lógica + evento emitter + listener)

---

### ❌ Qué NO Existe (Crear desde Cero)

#### 1. **RutaGameificadaView** (Vista Nueva)
- Reemplaza `rutaPlayerView.js`
- Componentes: RutaHeader, BlockSection, LevelGroup, NodeCard, NodeDetailPanel
- Estilos: rutaGameificada.css con animaciones
- Lógica de expand/collapse, selección, detail panel

**Esfuerzo:** 4-5 horas

---

#### 2. **Animaciones Library**
- Confetti particles
- Scale/bounce effects
- Unlock animations
- Progress bar animations

**Esfuerzo:** 2-3 horas (usando CSS + requestAnimationFrame)

---

#### 3. **Event System entre Clase y Ruta**
- Cuando se guarda observación en clase → notifica ruta
- Ruta actualiza árbol en tiempo real
- Muestra animaciones

**Esfuerzo:** 1-2 horas (event emitter simple)

---

## Plan de Implementación

### FASE 1: Base de Datos (30 minutos)

```
✓ Migración 1: Agregar covered_date, covered_by_clase_id a indicator_attempts
✓ Migración 2: Crear tabla planned_content
✓ Índices: Para queries rápidas
```

### FASE 2: Backend Services (90 minutos)

```
✓ rutaGameificadaService.js
  ├── getStudentsPerNode(nodeId) → [ {id, nombre, date} ]
  ├── markNodeAsCovered(nodeId, claseId, studentIds)
  ├── getPlanningContentForClase(claseId)
  └── addPlannedContent(claseId, nodeId)

✓ Modificar evaluationService.js
  └── Agregar hookNotification al guardar evaluaciones

✓ Crear eventEmitter.js
  └── Simplepatrón Observer para Clase ↔ Ruta
```

### FASE 3: Frontend - Ruta (300 minutos / 5 horas)

```
✓ src/portal-maestros/views/rutaGameificadaView.js
  └── Componentes:
      ├── RutaHeader.js
      ├── BlockSection.js
      ├── LevelGroup.js
      ├── NodeCard.js
      ├── StudentAvatars.js
      └── NodeDetailPanel.js

✓ src/portal-maestros/animations/rutaAnimations.js
  ├── cascadeIn()
  ├── markCovered()
  ├── unlockLevel()
  ├── confetti()
  └── levelExpand()

✓ src/portal-maestros/styles/rutaGameificada.css
  ├── Layout vertical mobile
  ├── Colors & semaphore
  ├── Animations & transitions
  └── Responsive

✓ Event listeners para actualización en tiempo real
```

### FASE 4: Frontend - Clase (120 minutos / 2 horas)

```
✓ Modificar asistenciaView.js
  ├── Después de saveEvaluaciones
  ├── Emitir evento: 'node-covered'
  └── Con: nodeId, claseId, studentIds

✓ Modificar ContentSelectionPanel.js (opcional)
  ├── Mostrar indicadores del nodo planeado para hoy
  └── Quick-select si ya está planeado
```

### FASE 5: Testing (120 minutos / 2 horas)

```
✓ Unit tests para servicios
✓ Integration tests para flows (plan → cover → animate)
✓ E2E tests para animaciones
```

---

## Viabilidad Técnica

| Aspecto | Status | Notas |
|--------|--------|-------|
| **Semáforos por node** | ✅ Funciona | Ya existe, usa indicator_attempts |
| **Vinculación obs ↔ indicador** | ✅ Funciona | Ya existe, bien estructurado |
| **Coverage tracking** | ⚠️ Necesita BD | 1 migración simple |
| **Student avatars** | ⚠️ Necesita query | 1 view SQL |
| **Planned content** | ⚠️ Necesita tabla | 1 migración + UI |
| **Animations** | ✅ Factible | CSS + JS estándar |
| **Real-time updates** | ✅ Factible | Simple event emitter |
| **Mobile responsive** | ✅ Factible | Diseño vertical, sin issues |

---

## Riesgos y Mitigaciones

### Riesgo 1: Performance con muchos nodos (50+)
**Mitigación:**
- Lazy load nodosNot expanded initially
- Batch load semáforos (ya hace esto)
- Virtualization si hay scroll infinito

---

### Riesgo 2: Conflictos con rutaPlayerView existente
**Mitigación:**
- Renombrar a rutaGameificadaView
- Mantener rutaPlayerView para rollback si algo falla
- Feature flag para switchear vistas

---

### Riesgo 3: Sincronización Clase ↔ Ruta
**Mitigación:**
- Event emitter simple (no WebSocket aún)
- Si falla: Página se actualiza en manual refresh
- Supabase realtime puede agregarse después

---

## Estimación Total

| Fase | Horas | Descripción |
|------|-------|-------------|
| **DB Migrations** | 0.5 | Cambios simples |
| **Backend Services** | 1.5 | Queries + event emitter |
| **Frontend Ruta** | 5 | Componentes + animaciones |
| **Frontend Clase** | 2 | Integración eventos |
| **Testing** | 2 | Unit + integration + E2E |
| **Buffer (bugs, revisiones)** | 1.5 | 20% contingency |
| **TOTAL** | **12-13 horas** | **1.5 días con TDD** |

---

## Conclusión

✅ **El spec ES VIABLE**. No hay blockers críticos.

**Cambios necesarios:**
1. 2 migraciones BD (covered_date, planned_content table)
2. 3 servicios nuevos (rutaGameificadaService, eventEmitter mods)
3. 7 componentes nuevos (RutaGameificada + 6 sub-componentes)
4. 1 animaciones library
5. Integración con asistenciaView

**Riesgo:** BAJO. La base de datos y servicios ya están bien estructurados.

**Recomendación:** Proceder con implementation plan. Usar TDD. Estimar 12-13 horas totales.

---

**Próximo paso:** ¿Aprobas este diagnóstico? Si sí, genero el plan de implementación con todas las tareas TDD.
