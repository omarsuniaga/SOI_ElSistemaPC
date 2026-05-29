-- Migration: Backfill alumnos from postulantes data
-- Matching: primary by email (correo = correo_representante), fallback by normalized nombre_completo
-- Security: SECURITY DEFINER so the function bypasses RLS (postulantes UPDATE is service_role-only)
-- Usage:  SELECT * FROM backfill_alumnos_desde_postulantes();
-- Preview: SELECT * FROM backfill_alumnos_desde_postulantes(true);  -- dry-run, no writes

CREATE OR REPLACE FUNCTION public.backfill_alumnos_desde_postulantes(dry_run BOOLEAN DEFAULT false)
RETURNS TABLE(
  alumno_id         UUID,
  alumno_nombre     TEXT,
  postulante_id     UUID,
  postulante_nombre TEXT,
  match_tipo        TEXT,
  campos_llenados   INT,
  accion            TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  filled INT;
  cols   TEXT[];
BEGIN
  FOR r IN
    WITH matches AS (
      SELECT
        a.id               AS a_id,
        a.nombre_completo  AS a_nombre,
        a.correo_representante AS a_correo,
        p.id               AS p_id,
        p.nombre_completo  AS p_nombre,
        p.correo           AS p_correo,
        CASE
          WHEN a.correo_representante IS NOT NULL
           AND a.correo_representante <> ''
           AND lower(trim(a.correo_representante)) = lower(trim(p.correo))
          THEN 'email'
          WHEN (a.correo_representante IS NULL OR a.correo_representante = '')
           AND lower(regexp_replace(trim(a.nombre_completo), '\s+', ' ', 'g'))
             = lower(regexp_replace(trim(p.nombre_completo), '\s+', ' ', 'g'))
          THEN 'nombre'
          ELSE NULL
        END AS match_tipo
      FROM alumnos a
      JOIN postulantes p ON
        (lower(trim(a.correo_representante)) = lower(trim(p.correo))
         AND a.correo_representante IS NOT NULL AND a.correo_representante <> '')
        OR
        (lower(regexp_replace(trim(a.nombre_completo), '\s+', ' ', 'g'))
         = lower(regexp_replace(trim(p.nombre_completo), '\s+', ' ', 'g'))
         AND (a.correo_representante IS NULL OR a.correo_representante = ''))
      WHERE p.estado IS DISTINCT FROM 'inscrito'
         OR p.alumno_id IS DISTINCT FROM a.id
    )
    SELECT *
    FROM matches
    WHERE matches.match_tipo IS NOT NULL
    ORDER BY matches.match_tipo  -- email matches first
  LOOP
    filled := 0;

    -- Build column list dynamically for dry-run detail
    IF NOT dry_run THEN
      UPDATE alumnos SET
        fecha_nacimiento         = COALESCE(alumnos.fecha_nacimiento,        (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id)),
        nacionalidad             = COALESCE(alumnos.nacionalidad,            (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id)),
        sector_calle_numero      = COALESCE(alumnos.sector_calle_numero,     (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id)),
        madre_nombre             = COALESCE(alumnos.madre_nombre,            (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        madre_tlf_whatsapp       = COALESCE(alumnos.madre_tlf_whatsapp,      (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        padre_nombre             = COALESCE(alumnos.padre_nombre,            (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        padre_tlf_whatsapp       = COALESCE(alumnos.padre_tlf_whatsapp,      (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        representante_parentesco = COALESCE(alumnos.representante_parentesco,(SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id)),
        acepta_pago_600          = COALESCE(alumnos.acepta_pago_600,         (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id)),
        autoriza_fotos_redes     = COALESCE(alumnos.autoriza_fotos_redes,    (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id))
      WHERE id = r.a_id;

      -- Count how many were actually filled (non-null in postulante, was null/empty in alumno)
      SELECT COUNT(*) INTO filled
      FROM (
        SELECT unnest(ARRAY[
          CASE WHEN (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.fecha_nacimiento         FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.nacionalidad             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.sector_calle_numero      FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.representante_parentesco FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.acepta_pago_600          FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.autoriza_fotos_redes     FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END
        ])
      ) AS vals(v)
      WHERE v IS NOT NULL;

      -- Mark the postulante as inscribed
      UPDATE postulantes SET
        estado    = 'inscrito',
        alumno_id = r.a_id,
        updated_at = NOW()
      WHERE id = r.p_id
        AND (estado IS DISTINCT FROM 'inscrito' OR postulantes.alumno_id IS DISTINCT FROM r.a_id);
    END IF;

    RETURN QUERY SELECT
      r.a_id,
      r.a_nombre,
      r.p_id,
      r.p_nombre,
      r.match_tipo,
      filled,
      CASE WHEN dry_run THEN 'preview' ELSE 'updated' END;
  END LOOP;

  -- Also handle postulantes that are ALREADY linked (alumno_id already set) but may have new data
  FOR r IN
    SELECT
      a.id               AS a_id,
      a.nombre_completo  AS a_nombre,
      p.id               AS p_id,
      p.nombre_completo  AS p_nombre,
      'ya_vinculado'     AS match_tipo
    FROM postulantes p
    JOIN alumnos a ON a.id = p.alumno_id
    WHERE p.estado = 'inscrito'
      AND p.alumno_id IS NOT NULL
      AND (a.fecha_nacimiento IS NULL
        OR a.nacionalidad IS NULL
        OR a.madre_nombre IS NULL
        OR a.padre_nombre IS NULL)
  LOOP
    filled := 0;

    IF NOT dry_run THEN
      UPDATE alumnos SET
        fecha_nacimiento         = COALESCE(alumnos.fecha_nacimiento,        (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id)),
        nacionalidad             = COALESCE(alumnos.nacionalidad,            (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id)),
        sector_calle_numero      = COALESCE(alumnos.sector_calle_numero,     (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id)),
        madre_nombre             = COALESCE(alumnos.madre_nombre,            (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        madre_tlf_whatsapp       = COALESCE(alumnos.madre_tlf_whatsapp,      (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        padre_nombre             = COALESCE(alumnos.padre_nombre,            (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        padre_tlf_whatsapp       = COALESCE(alumnos.padre_tlf_whatsapp,      (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        representante_parentesco = COALESCE(alumnos.representante_parentesco,(SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id)),
        acepta_pago_600          = COALESCE(alumnos.acepta_pago_600,         (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id)),
        autoriza_fotos_redes     = COALESCE(alumnos.autoriza_fotos_redes,    (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id))
      WHERE id = r.a_id;

      SELECT COUNT(*) INTO filled
      FROM (
        SELECT unnest(ARRAY[
          CASE WHEN (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.fecha_nacimiento         FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.nacionalidad             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.sector_calle_numero      FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.representante_parentesco FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.acepta_pago_600          FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.autoriza_fotos_redes     FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END
        ])
      ) AS vals(v)
      WHERE v IS NOT NULL;
    END IF;

    RETURN QUERY SELECT
      r.a_id,
      r.a_nombre,
      r.p_id,
      r.p_nombre,
      r.match_tipo,
      filled,
      CASE WHEN dry_run THEN 'preview' ELSE 'updated' END;
  END LOOP;
END;
$$;

-- Prevent duplicate postulantes from repeated syncs
-- The sync function upserts on (correo, nombre_completo) instead of id
ALTER TABLE public.postulantes ADD CONSTRAINT postulantes_submission_key UNIQUE (correo, nombre_completo);

-- Grant execute to authenticated users (maestros with JWT)
REVOKE ALL ON FUNCTION public.backfill_alumnos_desde_postulantes(BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backfill_alumnos_desde_postulantes(BOOLEAN) TO authenticated;
