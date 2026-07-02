---
doc_id: PORTAL-002
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\PLAN_PLANIFICACION_ACADEMICA.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-002
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# PLAN DE IMPLEMENTACIÓN: Planificación Académica
## Visual Progress Tracker para Indicadores de Contenido

---

## 1. VISIÓN GENERAL

### Problema
Maestros enseñan indicadores/contenidos de su ruta académica semana a semana, pero no tienen forma visual de:
- Saber qué estudiantes han visto qué contenido
- Ver el progreso acumulativo de cada estudiante
- Identificar indicadores completados vs. parciales vs. sin trabajar
- Acceder a observaciones históricas de un indicador

### Solución
Dashboard "semáforo" donde:
- **Verde** = todos los estudiantes han visto el indicador
- **Naranja/Amarillo** = indicador visto parcialmente (algunos estudiantes sí, otros no)
- **Gris/Transparente** = indicador aún no trabajado
- Los cambios persisten semana a semana
- Se pueden ver detalles: quién vio qué, cuándo, con qué calificación

---

## 2. FLUJO DE USUARIO (Situacional)

### Acto 1: Planificación (Sesión con estudiantes)
```
1. Maestro abre "Planificación Académica"
   ↓
2. Ve su ruta de contenido (ej. "Iniciación Violín A")
   └─ Indicadores agrupados por categoría:
      - TÉCNICAS (Postura, Arco, Dedos, Afinación)
      - ESCALAS (Do Mayor, Re Mayor, etc)
      - REPERTORIO (Obras, Estudios)
   ↓
3. Selecciona un indicador (ej. "Técnica-Arco")
   ↓
4. Ve estado actual (ej. Gris = no trabajado, o Verde = completado)
   ↓
5. Hoy trabajó con ese indicador → clickea en el indicador
   ↓
6. Se abre modal: "Registrar Observación para Técnica-Arco"
   ├─ Lista de TODOS los estudiantes (checkboxes)
   ├─ Descripción de la clase (textarea)
   ├─ Calificación del indicador (bien/regular/mal)
   └─ Botón "Guardar Observación"
   ↓
7. Maestro selecciona quiénes trabajaron (ej. 8 de 12 estudiantes)
   ↓
8. Escribe: "Arco más recto, buena presión. Algunos aún necesitan practicar transferencia."
   ↓
9. Selecciona calificación: "Bien" ✓
   ↓
10. Clickea "Guardar"
    ↓
11. Indicador ahora muestra NARANJA (8/12 estudiantes vieron)
    ↓
12. Próxima semana trabajará con más estudiantes
    ↓
13. La semana que viene los 4 restantes ven el mismo indicador
    ↓
14. Nuevamente registra observación (4/4 nuevos)
    ↓
15. Indicador ahora VERDE (12/12 estudiantes vieron)
```

### Acto 2: Revisión de Progreso (Maestro quiere reportes)
```
1. Maestro clickea en indicador NARANJA "Técnica-Arco"
   ↓
2. Se abre panel de detalles:
   ├─ Título: "Técnica-Arco"
   ├─ Progreso: 8/12 (67%)
   ├─ Historial de observaciones (apiladas cronológicamente):
   │  ├─ Semana 1 (03/06):
   │  │  ├─ Estudiantes vieron: Alumno1, Alumno2, ..., Alumno8
   │  │  ├─ Descripción: "Arco más recto, buena presión..."
   │  │  └─ Calificación: Bien ✓
   │  └─ (futuro) Semana 2 (10/06):
   │      └─ Estudiantes vieron: Alumno9, Alumno10, Alumno11, Alumno12
   │
   ├─ Resumen por estudiante:
   │  ├─ ✓ Alumno1 (Bien) — Semana 1
   │  ├─ ✓ Alumno2 (Regular) — Semana 1
   │  ├─ ✓ Alumno3 (Bien) — Semana 1
   │  ...
   │  ├─ ✗ Alumno9 (Sin ver)
   │  ├─ ✗ Alumno10 (Sin ver)
   │  ...
   │
   └─ Botón X para cerrar
```

