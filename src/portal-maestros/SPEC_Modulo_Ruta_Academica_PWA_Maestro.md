# SPEC TÉCNICA Y FUNCIONAL
# Módulo de Ruta Académica por Nodos para la PWA del Maestro

**Proyecto:** PWA del Maestro — Registro de Asistencias, Observaciones y Planificación Académica  
**Módulo:** Ruta Académica por Nodos  
**Instrumento inicial:** Violín  
**Versión:** 1.0.0  
**Estado:** Especificación inicial para desarrollo  
**Fecha:** 2026-05-05  

---

## 1. Propósito del documento

Este documento define la especificación funcional, técnica y de arquitectura para implementar el **Módulo de Ruta Académica por Nodos** dentro de la PWA del Maestro.

La PWA ya está orientada al **registro de asistencias y observaciones de clases**. Este módulo amplía esa funcionalidad para que el maestro pueda:

1. Consultar una ruta académica oficial.
2. Crear o adaptar una planificación académica para un alumno o grupo.
3. Seleccionar la clase que impartirá.
4. Generar un evento de clase a partir de la planificación.
5. Traspasar automáticamente el contenido planificado al contenido real del día.
6. Registrar asistencia.
7. Evaluar nodos e indicadores.
8. Marcar cada evaluación como:
   - `approved` / aprobado
   - `failed` / reprobado
   - `in_process` / en proceso
9. Guardar observaciones, tareas y evidencias.
10. Actualizar el progreso académico del alumno en Supabase.
11. Permitir al área académica visualizar qué está trabajando cada maestro.

La regla central del módulo es:

> **El maestro decide. El sistema guía. El alumno avanza por dominio, no por tiempo.**

---

## 2. Contexto pedagógico del módulo

La ruta académica se basa en una estructura de formación por competencias, inspirada en un modelo tipo “juego” o “Duolingo académico”, pero con rigor de conservatorio.

La estructura general es:

```txt
Ruta
└── Bloques
    └── Niveles
        └── Nodos
            └── Indicadores
                └── Intentos / Evaluaciones
```

Para violín, la ruta inicial se proyecta a 40 niveles, pero el MVP debe comenzar con:

```txt
1 ruta oficial
10 niveles iniciales
8 nodos por nivel
3 a 5 indicadores por nodo
```

Los 8 nodos oficiales por nivel son:

1. Escalas
2. Arpegios y patrones
3. Mano izquierda
4. Arco
5. Sonido
6. Afinación
7. Estudios técnicos
8. Repertorio / fragmentos

Los nodos **Sonido** y **Afinación** son críticos. Si alguno de estos está reprobado, el alumno no puede avanzar de nivel.

---

## 3. Principios de arquitectura

### 3.1. Separación entre plantilla y progreso

El sistema debe separar claramente:

```txt
Ruta oficial / plantilla institucional
≠
Progreso individual del alumno
```

La ruta oficial define niveles, nodos e indicadores.

El progreso del alumno registra qué nodos ha trabajado, qué intentos ha realizado, qué decisiones tomó el maestro y qué evidencia existe.

Esta separación evita que cambios futuros en la ruta oficial alteren el historial académico de los alumnos.

---

### 3.2. Versionado obligatorio

Toda ruta oficial debe tener versiones.

Ejemplo:

```txt
Ruta Integral de Violín por Nodos
Versión 1.0.0
Estado: published
```

Si se modifica el Nivel 10 en el futuro, se debe publicar una nueva versión, no editar destructivamente la versión usada por alumnos anteriores.

---

### 3.3. La IA no escribe directamente en producción

La IA puede ayudar a generar, revisar o mejorar planificaciones, pero no debe escribir directamente sobre la ruta oficial publicada ni aprobar alumnos.

Flujo correcto:

```txt
IA genera borrador
↓
Maestro revisa
↓
Área académica valida
↓
Sistema publica / activa
```

---

### 3.4. El contenido de clase debe ser un snapshot

Cuando el maestro selecciona una clase, el sistema debe generar un **evento de clase** y copiar dentro de ese evento el contenido que viene de la planificación.

Esto es importante porque la planificación puede cambiar en el futuro, pero el historial de esa clase debe conservar exactamente lo que se trabajó ese día.

Ejemplo:

