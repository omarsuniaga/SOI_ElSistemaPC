# Portal Maestros — Spec de Diseño
**Fecha:** 2026-05-04  
**Proyecto:** sistema-academico-pwa  
**Alcance:** Aplicación PWA separada para maestros, mismo repo, segundo entry point Vite

---

## 1. Visión general

El Portal Maestros es una PWA mobile-first independiente que vive en el mismo repositorio del sistema administrativo pero se despliega en una URL separada (`maestros.tudominio.com`). Comparte la base de datos Supabase y el cliente de autenticación, pero tiene su propio entry point, router, estilos y arquitectura optimizada para uso móvil en campo.

**Principio rector:** el tiempo del maestro en el dispositivo debe ser el mínimo posible. Cada flujo se diseña para reducir taps, no para mostrar información.

---

## 2. Arquitectura técnica

### 2.1 Estructura en el repositorio

```
sistema-academico-pwa/
├── index.html                        ← Admin (existente)
├── maestros.html                     ← Entry point portal maestros
├── src/
│   ├── main.js                       ← Admin bootstrap (existente)
│   ├── main-maestros.js              ← Portal bootstrap
│   ├── portal-maestros/
│   │   ├── auth/
│   │   │   ├── maestroAuth.js        ← Login + detección de rol
│   │   │   └── usePortalAuth.js      ← Hook de sesión
│   │   ├── router/
│   │   │   └── portalRouter.js       ← Router liviano (hash-based)
│   │   ├── views/
│   │   │   ├── loginView.js
│   │   │   ├── calendarioView.js     ← Vista principal (Inicio)
│   │   │   ├── hoyView.js            ← Clases del día
│   │   │   ├── asistenciaView.js     ← Flujo toma de asistencia
│   │   │   ├── metricasView.js       ← Dashboard del maestro
│   │   │   └── perfilView.js         ← Config, ausencias, planificación
│   │   ├── components/
│   │   │   ├── AsistenciaLista.js    ← Cola UX de alumnos
│   │   │   ├── DslEditor.js          ← Editor inteligente con highlight
│   │   │   ├── DslToolbar.js         ← Botones #, [], (), {}, $, 🎤, ✨
│   │   │   ├── AlumnoPickerModal.js  ← Multiselect de alumnos
│   │   │   ├── JustificacionModal.js ← Texto + imagen para ausencia J
│   │   │   ├── ClaseEmergente.js     ← Modal clase eventual
│   │   │   ├── AusenciaForm.js       ← Solicitud de ausencia
│   │   │   └── TareasPanel.js        ← Recordatorios con badge
│   │   ├── services/
│   │   │   ├── offlineQueue.js       ← Cola IndexedDB + sync
│   │   │   ├── dslParser.js          ← Parser del DSL pedagógico
│   │   │   ├── groqService.js        ← Cliente GROQ (AI + Whisper)
│   │   │   └── sesionDraft.js        ← Auto-guardado localStorage
│   │   └── styles/
│   │       └── portal.css            ← Estilos mobile-first
│   └── lib/
│       └── supabaseClient.js         ← Compartido (sin modificar)
```

### 2.2 Vite config

```js
// vite.config.js — agregar a la config existente
build: {
  rollupOptions: {
    input: {
      admin:    'index.html',
      maestros: 'maestros.html'
    }
  }
}
```

### 2.3 Offline-first (IndexedDB + sync)

La arquitectura es **offline-first desde el día 1**. IndexedDB es la fuente de verdad local. Supabase es el destino de sincronización.

**Flujo de escritura:**
1. Acción del maestro → guarda en IndexedDB inmediatamente
2. Si hay conexión → sincroniza a Supabase en background
3. Si no hay conexión → queda en cola `sync_queue`
4. Al recuperar conexión → procesa cola en orden FIFO

**Conflict resolution:** `updated_at` más reciente gana. Si hay conflicto detectado, se muestra banner amarillo: *"Esta sesión fue modificada. Tus cambios fueron guardados como revisión."* Se loguea el conflicto en tabla `sync_conflicts`.

