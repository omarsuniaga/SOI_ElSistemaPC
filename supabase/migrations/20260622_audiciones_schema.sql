-- =============================================
-- OSIJ-PC Audition System - Supabase Schema
-- =============================================

DROP VIEW IF EXISTS student_results CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
    jurado_id TEXT NOT NULL,
    jurado_name TEXT NOT NULL,
    -- Scale criteria (1-4)
    afinacion_general INT CHECK (afinacion_general BETWEEN 1 AND 4),
    ritmo_escala INT CHECK (ritmo_escala BETWEEN 1 AND 4),
    sonido INT CHECK (sonido BETWEEN 1 AND 4),
    digitacion INT CHECK (digitacion BETWEEN 1 AND 4),
    -- Repertoire criteria (1-4)
    afinacion_rep INT CHECK (afinacion_rep BETWEEN 1 AND 4),
    ritmo_rep INT CHECK (ritmo_rep BETWEEN 1 AND 4),
    articulacion INT CHECK (articulacion BETWEEN 1 AND 4),
    lectura INT CHECK (lectura BETWEEN 1 AND 4),
    -- Totals
    score_escala INT GENERATED ALWAYS AS (
        COALESCE(afinacion_general,0) + COALESCE(ritmo_escala,0) + 
        COALESCE(sonido,0) + COALESCE(digitacion,0)
    ) STORED,
    score_danzon INT GENERATED ALWAYS AS (
        COALESCE(afinacion_rep,0) + COALESCE(ritmo_rep,0) + 
        COALESCE(articulacion,0) + COALESCE(lectura,0)
    ) STORED,
    score_total INT GENERATED ALWAYS AS (
        COALESCE(afinacion_general,0) + COALESCE(ritmo_escala,0) + 
        COALESCE(sonido,0) + COALESCE(digitacion,0) +
        COALESCE(afinacion_rep,0) + COALESCE(ritmo_rep,0) + 
        COALESCE(articulacion,0) + COALESCE(lectura,0)
    ) STORED,
    -- Observations
    observations TEXT DEFAULT '',
    recommendation TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, jurado_id)
);

-- App users profile table (maps auth users to app roles)
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'jurado')),
    jurado_id TEXT NOT NULL CHECK (jurado_id IN ('admin','omar','kalani','manuel','especialista')),
    display_name TEXT NOT NULL,
    email TEXT,
    specialty TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper functions to avoid infinite recursion on RLS policies
CREATE OR REPLACE FUNCTION public.get_app_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.app_users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_app_user_role() = 'admin';
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Auto-create a default profile on sign-up (adjust later from SQL Editor)
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.app_users (id, role, jurado_id, display_name, email, specialty, is_active)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'jurado'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'jurado_id', ''), 'especialista'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(COALESCE(NEW.email, ''), '@', 1), 'usuario'),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = EXCLUDED.role,
        jurado_id = EXCLUDED.jurado_id,
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        specialty = EXCLUDED.specialty;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_auth_user();

-- Results view (averaged scores)
CREATE OR REPLACE VIEW student_results AS
SELECT 
    s.id,
    s.nombre_completo as name,
    CASE 
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%violin%' OR LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%violín%' OR LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%volin%' THEN 'Violines I'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%viola%' THEN 'Violas'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%cello%' OR LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%violoncello%' THEN 'Violoncellos'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%contrabajo%' THEN 'Contrabajos'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%flauta%' THEN 'Flautas'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%oboe%' THEN 'Oboes'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%clarinete%' THEN 'Clarinetes'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%corno%' THEN 'Cornos'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%trompeta%' THEN 'Trompetas'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%trombo%' THEN 'Trombones'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%tuba%' THEN 'Tuba'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%percu%' THEN 'Percusión'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%piano%' THEN 'Pianistas'
        ELSE COALESCE(s.instrumento_principal, s.instrumento_interes, 'Sin sección')
    END as section,
    COUNT(e.id) as eval_count,
    ROUND(AVG(e.score_escala)::numeric, 1) as avg_escala,
    ROUND(AVG(e.score_danzon)::numeric, 1) as avg_danzon,
    ROUND(AVG(e.score_total)::numeric, 1) as avg_total,
    CASE 
        WHEN AVG(e.score_total) >= 28 THEN 'A'
        WHEN AVG(e.score_total) >= 20 THEN 'B'
        WHEN AVG(e.score_total) >= 12 THEN 'C'
        WHEN AVG(e.score_total) >= 8 THEN 'D'
        ELSE NULL
    END as assigned_group
