-- 1. Redefinir la función maestro_actual() con tolerancia para desarrollo
CREATE OR REPLACE FUNCTION public.maestro_actual()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT id FROM public.maestros 
    WHERE user_id = auth.uid() 
       OR (user_id IS NULL AND id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefinir la función es_admin() para admitir administrador por correo y permiso
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->>'email' IN ('osuniagarivera@gmail.com')) OR
    public.tiene_permiso('admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Otorgar permisos de administración total a Omar Suniaga Rivera (con bypass temporal del trigger)
ALTER TABLE public.permisos_maestros DISABLE TRIGGER USER;

INSERT INTO public.permisos_maestros (maestro_id, puede_inscribir_clases, puede_registrar_alumnos, permisos)
VALUES ('dc73014a-9528-4081-84eb-f713b72031ff', true, true, ARRAY['admin', 'clases:write', 'clases:enroll'])
ON CONFLICT (maestro_id) DO UPDATE SET
  puede_inscribir_clases = true,
  puede_registrar_alumnos = true,
  permisos = ARRAY['admin', 'clases:write', 'clases:enroll'];

ALTER TABLE public.permisos_maestros ENABLE TRIGGER USER;

-- 4. Actualizar las políticas RLS en alumnos_clases
DROP POLICY IF EXISTS "alumnos_clases_insert" ON public.alumnos_clases;
DROP POLICY IF EXISTS "alumnos_clases_update" ON public.alumnos_clases;
DROP POLICY IF EXISTS "alumnos_clases_delete" ON public.alumnos_clases;

CREATE POLICY "alumnos_clases_insert" ON public.alumnos_clases
  FOR INSERT TO authenticated
  WITH CHECK (public.maestro_en_clase(clase_id) OR public.es_admin() OR public.tiene_permiso('clases:enroll') OR public.tiene_permiso('clases:write'));

CREATE POLICY "alumnos_clases_update" ON public.alumnos_clases
  FOR UPDATE TO authenticated
  USING (public.maestro_en_clase(clase_id) OR public.es_admin() OR public.tiene_permiso('clases:enroll') OR public.tiene_permiso('clases:write'))
  WITH CHECK (public.maestro_en_clase(clase_id) OR public.es_admin() OR public.tiene_permiso('clases:enroll') OR public.tiene_permiso('clases:write'));

CREATE POLICY "alumnos_clases_delete" ON public.alumnos_clases
  FOR DELETE TO authenticated
  USING (public.maestro_en_clase(clase_id) OR public.es_admin() OR public.tiene_permiso('clases:enroll') OR public.tiene_permiso('clases:write'));