**Indicador de estado visible** (siempre en header):
- `✓ Sincronizado` — verde
- `⏳ Pendiente (N)` — amarillo
- `⚠️ Error de sync` — rojo, con botón reintentar

### 2.4 Auth y detección de rol

```
Login (email + password) → Supabase Auth
  → query: SELECT * FROM maestros WHERE user_id = auth.uid()
  → Si existe → Portal Maestros
  → Si no existe → Error: "No tenés acceso de maestro"
```

Sesión almacenada en `localStorage`. Login biométrico (WebAuthn) disponible desde F7 como método opcional después del primer login manual.

---

## 3. Vistas y navegación

### 3.1 Estructura de navegación

```
LOGIN
  └── Bottom Nav (3 tabs):
        ├── 📅 INICIO (Calendario)
        ├── 🏫 HOY
        ├── 📊 MÉTRICAS
        └── ⚙️ [Perfil — ícono arriba derecha, fuera del bottom nav]

  INICIO → [tap en fecha] → Drawer de acciones
                              ├── Ver/editar sesión pasada
                              ├── Pasar asistencia (si es hoy)
                              ├── Clase emergente
                              └── Ver asistencia del día

  HOY → [tap en clase] → ASISTENCIA/SESIÓN
                              ├── Paso 1: Asistencia
                              └── Paso 2: Log de clase (DSL Editor)

  MÉTRICAS → [tap en alumno] → PERFIL DEL ALUMNO (timeline)

  PERFIL/CONFIG:
    ├── Datos personales
    ├── Solicitud de ausencia
    ├── Historial de ausencias
    ├── Planificación curricular
    ├── Notificaciones (config)
    ├── Tareas/Recordatorios (con badge)
    └── Cerrar sesión
```

### 3.2 Vista 1 — Calendario (Inicio)

- Cuadrícula mensual con toggle a lista (solo fechas con clases)
- **Colores de estado por fecha:**
  - 🟢 Verde: sesión registrada (asistencia + contenido guardados)
  - 🟡 Amarillo: clase sin registrar, dentro de la semana actual
  - 🔴 Rojo: clase sin registrar, hace más de 7 días
  - ⚪ Gris: fecha sin clases
- Al tocar fecha → drawer bottom con acciones contextuales según el día (pasado / hoy / futuro)

**Clase Emergente** (modal completo desde el drawer):
- Fecha (pre-cargada con la fecha seleccionada)
- Maestro (heredado del usuario, solo lectura)
- Motivo (por qué se realiza la clase eventual)
- Clase (seleccionar existente o escribir nombre nuevo)
- Contenido (qué se dará)
- Alumnos (multiselect de todos los alumnos del maestro)
- Horario (hora inicio + fin)
- Observaciones (texto libre)
- Botón Guardar → persiste en Supabase, visible en panel admin

### 3.3 Vista 2 — Hoy

- Lista de clases del día actual ordenadas por hora
- Card por clase: nombre, horario, salón, N° alumnos, estado de sesión
- Badge "Sin registrar" en rojo si la sesión del día no existe
- Tap → Vista Asistencia/Sesión

### 3.4 Vista 3 — Asistencia / Sesión de clase

**Header:** Nombre de la clase · Horario · Total alumnos · Botón "Ver planificación"

**Paso 1: Asistencia**

*Controles bulk arriba:*
- `✓ Todos P` — marca todos como presentes
- `✗ Todos A` — marca todos como ausentes
- (Justificado no tiene bulk — es individual por alumno)

*Lista de alumnos (cola UX):*
- Ordenada por instrumento → apellido → nombre (toggle A-Z / Z-A)
- Cada item: Avatar circular con inicial · Nombre completo · Instrumento
- Botones de estado: `P` · `J` · `A`
- Al marcar estado:
  - Fondo del item cambia: 🟢 Verde (P) · 🟣 Violeta (J) · 🔴 Rojo (A)
  - El alumno se mueve al FINAL de la lista (cola)
  - El siguiente alumno sin marcar sube a posición 1
  - El maestro puede marcar desde la misma posición del dedo repetidamente
  - Cuando todos los alumnos hayan sido marcados, la lista queda completa
