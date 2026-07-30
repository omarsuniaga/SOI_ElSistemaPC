-- Migration: Crear tabla plantillas_planificacion y politicas RLS
CREATE TABLE IF NOT EXISTS public.plantillas_planificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    objetivos TEXT,
    contenido TEXT,
    recursos TEXT,
    evaluacion_metodo TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.plantillas_planificacion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de lectura y escritura para public
DROP POLICY IF EXISTS plantillas_planificacion_read_all ON public.plantillas_planificacion;
CREATE POLICY plantillas_planificacion_read_all ON public.plantillas_planificacion FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS plantillas_planificacion_insert_all ON public.plantillas_planificacion;
CREATE POLICY plantillas_planificacion_insert_all ON public.plantillas_planificacion FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS plantillas_planificacion_update_all ON public.plantillas_planificacion;
CREATE POLICY plantillas_planificacion_update_all ON public.plantillas_planificacion FOR UPDATE TO public USING (true);

-- Insertar plantillas predeterminadas
INSERT INTO public.plantillas_planificacion (nombre, objetivos, contenido, recursos, evaluacion_metodo)
VALUES 
('Planificación Estándar de Técnica de Violín', 'Desarrollar postura, afinación y control de arco.', '1. Escalas e intervalos en primera posición.\n2. Estudios de Sevcik/Schradieck.\n3. Repertorio designado.', 'Atril, afinador, metrónomo, partitura.', 'Evaluación continua en clase y audición periódica.'),
('Planificación Inicial de Lenguaje Musical', 'Reconocimiento rítmico e identificación de notas en clave de Sol.', '1. Lectura rítmica solfeo rítmico.\n2. Dictado melódico sencillo.\n3. Canto de intervalos básicos.', 'Pizarra, teclado, cuadernos de pentagrama.', 'Pruebas rítmicas individuales y participación.')
ON CONFLICT DO NOTHING;
