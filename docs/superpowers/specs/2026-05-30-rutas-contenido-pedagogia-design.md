# Especificación: Rutas de Contenido Pedagógico (SOI)

**Fecha:** 2026-05-30  
**Módulo:** Pedagogía → Planificación  
**Estado:** Aprobado por usuario

---

## 1. Visión General

El módulo de **Rutas de Contenido** estructura la planificación pedagógica en tres capas:

1. **Ruta SOI Estándar** — Definida por admin una sola vez. Secuencia de objetivos + duración por instrumento/nivel.
2. **Ruta Adoptada por Maestro** — El maestro elige qué ruta usar cuando crea su clase. Amarrada a esa clase.
3. **Variantes Propuestas** — Maestros proponen cambios a SOI (copiar + modificar). Admin aprueba light. Reutilizables.

**Problema que resuelve:**
- Maestros sin experiencia: tienen estructura lista (SOI estándar)
- Maestros avanzados: pueden innovar (proponer variantes aprobadas)
- Admin: ve qué proponen y por qué (feedback pedagógico)
- Rastreo pedagógico: cobertura por alumno contra la ruta (quién está donde)

---

## 2. Flujo de Usuario

### 2.1 Admin: Crear Ruta SOI Estándar

**Cuándo:** Inicio del período académico (una sola vez por instrumento/nivel)

**Interfaz:** Modal "Nueva Ruta SOI"

**Campos:**
- Instrumento (dropdown: Guitarra, Piano, Violín, etc.)
- Nivel (dropdown: Nivel 1, Nivel 2, Intermedio, etc.)
- Nombre (text: auto-llena "Guitarra Nivel 1 - SOI Estándar")
- Duración total en semanas (number: 40)
- Secuencia de objetivos (tabla editable)
  - Cada fila: semanas asignadas + descripción objetivo
  - Operaciones: agregar fila, eliminar fila, reordenar

**Salida:** Ruta guardada en BD, estado `activa`. Aparece automáticamente para todos los maestros de ese instrumento/nivel.

---

### 2.2 Maestro: Adoptar Ruta (al crear clase)

**Cuándo:** Maestro hace "Nueva Clase"

**Interfaz:** Selector en modal "Nueva Clase"

**Comportamiento:**
1. Maestro selecciona instrumento + nivel
2. Sistema filtra: "¿Cuál ruta quieres para **Guitarra Nivel 1**?"
3. Opciones:
   - 📌 Guitarra Nivel 1 - SOI Estándar (oficial)
   - ⚡ Guitarra Nivel 1 - Variante Acelerada (aprobada por Juan Pérez)
   - 📚 Guitarra Nivel 1 - Variante + Teoría (aprobada por María García)
4. Maestro selecciona una
5. Clase queda amarrada a esa ruta en BD (`clase.ruta_id`)

**Nota:** Puede cambiar ruta después, pero es un cambio consciente.

---

### 2.3 Maestro: Ver Progreso de la Ruta

**Cuándo:** Abre su clase (view principal)

**Interfaz:** Panel "Progreso de Ruta" en la vista de clase

**Contenido:**
```
┌─ Mini-Resumen ─────────────────────────────┐
│ Semana actual: 5/40  │  Obj. cubiertos: 12/20  │
│ Estado: +2 sem adelanto  │  Rezagados: 3 alumnos │
└─────────────────────────────────────────────┘

┌─ Tabla de Cobertura por Alumno ─────────────┐
│ Alumno  │ Obj1 │ Obj2 │ Obj3 │ Obj4 │ ...   │
├─────────┼──────┼──────┼──────┼──────┤
│ Pedro   │ ✅   │ ✅   │ ⏳   │ ❌   │       │
│ Lucía   │ ✅   │ ✅   │ ✅   │ ✅   │       │
│ Carlos  │ ✅   │ ⏳   │ —    │ —    │       │
└─────────┴──────┴──────┴──────┴──────┘

Leyenda: ✅=Cubierto | ⏳=En proceso | ❌=No alcanzado | —=Pendiente
```

