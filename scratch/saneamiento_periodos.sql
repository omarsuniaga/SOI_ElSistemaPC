-- 1. Dejar activo EXCLUSIVAMENTE el período representativo "Período Actual" (ID: 98ac2880-ddfa-4979-97eb-7f0a00f5c83e)
UPDATE public.periodos 
SET activo = false 
WHERE id != '98ac2880-ddfa-4979-97eb-7f0a00f5c83e';

-- 2. Garantizar que por lo menos el periodo representativo esté como activo por si acaso
UPDATE public.periodos
SET activo = true
WHERE id = '98ac2880-ddfa-4979-97eb-7f0a00f5c83e';

-- 3. Crear el índice único parcial para impedir físicamente la duplicidad de periodos activos en el futuro
DROP INDEX IF EXISTS public.idx_periodo_activo_unico;

CREATE UNIQUE INDEX idx_periodo_activo_unico 
ON public.periodos (activo) 
WHERE (activo = true);