FROM public.alumnos s
LEFT JOIN evaluations e ON s.id = e.student_id
WHERE s.activo = true
GROUP BY s.id, s.nombre_completo, s.instrumento_principal, s.instrumento_interes;

-- Enable RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies
DROP POLICY IF EXISTS "App users self read policy" ON app_users;
DROP POLICY IF EXISTS "App users insert policy" ON app_users;
DROP POLICY IF EXISTS "App users select policy" ON app_users;
DROP POLICY IF EXISTS "App users self insert policy" ON app_users;
DROP POLICY IF EXISTS "App users self update policy" ON app_users;
DROP POLICY IF EXISTS "App users admin modify policy" ON app_users;
DROP POLICY IF EXISTS "Evaluations read policy" ON evaluations;
DROP POLICY IF EXISTS "Evaluations insert policy" ON evaluations;
DROP POLICY IF EXISTS "Evaluations update policy" ON evaluations;
DROP POLICY IF EXISTS "Evaluations delete policy" ON evaluations;

-- Public select policy so unauthenticated users can see active jurados on the login dropdown
CREATE POLICY "App users select policy" ON app_users
FOR SELECT USING (true);

-- Users can insert and update their own profile
CREATE POLICY "App users self insert policy" ON app_users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "App users self update policy" ON app_users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can manage all profiles
CREATE POLICY "App users admin modify policy" ON app_users
FOR ALL TO authenticated
USING (public.is_app_admin())
WITH CHECK (public.is_app_admin());

-- Read access for evaluations
CREATE POLICY "Evaluations read policy" ON evaluations
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM app_users au
        WHERE au.id = auth.uid()
          AND (
              au.role = 'admin'
              OR (
                  au.role = 'jurado'
                  AND au.jurado_id = evaluations.jurado_id
              )
          )
    )
);

-- Restricted write access by role/profile
CREATE POLICY "Evaluations insert policy" ON evaluations
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM app_users au
        WHERE au.id = auth.uid()
          AND (
              au.role = 'admin'
              OR (
                  au.role = 'jurado'
                  AND au.jurado_id = evaluations.jurado_id
              )
          )
    )
);

CREATE POLICY "Evaluations update policy" ON evaluations
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM app_users au
        WHERE au.id = auth.uid()
          AND (
              au.role = 'admin'
              OR (
                  au.role = 'jurado'
                  AND au.jurado_id = evaluations.jurado_id
              )
          )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM app_users au
        WHERE au.id = auth.uid()
          AND (
              au.role = 'admin'
              OR (
                  au.role = 'jurado'
                  AND au.jurado_id = evaluations.jurado_id
              )
          )
    )
);

CREATE POLICY "Evaluations delete policy" ON evaluations
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM app_users au
        WHERE au.id = auth.uid()
          AND (
              au.role = 'admin'
              OR (
                  au.role = 'jurado'
                  AND au.jurado_id = evaluations.jurado_id
              )
          )
    )
);

-- Keep updated_at current
CREATE OR REPLACE FUNCTION set_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_evaluations_updated_at ON evaluations;
CREATE TRIGGER trg_evaluations_updated_at
BEFORE UPDATE ON evaluations
FOR EACH ROW
EXECUTE FUNCTION set_evaluations_updated_at();

-- =============================================
-- SECTIONS CONFIGURATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.sections (
    id TEXT PRIMARY KEY, -- Ej: 'Violines I', 'Violas'
    family TEXT NOT NULL, -- Ej: 'Cuerdas'
    default_day TEXT NOT NULL, -- Ej: 'sabado'
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read sections" ON public.sections;
CREATE POLICY "Allow public read sections" ON public.sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin modify sections" ON public.sections;
CREATE POLICY "Allow admin modify sections" ON public.sections FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

INSERT INTO public.sections (id, family, default_day, order_index) VALUES
('Violines I', 'Cuerdas', 'sabado', 1),
('Violines II', 'Cuerdas', 'sabado', 2),
('Violines III', 'Cuerdas', 'sabado', 3),
('Violas', 'Cuerdas', 'sabado', 4),
('Violoncellos', 'Cuerdas', 'viernes', 1),
('Contrabajos', 'Cuerdas', 'viernes', 2),
('Pianistas', 'Cuerdas', 'viernes', 3),
('Flautas', 'Vientos Maderas', 'jueves', 1),
('Oboes', 'Vientos Maderas', 'jueves', 2),
('Clarinetes', 'Vientos Maderas', 'jueves', 3),
('Cornos', 'Vientos Metales', 'jueves', 4),
('Trompetas', 'Vientos Metales', 'jueves', 5),
('Trombones', 'Vientos Metales', 'jueves', 6),
('Tuba', 'Vientos Metales', 'jueves', 7),
('Percusión', 'Percusión', 'jueves', 8)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- REPERTOIRE CONFIGURATION TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS public.repertoire_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE, -- Ej: 'Violines I'
    title TEXT NOT NULL, -- Ej: 'Danzón N°2'
    type TEXT NOT NULL DEFAULT 'obra', -- 'obra', 'escala', 'metodo', 'ejercicio'
    composer TEXT DEFAULT '',
    arranger TEXT DEFAULT '',
    key_signature TEXT DEFAULT '',
    time_signature TEXT DEFAULT '',
    tempo_indication TEXT DEFAULT '',
    octaves TEXT DEFAULT '',
    difficulty_level INT DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    weight INT DEFAULT 16,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section, title, type)
);