- Al presionar `J` → Modal Justificación:
  - Campo de texto libre
  - Botón para adjuntar imagen (cámara o galería)
  - Guardar

*Barra de progreso:*
- Aparece solo cuando hay al menos 1 alumno marcado
- Se llena proporcionalmente (N marcados / total)
- Es decorativa — referencia visual rápida

**Paso 2: Log de clase (DSL Editor)**

Ver sección 4 completa.

Botón final: **"Guardar sesión"** → persiste asistencia + log + calificaciones atómicamente.

### 3.5 Vista 4 — Métricas

- **Por clase:** % asistencia en rango configurable, contenido dado por sesión, tiempo promedio por tema/indicador curricular
- **Por alumno:** % P/A/J, historial de menciones DSL, calificaciones, tareas asignadas
- **Alertas automáticas:** alumnos con ≥3 ausencias consecutivas o <70% asistencia (últimas 4 semanas)
- **Perfil de alumno:** timeline cronológico con sesiones, menciones, calificaciones, sugerencias, tareas
- Filtros: rango de fechas, clase, instrumento

### 3.6 Vista 5 — Perfil / Configuración (⚙️)

- **Datos personales:** foto, nombre, teléfono, correo, cambiar contraseña
- **Solicitud de ausencia:**
  - Fecha de ausencia
  - Motivo
  - Contenido de reemplazo (abre planificación para importar tema)
  - Suplencia o dinámica de trabajo
  - Envía a admin → activa protocolo en panel administrativo
  - Notifica al maestro sustituto (si está asignado) con acceso temporal a la clase
- **Historial de ausencias:** lista solo lectura, apertura de cada entrada
- **Planificación curricular:** plantilla profesional (ver sección 6)
- **Notificaciones:** toggles configurables (recordatorio pre-clase, sesión sin registrar, mensajes admin)
- **Tareas/Recordatorios:** lista de `{tareas}` pendientes con badge, agrupadas por alumno
- **Autorización de clases:** si el admin la habilitó, aparece creador de clases completo
- **Cerrar sesión**

---

## 4. Sistema DSL — Editor Inteligente

### 4.1 Tokens del lenguaje

| Token | Sintaxis | Significado | Color |
|---|---|---|---|
| Alumno | `#Pedro` | Mención de alumno (autocompleta) | 🔵 `#3b82f6` |
| Contenido | `[Escala Do Mayor]` | Tema o contenido dado | 🟢 `#10b981` |
| Sugerencia | `(mejorar posición)` | Feedback de mejora | 🟠 `#f59e0b` |
| Tarea | `{estudiar glisandos}` | Tarea asignada al alumno | 🟣 `#8b5cf6` |
| Medida técnica | `$3Octavas` | Término técnico específico | 🩵 `#0ea5e9` |
| Calificación | `4/5` | Nota sobre el contenido | 🔴 `#ef4444` |
| Objetivo curricular | `>DO-2.3` | Vincula con indicador de planificación | ⚪ `#94a3b8` italic |

**Ejemplo de entrada:**
```
#Pedro, #Martín, #Laura [Escala de Do Mayor] 4/5 $3Octavas
(mejorar cambio de posición 1era a 3era) {estudiar glisandos} >VLN-1.4
```

### 4.2 Toolbar de botones

```
[ # ]  [ [] ]  [ () ]  [ {} ]  [ $ ]  [ >_ ]  [ 🎤 ]  [ ✨ ]
```

