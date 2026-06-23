-- ============================================================
-- Addendum: caja-fundacion verify fixes
-- C-01: cierres_caja table (S-27 unique-per-day constraint)
-- W-01: wallet_status ENUM + status/congelada_en on wallet_config (S-22/S-23)
-- ============================================================

-- C-01: cierres_caja
DO $$ BEGIN
  CREATE TYPE public.cierre_caja_estado AS ENUM ('borrador', 'cerrado', 'auditado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.cierres_caja (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha                date NOT NULL,
  cajero_id            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_general        decimal(10,2) NOT NULL DEFAULT 0,
  por_metodo           jsonb DEFAULT '{}',
  cantidad_transacciones int NOT NULL DEFAULT 0,
  estado               cierre_caja_estado NOT NULL DEFAULT 'cerrado',
  notas                text,
  created_at           timestamptz DEFAULT now(),
  CONSTRAINT cierres_caja_fecha_unique UNIQUE (fecha)
);

CREATE INDEX IF NOT EXISTS idx_cierres_caja_fecha ON public.cierres_caja (fecha DESC);

ALTER TABLE public.cierres_caja ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cierres_caja_select_cajero_admin ON public.cierres_caja;
DROP POLICY IF EXISTS cierres_caja_insert_cajero_admin ON public.cierres_caja;
DROP POLICY IF EXISTS cierres_caja_update_admin        ON public.cierres_caja;

CREATE POLICY cierres_caja_select_cajero_admin ON public.cierres_caja
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY cierres_caja_insert_cajero_admin ON public.cierres_caja
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY cierres_caja_update_admin ON public.cierres_caja
  FOR UPDATE USING (get_user_role() = 'admin');

-- W-01: wallet_status ENUM + columns on wallet_config
DO $$ BEGIN
  CREATE TYPE public.wallet_status AS ENUM ('operativa', 'congelada', 'devuelta');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.wallet_config
  ADD COLUMN IF NOT EXISTS status public.wallet_status NOT NULL DEFAULT 'operativa';

ALTER TABLE public.wallet_config
  ADD COLUMN IF NOT EXISTS congelada_en timestamptz;

ALTER TABLE public.wallet_config
  ADD COLUMN IF NOT EXISTS devuelta_en timestamptz;