```txt
Planificación semanal:
Semana 4 → Trabajar Nodo Arco + Indicador Detaché

Clase del día:
2026-09-22 → Se genera snapshot con Nodo Arco + Indicador Detaché
```

Si luego el maestro edita la planificación, la clase del 22 de septiembre no debe cambiar.

---

## 4. Roles del sistema

### 4.1. Maestro

Puede:

- Ver sus alumnos.
- Ver sus clases.
- Registrar asistencia.
- Ver la planificación activa.
- Generar evento de clase desde una planificación.
- Evaluar nodos e indicadores.
- Marcar estados: aprobado, reprobado, en proceso.
- Escribir observaciones.
- Asignar tareas.
- Subir evidencias.
- Solicitar revisión IA de una planificación.
- Proponer ajustes.

No puede:

- Publicar una ruta oficial sin aprobación académica.
- Saltar nodos críticos.
- Aprobar un nivel si Sonido o Afinación están reprobados.
- Modificar versiones publicadas de la ruta oficial.

---

### 4.2. Área académica

Puede:

- Ver el avance de todos los alumnos.
- Ver qué planificaciones están activas.
- Aprobar o rechazar planificaciones propuestas.
- Revisar el trabajo de los maestros.
- Ver nodos con mayor tasa de reprobación.
- Ver relación entre asistencia y avance.
- Definir o publicar rutas oficiales.
- Archivar rutas antiguas.
- Revisar observaciones académicas.

---

### 4.3. Administrador

Puede:

- Gestionar usuarios.
- Gestionar roles.
- Gestionar permisos.
- Gestionar instrumentos.
- Configurar catálogos.
- Activar o desactivar módulos.

---

## 5. Estados oficiales

### 5.1. Estados de ruta

```txt
draft
published
archived
```

### 5.2. Estados de planificación académica

```txt
draft
ai_reviewed
pending_academic_review
approved
active
paused
completed
archived
```

### 5.3. Estados de sesión de clase

```txt
scheduled
in_progress
completed
cancelled
```

### 5.4. Estados de asistencia

```txt
present
absent
late
excused
```

### 5.5. Estados de progreso en nodo / indicador

```txt
pending      = pendiente, aún no evaluado
in_process   = en proceso, trabajado pero no dominado
approved     = aprobado, cumple el estándar
failed       = reprobado, no cumple el estándar
```

### 5.6. Regla del estado `in_process`

El estado `in_process` significa:

> El alumno está trabajando el dominio correcto de la clase, pero aún no ha demostrado dominio suficiente.

Por tanto:

- Cuenta como evidencia de trabajo.
- Permite registrar avance parcial.
- No desbloquea el siguiente nodo si el nodo requiere aprobación.
- No permite avanzar al siguiente nivel.
- Debe mantenerse activo en próximas clases hasta aprobarse o reprobarse formalmente.

---

## 6. Flujo principal del maestro

### 6.1. Flujo diario de clase

```txt
1. Maestro inicia sesión.
2. Entra a “Mis clases de hoy”.
3. Selecciona una clase.
4. La app busca la planificación activa relacionada.
5. El maestro pulsa “Iniciar clase”.
6. El sistema genera un class_session.
7. El sistema transfiere contenido planificado al contenido del día.
8. El maestro marca asistencia.
9. El maestro evalúa nodos / indicadores.
10. El maestro registra observaciones.
11. El maestro asigna tarea.
12. El maestro finaliza clase.
13. El sistema actualiza progreso.
14. El área académica puede ver lo trabajado.
```

---

### 6.2. Flujo de generación de contenido del día

```txt
academic_plan
↓
weekly_plan_entry
↓
class_session
↓
class_session_content_snapshot
↓
session_student_work
↓
indicator_attempts
```

---

## 7. Módulos de la PWA

### 7.1. Módulo Maestro

Pantallas:

```txt
TeacherDashboardView
TeacherClassesView
ClassSessionView
StudentPlanView
NodeEvaluationView
StudentProgressView
TeacherObservationsView
```

Componentes:

```txt
AttendanceList
CurrentClassHeader
PlanContentSnapshot
NodeStatusGrid
NodeEvaluationCard
IndicatorAttemptForm
HomeworkBox
TeacherObservationBox
EvidenceUploader
```

---

### 7.2. Módulo Rutas Académicas

Pantallas:

```txt
RouteLibraryView
RouteDetailView
RouteBuilderView
LevelEditorView
NodeEditorView
IndicatorEditorView
```

Componentes:

```txt
RouteCard
LevelCard
NodeEditor
IndicatorEditor
TargetWorkForm
UnlockCriteriaEditor
AiReviewPanel
```

---

### 7.3. Módulo Planificación Académica

Pantallas:

```txt
AcademicPlanBuilderView
AcademicPlanDetailView
WeeklyPlanView
PlanApprovalView
```

Componentes:

```txt
AcademicPlanForm
WeeklyPlanEntryForm
StudentSelector
LevelSelector
TargetWorkSelector
PlanStatusBadge
```

---

### 7.4. Módulo Área Académica

Pantallas:

```txt
AcademicOverviewView
TeacherWorkReportView
StudentProgressReportView
PlanReviewQueueView
NodeFailureStatsView
AttendanceProgressView
```

Componentes:

```txt
ProgressTable
TeacherWorkSummary
StudentLevelMap
NodeFailureChart
AttendanceProgressCard
```

---

## 8. Estructura recomendada del frontend

Asumiendo Vue 3 + Pinia + Supabase:

```txt
src/
  modules/
    teacher/
      views/
        TeacherDashboardView.vue
        TeacherClassesView.vue
        ClassSessionView.vue
        StudentPlanView.vue
      components/
        AttendanceList.vue
        NodeStatusGrid.vue
        NodeEvaluationCard.vue
        IndicatorAttemptForm.vue
        HomeworkBox.vue
        TeacherObservationBox.vue
      stores/
        teacherClassStore.js
        attendanceStore.js
        studentProgressStore.js
      services/
        classSessionService.js
        attendanceService.js
        assessmentService.js

    academic-routes/
      views/
        RouteLibraryView.vue
        RouteBuilderView.vue
        LevelEditorView.vue
      components/
        RouteCard.vue
        LevelCard.vue
        NodeEditor.vue
        IndicatorEditor.vue
        AiReviewPanel.vue
      stores/
        routeStore.js
      services/
        routeService.js
        aiReviewService.js

    academic-planning/
      views/
        AcademicPlanBuilderView.vue
        AcademicPlanDetailView.vue
        WeeklyPlanView.vue
      components/
        AcademicPlanForm.vue
        WeeklyPlanEntryForm.vue
        PlanStatusBadge.vue
      stores/
        academicPlanStore.js
      services/
        academicPlanService.js

    academic-dashboard/
      views/
        AcademicOverviewView.vue
        PlanReviewQueueView.vue
        StudentProgressReportView.vue
      components/
        ProgressTable.vue
        NodeFailureStats.vue
        AttendanceProgressCard.vue
      stores/
        academicDashboardStore.js
      services/
        academicDashboardService.js

  lib/
    supabaseClient.js

  shared/
    components/
      AppButton.vue
      AppSelect.vue
      AppTextarea.vue
      AppStatusBadge.vue
    utils/
      dateUtils.js
      statusUtils.js
      validationUtils.js
```

**Nota de convención:** usar rutas relativas (`../`) y no alias `@/`, si esa es la norma del proyecto.

---

## 9. Modelo de base de datos en Supabase

### 9.1. Enums recomendados

```sql
create type route_status as enum ('draft', 'published', 'archived');

create type plan_status as enum (
  'draft',
  'ai_reviewed',
  'pending_academic_review',
  'approved',
  'active',
  'paused',
  'completed',
  'archived'
);

create type class_session_status as enum (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

create type attendance_status as enum (
  'present',
  'absent',
  'late',
  'excused'
);

create type progress_status as enum (
  'pending',
  'in_process',
  'approved',
  'failed'
);

create type attempt_result as enum (
  'in_process',
  'approved',
  'failed'
);
```

---

### 9.2. Tabla `routes`

