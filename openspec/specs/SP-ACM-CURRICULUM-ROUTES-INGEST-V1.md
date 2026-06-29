# SPEC: Ingesta, normalización y amarre curricular de planificación académica por capas semanales

## Código interno del cambio
`SP-ACM-CURRICULUM-ROUTES-INGEST-V1`

## Estado: PROPUESTA (Aprobación Requerida)

---

# 1. Contexto y Objetivos

El Portal Académico-Musical (ACM) requiere de un motor robusto para gestionar la planificación curricular y asegurar que lo diseñado se ejecute en el aula por los maestros, permitiendo la trazabilidad del avance de los estudiantes.

Este cambio implementa la **trazabilidad curricular fina por semanas curriculares**, estructurando:
1. **Fuentes documentales**: La ingesta de guías de cátedra rectoras (Violín/Viola) y módulos complementarios (Lenguaje Musical de Manuel).
2. **Planificación semanal**: La división granular de los niveles en semanas pedagógicas detalladas (Tema, Objetivo, Actividades, Evidencias, Evaluaciones).
3. **Rutas activas y ejecución**: Conexión directa con la clase diaria del maestro, permitiendo evaluar el logro de indicadores por alumno con un semáforo visual (Verde, Amarillo, Rojo, Azul, Gris).
4. **Seguimiento ACM**: Detección de grupos rezagados y alertas automáticas por falta de registro.

---

# 2. Análisis del Esquema Existente en Supabase

Auditando el historial de migraciones (`006_academic_route_schema.sql` y `ruta-academica-tables.sql`), la base de datos ya cuenta con los cimientos curriculares:
*   `routes` y `route_versions`: Estructura para registrar los instrumentos (Violín, Viola).
*   `levels`: Niveles progresivos (N0 Fundamentos, N1 Iniciación, etc.).
*   `nodes`: Categorías técnicas por nivel (Escalas, Mano Izquierda, Arco, Sonido [Crítico], Afinación [Crítico], etc.).
*   `indicators`: Criterios de evaluación atómicos asociados a cada nodo.
*   `academic_plans`: Asocia alumnos a una versión de ruta curricular.
*   `student_node_progress` y `student_level_progress`: Resúmenes de avance con triggers PL/pgSQL activos.
*   `class_sessions` (y `sesiones_clase` en el portal maestros): Sesión de clase del profesor.
*   `indicator_attempts`: El historial de calificaciones del indicador por alumno.

### Brecha de diseño (Gap Analysis)
Para dar cumplimiento a la especificación `SP-ACM-CURRICULUM-ROUTES-INGEST-V1`, extenderemos el modelo actual agregando:
1.  `acm_curriculum_sources`: Registro de documentos pedagógicos fuente cargados en la PWA (Capa 1).
2.  `acm_weekly_plan_items`: Para la planificación granular semanal del nivel (Tema, Objetivo, Actividades maestro/alumno, Tarea, Evidencia, Rúbrica) (Capa 3).
3.  `acm_active_routes`: Para vincular un grupo y maestro a una planificación activa y llevar el control de la semana actual (Capa 4).
4.  `student_indicator_progress` (o ampliación de `indicator_attempts` / `student_node_progress`): Para registrar el estado actual en el semáforo y guardar la evidencia asociada.

---

# 3. Propuesta de Arquitectura y Base de Datos (PostgreSQL / Supabase)

Proponemos la creación de la siguiente migración para el MVP1:

```sql
-- 1. Capa de Fuentes Documentales
CREATE TABLE IF NOT EXISTS public.acm_curriculum_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT,
    source_type TEXT CHECK (source_type IN ('documento_rector', 'documento_complementary', 'referencia_externa', 'ajuste_acm')),
    author TEXT,
    version_label TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, in_review, approved
    raw_text TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Estructura de Planificación Semanal
-- Extendemos vinculando al nivel (levels) e indicador base
CREATE TABLE IF NOT EXISTS public.acm_weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_version_id UUID REFERENCES public.route_versions(id) ON DELETE CASCADE,
    level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    main_topic TEXT NOT NULL,
    main_objective TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, active, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(route_version_id, level_id, week_number)
);

CREATE TABLE IF NOT EXISTS public.acm_weekly_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID REFERENCES public.acm_weekly_plans(id) ON DELETE CASCADE,
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    indicator_id UUID REFERENCES public.indicators(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    objective TEXT NOT NULL,
    teacher_strategy TEXT,
    student_activity TEXT,
    homework TEXT,
    materials TEXT,
    evidence TEXT,
    assessment_method TEXT,
    estimated_minutes INT DEFAULT 45,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Rutas Activas de Grupos
CREATE TABLE IF NOT EXISTS public.acm_active_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_version_id UUID REFERENCES public.route_versions(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.maestros(id) ON DELETE SET NULL,
    group_id UUID REFERENCES public.clases(id) ON DELETE CASCADE, -- clase_id representa el grupo en el portal
    level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
    current_week INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, suspended
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Progreso Atómico de Alumnos (Semáforo del Indicador)
CREATE TABLE IF NOT EXISTS public.student_indicator_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    indicator_id UUID REFERENCES public.indicators(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.class_sessions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'worked', 'in_process', 'achieved', 'needs_reinforcement', 'not_achieved', 'exceeded')),
    observation TEXT,
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, indicator_id)
);
```

---

# 4. Plan de Implementación (MVP 1)

El MVP 1 se concentrará en las siguientes tareas operativas:

### Paso 1: Carga y Simulación Curricular
*   Adaptar el `DataAdapter` en el frontend para soportar los endpoints de planificación y rutas activas en modo real y modo demo.
*   En `src/assets/data/mocks/`, crear datos iniciales para la planificación de Violín N0 (Semanas 1 a 6) de la guía rectora, y el Módulo de Lenguaje Musical de Manuel (Semanas 1 a 6 como apoyo de teoría).

### Paso 2: Interfaz del Portal ACM (Coordinador)
*   **Editor Curricular**: Vista simple para visualizar las semanas del plan académico y sus correspondientes indicadores del nivel seleccionado.
*   **Asignador de Rutas**: Formulario para asignar una planificación base a un maestro y un grupo específico, iniciando la ruta activa.

### Paso 3: Interfaz del Portal del Maestro ("Clase de Hoy")
*   **Sección de Avance Curricular**: Al dictar la clase en la PWA, el maestro visualiza automáticamente la semana del plan asociada al grupo.
*   **Semáforo de Calificación**: Un widget interactivo (círculos Gris/Amarillo/Rojo/Verde/Azul) al lado de cada estudiante en la lista de asistencia para evaluar su desempeño en el indicador semanal.
*   **Guardado Offline**: Soporte de sincronización a través de `offlineQueue.js` e IndexedDB.

---

# 5. Reglas de Validación de Riesgo y Alertas

1.  **Bloqueo de Avance (Regla 40% crítica)**: Si en la sesión actual el 40% de los estudiantes del grupo son calificados con `not_achieved` (Rojo) en un indicador de un nodo marcado como `is_critical` (como Sonido o Afinación), la PWA en el portal del maestro recomendará repetir el indicador en la próxima clase en lugar de avanzar de semana.
2.  **Alerta por Estancamiento**: Si un estudiante permanece con `in_process` (Amarillo) o `not_achieved` (Rojo) durante 3 semanas consecutivas en el mismo indicador crítico, se creará automáticamente un caso de alerta de riesgo académico en `student_case_alerts` (disparando el investigador autónomo de Hermes).