- **`#`** → abre `AlumnoPickerModal` multiselect → inserta `#Nombre1, #Nombre2`
- **`[]`** → inserta `[█]` (cursor dentro)
- **`()`** → inserta `(█)` (cursor dentro)
- **`{}`** → inserta `{█}` (cursor dentro)
- **`$`** → inserta `$`, activa modo "una palabra" (espacio cierra el token)
- **`>_`** → abre picker de objetivos de planificación → inserta `>CÓDIGO`
- **`🎤`** → graba audio → GROQ Whisper transcribe → GROQ Llama estructura en DSL → modal de revisión
- **`✨`** → toma texto actual → GROQ Llama propone versión DSL estructurada → modal de revisión → maestro acepta o edita

### 4.3 Highlight en tiempo real

El textarea se reemplaza por un `div[contenteditable]` con spans coloreados. El parser corre con debounce de 150ms en cada `input`. La experiencia visual es similar a un editor de código pero para contenido pedagógico.

### 4.4 Parser DSL

```js
// dslParser.js
parseDSL(texto) → {
  alumnos:      ["Pedro", "Martín", "Laura"],  // tokens #
  contenido:    ["Escala de Do Mayor"],         // tokens []
  sugerencias:  ["mejorar cambio de posición"], // tokens ()
  tareas:       ["estudiar glisandos"],         // tokens {}
  medidas:      ["3Octavas"],                   // tokens $
  calificacion: { valor: 4, sobre: 5 },         // patrón N/N
  objetivos:    ["VLN-1.4"]                     // tokens >
}
```

### 4.5 Almacenamiento por alumno

Al guardar la sesión, por cada alumno mencionado (`#`) se crea un registro individual:

```sql
-- sesion_alumno_log
id, sesion_id, alumno_id, contenido[], sugerencias[], 
calificacion, medidas[], objetivo_id, nota_privada, created_at

-- maestro_tareas
id, maestro_id, alumno_id, sesion_id, tarea, 
fecha_recordatorio, completada, created_at
```

Las tareas `{}` generan automáticamente un `maestro_tarea` con `fecha_recordatorio = sesion.fecha + 1 día`.

---

## 5. Sistema de IA con GROQ

### 5.1 Roles de la IA

**Rol 1 — Enriquecedor de texto**
Input: texto libre del maestro.
Output: texto estructurado en DSL.
El maestro siempre revisa y confirma antes de guardar. La IA nunca guarda directamente.

**Rol 2 — Transcripción de voz**
Flujo: Grabar (máx. 60s) → GROQ Whisper transcribe → GROQ Llama estructura en DSL → modal de revisión → maestro confirma.

### 5.2 Prompt base

```
Eres un asistente pedagógico musical especializado.
Recibes el registro de clase de un maestro de música.
Estructura la información usando este DSL:
  #Nombre    = alumno mencionado
  [texto]    = contenido dado en clase
  (texto)    = sugerencia de mejora para el alumno
  {texto}    = tarea asignada
  $término   = medida técnica (una palabra o frase con guion bajo)
  N/5        = calificación
  >CÓDIGO    = objetivo curricular alcanzado

Reglas:
- Agrupa alumnos con el mismo contenido: #Pedro, #Laura [Escala Do]
- Si no hay información de un tipo, omite el token
- Responde ÚNICAMENTE con el texto en DSL, sin explicaciones adicionales

Texto del maestro: "{input}"
```

### 5.3 Configuración GROQ

```js
// groqService.js
const GROQ_CONFIG = {
  baseURL:    'https://api.groq.com/openai/v1',
  model:      'llama3-8b-8192',      // rápido y suficiente para este caso
  whisperModel: 'whisper-large-v3',
  maxTokens:  500,
  temperature: 0.2  // baja para respuestas predecibles
}
```

La API key se almacena en variable de entorno `VITE_GROQ_API_KEY`, nunca en código.

---

## 6. Planificación Curricular

Plantilla profesional con estructura jerárquica:

```
Programa
  └── Nivel (ej: Nivel 1, Nivel 2)
        └── Bloque / Unidad
              └── Objetivo General
                    └── Objetivo Específico
                          └── Indicador (con código: VLN-1.4)
                                ├── Meta (qué debe lograr el alumno)
                                ├── Ponderación (% del bloque)
                                └── Nodo de gamificación
```