**Funcionamiento:**
- Mini-resumen calcula: semana actual = hoy vs fecha inicio clase
- Tabla muestra: por cada alumno, qué objetivos de la ruta cubrió
- Cada celda actualiza cuando maestro marca plan como "ejecutado"

**Acción pedagógica:** Maestro ve "Pedro le falta Obj3, necesita ayuda" → acción inmediata

---

### 2.4 Maestro: Proponer Variante de Ruta

**Cuándo:** Maestro dice "Mis alumnos aprenden diferente, propongo cambios"

**Interfaz:** Modal "Proponer Variante"

**Flujo:**
1. Maestro selecciona ruta base (ej: "Guitarra Nivel 1 - SOI Estándar")
2. Click "Proponer Variante" → abre modal pre-cargada con esa ruta
3. Maestro modifica:
   - Agregar objetivo
   - Eliminar objetivo
   - Cambiar semanas asignadas
   - Reordenar
4. Campos:
   - Nombre variante (text: "Variante acelerada para grupo avanzado")
   - Razón del cambio (textarea: pedagogía, contexto)
   - Visualización de cambios (read-only diff: qué agregaste/quitaste/moviste)
5. Click "Enviar para aprobación"
6. Variante queda en estado `pendiente`, esperando admin

**Nota:** Mientras está pendiente, maestro sigue usando ruta SOI original. No se bloquea.

---

### 2.5 Admin: Revisar y Aprobar Variantes

**Cuándo:** Admin abre dashboard de variantes propuestas

**Interfaz:** Dashboard "Variantes Propuestas"

**Contenido:**
```
┌─ Variante Acelerada (PENDIENTE) ────────────┐
│ Por: Juan Pérez • 2 días atrás               │
│ Razón: "Mi grupo avanza más rápido"          │
│                                              │
│ Cambios:                                     │
│ → Semana 1-2 → Semana 1 (acelero 1 semana) │
│ + Teoría en Semana 3 (nueva)                │
│ - Arpegios Semana 8 (quitada)               │
│                                              │
│ [Ver detalles] [✓ Aprobar] [✗ Rechazar]     │
└──────────────────────────────────────────────┘
```

**Flujo:**
1. Admin ve lista de variantes pendientes
2. Click en una → ve cambios lado a lado (SOI vs variante)
3. Botones: "Aprobar" o "Rechazar con comentario"
4. Si aprueba: estado → `aprobada`, aparece en selector de maestros
5. Si rechaza: estado → `rechazada`, comentario visible para maestro

**Tiempo:** ~10 segundos por variante (review light, no profundo)

**Impacto:** Admin ve patrones ("muchos aceleran semana 5" → SOI podría necesitar revisión)

---

## 3. Modelos de Datos

### 3.1 Tabla: `rutas_contenido`

```sql
CREATE TABLE rutas_contenido (
  id                UUID PRIMARY KEY,
  instrumento       TEXT NOT NULL,        -- "Guitarra", "Piano"
  nivel             TEXT NOT NULL,        -- "Nivel 1", "Intermedio"
  nombre            TEXT NOT NULL,        -- "SOI Estándar", "Variante Acelerada"
  tipo              TEXT NOT NULL,        -- 'soi-estandar' | 'maestro-variante'
  estado            TEXT NOT NULL,        -- 'activa' | 'pendiente' | 'aprobada' | 'rechazada'
  descripcion       TEXT,                 -- Razón del cambio (si es variante)
  ruta_base_id      UUID REFERENCES rutas_contenido(id),  -- NULL si es SOI, referencia si variante
  duracion_semanas  INT NOT NULL DEFAULT 40,
  creada_por        UUID REFERENCES maestros(id),        -- quien la propuso
  aprobada_por      UUID REFERENCES maestros(id),        -- admin que aprobó
  fecha_aprobacion  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (instrumento, nivel, tipo, estado)
)
```

### 3.2 Tabla: `ruta_contenido_objetivos`

