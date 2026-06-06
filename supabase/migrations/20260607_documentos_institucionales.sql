-- ══════════════════════════════════════════════════════════════════
-- Etapa 4 — Motor Documental Institucional
-- ══════════════════════════════════════════════════════════════════

-- 1. Escolaridad anual del alumno
CREATE TABLE IF NOT EXISTS public.alumno_escolaridad (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id           UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  centro_estudios     TEXT,
  grado_nivel         TEXT,
  seccion             TEXT,
  anio_escolar        TEXT,
  director_institucion TEXT,
  cargo_director      TEXT DEFAULT 'Director/a',
  telefono_centro     TEXT,
  correo_centro       TEXT,
  direccion_centro    TEXT,
  activo              BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Plantillas documentales
CREATE TABLE IF NOT EXISTS public.document_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  descripcion TEXT,
  contenido   TEXT NOT NULL,
  variables   TEXT[] DEFAULT '{}',
  estado      TEXT NOT NULL DEFAULT 'activa'
              CHECK (estado IN ('activa', 'inactiva', 'archivada')),
  version     INTEGER NOT NULL DEFAULT 1,
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lotes de generación masiva
CREATE TABLE IF NOT EXISTS public.document_batches (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                     TEXT NOT NULL,
  titulo                   TEXT NOT NULL,
  grupo_tipo               TEXT,
  grupo_id                 UUID,
  grupo_nombre             TEXT,
  actividad_nombre         TEXT,
  fecha_actividad          DATE,
  lugar_actividad          TEXT,
  total_alumnos            INTEGER DEFAULT 0,
  total_generados          INTEGER DEFAULT 0,
  total_con_advertencias   INTEGER DEFAULT 0,
  total_excluidos          INTEGER DEFAULT 0,
  estado                   TEXT NOT NULL DEFAULT 'borrador'
                           CHECK (estado IN ('borrador', 'generado', 'archivado', 'anulado')),
  generado_por             UUID,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  generated_at             TIMESTAMPTZ
);

-- 4. Documentos individuales generados
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id            UUID REFERENCES public.document_batches(id) ON DELETE SET NULL,
  template_id         UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  tipo                TEXT NOT NULL,
  titulo              TEXT NOT NULL,
  alumno_id           UUID REFERENCES public.alumnos(id) ON DELETE SET NULL,
  alumno_nombre       TEXT,
  grupo_nombre        TEXT,
  actividad_nombre    TEXT,
  contenido_final     TEXT NOT NULL,
  variables_usadas    JSONB DEFAULT '{}',
  variables_faltantes JSONB DEFAULT '[]',
  advertencias        JSONB DEFAULT '[]',
  pdf_url             TEXT,
  estado              TEXT NOT NULL DEFAULT 'borrador'
                      CHECK (estado IN ('borrador', 'generado', 'archivado', 'anulado')),
  generado_por        UUID,
  generated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS
ALTER TABLE public.alumno_escolaridad    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_batches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_alumno_escolaridad_all"  ON public.alumno_escolaridad  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_document_templates_all"  ON public.document_templates  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_document_batches_all"    ON public.document_batches    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_generated_documents_all" ON public.generated_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Plantillas base
INSERT INTO public.document_templates (nombre, tipo, descripcion, contenido, variables, estado)
SELECT * FROM (VALUES
  (
    'Permiso de Ausencia Escolar',
    'permiso_ausencia_escolar',
    'Solicitud formal de permiso de ausencia escolar para actividad institucional',
    E'Punta Cana, {fecha_actual}\n\nPara: {director_institucion}\n{cargo_director}\nCentro Educativo: {centro_estudios}\n\nAsunto: Solicitud de permiso de ausencia\n\nEstimado/a {director_institucion}:\n\nPor medio de la presente, El Sistema Punta Cana, programa de formación musical de la {nombre_fundacion}, solicita respetuosamente el permiso de ausencia del alumno/a {nombre_alumno}, cursante de {grado}, sección {seccion}, quien forma parte activa de nuestra institución.\n\nEl motivo de la presente solicitud es la participación del alumno/a en {nombre_actividad}, a realizarse el día {fecha_actividad} en {lugar_actividad}.\n\n{motivo_permiso}\n\nAgradecemos de antemano su comprensión, apoyo y colaboración con la formación musical de nuestros estudiantes.\n\nAtentamente,\n\n\n{responsable_institucional}\n{nombre_institucion}',
    ARRAY['{fecha_actual}','{director_institucion}','{cargo_director}','{centro_estudios}','{nombre_alumno}','{grado}','{seccion}','{nombre_actividad}','{fecha_actividad}','{lugar_actividad}','{motivo_permiso}','{responsable_institucional}','{nombre_institucion}','{nombre_fundacion}'],
    'activa'
  ),
  (
    'Autorización de Viaje Nacional',
    'autorizacion_viaje_nacional',
    'Autorización del representante para viaje o actividad fuera de Punta Cana',
    E'Punta Cana, {fecha_actual}\n\nAUTORIZACIÓN DE VIAJE / ACTIVIDAD\n\nYo, {nombre_representante}, portador/a de la cédula {cedula_representante}, en mi condición de representante del/la alumno/a {nombre_alumno}, quien forma parte del programa musical {nombre_institucion}, por medio de la presente autorizo su participación en la actividad:\n\nActividad: {nombre_actividad}\nFecha: {fecha_actividad}\nLugar: {lugar_actividad}\nHora de salida: {hora_salida}\nHora estimada de regreso: {hora_regreso}\nResponsable institucional: {responsable_institucional}\n\n{observaciones_actividad}\n\nSeleccione:\n[  ] Sí autorizo la participación de mi representado/a en la actividad descrita\n[  ] No autorizo\n\nFirma del representante: ___________________________\n\nNombre: {nombre_representante}\nCédula: {cedula_representante}\nTeléfono: {telefono_representante}\nFecha: {fecha_actual}',
    ARRAY['{fecha_actual}','{nombre_representante}','{cedula_representante}','{nombre_alumno}','{nombre_institucion}','{nombre_actividad}','{fecha_actividad}','{lugar_actividad}','{hora_salida}','{hora_regreso}','{responsable_institucional}','{telefono_representante}','{observaciones_actividad}'],
    'activa'
  ),
  (
    'Carta a Representante',
    'carta_representante',
    'Comunicación institucional general al representante del alumno',
    E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\nPor medio de la presente, el equipo de {nombre_institucion} se dirige a usted en calidad de representante del/la alumno/a {nombre_alumno}, para comunicarle lo siguiente:\n\n{motivo_permiso}\n\nPara cualquier consulta o aclaración, puede comunicarse con nosotros a través de nuestros canales institucionales.\n\nAgradecemos su atención y colaboración.\n\nAtentamente,\n\n\n{responsable_institucional}\n{nombre_institucion}',
    ARRAY['{fecha_actual}','{nombre_representante}','{nombre_alumno}','{nombre_institucion}','{motivo_permiso}','{responsable_institucional}'],
    'activa'
  ),
  (
    'Amonestación Leve',
    'amonestacion_leve',
    'Plantilla base — disponible para configuración futura, no automatizar',
    E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\nPor medio de la presente, comunicamos que el/la alumno/a {nombre_alumno} ha recibido una amonestación leve en el marco del reglamento interno de {nombre_institucion}.\n\n{motivo_permiso}\n\nEsta comunicación es de carácter informativo.\n\nAtentamente,\n{responsable_institucional}',
    ARRAY['{fecha_actual}','{nombre_representante}','{nombre_alumno}','{nombre_institucion}','{motivo_permiso}','{responsable_institucional}'],
    'inactiva'
  ),
  (
    'Amonestación Moderada',
    'amonestacion_moderada',
    'Plantilla base — disponible para configuración futura, no automatizar',
    E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\nInformamos formalmente que el/la alumno/a {nombre_alumno} ha recibido una amonestación de carácter moderado conforme al reglamento interno de {nombre_institucion}.\n\n{motivo_permiso}\n\nSolicitamos su presencia para una reunión con el coordinador pedagógico.\n\nAtentamente,\n{responsable_institucional}',
    ARRAY['{fecha_actual}','{nombre_representante}','{nombre_alumno}','{nombre_institucion}','{motivo_permiso}','{responsable_institucional}'],
    'inactiva'
  ),
  (
    'Amonestación Grave',
    'amonestacion_grave',
    'Plantilla base — disponible para configuración futura, no automatizar',
    E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\nNotificamos formalmente que el/la alumno/a {nombre_alumno} ha incurrido en una falta grave conforme al reglamento de {nombre_institucion}.\n\n{motivo_permiso}\n\nRequerimos su presencia urgente en la institución.\n\nAtentamente,\n{responsable_institucional}',
    ARRAY['{fecha_actual}','{nombre_representante}','{nombre_alumno}','{nombre_institucion}','{motivo_permiso}','{responsable_institucional}'],
    'inactiva'
  )
) AS t(nombre, tipo, descripcion, contenido, variables, estado)
WHERE NOT EXISTS (
  SELECT 1 FROM public.document_templates WHERE nombre = t.nombre
);
