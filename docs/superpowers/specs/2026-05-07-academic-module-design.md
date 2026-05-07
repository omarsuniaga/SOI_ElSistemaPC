# Módulo Académico — Design Spec

> **For agentic workers:** This spec covers the core academic module for the teacher portal PWA. Use `superpowers:writing-plans` to create the implementation plan from this spec.

**Goal:** Enable teachers to record structured observations, evaluate students per indicator, track progress through a route/node tree with semaphore, and view individual student history — all from the attendance view.

**Context:** The system already has routes (2), blocks (3), levels (10), and nodes (160) for violin. Indicators (children of nodes) do not exist yet (0 rows). No evaluations, no planning, no session content recorded yet.

**Tech Stack:** Vanilla JS ES modules, Supabase JS v2 + PostgREST, existing DSL toolbar (`dslToolbar.js`), existing attendance view (`asistenciaView.js`), existing data service (`maestroDataService.js`).

---

## 1. Parser DSL y Modelo de Tokens

### 1.1 Tokens soportados

| Token | Sintaxis | Ejemplo | Resultado |
|-------|----------|---------|-----------|
| Mención | `#nombre` | `#Isabella` | Alumno referenciado |
| Grupo | `#todos` | `#todos` | Todos los presentes |
| Indicador | `[texto]` | `[Agarre del arco]` | Indicador evaluado |
| Nota | `/N` | `/4` | Calificación 1-5 |
| Observación | `(texto)` | `(mejorar presión)` | Nota pedagógica |
| Tarea | `{texto}` | `{practicar 10min}` | Tarea asignada |
| Medida | `$texto` | `$afinación` | Parámetro técnico |

### 1.2 Lógica de resolución

Entrada:
```
#todos [Agarre del arco] /2
#Isabella #Martin /4 (mejor presión) {practicar frente al espejo 10min}
```

Parser produce:
```json
{
  "indicador": "Agarre del arco",
  "evaluaciones": [
    { "alumnos": ["*todos*"], "nota": 2, "observacion": null, "tarea": null },
    { "alumnos": ["Isabella", "Martin"], "nota": 4, "observacion": "mejor presión", "tarea": "practicar frente al espejo 10min" }
  ]
}
```

### 1.3 Reglas de precedencia

- `#todos` establece la nota base para todos los alumnos presentes.
- Menciones específicas (`#Isabella`) SIEMPRE sobreescriben la nota de `#todos`.
- El orden no importa — el parser detecta conflictos y aplica la más específica.
- Si no hay `#todos` y no todos los presentes están mencionados, el validador alerta.

### 1.4 Autocomplete

- `#` → lista de alumnos PRESENTES en la sesión activa (ausentes excluidos).
- `[` → lista de indicadores del nodo activo seleccionado en el árbol.
- Autocomplete filtrado por texto escrito después del token trigger.
- Seleccionar del autocomplete inserta el token completo.

---

## 2. Árbol de Ruta + Semáforo

### 2.1 Componente: Barra de Nodo Activo

Barra colapsable que se muestra encima del editor de observaciones en la vista de asistencia.

**Estado colapsado:** Breadcrumb del nodo activo:
```
Tema activo
Niv1 › Nodo 1 › Agarre del arco                    ▾
```

**Estado expandido:** Árbol completo de la ruta del instrumento de la clase:

```
🎻 Violín — Ruta Integral
├── Nivel 1 — Iniciación Musical                [2/8 completados]
│   ├── Nodo 1 — Escalas
│   │   ├── 🟢 Postura de Pie                   12/12 dominan
│   │   ├── 🟡 Postura Sentado                  9/12 · 3 en proceso
│   │   ├── ⚫ Agarre del arco                  ← Sugerido
│   │   └── ⚫ Pase del arco
│   ├── Nodo 2 — Arpegios y patrones            [0/4 vistos]
│   └── Nodo 3 — Mano izquierda                 [0/4 vistos]
├── 🔒 Nivel 2 — Primeros Intervalos            Bloqueado
└── ...
```

### 2.2 Flujo de usuario

```
MAESTRO                                    SISTEMA
───────                                    ───────
Abre vista Asistencia ──────────────────►  Carga árbol de la ruta del
                                           instrumento de la clase activa

Ve barra colapsada con breadcrumb ◄──────  Muestra último indicador
                                           evaluado o el sugerido

Toca la barra ──────────────────────────►  Expande árbol completo
                                           Nivel → Nodo → Indicadores
                                           con semáforo por cada indicador

Toca un indicador ──────────────────────►  Inserta [indicador] en el editor
(ej: "Agarre del arco")                    + colapsa el árbol automáticamente

Ve etiqueta "Sugerido" ────────────────►   Sistema sugiere el próximo
en indicador gris                          no evaluado, en orden secuencial

Ve 🔒 en Nivel 2 ──────────────────────►  Nivel bloqueado: ≥80% de
                                           indicadores del nivel anterior
                                           deben estar 🟢 para desbloquear
```