```sql
create table routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instrument text not null,
  description text,
  status route_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 9.3. Tabla `route_versions`

```sql
create table route_versions (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  version text not null,
  status route_status not null default 'draft',
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique(route_id, version)
);
```

---

### 9.4. Tabla `blocks`

```sql
create table blocks (
  id uuid primary key default gen_random_uuid(),
  route_version_id uuid not null references route_versions(id) on delete cascade,
  name text not null,
  level_from int not null,
  level_to int not null,
  objective text,
  description text,
  order_index int not null default 0
);
```

---

### 9.5. Tabla `levels`

```sql
create table levels (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  route_version_id uuid not null references route_versions(id) on delete cascade,
  level_number int not null,
  name text not null,
  main_objective text,
  suggested_duration_value int,
  suggested_duration_unit text,
  is_flexible_duration boolean not null default true,
  target_work jsonb not null default '{}'::jsonb,
  unlock_criteria jsonb not null default '{}'::jsonb,
  order_index int not null default 0,
  unique(route_version_id, level_number)
);
```

---

### 9.6. Tabla `nodes`

```sql
create table nodes (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references levels(id) on delete cascade,
  name text not null,
  type text not null,
  is_critical boolean not null default false,
  is_required boolean not null default true,
  objective text,
  order_index int not null default 0
);
```

---

### 9.7. Tabla `indicators`

```sql
create table indicators (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references nodes(id) on delete cascade,
  description text not null,
  minimum_criteria jsonb not null default '{}'::jsonb,
  is_required boolean not null default true,
  order_index int not null default 0
);
```

---

### 9.8. Tabla `students`

Si ya existe una tabla de alumnos, adaptar esta estructura a la existente.

```sql
create table students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  instrument text,
  program text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 9.9. Tabla `teacher_profiles`

Si ya existe una tabla de perfiles, adaptar.

