-- Migration: Fix RLS for postulantes to allow authenticated users (maestros/admins) to UPDATE and DELETE records.
-- Previously, only SELECT was allowed for 'authenticated', while INSERT/UPDATE/DELETE were restricted to 'service_role'.
-- This blocked the frontend admission module from updating status, adding notes, or deleting candidates.

-- 1. Permite a los usuarios autenticados actualizar postulantes (cambiar estado, agendar citas, notas)
CREATE POLICY postulantes_update_authenticated ON public.postulantes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Permite a los usuarios autenticados eliminar postulantes
CREATE POLICY postulantes_delete_authenticated ON public.postulantes
    FOR DELETE
    TO authenticated
    USING (true);