### 2.3 Semáforo grupal (por indicador, sobre alumnos de la clase)

| Color | Condición |
|-------|-----------|
| 🟢 Verde | 100% de alumnos con nota ≥ 4/5 |
| 🟡 Amarillo | Al menos 1 alumno evaluado, pero no todos ≥ 4 |
| ⚫ Gris | Ningún alumno evaluado en este indicador |

### 2.4 Datos que consume

- `rutas` → `bloques` → `niveles` → `nodos` → `indicadores` (estructura del árbol)
- `evaluaciones` filtradas por clase activa (para calcular semáforo)
- `inscripciones` de la clase activa (para saber cuántos alumnos hay)

---

## 3. Flujo de Evaluación + Persistencia

### 3.1 Flujo completo

```
MAESTRO                                    SISTEMA
───────                                    ───────
Selecciona indicador del árbol ─────────►  Inserta [indicador] en editor

Escribe observación DSL:
"#todos [Agarre del arco] /2
 #Isabella #Martin /4 (mejor ───────────►  Parser tokeniza en tiempo real,
 presión) {practicar 10min}"               colorea tokens en el editor

Toca "Guardar observación" ─────────────►  Pipeline de procesamiento:

                                           1. PARSEAR
                                           Texto → tokens → estructura JSON

                                           2. RESOLVER
                                           #todos → lista de presentes
                                           Excepciones sobreescriben #todos

                                           3. VALIDAR
◄── "Faltan 2 alumnos sin nota:            Chequea que 100% de presentes
     Pedro, Ana. ¿Asignarles /2?"          tengan evaluación

Confirma / Ajusta ──────────────────────►  4. PERSISTIR
                                           Crea evaluaciones por alumno ×
                                           indicador en tabla evaluaciones

Ve toast "✅ Guardado" ◄────────────────   5. ACTUALIZAR
Semáforo se actualiza en el árbol          Recalcula semáforo del indicador
```

### 3.2 Modelo de datos — Tablas nuevas

#### `indicadores`
```sql
CREATE TABLE indicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nodo_id uuid NOT NULL REFERENCES nodos(id),
  nombre text NOT NULL,
  descripcion text,
  orden smallint NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_indicadores_nodo ON indicadores(nodo_id);
```

#### `evaluaciones`
```sql
CREATE TABLE evaluaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES sesiones(id),
  indicador_id uuid NOT NULL REFERENCES indicadores(id),
  alumno_id uuid NOT NULL REFERENCES alumnos(id),
  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5),
  observacion text,
  tarea text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sesion_id, indicador_id, alumno_id)
);
CREATE INDEX idx_evaluaciones_sesion ON evaluaciones(sesion_id);
CREATE INDEX idx_evaluaciones_indicador ON evaluaciones(indicador_id);
CREATE INDEX idx_evaluaciones_alumno ON evaluaciones(alumno_id);
```

#### `observaciones_sesion`
```sql
CREATE TABLE observaciones_sesion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES sesiones(id),
  maestro_id uuid NOT NULL REFERENCES maestros(id),
  contenido_raw text NOT NULL,
  contenido_parsed jsonb,
  es_borrador boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_obs_sesion ON observaciones_sesion(sesion_id);
```

### 3.3 Relaciones

```
rutas ──1:N──► bloques ──1:N──► niveles ──1:N──► nodos ──1:N──► indicadores
                                                                     │
sesiones ──1:N──► evaluaciones ◄──N:1── alumnos                      │
                      │                                              │
                      └──────────── FK ──────────────────────────────┘

sesiones ──1:N──► observaciones_sesion ──N:1──► maestros
```

### 3.4 Múltiples observaciones por sesión

- El maestro puede guardar varias observaciones por sesión (una por indicador evaluado).
- Cada "Guardar" crea una nueva fila en `observaciones_sesion` + sus evaluaciones.
- El editor se limpia después de guardar, listo para la próxima observación.
- Si evalúa el mismo indicador+alumno dos veces en la misma sesión, la segunda sobreescribe (UPSERT por unique constraint).

---

## 4. Asistente IA

### 4.1 Función 1: Estructurar texto → DSL

```
MAESTRO                                    SISTEMA
───────                                    ───────
Escribe texto desordenado:                 Detecta intención
"isabella y martin bien en agarre,
 4, el resto 2, que practiquen
 espejo"

Toca ✨ "Mejorar con IA" ──────────────►  LLM reformatea → DSL:
                                           "#todos [Agarre del arco] /2
                                            #Isabella #Martin /4
                                            {practicar frente al espejo
                                            10min}"

Ve DSL formateado en editor ◄───────────   Maestro puede editar antes
                                           de guardar
```

