-- Migration 006: Fix RLS policy + create refresh_maestro_desempeno()
-- Fixes RLS to check raw_user_meta_data->>'rol' instead of raw_app_meta_data->>'role'
-- Also removes stale migration_005 references from previous migrations table

-- Fix RLS policy: consistent with es_admin() used by other tables
DROP POLICY IF EXISTS admin_read_md ON maestro_desempeno;

CREATE POLICY admin_read_md ON maestro_desempeno
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'admin'
        )
    );

-- Function to compute/recompute maestro_desempeno from registros_pendientes
CREATE OR REPLACE FUNCTION refresh_maestro_desempeno()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now timestamptz := now();
BEGIN
    INSERT INTO maestro_desempeno (
        maestro_id, total_sesiones, sesiones_verde, sesiones_amarillo,
        sesiones_naranja, sesiones_rojo, categoria, tendencia,
        fecha_ultima_evaluacion, pending_count, oldest_dias_atraso, updated_at
    )
    SELECT
        rp.maestro_id,
        COUNT(*)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) <= 1)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 2 AND 3)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 4 AND 6)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) >= 7)::int,
        CASE
            WHEN COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) >= 7) > 0 THEN 'negligente'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 4 AND 6) > 0 THEN 'incumplidor'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 2 AND 3) > 0 THEN 'regular'
            ELSE 'responsable'
        END,
        CASE
            WHEN COUNT(*) FILTER (WHERE rp.created_at >= v_now - INTERVAL '7 days') >
                 COUNT(*) FILTER (WHERE rp.created_at BETWEEN v_now - INTERVAL '14 days' AND v_now - INTERVAL '7 days')
            THEN 'empeorando'
            WHEN COUNT(*) FILTER (WHERE rp.created_at >= v_now - INTERVAL '7 days') <
                 COUNT(*) FILTER (WHERE rp.created_at BETWEEN v_now - INTERVAL '14 days' AND v_now - INTERVAL '7 days')
            THEN 'mejorando'
            ELSE 'estable'
        END,
        v_now,
        COUNT(*) FILTER (WHERE rp.estado = 'pendiente')::int,
        COALESCE(EXTRACT(DAY FROM v_now - MIN(rp.created_at) FILTER (WHERE rp.estado = 'pendiente')), 0)::int,
        v_now
    FROM registros_pendientes rp
    WHERE rp.estado = 'pendiente'
    GROUP BY rp.maestro_id
    ON CONFLICT (maestro_id) DO UPDATE SET
        total_sesiones = EXCLUDED.total_sesiones,
        sesiones_verde = EXCLUDED.sesiones_verde,
        sesiones_amarillo = EXCLUDED.sesiones_amarillo,
        sesiones_naranja = EXCLUDED.sesiones_naranja,
        sesiones_rojo = EXCLUDED.sesiones_rojo,
        categoria = EXCLUDED.categoria,
        tendencia = EXCLUDED.tendencia,
        fecha_ultima_evaluacion = EXCLUDED.fecha_ultima_evaluacion,
        pending_count = EXCLUDED.pending_count,
        oldest_dias_atraso = EXCLUDED.oldest_dias_atraso,
        updated_at = EXCLUDED.updated_at;

    -- Remove maestros without pending registros
    DELETE FROM maestro_desempeno md
    WHERE NOT EXISTS (
        SELECT 1 FROM registros_pendientes rp
        WHERE rp.maestro_id = md.maestro_id AND rp.estado = 'pendiente'
    )
    AND md.maestro_id IS NOT NULL;
END;
$$;