---

## 3. MODELO DE DATOS

### 3.1 Tablas Nuevas Requeridas

#### Tabla: `indicator_sessions` (Sesiones de Enseñanza de Indicadores)
```sql
CREATE TABLE indicator_sessions (
  id UUID PRIMARY KEY,
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  route_version_id UUID NOT NULL REFERENCES route_versions(id),
  node_id UUID NOT NULL REFERENCES nodes(id),  -- el indicador
  
  -- Metadatos de la observación
  fecha DATE NOT NULL,
  descripcion TEXT,  -- "Arco más recto, buena presión..."
  calificacion ENUM('bien', 'regular', 'mal'),
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_indicator_sessions_maestro_route ON indicator_sessions(maestro_id, route_version_id);
CREATE INDEX idx_indicator_sessions_node ON indicator_sessions(node_id);
CREATE INDEX idx_indicator_sessions_fecha ON indicator_sessions(fecha);
```

#### Tabla: `indicator_session_students` (Estudiantes en cada sesión)
```sql
CREATE TABLE indicator_session_students (
  id UUID PRIMARY KEY,
  indicator_session_id UUID NOT NULL REFERENCES indicator_sessions(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES alumnos(id),
  
  -- Cómo le fue
  nota_cualitativa ENUM('bien', 'regular', 'mal'),
  observaciones_individuales TEXT,  -- "Necesita practicar transferencia"
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_indicator_session_students_session ON indicator_session_students(indicator_session_id);
CREATE INDEX idx_indicator_session_students_alumno ON indicator_session_students(alumno_id);
```

### 3.2 Relaciones con Tablas Existentes

```
maestros (1) ←→ (N) indicator_sessions
route_versions (1) ←→ (N) indicator_sessions
nodes (1) ←→ (N) indicator_sessions  [node = indicador]
alumnos (1) ←→ (N) indicator_session_students
indicator_sessions (1) ←→ (N) indicator_session_students
```

### 3.3 Vista Computada (Próxima optimización)

```sql
-- Vista para calcular estado rápidamente
CREATE VIEW indicator_progress AS
SELECT 
  route_version_id,
  node_id,
  COUNT(DISTINCT CASE WHEN iss.alumno_id IS NOT NULL THEN iss.alumno_id END) as estudiantes_vieron,
  COUNT(DISTINCT alumno_id) FILTER (WHERE alumno_id IN (SELECT id FROM alumnos WHERE clase_id = ...) as estudiantes_totales,
  -- Cálculo de estado
  CASE 
    WHEN estudiantes_vieron = estudiantes_totales THEN 'completo'
    WHEN estudiantes_vieron > 0 AND estudiantes_vieron < estudiantes_totales THEN 'parcial'
    ELSE 'no_iniciado'
  END as estado
FROM indicator_sessions s
LEFT JOIN indicator_session_students iss ON s.id = iss.indicator_session_id
GROUP BY route_version_id, node_id;
```

---

## 4. COMPONENTES DE UI/UX

### 4.1 Vista Principal: Dashboard de Indicadores