**Contexto que recibe la IA:**
- Lista de alumnos presentes (nombres exactos)
- Indicador seleccionado (si hay uno en el árbol)
- Catálogo de indicadores del nodo activo
- Sintaxis DSL válida (tokens permitidos con ejemplos)

### 4.2 Función 2: Validar completitud

```
MAESTRO                                    SISTEMA
───────                                    ───────
Toca "Guardar" ────────────────────────►   Compara mencionados vs presentes

◄── Alerta inline:                         Si faltan alumnos sin nota:
"⚠️ Pedro y Ana no tienen nota.             muestra warning con acción
 ¿Asignar /2 (nota general)?"

[Aceptar] / [Editar] ──────────────────►  Completa evaluaciones o espera
```

### 4.3 Función 3: Sugerencias pedagógicas

```
MAESTRO                                    SISTEMA
───────                                    ───────
Selecciona indicador del árbol ─────────►  IA analiza historial:
                                           - Última evaluación del grupo
                                           - Tendencia (mejorando/bajando)
                                           - Alumnos rezagados

◄── Chip discreto bajo el indicador:      Muestra sugerencia contextual
"💡 3 alumnos bajaron en este
 indicador. Considerar repaso."
```

**No bloquea el flujo.** Es un chip informativo que el maestro puede ignorar.

### 4.4 Función 4: Dictado inteligente

```
MAESTRO                                    SISTEMA
───────                                    ───────
Toca 🎤 (micrófono) ───────────────────►  Activa Web Speech API

Habla: "Isabella y Martin                  Transcribe audio → texto plano
estuvieron bien en agarre del
arco, les pongo cuatro, el                 LLM convierte texto plano →
resto un dos, que practiquen               DSL estructurado
frente al espejo"

Ve DSL en editor ◄──────────────────────  Mismo resultado que Función 1
Puede editar antes de guardar
```

**Transcripción:** Web Speech API (nativo, gratis) como primera opción. Fallback a Whisper API si la calidad no es suficiente.

### 4.5 Prompt de IA — Contexto completo

Para las funciones 1, 3 y 4, el LLM recibe:

```
- Lista de alumnos presentes (nombres)
- Indicador seleccionado actualmente (si hay)
- Catálogo de indicadores del nodo activo
- Historial reciente de evaluaciones del grupo (últimas 3 sesiones)
- Sintaxis DSL válida con ejemplos
```

---

## 5. Perfil del Alumno + Progreso

### 5.1 Puntos de acceso

**Acceso 1 — Desde asistencia:**
Maestro toca el nombre de un alumno en la lista de presentes → se abre panel lateral con su perfil.

**Acceso 2 — Desde métricas:**
Maestro abre vista Métricas → buscador de alumno (autocomplete de alumnos de sus clases) → selecciona → abre perfil completo.

### 5.2 Flujo de usuario

```
MAESTRO                                    SISTEMA
───────                                    ───────
Toca nombre de alumno (asistencia)
  — o —                                    Abre perfil del alumno
Busca alumno en métricas ──────────────►   (panel lateral o vista completa)

Ve header:
┌────────────────────────────────┐         Muestra:
│ 👤 Isabella Rodríguez          │         - Nombre + clase
│ Violín · Nivel 1               │         - Nivel actual en la ruta
│ ████████░░ 65% avance          │         - % avance general
└────────────────────────────────┘

Ve mapa de ruta personal:                  Mismo árbol pero con SUS notas
├── Nodo 1 — Escalas                       individuales y semáforo
│   ├── 🟢 Postura de Pie (5/5)           individual
│   ├── 🟡 Postura Sentado (3/5)
│   ├── 🟡 Agarre del arco (4/5)
│   └── ⚫ Pase del arco

Toca un indicador ──────────────────────►  Expande historial (timeline):

┌────────────────────────────────┐         Timeline de evaluaciones:
│ Agarre del arco                │         nota + fecha + observación +
│ 📅 15/abr — /2 (inicio)       │         tarea asignada
│ 📅 22/abr — /3 (mejora)       │
│ 📅 29/abr — /4 ✨              │
│ Obs: "mejor presión"          │
│ Tarea: "practicar espejo"     │
└────────────────────────────────┘

Ve tareas pendientes:                      Filtra tareas asignadas
┌────────────────────────────────┐         no completadas del alumno
│ 📋 Tareas pendientes (2)       │
│ • practicar espejo 10min       │
│ • repasar escala en casa       │
└────────────────────────────────┘
```

### 5.3 Semáforo individual (por indicador, para UN alumno)

