-- Migration: 20260823192500_programa_becas_patrocinios.sql
-- Description: Módulo de Programa de Becas, Exoneraciones y Patrocinios.

CREATE TABLE IF NOT EXISTS public.programas_beneficio (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('beca', 'exoneracion', 'patrocinio')),
  porcentaje_cobertura integer NOT NULL CHECK (porcentaje_cobertura >= 0 AND porcentaje_cobertura <= 100),
  aplica_matricula boolean NOT NULL DEFAULT false,
  aplica_mensualidad boolean NOT NULL DEFAULT true,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT programas_beneficio_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.patrocinadores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  tipo_entidad text NOT NULL CHECK (tipo_entidad IN ('empresa', 'fundacion', 'individuo', 'institucion')),
  contacto_nombre text,
  contacto_email text,
  contacto_telefono text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patrocinadores_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.alumnos_beneficios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  programa_id uuid NOT NULL REFERENCES public.programas_beneficio(id),
  patrocinador_id uuid REFERENCES public.patrocinadores(id),
  estado text NOT NULL CHECK (estado IN ('solicitado', 'activo', 'suspendido', 'revocado', 'vencido', 'rechazado')) DEFAULT 'solicitado',
  fecha_inicio date NOT NULL,
  fecha_fin date,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alumnos_beneficios_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.programas_beneficio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos_beneficios ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para administradores y personal de finanzas
CREATE POLICY "Admins y finanzas pueden ver programas_beneficio"
  ON public.programas_beneficio FOR SELECT
  USING (
    public.es_rol('superadmin') OR 
    public.es_rol('admin') OR 
    public.es_rol('finanzas') OR 
    public.es_rol('direccion')
  );

CREATE POLICY "Admins y finanzas pueden gestionar programas_beneficio"
  ON public.programas_beneficio FOR ALL
  USING (
    public.es_rol('superadmin') OR 
    public.es_rol('admin') OR 
    public.es_rol('finanzas')
  );

CREATE POLICY "Admins y finanzas pueden ver patrocinadores"
  ON public.patrocinadores FOR SELECT
  USING (
    public.es_rol('superadmin') OR 
    public.es_rol('admin') OR 
    public.es_rol('finanzas') OR 
    public.es_rol('direccion')
  );

CREATE POLICY "Admins y finanzas pueden gestionar patrocinadores"
  ON public.patrocinadores FOR ALL
  USING (
    public.es_rol('superadmin') OR 
    public.es_rol('admin') OR 
    public.es_rol('finanzas')
  );

CREATE POLICY "Admins, finanzas y maestros pueden ver beneficios asignados"
  ON public.alumnos_beneficios FOR SELECT
  USING (
    public.es_rol('superadmin') OR 
    public.es_rol('admin') OR 
    public.es_rol('finanzas') OR 
    public.es_rol('direccion') OR
    public.es_rol('maestro')
  );

CREATE POLICY "Admins y finanzas pueden gestionar asignaciones de beneficios"
  ON public.alumnos_beneficios FOR ALL
  USING (
    public.es_rol('superadmin') OR 
    public.es_rol('admin') OR 
    public.es_rol('finanzas')
  );

-- Modificamos fn_generar_ciclo_cuotas para tener en cuenta a los alumnos con beneficios activos
CREATE OR REPLACE FUNCTION public.fn_generar_ciclo_cuotas(p_mes integer, p_anio integer, p_monto_centavos bigint DEFAULT 60000)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count       int := 0;
  v_familia     RECORD;
  v_alumno      RECORD;
  v_beneficio   RECORD;
  v_vencimiento date;
  v_monto_base  bigint;
  v_monto_final bigint;
  v_descuento   bigint;
  v_estado      text;
  v_metadatos   jsonb;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes must be between 1 and 12, got %', p_mes;
  END IF;

  v_vencimiento := make_date(p_anio, p_mes, 5);

  FOR v_familia IN
    SELECT id FROM public.familias WHERE activa = true
  LOOP
    FOR v_alumno IN
      SELECT id FROM public.alumnos
      WHERE familia_id = v_familia.id AND activo = true
    LOOP
      
      -- Reset variables para cada alumno
      v_monto_base := p_monto_centavos;
      v_monto_final := p_monto_centavos;
      v_descuento := 0;
      v_estado := 'pendiente';
      v_metadatos := '{}'::jsonb;
      
      -- Consultar si tiene un beneficio activo para el mes en curso
      -- Asumimos que si fecha_fin es null, el beneficio es indefinido.
      SELECT ab.id as beneficio_id, pb.id as programa_id, pb.nombre as programa_nombre, 
             pb.tipo, pb.porcentaje_cobertura
        INTO v_beneficio
        FROM public.alumnos_beneficios ab
        JOIN public.programas_beneficio pb ON ab.programa_id = pb.id
       WHERE ab.alumno_id = v_alumno.id
         AND ab.estado = 'activo'
         AND pb.aplica_mensualidad = true
         AND ab.fecha_inicio <= v_vencimiento
         AND (ab.fecha_fin IS NULL OR ab.fecha_fin >= v_vencimiento)
       ORDER BY pb.porcentaje_cobertura DESC
       LIMIT 1;
       
      IF FOUND THEN
         v_descuento := (v_monto_base * v_beneficio.porcentaje_cobertura) / 100;
         v_monto_final := v_monto_base - v_descuento;
         
         -- Actualizamos los metadatos para rastreo
         v_metadatos := jsonb_build_object(
           'becaId', v_beneficio.programa_id,
           'becaNombre', v_beneficio.programa_nombre,
           'beneficio_asignacion_id', v_beneficio.beneficio_id,
           'porcentaje_cobertura', v_beneficio.porcentaje_cobertura
         );
         
         IF v_monto_final <= 0 THEN
            IF v_beneficio.tipo = 'exoneracion' THEN
               v_estado := 'exonerada';
            ELSE
               v_estado := 'becada';
            END IF;
         END IF;
      END IF;

      INSERT INTO public.cuotas (
        familia_id, alumno_id, concepto,
        monto_base_centavos, monto_final_centavos, descuento_centavos,
        fecha_generacion, fecha_vencimiento,
        ciclo_mes, ciclo_anio, estado, metadatos
      )
      VALUES (
        v_familia.id, v_alumno.id, 'mensualidad',
        v_monto_base, v_monto_final, v_descuento,
        CURRENT_DATE, v_vencimiento,
        p_mes, p_anio, v_estado, v_metadatos
      )
      ON CONFLICT (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto)
      DO NOTHING;

      IF FOUND THEN
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$function$;