```
┌─────────────────────────────────────────────────┐
│ PLANIFICACIÓN ACADÉMICA                         │
├─────────────────────────────────────────────────┤
│ Clase: Iniciación de Violín A                   │
│ Ruta: Iniciación-Violín (v2.1)                 │
│                                                  │
│ [Filtrar por categoría ▼]  [Buscar...] [+]     │
├─────────────────────────────────────────────────┤
│                                                  │
│ TÉCNICAS (4/8 indicadores completados)         │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Postura (Verde)              [→]      │   │
│ │   12/12 estudiantes vieron     Click→   │   │
│ ├──────────────────────────────────────────┤   │
│ │ ◐ Arco (Naranja)               [→]      │   │
│ │   8/12 estudiantes vieron      Click→   │   │
│ ├──────────────────────────────────────────┤   │
│ │ ◐ Dedos (Naranja)              [→]      │   │
│ │   5/12 estudiantes vieron      Click→   │   │
│ ├──────────────────────────────────────────┤   │
│ │ ○ Afinación (Gris)             [→]      │   │
│ │   0/12 estudiantes vieron      Click→   │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ESCALAS (2/6 indicadores completados)          │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Do Mayor (Verde)             [→]      │   │
│ │   12/12 estudiantes vieron     Click→   │   │
│ ├──────────────────────────────────────────┤   │
│ │ ✓ Re Mayor (Verde)             [→]      │   │
│ │   12/12 estudiantes vieron     Click→   │   │
│ ├──────────────────────────────────────────┤   │
│ │ ○ Mi Mayor (Gris)              [→]      │   │
│ │   0/12 estudiantes vieron      Click→   │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Colores:**
- **Verde (✓)**: 100% estudiantes vieron
- **Naranja (◐)**: 1-99% estudiantes vieron
- **Gris (○)**: 0% estudiantes vieron (aún no trabajado)

**Interactions:**
- Click en indicador → abre modal de detalles
- Click [+] → abre modal de "Registrar Observación"
- [Filtrar] → por categoría, estado, búsqueda

---

### 4.2 Modal: Registrar Observación

```
┌─────────────────────────────────────────────────┐
│ Registrar Observación: Técnica-Arco             │ X
├─────────────────────────────────────────────────┤
│                                                  │
│ Selecciona estudiantes que trabajaron:         │
│ ┌─────────────────────────────────────────┐   │
│ │ [✓] Alumno 1 (Violín)                  │   │
│ │ [✓] Alumno 2 (Violín)                  │   │
│ │ [ ] Alumno 3 (Violín)                  │   │
│ │ [✓] Alumno 4 (Violín)                  │   │
│ │ ... (scroll)                            │   │
│ │ [ ] Alumno 12 (Violín)                 │   │
│ └─────────────────────────────────────────┘   │
│ [Seleccionar todos] [Deseleccionar todos]     │
│                                                  │
│ Descripción de la clase:                       │
│ ┌─────────────────────────────────────────┐   │
│ │ Arco más recto, buena presión. Algunos │   │
│ │ aún necesitan practicar transferencia.  │   │
│ └─────────────────────────────────────────┘   │
│                                                  │
│ Calificación del indicador:                    │
│ ( ) Mal   (○) Regular   (●) Bien              │
│                                                  │
│ [Cancelar]  [Guardar Observación]             │
└─────────────────────────────────────────────────┘
```

---

### 4.3 Modal: Detalles del Indicador

```
┌──────────────────────────────────────────────────┐
│ Técnica-Arco — Historial & Progreso             │ X
├──────────────────────────────────────────────────┤
│                                                   │
│ Progreso General:                                │
│ ████████░░  8/12 (67%)   [Naranja = Parcial]   │
│                                                   │
│ Observaciones Históricas (más reciente primero): │
│ ┌──────────────────────────────────────────┐   │
│ │ 📅 Semana 1 (03/06)                      │   │
│ │ ├─ Calificación: ✓ Bien                  │   │
│ │ ├─ Estudiantes (8):                      │   │
│ │ │  • Alumno 1, Alumno 2, Alumno 3, ...  │   │
│ │ └─ Observación:                          │   │
│ │    "Arco más recto, buena presión. Algunos    │
│ │     aún necesitan practicar transferencia."   │
│ └──────────────────────────────────────────┘   │
│                                                   │
│ Resumen por Estudiante:                         │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Alumno 1 (Bien)     — 03/06            │   │
│ │ ✓ Alumno 2 (Regular)  — 03/06            │   │
│ │ ✓ Alumno 3 (Bien)     — 03/06            │   │
│ │ ...                                       │   │
│ │ ✗ Alumno 9 (Sin ver)                    │   │
│ │ ✗ Alumno 10 (Sin ver)                   │   │
│ │ ✗ Alumno 11 (Sin ver)                   │   │
│ │ ✗ Alumno 12 (Sin ver)                   │   │
│ └──────────────────────────────────────────┘   │
│                                                   │
│ [Cerrar]                                        │
└──────────────────────────────────────────────────┘
```

---

## 5. FLUJO DE DATOS Y PERSISTENCIA

### 5.1 Guardar Observación

```
Usuario clicks "Guardar"
    ↓