| Color | Condición |
|-------|-----------|
| 🟢 Verde | Última nota ≥ 4/5 |
| 🟡 Amarillo | Última nota 2-3/5 |
| 🔴 Rojo | Última nota 1/5 |
| ⚫ Gris | No evaluado |

### 5.4 Cálculo de % avance

```
avance = (indicadores con última nota ≥ 4) / (total indicadores de la ruta) × 100
```

Solo cuenta indicadores con nota ≥ 4 como "dominados". Los de nota 1-3 no suman al avance.

### 5.5 Datos que consume

- `evaluaciones` filtradas por `alumno_id` (todas las sesiones)
- `indicadores` → `nodos` → `niveles` (estructura de la ruta)
- `observaciones_sesion` (para extraer tareas pendientes)

---

## 6. Auto-draft + Guardado

### 6.1 Auto-draft por inactividad

```
MAESTRO                                    SISTEMA
───────                                    ───────
Escribe en el editor ───────────────────►  Inicia timer de 30 segundos

Sigue escribiendo ──────────────────────►  Resetea timer (debounce)

Para de escribir (30s pasan) ───────────►  Guarda borrador automático:
                                           observaciones_sesion
                                           es_borrador = true

◄── Indicador sutil:                      Muestra timestamp
"💾 Borrador guardado 14:32"

Cierra app por accidente ───────────────►  Borrador persiste en Supabase

Reabre asistencia de la misma sesión ───►  Detecta borrador existente

◄── Modal:                                Muestra opciones
"Tenés un borrador de las 14:32.
 ¿Recuperar?"
 [Recuperar] [Descartar]

[Recuperar] ────────────────────────────►  Carga contenido_raw en editor
[Descartar] ────────────────────────────►  Elimina borrador de DB
```

### 6.2 Guardado explícito

```
MAESTRO                                    SISTEMA
───────                                    ───────
Toca "Guardar observación" ─────────────►  Pipeline completo:
                                           Parse → Resolve → Validate →
                                           Persist

                                           Marca es_borrador = false

                                           Crea evaluaciones por alumno ×
                                           indicador (UPSERT)

◄── Toast:                                Actualiza semáforo del árbol
"✅ Observación guardada.
 12 alumnos evaluados en
 Agarre del arco"

Editor se limpia ◄──────────────────────  Listo para próxima observación
```

### 6.3 Reglas

- Auto-draft: debounce 30s, UPSERT por sesión (un solo borrador activo por sesión).
- Guardado explícito: crea nueva fila con `es_borrador = false` + evaluaciones.
- Múltiples observaciones por sesión permitidas (una por indicador).
- Al reabrir sesión con borrador: modal de recuperación.

---

## 7. Resumen de Componentes Nuevos

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| `dslParser.js` | `src/portal-maestros/services/` | Parsear texto DSL → estructura JSON |
| `routeTreeComponent.js` | `src/portal-maestros/components/` | Árbol colapsable con semáforo |
| `evaluationService.js` | `src/portal-maestros/services/` | Resolver, validar, persistir evaluaciones |
| `studentProfileComponent.js` | `src/portal-maestros/components/` | Panel de perfil del alumno |
| `aiAssistantService.js` | `src/portal-maestros/services/` | Estructurar, validar completitud, sugerir |
| `autoDraftService.js` | `src/portal-maestros/services/` | Auto-guardado por inactividad |

## 8. Tablas Nuevas en Supabase

| Tabla | Descripción |
|-------|-------------|
| `indicadores` | Indicadores hijos de cada nodo (ej: "Agarre del arco") |
| `evaluaciones` | Evaluación por alumno × indicador × sesión (nota 1-5 + obs + tarea) |
| `observaciones_sesion` | Texto DSL raw + parseado por sesión, con flag borrador |

## 9. Flujo General End-to-End

```
Maestro abre Asistencia
    │
    ├── Pasa lista (existente)
    │
    ├── Abre árbol de ruta ──► Ve semáforo por indicador
    │   └── Toca indicador ──► Se inserta [indicador] en editor
    │
    ├── Escribe/Dicta observación en editor DSL
    │   ├── #todos [indicador] /nota
    │   └── #alumno /nota (observación) {tarea}
    │
    ├── (Opcional) Toca ✨ IA ──► Reformatea texto desordenado → DSL
    │
    ├── Auto-draft cada 30s de inactividad
    │
    ├── Toca "Guardar" ──► Parse → Resolve → Validate → Persist
    │   ├── Si faltan alumnos → alerta con opción de completar
    │   └── Evaluaciones creadas + semáforo actualizado
    │
    ├── Repite para otro indicador (múltiples obs por sesión)
    │
    └── Toca nombre de alumno ──► Panel con progreso individual
        ├── Mapa de ruta con SUS notas
        ├── Timeline por indicador
        └── Tareas pendientes
```
