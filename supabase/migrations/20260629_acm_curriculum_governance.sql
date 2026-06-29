-- ACM curriculum governance layer
-- This complements the existing planning tables and makes ACM the source of truth
-- for curriculum versions, weekly plans and route assignments.

CREATE TABLE IF NOT EXISTS public.acm_curriculum_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_name text NOT NULL,
  file_path text,
  source_type text NOT NULL CHECK (source_type IN (
    'documento_rector',
    'documento_complementario',
    'referencia_externa',
    'ajuste_acm'
  )),
  author text,
  version_label text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'in_review',
    'approved',
    'active',
    'archived',
    'replaced'
  )),
  raw_text text,
  notes text,
  related_version_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.acm_curriculum_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  source_id uuid REFERENCES public.acm_curriculum_sources(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.programas(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'in_review',
    'approved',
    'active',
    'archived',
    'replaced'
  )),
  is_active boolean NOT NULL DEFAULT false,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.acm_curriculum_sources
  DROP CONSTRAINT IF EXISTS acm_curriculum_sources_related_version_fkey;
ALTER TABLE public.acm_curriculum_sources
  ADD CONSTRAINT acm_curriculum_sources_related_version_fkey
  FOREIGN KEY (related_version_id) REFERENCES public.acm_curriculum_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_acm_curriculum_sources_status ON public.acm_curriculum_sources(status);
CREATE INDEX IF NOT EXISTS idx_acm_curriculum_versions_status ON public.acm_curriculum_versions(status);
CREATE INDEX IF NOT EXISTS idx_acm_curriculum_versions_source ON public.acm_curriculum_versions(source_id);

CREATE TABLE IF NOT EXISTS public.acm_weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id uuid NOT NULL REFERENCES public.acm_curriculum_versions(id) ON DELETE CASCADE,
  program_id uuid REFERENCES public.programas(id) ON DELETE SET NULL,
  area_id uuid,
  instrument_id uuid,
  module_id uuid,
  level_id uuid,
  phase_id uuid,
  week_number integer NOT NULL,
  week_label text,
  phase_type text,
  main_topic text,
  main_objective text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.acm_weekly_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id uuid NOT NULL REFERENCES public.acm_weekly_plans(id) ON DELETE CASCADE,
  node_id uuid,
  indicator_id uuid REFERENCES public.indicators(id) ON DELETE SET NULL,
  topic text,
  objective text,
  teacher_strategy text,
  student_activity text,
  homework text,
  materials text,
  evidence text,
  assessment_method text,
  estimated_minutes integer,
  order_index integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acm_weekly_plans_level ON public.acm_weekly_plans(level_id, week_number);
CREATE INDEX IF NOT EXISTS idx_acm_weekly_plan_items_weekly_plan ON public.acm_weekly_plan_items(weekly_plan_id);

CREATE TABLE IF NOT EXISTS public.acm_active_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id uuid NOT NULL REFERENCES public.acm_weekly_plans(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  group_id uuid REFERENCES public.clases(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.programas(id) ON DELETE SET NULL,
  area_id uuid,
  instrument_id uuid,
  module_id uuid,
  level_id uuid,
  phase_id uuid,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  current_week integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acm_active_routes_teacher ON public.acm_active_routes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_acm_active_routes_group ON public.acm_active_routes(group_id);
CREATE INDEX IF NOT EXISTS idx_acm_active_routes_status ON public.acm_active_routes(status);

CREATE TABLE IF NOT EXISTS public.teacher_class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active_route_id uuid REFERENCES public.acm_active_routes(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  group_id uuid REFERENCES public.clases(id) ON DELETE SET NULL,
  class_date date NOT NULL DEFAULT CURRENT_DATE,
  week_number integer,
  planned_week_id uuid REFERENCES public.acm_weekly_plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'started', 'completed', 'cancelled')),
  general_observation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.teacher_session_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.teacher_class_sessions(id) ON DELETE CASCADE,
  indicator_id uuid REFERENCES public.indicators(id) ON DELETE SET NULL,
  planned_topic text,
  planned_objective text,
  worked_status text NOT NULL DEFAULT 'not_started',
  teacher_notes text,
  next_action text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_indicator_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  indicator_id uuid NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.teacher_class_sessions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'not_started',
  score numeric,
  observation text,
  evidence_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_indicator_progress_unique UNIQUE (student_id, indicator_id)
);

CREATE TABLE IF NOT EXISTS public.acm_evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.alumnos(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.clases(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.teacher_class_sessions(id) ON DELETE SET NULL,
  indicator_id uuid REFERENCES public.indicators(id) ON DELETE SET NULL,
  file_url text NOT NULL,
  file_type text,
  description text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acm_evidence_files_indicator ON public.acm_evidence_files(indicator_id);
CREATE INDEX IF NOT EXISTS idx_acm_evidence_files_session ON public.acm_evidence_files(session_id);