Validación en cliente:
  - Al menos 1 alumno seleccionado
  - Descripción no vacía (opcional pero recomendada)
  - Calificación seleccionada
    ↓
INSERT INTO indicator_sessions (maestro_id, route_version_id, node_id, fecha, descripcion, calificacion)
    ↓
FOR EACH selected alumno:
    INSERT INTO indicator_session_students (indicator_session_id, alumno_id, nota_cualitativa, observaciones_individuales)
    ↓
Invalidar cache de indicadores
    ↓
Actualizar UI: indicador cambia color (Verde/Naranja/Gris)
    ↓
Mostrar toast: "✓ Observación guardada"
```

### 5.2 Recuperar Estado de Indicador

```
GET /api/v1/planning/indicators?route_version_id=xxx&maestro_id=yyy

Respuesta:
{
  "indicators": [
    {
      "node_id": "abc123",
      "nombre": "Técnica-Arco",
      "categoría": "TÉCNICAS",
      "estado": "parcial",
      "estudiantes_vieron": 8,
      "estudiantes_totales": 12,
      "progreso_porcentaje": 67,
      "color": "warning",  // o "success" o "secondary"
      "ultima_observacion": "2026-06-03",
      "observaciones_count": 1
    },
    ...
  ]
}
```

### 5.3 Recuperar Detalles de Indicador

```
GET /api/v1/planning/indicators/{node_id}/history?route_version_id=xxx&maestro_id=yyy

