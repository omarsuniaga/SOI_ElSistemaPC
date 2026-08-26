-- Migration: 20260823220000_gastos_fijos_mensuales.sql
-- Description: Gastos fijos mensuales institucionales con ventana de pago
-- (día inicio - día fin) y generación idempotente de instancias por período.
-- Reemplaza el concepto de "servicios_recurrentes" (que solo vivía en estado
-- local del portal /soi-finanzas y se perdía al recargar) por tablas reales.
--
-- Nota: aplicada en vivo vía execute_sql (no vía apply_migration) durante la
-- sesión que la escribió — igual que varias migraciones recientes del
-- repositorio, este archivo documenta el esquema pero no aparece en el
-- historial de `supabase migration list`. Verificado manualmente: tablas,
-- RLS y la función de generación quedaron creadas y probadas contra un
-- registro de humo que se insertó y se borró en la misma sesión.

CREATE TABLE public.gastos_fijos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  categoria text NOT NULL CHECK (categoria IN ('comunicaciones','energia','agua','limpieza','personal','alquiler','software','seguro','otro')),
  centro_costo soi_departamento NOT NULL DEFAULT 'ADM',
  monto_centavos bigint NOT NULL CHECK (monto_centavos > 0),
  dia_inicio smallint NOT NULL CHECK (dia_inicio BETWEEN 1 AND 31),
  dia_fin smallint NOT NULL CHECK (dia_fin BETWEEN 1 AND 31 AND dia_fin >= dia_inicio),
  repetir_mensual boolean NOT NULL DEFAULT true,
  activo boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

CREATE TABLE public.gastos_fijos_pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_fijo_id uuid NOT NULL REFERENCES public.gastos_fijos(id) ON DELETE CASCADE,
  periodo_anio integer NOT NULL,
  periodo_mes integer NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  monto_centavos bigint NOT NULL CHECK (monto_centavos > 0),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado')),
  fecha_pago date,
  referencia text,
  registrado_por uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gasto_fijo_id, periodo_anio, periodo_mes)
);

CREATE INDEX idx_gastos_fijos_pagos_gasto ON public.gastos_fijos_pagos(gasto_fijo_id);

ALTER TABLE public.gastos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_fijos_pagos ENABLE ROW LEVEL SECURITY;

-- RLS: get_user_role() (lee profiles.rol) es el helper realmente usado en
-- producción por cuotas/pagos/familias/becas — no public.es_rol(...), que
-- aparece en la migración 20260823192500_programa_becas_patrocinios.sql
-- pero nunca llegó a aplicarse (esa tabla no existe en la base real).
CREATE POLICY gastos_fijos_select_finanzas_admin
  ON public.gastos_fijos FOR SELECT
  USING (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY gastos_fijos_insert_finanzas_admin
  ON public.gastos_fijos FOR INSERT
  WITH CHECK (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY gastos_fijos_update_admin
  ON public.gastos_fijos FOR UPDATE
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY gastos_fijos_pagos_select_finanzas_admin
  ON public.gastos_fijos_pagos FOR SELECT
  USING (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY gastos_fijos_pagos_insert_finanzas_admin
  ON public.gastos_fijos_pagos FOR INSERT
  WITH CHECK (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY gastos_fijos_pagos_update_finanzas_admin
  ON public.gastos_fijos_pagos FOR UPDATE
  USING (get_user_role() = ANY (ARRAY['finanzas','admin']))
  WITH CHECK (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE OR REPLACE FUNCTION public.fn_generar_instancias_gastos_fijos(p_mes integer, p_anio integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count int := 0;
  v_gasto RECORD;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes must be between 1 and 12, got %', p_mes;
  END IF;

  FOR v_gasto IN
    SELECT id, monto_centavos FROM public.gastos_fijos
    WHERE activo = true AND repetir_mensual = true
  LOOP
    INSERT INTO public.gastos_fijos_pagos (gasto_fijo_id, periodo_anio, periodo_mes, monto_centavos)
    VALUES (v_gasto.id, p_anio, p_mes, v_gasto.monto_centavos)
    ON CONFLICT (gasto_fijo_id, periodo_anio, periodo_mes) DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.fn_generar_instancias_gastos_fijos(integer, integer) TO authenticated;
