-- Migration: create plantillas_planificacion table
-- Description: Stores reusable planning templates (objetivos, contenido, recursos,
-- evaluacion_metodo) replacing the hardcoded PLANTILLAS_PLANIFICACION array in
-- planificacionModal.js.

create table if not exists plantillas_planificacion (
  id              text        primary key,
  nombre          text        not null,
  objetivos       text        not null default '',
  contenido       text        not null default '',
  recursos        text        not null default '',
  evaluacion_metodo text     not null default '',
  activo          boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Enable RLS
alter table plantillas_planificacion enable row level security;

-- RLS policies: all authenticated users can read active templates
create policy "Lectura de plantillas de planificación activas"
  on plantillas_planificacion
  for select
  to authenticated
  using (activo = true);

-- Only admin/coordinator roles can manage templates
create policy "Administración de plantillas de planificación"
  on plantillas_planificacion
  for all
  to authenticated
  using (
    coalesce(
      current_setting('request.jwt.claims', true)::json->>'role',
      ''
    ) in ('admin', 'coordinador')
  )
  with check (
    coalesce(
      current_setting('request.jwt.claims', true)::json->>'role',
      ''
    ) in ('admin', 'coordinador')
  );

-- Updated_at trigger (reuses function from previous migration)
create trigger set_plantillas_planificacion_updated_at
  before update on plantillas_planificacion
  for each row
  execute function trigger_set_updated_at();

-- Seed default templates (matches PLANTILLAS_PLANIFICACION)
insert into plantillas_planificacion (id, nombre, objetivos, contenido, recursos, evaluacion_metodo) values
  (
    'tecnica', 'Técnica',
    'Desarrollar la técnica instrumental del alumno.\n- Postura correcta\n- Digitación\n- Control del tempo\n- Calidad del sonido',
    'Ejercicios de técnica:\n1. Escalas mayores y menores\n2. Arpegios\n3. Ejercicios de digitación\n4. Estudios técnicos',
    'Método del nivel, estudios técnicos, metrónomo',
    'Observación directa, ejecución de escalas sin errores'
  ),
  (
    'teoria', 'Teoría Musical',
    'Comprender los fundamentos teóricos de la música.\n- Lectura rítmica\n- Reconocimiento de intervalos\n- Armonía básica\n- Análisis de obras',
    'Contenidos:\n1. Teoría musical básica\n2. Lectura a primera vista\n3. Dictado melódico\n4. Análisis armónico',
    'Libro de teoría, cuaderno de ejercicios, pizarra',
    'Prueba escrita, lectura a primera vista, dictados'
  ),
  (
    'repertorio', 'Repertorio',
    'Desarrollar el repertorio musical del alumno.\n- Interpretación de obras\n- Expresión musical\n- Memorización\n- Presentación en público',
    'Obras del programa:\n1. Pieza de repertorio\n2. Ejercicios de interpretación\n3. Trabajo de dinámica y fraseo\n4. Práctica con acompañamiento',
    'Partituras, grabaciones de referencia, piano acompañante',
    'Audición interna, evaluación de interpretación'
  ),
  (
    'improvisacion', 'Improvisación',
    'Fomentar la creatividad musical y la improvisación.\n- Exploración sonora\n- Improvisación libre\n- Improvisación estructurada\n- Composición guiada',
    'Actividades:\n1. Ejercicios de exploración sonora\n2. Improvisación libre\n3. Improvisación sobre cambios armónicos\n4. Composición guiada',
    'Instrumento, pistas de acompañamiento, grabadora',
    'Observación de creatividad, coherencia musical'
  ),
  (
    'audicion', 'Audición',
    'Desarrollar la capacidad de escuchar y analizar música.\n- Escucha activa\n- Identificación de elementos\n- Análisis formal\n- Reseñas musicales',
    'Actividades:\n1. Audición de obras del repertorio\n2. Identificación de instrumentos\n3. Análisis de forma y estructura\n4. Discusión y reseña',
    'Audio, videos, partituras de referencia',
    'Participación en discusión, trabajo escrito'
  ),
  (
    'blanco', 'En blanco',
    '', '', '', ''
  );