```sql
create table teacher_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  instrument text,
  role text not null default 'teacher',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 9.10. Tabla `academic_plans`

```sql
create table academic_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  group_id uuid,
  teacher_id uuid not null references auth.users(id),
  route_version_id uuid not null references route_versions(id),
  initial_level_id uuid references levels(id),
  current_level_id uuid references levels(id),
  target_level_id uuid references levels(id),
  status plan_status not null default 'draft',
  start_date date,
  end_date date,
  general_objective text,
  target_work jsonb not null default '{}'::jsonb,
  ai_review_status text,
  academic_approval_status text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (student_id is not null or group_id is not null)
);
```

---

### 9.11. Tabla `weekly_plan_entries`

```sql
create table weekly_plan_entries (
  id uuid primary key default gen_random_uuid(),
  academic_plan_id uuid not null references academic_plans(id) on delete cascade,
  week_number int,
  session_date date,
  focus text not null,
  assigned_node_ids uuid[] default '{}',
  assigned_indicator_ids uuid[] default '{}',
  homework text,
  teacher_notes text,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 9.12. Tabla `student_level_progress`

```sql
create table student_level_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  academic_plan_id uuid not null references academic_plans(id) on delete cascade,
  level_id uuid not null references levels(id),
  status progress_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  teacher_final_decision progress_status,
  final_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, academic_plan_id, level_id)
);
```

---

### 9.13. Tabla `student_node_progress`

```sql
create table student_node_progress (
  id uuid primary key default gen_random_uuid(),
  student_level_progress_id uuid not null references student_level_progress(id) on delete cascade,
  node_id uuid not null references nodes(id),
  status progress_status not null default 'pending',
  teacher_decision progress_status,
  feedback text,
  evaluated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_level_progress_id, node_id)
);
```

---

### 9.14. Tabla `indicator_attempts`

```sql
create table indicator_attempts (
  id uuid primary key default gen_random_uuid(),
  student_node_progress_id uuid not null references student_node_progress(id) on delete cascade,
  indicator_id uuid not null references indicators(id),
  attempt_number int not null default 1,
  result attempt_result not null,
  feedback text,
  next_action text,
  evidence_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
```

---

### 9.15. Tabla `class_sessions`

```sql
create table class_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  academic_plan_id uuid references academic_plans(id),
  weekly_plan_entry_id uuid references weekly_plan_entries(id),
  class_type text not null default 'individual',
  instrument text,
  group_id uuid,
  session_date date not null default current_date,
  status class_session_status not null default 'scheduled',
  title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 9.16. Tabla `class_session_content_snapshots`

Esta tabla almacena el contenido transferido desde la planificación al día de clase.

```sql
create table class_session_content_snapshots (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions(id) on delete cascade,
  source_academic_plan_id uuid references academic_plans(id),
  source_weekly_plan_entry_id uuid references weekly_plan_entries(id),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
```

Ejemplo de `snapshot`:

```json
{
  "level": {
    "id": "level_10_uuid",
    "number": 10,
    "name": "Vivaldi Boss Level"
  },
  "focus": "Detaché en semicorcheas y La menor",
  "nodes": [
    {
      "id": "node_bow_uuid",
      "name": "Arco",
      "indicators": [
        {
          "id": "indicator_detache_uuid",
          "description": "Ejecuta detaché claro en pasajes de semicorcheas."
        }
      ]
    }
  ],
  "homework": "Practicar La menor a dos octavas con metrónomo a 60 bpm."
}
```

---

### 9.17. Tabla `attendance_records`

```sql
create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status attendance_status not null,
  notes text,
  created_at timestamptz not null default now(),
  unique(class_session_id, student_id)
);
```

---

### 9.18. Tabla `session_student_work`

Registra qué se trabajó con cada alumno dentro de una clase.

```sql
create table session_student_work (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  node_id uuid references nodes(id),
  indicator_id uuid references indicators(id),
  status progress_status not null default 'in_process',
  work_summary text,
  teacher_notes text,
  homework text,
  created_at timestamptz not null default now()
);
```

---

### 9.19. Tabla `evidence_files`

```sql
create table evidence_files (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  class_session_id uuid references class_sessions(id) on delete cascade,
  related_entity_type text not null,
  related_entity_id uuid not null,
  file_url text not null,
  file_type text,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz not null default now()
);
```

---

### 9.20. Tabla `ai_reviews`

```sql
create table ai_reviews (
  id uuid primary key default gen_random_uuid(),
  academic_plan_id uuid references academic_plans(id) on delete cascade,
  route_version_id uuid references route_versions(id),
  requested_by uuid references auth.users(id),
  input_payload jsonb not null,
  output_payload jsonb not null,
  coherence_score numeric,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);
```

---

## 10. Funciones / Edge Functions recomendadas

### 10.1. `create-class-session-from-plan`

**Responsabilidad:** crear una clase desde una planificación y generar snapshot del contenido.

Input:

```json
{
  "academicPlanId": "uuid",
  "weeklyPlanEntryId": "uuid",
  "sessionDate": "2026-09-22"
}
```

Output:

```json
{
  "classSessionId": "uuid",
  "snapshotId": "uuid",
  "status": "created"
}
```

Proceso:

```txt
1. Validar que el maestro tiene acceso al plan.
2. Leer academic_plan.
3. Leer weekly_plan_entry.
4. Crear class_session.
5. Crear class_session_content_snapshot.
6. Devolver IDs.
```

---

### 10.2. `mark-attendance`

**Responsabilidad:** guardar asistencia de alumnos en una clase.

Input:

```json
{
  "classSessionId": "uuid",
  "records": [
    {
      "studentId": "uuid",
      "status": "present",
      "notes": ""
    }
  ]
}
```

---

### 10.3. `evaluate-indicator`

**Responsabilidad:** registrar intento de evaluación de un indicador.

Input:

```json
{
  "studentNodeProgressId": "uuid",
  "indicatorId": "uuid",
  "result": "in_process",
  "feedback": "Aún pierde estabilidad en el cambio de cuerda.",
  "nextAction": "Repetir lentamente con metrónomo.",
  "evidenceUrl": null
}
```

Reglas:

```txt
approved   → puede contribuir al cierre del nodo.
failed     → mantiene o marca el nodo como failed.
in_process → mantiene el nodo activo, pero no desbloquea avance.
```

---

### 10.4. `recalculate-node-progress`

**Responsabilidad:** recalcular el estado de un nodo según sus indicadores.

Regla sugerida:

```txt
Si todos los indicadores requeridos están approved → nodo approved.
Si cualquier indicador crítico está failed → nodo failed.
Si existe al menos un indicador in_process y ninguno failed → nodo in_process.
Si no hay intentos → nodo pending.
```

---

### 10.5. `complete-level-if-ready`

**Responsabilidad:** verificar si el nivel puede completarse.

Reglas:

```txt
1. Todos los nodos requeridos deben estar approved.
2. Todos los nodos críticos deben estar approved.
3. El maestro debe confirmar decisión final.
4. Si se aprueba, activar siguiente nivel.
```

---

### 10.6. `ai-review-academic-plan`

**Responsabilidad:** revisar una planificación con IA.

La IA debe responder con:

```json
{
  "coherenceScore": 0.86,
  "summary": "La planificación es coherente con el nivel objetivo.",
  "risks": [
    "El nodo de Arco tiene poca carga para preparar Vivaldi."
  ],
  "missingNodes": [],
  "suggestedAdjustments": [
    "Agregar trabajo de detaché en semicorcheas durante dos semanas."
  ],
  "suggestedWeeklyPlan": []
}
```

**Regla:** esta función no debe publicar ni activar cambios automáticamente.

---

## 11. Lógica de progreso

### 11.1. Reglas por indicador

```txt
pending:
  No existe evaluación todavía.

in_process:
  El alumno trabajó el indicador, pero no alcanzó dominio.
  No desbloquea avance.

approved:
  El maestro valida dominio suficiente.

failed:
  El alumno no cumple el mínimo.
  Debe repetir o recibir plan correctivo.
```

---

### 11.2. Reglas por nodo

```txt
Nodo aprobado:
  Todos los indicadores requeridos están approved.

Nodo en proceso:
  Al menos un indicador está in_process y ninguno requerido está failed.

Nodo reprobado:
  Uno o más indicadores requeridos están failed.

Nodo pendiente:
  No tiene intentos registrados.
```

---

### 11.3. Reglas por nivel

```txt
Nivel aprobado:
  Todos los nodos requeridos están approved.
  Sonido y Afinación están approved.
  Maestro confirma aprobación final.

Nivel en proceso:
  Uno o más nodos están pending o in_process.

Nivel reprobado:
  Maestro marca decisión final failed
  o nodos críticos fallan repetidamente.

Nivel no desbloqueado:
  Nivel anterior no aprobado.
```

---

### 11.4. Pseudocódigo de promoción

```js
export function canCompleteLevel(nodes) {
  const requiredNodes = nodes.filter((node) => node.is_required)
  const criticalNodes = nodes.filter((node) => node.is_critical)

  const requiredApproved = requiredNodes.every(
    (node) => node.status === 'approved'
  )

  const criticalApproved = criticalNodes.every(
    (node) => node.status === 'approved'
  )

  return requiredApproved && criticalApproved
}
```

---

## 12. Formularios HTML / UI requeridos

### 12.1. Formulario de planificación académica

Campos:

```txt
Alumno o grupo
Maestro responsable
Instrumento
Ruta
Versión de ruta
Nivel inicial
Nivel objetivo
Fecha de inicio
Fecha estimada de cierre
Objetivo general
Obra-hito
Notas del maestro
```

---

### 12.2. Formulario de obra-hito

Campos:

```txt
Compositor
Título
Opus / catálogo
Movimiento
Rol:
  - preparation
  - bridge_work
  - boss_work
  - optional
¿Requiere ejecución completa?
Observaciones
```

---

### 12.3. Formulario de planificación semanal

Campos:

```txt
Semana
Fecha sugerida
Foco de trabajo
Nodos asignados
Indicadores asignados
Tarea para casa
Notas del maestro
```

---

### 12.4. Formulario de inicio de clase

Campos:

```txt
Clase / fecha
Alumno o grupo
Planificación activa
Semana planificada
Botón: Generar clase desde planificación
```

Al generar clase, mostrar:

```txt
Contenido del día:
- Nivel
- Nodos
- Indicadores
- Tarea prevista
- Observaciones previas
```

---

### 12.5. Formulario de asistencia

Campos por alumno:

```txt
Presente
Ausente
Tarde
Justificado
Notas
```

---

### 12.6. Formulario de evaluación de indicador

Campos:

```txt
Nodo
Indicador
Estado:
  - En proceso
  - Aprobado
  - Reprobado
Feedback
Próxima acción
Evidencia
```

Regla UX:

- `approved` debe mostrarse en verde.
- `failed` debe mostrarse en rojo.
- `in_process` debe mostrarse en amarillo.
- `pending` debe mostrarse en gris.

---

## 13. Pantalla principal de clase

La pantalla más importante del maestro debe verse conceptualmente así:

```txt
Clase de hoy
────────────────────────────
Alumno: Ana Pérez
Instrumento: Violín
Nivel actual: 10 — Vivaldi Boss Level
Plan: Septiembre–Enero

Asistencia:
[Presente] [Ausente] [Tarde] [Justificado]

Contenido del día:
Foco: Detaché en semicorcheas + La menor

Nodos:
🟢 Escalas
🟡 Arco
🟢 Sonido
🟢 Afinación
⚪ Estudios
🔒 Repertorio

Indicador activo:
“Ejecuta detaché claro en pasajes de semicorcheas.”

Evaluación:
[En proceso] [Aprobado] [Reprobado]

Feedback:
________________________________

Próxima acción:
________________________________

Botones:
Guardar evaluación
Asignar tarea
Finalizar clase
```

---

## 14. Integración con IA

### 14.1. Casos de uso IA

La IA puede ayudar en:

1. Generar planificación semanal.
2. Sugerir indicadores.
3. Revisar sobrecarga de contenidos.
4. Detectar incoherencias entre obra y nivel.
5. Proponer tareas.
6. Redactar feedback pedagógico.
7. Resumir progreso mensual.
8. Sugerir refuerzos para nodos reprobados.

---

### 14.2. Límites de IA

La IA no debe:

- Aprobar alumnos.
- Cambiar estados de progreso por sí sola.
- Publicar rutas oficiales.
- Borrar historial académico.
- Saltar aprobación del maestro.
- Alterar nodos críticos.

---

### 14.3. Prompt base para revisión IA

```txt
Actúa como especialista en pedagogía del violín y arquitectura curricular.
Revisa esta planificación académica contra la Ruta Violinística por Nodos.
Evalúa:
1. Coherencia con el nivel.
2. Sobrecarga técnica.
3. Relación entre obra-hito y nodos.
4. Ausencia de nodos críticos.
5. Progresión semanal.
6. Riesgos pedagógicos.

Devuelve un JSON con:
- coherenceScore
- summary
- risks
- missingNodes
- suggestedAdjustments
- suggestedWeeklyPlan
No apruebes al alumno. Solo asesora al maestro.
```

---

## 15. RLS y seguridad

### 15.1. Principios

- El maestro solo ve alumnos y clases asignadas.
- El área académica ve todos los planes y progresos.
- El administrador gestiona configuración.
- La ruta publicada es de lectura para maestros.
- Solo área académica o admin puede publicar rutas.
- Los intentos y evidencias deben conservar historial.

---

### 15.2. Políticas RLS mínimas

Activar RLS:

```sql
alter table academic_plans enable row level security;
alter table class_sessions enable row level security;
alter table attendance_records enable row level security;
alter table student_level_progress enable row level security;
alter table student_node_progress enable row level security;
alter table indicator_attempts enable row level security;
```

Ejemplo conceptual:

```sql
create policy "teachers can view their own plans"
on academic_plans
for select
using (teacher_id = auth.uid());
```

Para área académica se recomienda una tabla de roles:

```sql
user_roles (
  user_id uuid,
  role text
)
```

Y una función:

```sql
is_academic_user()
```

---

## 16. MVP recomendado

No implementar todo al mismo tiempo.

### MVP 1

Objetivo: validar el flujo real del maestro en clase.

Debe incluir:

```txt
- Login
- Roles básicos
- Lista de alumnos
- Ruta oficial cargada manualmente
- 10 niveles iniciales
- Nodos por nivel
- Indicadores por nodo
- Plan académico activo
- Generar clase desde planificación
- Snapshot de contenido del día
- Registro de asistencia
- Evaluación: en proceso / aprobado / reprobado
- Observaciones
- Tareas
- Vista de progreso del alumno
```

No incluir todavía:

```txt
- IA avanzada
- Reportes complejos
- Gamificación visual completa
- 40 niveles completos
- Multimedia avanzada
```

---

### MVP 2

Agregar:

```txt
- Revisión IA de planificación
- Generación IA de tareas
- Panel académico
- Reportes por maestro
- Nodos más reprobados
- Relación asistencia/progreso
```

---

### MVP 3

Agregar:

```txt
- 40 niveles completos
- Versionado avanzado
- Adaptación por instrumento
- Evidencias de audio/video
- Evaluaciones semestrales
- Modo audición
```

---

## 17. Criterios de aceptación del MVP

El MVP se considera funcional cuando:

1. Un maestro puede iniciar sesión.
2. El maestro puede seleccionar una clase.
3. El sistema puede generar un evento de clase desde una planificación.
4. El contenido planificado se copia como snapshot del día.
5. El maestro puede marcar asistencia.
6. El maestro puede evaluar indicadores como:
   - `in_process`
   - `approved`
   - `failed`
7. El estado `in_process` no desbloquea avance.
8. El estado `approved` contribuye al avance.
9. El estado `failed` obliga a repetir o registrar plan correctivo.
10. El sistema actualiza el progreso del nodo.
11. El sistema impide aprobar nivel si Sonido o Afinación no están aprobados.
12. El maestro puede registrar observaciones y tareas.
13. El área académica puede ver qué trabajó el maestro.
14. El historial de clase no cambia aunque se edite la planificación después.

---

## 18. Riesgos técnicos y pedagógicos

### 18.1. Riesgo: sobreingeniería

No cargar 40 niveles desde el inicio. Primero validar flujo con 10 niveles.

### 18.2. Riesgo: IA con demasiado poder

La IA debe generar borradores, no decisiones oficiales.

### 18.3. Riesgo: maestros con criterios distintos

Solución: indicadores claros, nodos críticos y revisión académica.

### 18.4. Riesgo: mezclar asistencia con aprobación

La asistencia informa, pero no aprueba niveles.

### 18.5. Riesgo: cambiar plantillas y dañar historial

Solución: versionado y snapshots.

---

## 19. Definición del módulo en una frase

> El Módulo de Ruta Académica por Nodos convierte la planificación del maestro en eventos de clase evaluables, integrados con asistencia, observaciones y progreso académico, permitiendo que cada alumno avance por dominio real bajo decisión final del maestro.

---

## 20. Próxima tarea para el equipo de desarrollo

### Sprint 1 sugerido

1. Crear tablas base en Supabase:
   - routes
   - route_versions
   - blocks
   - levels
   - nodes
   - indicators
   - academic_plans
   - weekly_plan_entries
   - class_sessions
   - class_session_content_snapshots
   - attendance_records
   - student_level_progress
   - student_node_progress
   - indicator_attempts

2. Cargar seed inicial:
   - Ruta de Violín v1
   - Bloque I
   - Niveles 1–10
   - 8 nodos por nivel
   - indicadores mínimos para Nivel 1 y Nivel 10

3. Crear pantallas:
   - TeacherClassesView
   - ClassSessionView
   - StudentPlanView
   - NodeEvaluationCard

4. Crear servicios:
   - createClassSessionFromPlan
   - markAttendance
   - evaluateIndicator
   - recalculateNodeProgress

5. Validar flujo manual completo con un maestro y un alumno.

---

## 21. Apéndice: JSON mínimo de evaluación

```json
{
  "classSessionId": "uuid",
  "studentId": "uuid",
  "levelId": "uuid",
  "nodeId": "uuid",
  "indicatorId": "uuid",
  "result": "in_process",
  "feedback": "El alumno comprende el patrón, pero aún pierde estabilidad rítmica.",
  "nextAction": "Repetir con metrónomo a 60 bpm durante la semana.",
  "evidenceUrl": null
}
```

---

## 22. Apéndice: JSON mínimo de snapshot de clase

```json
{
  "source": {
    "academicPlanId": "uuid",
    "weeklyPlanEntryId": "uuid"
  },
  "level": {
    "id": "uuid",
    "number": 10,
    "name": "Vivaldi Boss Level"
  },
  "sessionFocus": "Detaché en semicorcheas y escala de La menor",
  "nodes": [
    {
      "id": "uuid",
      "name": "Arco",
      "isCritical": false,
      "indicators": [
        {
          "id": "uuid",
          "description": "Ejecuta detaché claro en pasajes de semicorcheas.",
          "minimumCriteria": {
            "tempo": 72,
            "allowedStops": 0
          }
        }
      ]
    }
  ],
  "plannedHomework": "Practicar compases 1–16 de Vivaldi lentamente con metrónomo."
}
```

---

## 23. Apéndice: regla final de avance

```txt
Un alumno puede avanzar al siguiente nivel solo si:

1. Todos los nodos requeridos están approved.
2. Todos los nodos críticos están approved.
3. No existen indicadores requeridos en estado in_process.
4. No existen indicadores requeridos en estado failed.
5. El maestro confirma la aprobación final.
```

---

# Fin de la especificación
