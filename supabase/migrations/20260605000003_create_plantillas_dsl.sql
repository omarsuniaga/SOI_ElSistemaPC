-- Migration: create plantillas_dsl table
-- Description: Stores reusable DSL content templates for lesson planning,
-- replacing the hardcoded DSL_TEMPLATES array in planificacionView.js.

create table if not exists plantillas_dsl (
  id          uuid        primary key default gen_random_uuid(),
  nombre      text        not null,
  instrumento text        not null default 'General',
  descripcion text        not null default '',
  contenido   text        not null,
  activo      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable RLS
alter table plantillas_dsl enable row level security;

-- RLS policies: all authenticated users can read active templates
create policy "Lectura de plantillas activas"
  on plantillas_dsl
  for select
  to authenticated
  using (activo = true);

-- Only admin/coordinator roles can manage templates
create policy "Administración de plantillas"
  on plantillas_dsl
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

-- Updated_at trigger
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_plantillas_dsl_updated_at
  before update on plantillas_dsl
  for each row
  execute function trigger_set_updated_at();

-- Seed default templates
insert into plantillas_dsl (nombre, instrumento, descripcion, contenido) values
  (
    'Escala Mayor',
    'Piano / Guitarra',
    'Trabajo de escalas diatónicas mayores en posición cerrada.',
    '[Indicador] Ejecuta la escala de Do mayor en dos octavas con digitación correcta
[Indicador] Mantiene tempo estable con metrónomo a 60 bpm
{Actividad} Calentamiento de dedos: ejercicios de Hanon 5 min
{Actividad} Escala lenta con atención al peso del brazo
{Actividad} Escala en tempo progresivo hasta 80 bpm'
  ),
  (
    'Lectura a Primera Vista',
    'General',
    'Desarrollar la capacidad de leer y ejecutar partituras sin preparación previa.',
    '[Indicador] Lee correctamente las figuras rítmicas (negra, corchea, blanca)
[Indicador] Identifica la clave y armadura antes de comenzar
{Actividad} Análisis visual de 2 min antes de tocar
{Actividad} Ejecución a tempo lento sin parar
{Actividad} Revisión de errores y segunda lectura'
  ),
  (
    'Montaje de Repertorio',
    'General',
    'Proceso sistemático de aprendizaje de una obra musical.',
    '[Indicador] Memoriza la estructura formal de la obra (A-B-A)
[Indicador] Ejecuta las secciones complejas de manera fluida
{Actividad} División por secciones: aprender A, luego B
{Actividad} Trabajo de manos separadas en pasajes difíciles
{Actividad} Ensamble y trabajo de empalmes entre secciones'
  ),
  (
    'Teoría Musical Aplicada',
    'Teoría',
    'Integración de conceptos teóricos con la práctica instrumental.',
    '[Indicador] Identifica intervalos en el instrumento (2da, 3ra, 4ta, 5ta)
[Indicador] Construye y ejecuta acordes mayores y menores
{Actividad} Dictado rítmico (4 compases)
{Actividad} Identificación auditiva de intervalos
{Actividad} Construcción de acordes en el instrumento'
  );