Respuesta:
{
  "node_id": "abc123",
  "nombre": "Técnica-Arco",
  "estado": "parcial",
  "estudiantes_vieron": 8,
  "estudiantes_totales": 12,
  "observaciones": [
    {
      "session_id": "sess1",
      "fecha": "2026-06-03",
      "calificacion": "bien",
      "descripcion": "Arco más recto, buena presión...",
      "estudiantes": [
        { "alumno_id": "a1", "nombre": "Alumno 1", "nota": "bien" },
        { "alumno_id": "a2", "nombre": "Alumno 2", "nota": "regular" },
        ...
      ]
    }
  ],
  "resumen_estudiantes": [
    { "alumno_id": "a1", "nombre": "Alumno 1", "vio": true, "calificacion": "bien", "fecha": "2026-06-03" },
    { "alumno_id": "a2", "nombre": "Alumno 2", "vio": true, "calificacion": "regular", "fecha": "2026-06-03" },
    ...
    { "alumno_id": "a9", "nombre": "Alumno 9", "vio": false, "calificacion": null, "fecha": null }
  ]
}
```

---

## 6. ESTADO VISUAL: LÓGICA DE COLORES

```javascript
function getIndicatorStatus(estudiantes_vieron, estudiantes_totales) {
  if (estudiantes_vieron === 0) {
    return {
      estado: "no_iniciado",
      color: "gray-400",
      fondo: "transparent",
      icono: "○",
      label: "No trabajado"
    };
  }
  
  if (estudiantes_vieron === estudiantes_totales) {
    return {
      estado: "completado",
      color: "green-500",
      fondo: "green-50",
      icono: "✓",
      label: "Completado"
    };
  }
  
  // 1% a 99%
  return {
    estado: "parcial",
    color: "amber-500",
    fondo: "amber-50",
    icono: "◐",
    label: `Parcial (${Math.round(estudiantes_vieron/estudiantes_totales * 100)}%)`
  };
}
```

---

## 7. FUNCIONALIDADES ADICIONALES (Futuro)

- [ ] Exportar indicadores a PDF (progress report)
- [ ] Gráficos de evolución por indicador a lo largo del tiempo
- [ ] Predicción de cuándo se completarán todos los indicadores
- [ ] Bulk actions: marcar varios indicadores como trabajados
- [ ] Histórico comparativo: "Este indicador se completó en 2 semanas, el anterior en 3"
- [ ] Notificaciones: "Técnica-X está 50% completada, considera trabajar con los restantes"
- [ ] Integración con evaluaciones: auto-llenar notas de Técnica-X basado en observaciones

---

## 8. IMPLEMENTACIÓN: ORDEN DE PRIORIDAD

### Fase 1: MVP (2-3 semanas)
1. ✅ Crear tablas `indicator_sessions` + `indicator_session_students`
2. ✅ API: GET /indicators (list con estado)
3. ✅ API: POST /indicators/{id}/session (guardar observación)
4. ✅ Componente: Dashboard de indicadores (grid con colores)
5. ✅ Modal: Registrar Observación
6. ✅ Modal: Ver Detalles (historial apilado)
7. ✅ Persistencia: guardado en Supabase
8. ✅ Invalidación de cache

### Fase 2: Polish (1-2 semanas)
- Búsqueda/filtrado en dashboard
- Ordenamiento por estado/fecha
- Mejoras visuales (animaciones, responsive mobile)
- Accesibilidad (A11y)

### Fase 3: Avanzado (Futuro)
- Reportes/PDF
- Gráficas
- Notificaciones
- Integraciones

---

## 9. ARCHIVOS A CREAR/MODIFICAR

### Backend (APIs):
- `src/modules/planning/` (nuevo)
  - `services/planningService.js` — lógica de observaciones
  - `api/planningApi.js` — endpoints GET/POST
  - `domain/IndicatorSession.js` — modelo de datos

### Frontend (UI):
- `src/portal-maestros/views/planningView.js` (nuevo)
- `src/portal-maestros/components/IndicatorGrid.js` (nuevo)
- `src/portal-maestros/components/IndicatorModal.js` (nuevo)
- `src/portal-maestros/components/IndicatorDetailsModal.js` (nuevo)
- `src/portal-maestros/styles/planning.css` (nuevo)

### Database:
- `migrations/0015_indicator_sessions.sql` (nueva tabla)
- `migrations/0016_indicator_session_students.sql` (nueva tabla)

---

## 10. VALIDACIONES Y RESTRICCIONES

✅ **Validación de Permisos:**
- Solo maestro puede registrar observaciones de su ruta
- No puede cambiar observaciones de otros maestros (solo crear nuevas)

✅ **Validación de Datos:**
- Al menos 1 alumno seleccionado
- Fecha no puede ser futura
- Node_id debe pertenecer a la ruta_version del maestro

✅ **Restricciones de Negocio:**
- Una semana = un rango de fechas (flexible)
- Cada alumno puede estar en multiple indicadores
- Un indicador puede tener N observaciones (histórico acumulativo)

---

## RESUMEN DE REQUISITOS

| Aspecto | Requerimiento |
|---------|---------------|
| **Persistencia** | Cambios guardados en Supabase |
| **Historial** | Todas las observaciones se apilan (no se sobrescriben) |
| **Visualización** | Semáforo: Verde/Naranja/Gris según % estudiantes |
| **Detalles** | Modal con historial cronológico + resumen por estudiante |
| **Multi-semana** | Maestro puede trabajar diferentes indicadores cada semana |
| **Acumulativo** | Progreso de cada estudiante se mantiene |
| **Observaciones** | Descripción + calificación + lista de alumnos |
| **Acceso** | Ver detalles de quién vio qué, cuándo, cómo |