```sql
CREATE TABLE ruta_contenido_objetivos (
  id                    UUID PRIMARY KEY,
  ruta_id               UUID NOT NULL REFERENCES rutas_contenido(id) ON DELETE CASCADE,
  objetivo_id           UUID REFERENCES curriculo_objetivos(id),  -- Link a objetivo existente
  descripcion           TEXT NOT NULL,  -- "Escala Do Mayor en 1 octava"
  semana_inicio         INT NOT NULL,   -- 1
  semana_fin            INT NOT NULL,   -- 2
  orden                 INT NOT NULL,   -- 1, 2, 3... (para ordenar)
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (ruta_id, orden)
)
```

### 3.3 Actualización: Tabla `clases`

```sql
ALTER TABLE clases ADD COLUMN ruta_id UUID REFERENCES rutas_contenido(id);
-- Cada clase está amarrada a una ruta específica
```

### 3.4 Actualización: Tabla `cobertura_alumno_objetivo`

Se reutiliza la existente, pero el sistema la vincula automáticamente contra los objetivos de la ruta de la clase:

```sql
-- Cuando maestro marca plan "ejecutado":
-- 1. Sistema extrae ruta de la clase
-- 2. Analiza plan (contenido DSL)
-- 3. Mapea contra objetivos de esa ruta
-- 4. Sugiere cobertura
-- 5. Maestro confirma
-- 6. Se guarda con referencia a ruta_contenido_objetivos
```

---

## 4. API Endpoints

### 4.1 Rutas (CRUD)

**POST /api/rutas-contenido/crear**
- Body: `{ instrumento, nivel, nombre, duracion_semanas, objetivos: [{descripcion, semana_inicio, semana_fin}, ...] }`
- Respuesta: `{ id, ... }`

**GET /api/rutas-contenido**
- Params: `?instrumento=Guitarra&nivel=Nivel%201&estado=activa`
- Respuesta: lista de rutas

**GET /api/rutas-contenido/:id**
- Respuesta: ruta + lista de objetivos

**PATCH /api/rutas-contenido/:id**
- Body: campos a actualizar
- Respuesta: ruta actualizada

### 4.2 Variantes

**POST /api/rutas-contenido/:id/proponer-variante**
- Body: `{ nombre, descripcion, cambios: { agregados, removidos, movidos } }`
- Respuesta: `{ variante_id, estado: 'pendiente' }`

**GET /api/rutas-contenido/pendientes**
- Admin only
- Respuesta: lista de variantes pendientes

**POST /api/rutas-contenido/:id/aprobar**
- Admin only
- Body: `{ aprobada: true } | { aprobada: false, razon }`
- Respuesta: variante actualizada, estado ahora `aprobada` o `rechazada`

### 4.3 Progreso

**GET /api/clases/:clase_id/progreso-ruta**
- Respuesta: 
  ```json
  {
    "ruta_id": "...",
    "ruta_nombre": "Guitarra Nivel 1 - SOI Estándar",
    "duracion_semanas": 40,
    "semana_actual": 5,
    "objetivos_cubiertos": 12,
    "total_objetivos": 20,
    "alumnos": [
      {
        "alumno_id": "...",
        "nombre": "Pedro",
        "cobertura": [
          { "objetivo_id": "...", "estado": "cubierto" },
          { "objetivo_id": "...", "estado": "en_proceso" },
          ...
        ]
      }
    ]
  }
  ```

---

## 5. Componentes UI (Nuevos)

### 5.1 `rutaSelectorModal.js`
- Modal para seleccionar ruta al crear clase
- Filtra por instrumento/nivel
- Muestra SOI + variantes aprobadas
- Selección → guarda en clase

### 5.2 `rutaCrearModal.js`
- Modal para admin crear ruta SOI
- Tabla editable de objetivos
- Agregar/eliminar/reordenar filas

### 5.3 `rutaProgresoPanel.js`
- Panel en vista de clase
- Mini-resumen (semana actual, objetivos cubiertos, estado)
- Tabla de cobertura por alumno
- Auto-actualiza al marcar planes como ejecutados

### 5.4 `rutaVarianteModal.js`
- Modal para maestro proponer variante
- Pre-carga ruta base
- Modifica (agregar/quitar/mover objetivos)
- Muestra diff visual de cambios
- Botón "Enviar para aprobación"