El maestro carga su planificación desde la sección de configuración. Al presionar "Ver planificación" en la Vista Asistencia, se abre un drawer con los temas del bloque actual. Al tocar un tema, se importa al editor DSL como token `[Tema] >CÓDIGO`.

---

## 7. Gamificación

Inspirada en Duolingo pero adaptada al contexto pedagógico musical.

- La planificación se visualiza como una **ruta de nodos** (camino visual)
- Cada nodo = un indicador curricular
- Un nodo se marca como **completado** cuando el maestro usa el token `>CÓDIGO` en una sesión y la IA (o el maestro manualmente) lo confirma
- Los nodos pueden estar en estado: `bloqueado` → `disponible` → `en progreso` → `completado`
- El maestro ve su avance porcentual por bloque y por nivel
- El admin ve el avance de todos los maestros en sus respectivas planificaciones

---

## 8. Sistema de notificaciones push

- Service Worker registrado en `maestros.html` entry point
- Push via Web Push API + Supabase Edge Function como emisor
- **Notificaciones configurables por el maestro:**
  - Recordatorio 15/30/60 min antes de cada clase
  - Alerta: sesión sin registrar después de X horas
  - Mensaje directo del admin
  - Tarea vencida sin completar
  - Alumno en situación de riesgo (ausencias)
- Cada tipo tiene toggle ON/OFF en la sección de configuración

---

## 9. Co-docencia

Cuando una clase tiene `maestro_suplente_id`:
- **F5 (lectura):** el auxiliar ve la clase en su portal, puede ver la planificación y el historial
- **F7 (escritura):** el auxiliar puede tomar asistencia; el sistema registra `registrado_por` en cada entrada; si ambos registraron el mismo alumno en la misma sesión, gana el `updated_at` más reciente

---

## 10. Sustitución

Flujo cuando un maestro registra ausencia:
1. Maestro selecciona sustituto de lista de maestros activos
2. Admin recibe notificación y aprueba/rechaza
3. Al aprobar → se crea registro `clase_acceso_temporal` para el sustituto
4. Sustituto ve la clase en su portal con badge "Suplencia"
5. Puede tomar asistencia; queda registrado como autor de esa sesión
6. El acceso temporal expira automáticamente al finalizar el día de la suplencia

---

## 11. Plan de fases de implementación

| Fase | Nombre | Contenido |
|---|---|---|
| **F1** | Fundación offline-first | Vite entry point, `maestros.html`, auth + detección de rol maestro, arquitectura IndexedDB + sync queue, indicador de sync, Vista Hoy (básica), Calendario (estructura + colores de estado) |
| **F2** | Asistencia core | Vista Asistencia completa: cola UX, P/A/J, colores de fondo, barra de progreso, modal justificación (texto + imagen), botones bulk, auto-guardado de borrador, conflict resolution |
| **F3** | Editor DSL | Parser DSL, highlight en tiempo real (contenteditable), toolbar de botones, AlumnoPickerModal, almacenamiento por alumno (`sesion_alumno_log`), calificaciones con rúbricas ponderadas, nota privada por alumno |
| **F4** | IA con GROQ | Enriquecimiento de texto (✨), transcripción de voz (🎤 + Whisper), modal de revisión, sistema de tareas (`maestro_tareas`), TareasPanel con badge |
| **F5** | Calendario completo + clases especiales | Drawer de acciones por fecha, clase emergente (modal completo), editar sesión pasada, co-docencia en lectura |
| **F6** | Perfil + ausencias + sustitución | Datos personales, cambio de contraseña, solicitud de ausencia, selección de sustituto, acceso temporal, historial de ausencias solo lectura |
| **F7** | Métricas + alertas + timeline | Dashboard por clase y alumno, % asistencia en rangos, alertas automáticas de riesgo, timeline cronológico del alumno (con datos DSL), análisis de avance curricular |
| **F8** | PWA completa | Push notifications configurables, biometría WebAuthn, exportación PDF de reportes a Supabase Storage, co-docencia escritura completa |
| **F9** | Planificación + gamificación + banco | Plantilla curricular profesional, ruta de nodos estilo Duolingo, token `>Objetivo`, banco de snippets con `/`, autorización admin para crear clases |