ALTER TABLE public.repertoire_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read repertoire_items" ON public.repertoire_items;
CREATE POLICY "Allow public read repertoire_items" ON public.repertoire_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin modify repertoire_items" ON public.repertoire_items;
CREATE POLICY "Allow admin modify repertoire_items" ON public.repertoire_items FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

CREATE TABLE IF NOT EXISTS public.repertoire_fragments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repertoire_item_id UUID NOT NULL REFERENCES public.repertoire_items(id) ON DELETE CASCADE,
    label TEXT DEFAULT '', -- Ej: 'Fragmento A'
    measures_start INT,
    measures_end INT,
    notes TEXT DEFAULT '',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.repertoire_fragments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read repertoire_fragments" ON public.repertoire_fragments;
CREATE POLICY "Allow public read repertoire_fragments" ON public.repertoire_fragments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin modify repertoire_fragments" ON public.repertoire_fragments;
CREATE POLICY "Allow admin modify repertoire_fragments" ON public.repertoire_fragments FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

-- Insert default pieces
INSERT INTO public.repertoire_items (section, title, type, tempo_indication) VALUES
('Violines I', 'Danzón N°2', 'obra', 'Compases: Inicio a 34 / 86-93 / 115-121 / 238-249 / 288-297'),
('Violines II', 'Danzón N°2', 'obra', 'Compases: 25-34 / 74-93 / 158-165 / 244-249 / 288-297'),
('Violines III', 'Danzón N°2', 'obra', 'Compases: 25-34 / 158-165 / 288-297 / 346-353'),
('Violas', 'Danzón N°2', 'obra', 'Compases: 22-38 / 94-112 / 129-141 / 288-297'),
('Violoncellos', 'Danzón N°2', 'obra', 'Compases: Inicio a 12 / 63-70 / 113-120 / 142-152 / 349-357'),
('Contrabajos', 'Danzón N°2', 'obra', 'Compases: 1-13 / 121-129 / 142-152 / 315-323'),
('Flautas', 'Danzón N°2', 'obra', 'Compases: 122-129 / 238-249'),
('Oboes', 'Danzón N°2', 'obra', 'Compases: 4-13 / 34-42'),
('Clarinetes', 'Danzón N°2', 'obra', 'Compases: 1-13 / 66-70 / 133-146'),
('Cornos', 'Danzón N°2', 'obra', 'Compases: 52-60 / 166-173'),
('Trompetas', 'Danzón N°2', 'obra', 'Compases: 139-146 / 280-288'),
('Trombones', 'Danzón N°2', 'obra', 'Compases: 121-129 / 324-332'),
('Tuba', 'Danzón N°2', 'obra', 'Compases: 166-173 / 315-323'),
('Percusión', 'Danzón N°2', 'obra', 'Claves / Timbales / Piano')
ON CONFLICT (section, title, type) DO NOTHING;

-- Alter tables to add new columns if they do not exist
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS composer TEXT DEFAULT '';
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS arranger TEXT DEFAULT '';
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS time_signature TEXT DEFAULT '';
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS octaves TEXT DEFAULT '';
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS difficulty_level INT DEFAULT 1;
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.repertoire_items ADD COLUMN IF NOT EXISTS weight INT DEFAULT 16;

ALTER TABLE public.repertoire_fragments ADD COLUMN IF NOT EXISTS label TEXT DEFAULT '';
ALTER TABLE public.repertoire_fragments ADD COLUMN IF NOT EXISTS measures_start INT;
ALTER TABLE public.repertoire_fragments ADD COLUMN IF NOT EXISTS measures_end INT;
ALTER TABLE public.repertoire_fragments ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';