### 5.5 `rutaVariantesDashboard.js`
- Dashboard para admin
- Lista variantes pendientes
- Muestra cambios lado a lado (SOI vs variante)
- Botones: Aprobar / Rechazar

---

## 6. Flujo de Cobertura (Integration con existente)

### Flujo actual (con rutas):

1. **Maestro crea plan** (ya existe)
2. **Maestro ejecuta clase** → click "Marcar como ejecutado"
3. **Sistema abre coberturaModal** (ya existe)
4. **Cambio:** El modal **ahora mapea contra la ruta de la clase**
   - Extrae `clase.ruta_id`
   - Obtiene objetivos de esa ruta
   - IA analiza plan + DSL contra esos objetivos
   - Sugiere: "Cubriste Obj3, Obj5 de tu ruta"
5. **Maestro confirma**
6. **Cobertura se guarda**
7. **tabla de progreso se actualiza automáticamente**

---

## 7. Estados y Transiciones

### Ruta SOI:
```
[Creada] → [Activa] → [Archivada o Reemplazada]
```

### Variante:
```
[Propuesta] → [Pendiente] → [Aprobada] → [Usada por otros maestros]
                          ↘ [Rechazada] → [Notificación al maestro]
```

### Clase:
```
Antes: Sin ruta específica
Ahora: Al crear clase → selecciona ruta → clase.ruta_id = X
       Luego: puede cambiar ruta (consciente), se actualiza cobertura
```

---

## 8. Consideraciones Técnicas

### 8.1 Performance
- Tabla de cobertura: índices en `(ruta_id, alumno_id)` para queries rápidas
- Cache: rutas activas + variantes aprobadas en memoria (cambian rara vez)
- Lazy load: tabla de cobertura renderiza primero 5 alumnos, scroll carga más

### 8.2 Data Integrity
- Al eliminar una ruta base (SOI), no se pueden crear variantes nuevas
- Variantes aprobadas quedan incluso si la ruta base se archiva
- Al cambiar ruta de una clase, cobertura anterior no se pierde (queda en historial)

### 8.3 IA Integration
- Al sugerir cobertura, IA recibe:
  - Plan contents (tema, objetivos mencionados, DSL)
  - Ruta de la clase (lista de objetivos esperados)
  - Historial de cobertura previa del alumno
- Mejora precisión: "Esta clase cubrió específicamente X de tu ruta"

### 8.4 Admin Review
- Variantes pendientes no bloquean al maestro
- Admin puede aprobar/rechazar en batch si hay muchas
- Rechazar → notificación al maestro con razón

---

## 9. Scope de MVP

**Incluir en primer release:**
- ✅ Crear ruta SOI (admin)
- ✅ Selector de ruta (maestro, al crear clase)
- ✅ Panel de progreso (tabla + mini-resumen)
- ✅ Proponer variante (maestro)
- ✅ Aprobar variante (admin, dashboard)
- ✅ Integración con cobertura existente

**Post-MVP (future):**
- Historial de cambios en rutas
- Comparativas de rendimiento entre variantes
- Sugerencias automáticas de variantes (IA)
- Export de rutas para compartir entre instituciones

---

## 10. Testing Strategy

### Unit:
- Cálculo de semana actual vs duración
- Validación de cambios en variante (no duplicar objetivos, etc.)

### Integration:
- Crear ruta → aparece en selector
- Proponer variante → aparece en dashboard admin
- Aprobar variante → aparece en selector de otros maestros
- Marcar plan como ejecutado → tabla se actualiza

### E2E (Cypress):
- Admin flujo: crear SOI → maestro elige → maestro ejecuta → ve progreso
- Maestro flujo: propone variante → admin aprueba → otro maestro adopta

---

## 11. Wireframe References

Los mockups están en: `.claude/mockups/index.html`

1. Modal Nueva Clase (con selector)
2. Panel Progreso (mini-resumen + tabla)
3. Modal Crear Ruta (admin)
4. Modal Proponer Variante (maestro)
5. Dashboard Variantes (admin)

---

## Aprobación

- **Diseño aprobado por:** usuario (Omar)
- **Fecha:** 2026-05-30
- **Siguiente paso:** Escribir plan de implementación (tasks/orden)