---

## 12. Esquema de base de datos (nuevas tablas)

```sql
-- Sesiones de clase (asistencia + contenido juntos)
sesiones_clase (
  id, clase_id, maestro_id, fecha, hora_inicio, hora_fin,
  contenido_dsl TEXT,        -- texto raw del DSL
  borrador BOOLEAN,          -- true = no finalizado
  created_at, updated_at
)

-- Asistencia individual por sesión
asistencia_sesion (
  id, sesion_id, alumno_id,
  estado ENUM('P','A','J'),
  justificacion TEXT,
  justificacion_imagen_url TEXT,
  registrado_por UUID,       -- para co-docencia
  created_at
)

-- Log parseado por alumno (generado del DSL)
sesion_alumno_log (
  id, sesion_id, alumno_id,
  contenido TEXT[],
  sugerencias TEXT[],
  calificacion NUMERIC,
  medidas TEXT[],
  objetivo_id UUID,
  nota_privada TEXT,
  created_at
)

-- Tareas del maestro hacia alumnos
maestro_tareas (
  id, maestro_id, alumno_id, sesion_id,
  tarea TEXT,
  fecha_recordatorio DATE,
  completada BOOLEAN DEFAULT false,
  created_at
)

-- Clases emergentes
clases_emergentes (
  id, maestro_id, fecha, hora_inicio, hora_fin,
  clase_id UUID NULLABLE,    -- NULL si es clase totalmente nueva
  nombre_clase TEXT,         -- si no hay clase_id
  motivo TEXT,
  contenido TEXT,
  observaciones TEXT,
  created_at
)

-- Solicitudes de ausencia
solicitudes_ausencia (
  id, maestro_id, fecha_ausencia,
  motivo TEXT,
  contenido_reemplazo TEXT,
  suplente_id UUID NULLABLE,
  dinamica_trabajo TEXT,
  estado ENUM('pendiente','aprobada','rechazada'),
  created_at
)

-- Acceso temporal para sustitutos
clase_acceso_temporal (
  id, clase_id, maestro_suplente_id,
  fecha_inicio DATE, fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at
)

-- Planificación curricular
planificacion_nodos (
  id, maestro_id, programa_id,
  codigo TEXT,               -- ej: VLN-1.4
  nombre TEXT,
  descripcion TEXT,
  nivel INTEGER,
  bloque INTEGER,
  ponderacion NUMERIC,
  padre_id UUID NULLABLE,    -- jerarquía
  estado ENUM('bloqueado','disponible','en_progreso','completado'),
  created_at
)

-- Cola de sincronización offline
sync_queue (
  id, tabla TEXT, operacion ENUM('insert','update','delete'),
  payload JSONB,
  intentos INTEGER DEFAULT 0,
  created_at
)
```

---

## 13. Decisiones técnicas

| Decisión | Elección | Razón |
|---|---|---|
| Offline storage | IndexedDB (via `idb` library) | Mejor API que localStorage, soporta objetos complejos |
| Editor DSL | `div[contenteditable]` + spans | Permite highlight sin librerías pesadas |
| IA | GROQ (Llama 3 + Whisper) | Velocidad <1s, Whisper integrado, mismo API key |
| Push notifications | Web Push API + Supabase Edge Function | Sin Firebase, control total |
| Biometría | WebAuthn API nativa | Sin librerías, soporte universal en móviles modernos |
| PDF export | `jsPDF` (ya en el proyecto) | Sin nueva dependencia |
| Voz | MediaRecorder API → GROQ Whisper | Nativo del navegador, sin dependencias |
| Sync conflict | Last `updated_at` wins | Simple, auditable, suficiente para este caso de uso |

---

*Spec aprobado. Próximo paso: plan de implementación por fases comenzando por F1.*
