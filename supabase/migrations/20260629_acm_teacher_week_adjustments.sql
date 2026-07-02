-- Controlled teacher adjustments over ACM weekly guidance.
-- These records adapt execution per class without mutating the ACM base plan.

CREATE TABLE IF NOT EXISTS public.acm_teacher_week_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.maestros(id) ON DELETE CASCADE,
  weekly_plan_id uuid NOT NULL REFERENCES public.acm_weekly_plans(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  teacher_strategy text,
  student_activity text,
  homework text,
  evidence text,
  teacher_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT acm_teacher_week_adjustments_unique
    UNIQUE (group_id, teacher_id, weekly_plan_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_acm_teacher_week_adjustments_group
ON public.acm_teacher_week_adjustments(group_id, teacher_id, weekly_plan_id);
