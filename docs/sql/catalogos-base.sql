-- ============================================================
-- CATÁLOGOS EDITABLES PARA AUTOCOMPLETADO DSL
-- Tabla de configuración editable por área académica
-- ============================================================

-- Tabla de catálogos
CREATE TABLE IF NOT EXISTS catalogos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('contenidos', 'medidas', 'sugerencias', 'tareas', 'objetivos')),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    codigo TEXT,  -- Para medidas técnicas: $Tecnica_mano_derecha
    categoria TEXT,  -- Agrupación opcional
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_catalogos_tipo ON catalogos(tipo);
CREATE INDEX IF NOT EXISTS idx_catalogos_activo ON catalogos(activo);

-- ============================================================
-- SEED: Catálogo completo de Contenidos Musicales
-- ============================================================

INSERT INTO catalogos (tipo, nombre, descripcion, orden) VALUES
-- ESCALAS
('contenidos', 'Escala Do Mayor', 'Escala en tonalidad de Do Mayor', 1),
('contenidos', 'Escala Re Mayor', 'Escala en tonalidad de Re Mayor', 2),
('contenidos', 'Escala Mi Mayor', 'Escala en tonalidad de Mi Mayor', 3),
('contenidos', 'Escala Fa Mayor', 'Escala en tonalidad de Fa Mayor', 4),
('contenidos', 'Escala Sol Mayor', 'Escala en tonalidad de Sol Mayor', 5),
('contenidos', 'Escala La Mayor', 'Escala en tonalidad de La Mayor', 6),
('contenidos', 'Escala Si Mayor', 'Escala en tonalidad de Si Mayor', 7),
('contenidos', 'Escala Do# Mayor', 'Escala en tonalidad de Do# Mayor', 8),
('contenidos', 'Escala Fa# Mayor', 'Escala en tonalidad de Fa# Mayor', 9),
('contenidos', 'Escala Sib Mayor', 'Escala en tonalidad de Sib Mayor', 10),
('contenidos', 'Escala menores naturales', 'Escala menor natural', 11),
('contenidos', 'Escala menores armónicas', 'Escala menor armónica', 12),
('contenidos', 'Escala menores melódicas', 'Escala menor melódica', 13),
('contenidos', 'Escala cromática', 'Escala cromática en una cuerda', 14),
('contenidos', 'Escala dinámica', 'Escala con cambios de dinámica', 15),
('contenidos', 'Escala con terceras', 'Escala por terceras mayores', 16),
('contenidos', 'Escala con sextas', 'Escala por sextas mayores', 17),
('contenidos', 'Escala con octavas', 'Escala a dos octavas', 18),
('contenidos', 'Escala modos', 'Modos jónicos, dórico, frigio, etc.', 19),

-- ARPEGIOS
('contenidos', 'Arpegio Do Mayor', 'Tríada de Do Mayor', 20),
('contenidos', 'Arpegio Re Mayor', 'Tríada de Re Mayor', 21),
('contenidos', 'Arpegio La menor', 'Tríada de La menor', 22),
('contenidos', 'Arpegio Sol Mayor', 'Tríada de Sol Mayor', 23),
('contenidos', 'Arpegio menor', 'Tríadas menores', 24),
('contenidos', 'Arpegio disminuido', 'Tríada disminuida', 25),
('contenidos', 'Arpegio dominante', 'Acorde de sensible', 26),
('contenidos', 'Arpegio a tres octavas', 'Arpegio extenso', 27),
('contenidos', 'Arpegio broken', 'Arpegio quebrado (broken)', 28),
('contenidos', 'Arpegio escalas', 'Transición arpegio-escala', 29),

-- ESTUDIOS TÉCNICOS
('contenidos', 'Estudio de técnica', 'Estudio técnico básico', 30),
('contenidos', 'Estudio de velocidad', 'Estudios para velocidad', 31),
('contenidos', 'Estudio de digitación', 'Ejercicios de digitación', 32),
('contenidos', 'Estudio de arco', 'Estudios de arco', 33),
('contenidos', 'Estudio de escalas', 'Estudios de escalas', 34),
('contenidos', 'Estudio de independencia', 'Ejercicios de mano izquierda', 35),
('contenidos', 'Estudio de memoria', 'Estudios para memorización', 36),

-- REPERTORIO
('contenidos', 'Obra académica', 'Pieza de nivel académico', 40),
('contenidos', 'Obra de repertorio', 'Pieza de repertorio', 41),
('contenidos', 'Fragmento de concerto', 'Fragmento de concerto', 42),
('contenidos', 'Sonata', 'Sonata clásica', 43),
('contenidos', 'Pieza contemporánea', 'Pieza del siglo XX-XXI', 44),
('contenidos', 'Pieza baroque', 'Pieza del período barroco', 45),
('contenidos', 'Pieza romántica', 'Pieza del período romántico', 46),

-- OTRAS TÉCNICAS
('contenidos', 'Vibrato', 'Técnica de vibrato', 50),
('contenidos', 'Dynamics', 'Dinámicas (p, mf, f, etc.)', 51),
('contenidos', 'Ritmo', 'Ejercicios rítmicos', 52),
('contenidos', 'Lectura a primera vista', 'Lectura improvisada', 53),
('contenidos', 'Memorización', 'Técnicas de memoria', 54),
('contenidos', 'Postura', 'Posición corporal', 55),
('contenidos', 'Respiración', 'Técnica de respiración', 56);

-- ============================================================
-- SEED: Catálogo de Medidas Técnicas
-- ============================================================

INSERT INTO catalogos (tipo, nombre, codigo, categoria, orden) VALUES
-- MANO DERECHA
('medidas', 'Técnica mano derecha', '$Tecnica_mano_derecha', 'MANO_DERECHA', 1),
('medidas', 'Ataque del arco', '$Ataque_arco', 'MANO_DERECHA', 2),
('medidas', 'Ligado', '$Ligado', 'MANO_DERECHA', 3),
('medidas', 'Staccato', '$Staccato', 'MANO_DERECHA', 4),
('medidas', 'Detaché', '$Detache', 'MANO_DERECHA', 5),
('medidas', 'Marcato', '$Marcato', 'MANO_DERECHA', 6),
('medidas', 'Col legno', '$Col_legno', 'MANO_DERECHA', 7),
('medidas', 'Sul ponticello', '$Sul_ponticello', 'MANO_DERECHA', 8),
('medidas', 'Sul tasto', '$Sul_tasto', 'MANO_DERECHA', 9),
('medidas', 'Spiccato', '$Spiccato', 'MANO_DERECHA', 10),
('medidas', 'Sautillé', '$Sautille', 'MANO_DERECHA', 11),
('medidas', 'Tremolo', '$Tremolo', 'MANO_DERECHA', 12),

-- MANO IZQUIERDA
('medidas', 'Técnica mano izquierda', '$Tecnica_mano_izquierda', 'MANO_IZQUIERDA', 20),
('medidas', 'Digitación', '$Digitacion', 'MANO_IZQUIERDA', 21),
('medidas', 'Cambio de cuerda', '$Cambio_de_cuerda', 'MANO_IZQUIERDA', 22),
('medidas', 'Transición posiciones', '$Transicion_posiciones', 'MANO_IZQUIERDA', 23),
('medidas', 'Doble cuerda', '$Doble_cuerda', 'MANO_IZQUIERDA', 24),
('medidas', 'Trémolo de dedos', '$Tremolo_dedos', 'MANO_IZQUIERDA', 25),

-- POSTURA
('medidas', 'Postura corporal', '$Postura_corporal', 'POSTURA', 30),
('medidas', 'Posición de manos', '$Posicion_manos', 'POSTURA', 31),
('medidas', 'Posición del violín', '$Posicion_violin', 'POSTURA', 32),
('medidas', 'Apoyo del arco', '$Apoyo_arco', 'POSTURA', 33),

-- SONIDO
('medidas', 'Calidad de sonido', '$Calidad_sonido', 'SONIDO', 40),
('medidas', 'Proyección sonora', '$Proyeccion_sonora', 'SONIDO', 41),
('medidas', 'Tono uniforme', '$Tono_uniforme', 'SONIDO', 42),
('medidas', 'Resonancia', '$Resonancia', 'SONIDO', 43),

-- AFINACIÓN
('medidas', 'Afinación precisa', '$Afinacion_precisa', 'AFINACION', 50),
('medidas', 'Afinación relativa', '$Afinacion_relativa', 'AFINACION', 51),
('medidas', 'Entonación', '$Entonacion', 'AFINACION', 52),

-- RITMO
('medidas', 'Ritmo binario', '$Ritmo_binario', 'RITMO', 60),
('medidas', 'Ritmo ternario', '$Ritmo_ternario', 'RITMO', 61),
('medidas', 'Syncopa', '$Syncopa', 'RITMO', 62),
('medidas', ' Puntillo', '$Ritmo_puntillo', 'RITMO', 63),
('medidas', 'Tempo', '$Tempo', 'RITMO', 64),

-- DINÁMICA
('medidas', 'Dinámica piano', '$Dinamica_piano', 'DINAMICA', 70),
('medidas', 'Dinámica forte', '$Dinamica_forte', 'DINAMICA', 71),
('medidas', 'Dinámica mezzo', '$Dinamica_mezzo', 'DINAMICA', 72),
('medidas', 'Crescendo', '$Dinamica_crescendo', 'DINAMICA', 73),
('medidas', 'Decrescendo', '$Dinamica_decrescendo', 'DINAMICA', 74),
('medidas', 'Sforzando', '$Dinamica_sforzando', 'DINAMICA', 75),

-- VIBRATO
('medidas', 'Vibrato amplio', '$Vibrato_amplio', 'VIBRATO', 80),
('medidas', 'Vibrato rápido', '$Vibrato_rapido', 'VIBRATO', 81),
('medidas', 'Vibrato lento', '$Vibrato_lento', 'VIBRATO', 82),
('medidas', 'Vibrato central', '$Vibrato_central', 'VIBRATO', 83),

-- ARTICULACIÓN
('medidas', 'Articulación legato', '$Articulacion_legato', 'ARTICULACION', 90),
('medidas', 'Articulación staccato', '$Articulacion_staccato', 'ARTICULACION', 91),
('medidas', 'Non legato', '$Non_legato', 'ARTICULACION', 92),

-- RESPIRACIÓN Y EXPRESIÓN
('medidas', 'Respiración diafragmática', '$Respiracion_diafragmatica', 'EXPRESION', 100),
('medidas', 'Respiración costal', '$Respiracion_costal', 'EXPRESION', 101),
('medidas', 'Expresión musical', '$Expresion_musical', 'EXPRESION', 102),
('medidas', 'Phrasing', '$Phrasing', 'EXPRESION', 103);

-- ============================================================
-- SEED: Catálogo de Sugerencias
-- ============================================================

INSERT INTO catalogos (tipo, nombre, descripcion, orden) VALUES
('sugerencias', 'Practicar con metrónomo', 'Usar metrónomo a velocidad controlada', 1),
('sugerencias', 'Mantener postura correcta', 'Verificar posición del cuerpo', 2),
('sugerencias', 'Trabajar digitación alternativa', 'Explorar posiciones alternativas', 3),
('sugerencias', 'Mejorar ataque del arco', 'Trabajar la entrada del arco', 4),
('sugerencias', 'Mantener afinación', 'Prestar atención a la entonación', 5),
('sugerencias', 'Practicar lentamente primero', 'Comenzar a tempo lento', 6),
('sugerencias', 'Aumentar velocidad gradualmente', 'Incrementar BPM progresivamente', 7),
('sugerencias', 'Estudiar con pausa', 'Tomar descansos frecuentes', 8),
('sugerencias', 'Grabar práctica', 'Auto-evaluarse con grabación', 9),
('sugerencias', 'Escuchar referencias', 'Oír grabaciones del repertorio', 10),
('sugerencias', 'Visualizar antes de tocar', 'Leer la partitura mentalmente', 11),
('sugerencias', 'Separar manos', 'Practicar cada mano independientemente', 12),
('sugerencias', 'Volver a lo básico', 'Revisar fundamentos', 13),
('sugerencias', 'Enfocarse en la respiración', 'Respirar correctamente', 14),
('sugerencias', 'Relajar hombros', 'Evitar tensión en hombros', 15);

-- ============================================================
-- SEED: Catálogo de Tareas
-- ============================================================

INSERT INTO catalogos (tipo, nombre, descripcion, orden) VALUES
('tareas', 'Practicar 30 min diarios', 'Dedicación diaria de media hora', 1),
('tareas', 'Practicar 1 hora diaria', 'Dedicación diaria de una hora', 2),
('tareas', 'Estudiar escala Do Mayor', 'Repasar escala Do Mayor', 3),
('tareas', 'Estudiar escala de la clase', 'Practicar escala asignada', 4),
('tareas', 'Revisar teoría musical', 'Estudiar conceptos teóricos', 5),
('tareas', 'Escuchar grabación de referencia', 'Oír interpretación modelo', 6),
('tareas', 'Preparar próximo estudio', 'Avanzar en el estudio asignado', 7),
('tareas', 'Grabar video de práctica', 'Documentar progreso en video', 8),
('tareas', 'Memorizar frase musical', 'Memorizar 4-8 compases', 9),
('tareas', 'Practicar con metrónomo a 60', 'Trabajo de ritmo a tempo bajo', 10),
('tareas', 'Trabajar pasaje difícil', 'Repetir sección problemática', 11),
('tareas', 'Estudiar escalas con bowing', 'Aplicar patrón de arco a escalas', 12),
('tareas', 'Revisar postura', 'Grabarse para verificar posición', 13),
('tareas', 'Practicar vibrato', 'Ejercicios de vibrato', 14),
('tareas', 'Completar lectura de obra', 'Llegar al final de la pieza', 15);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT tipo, COUNT(*) as total FROM catalogos WHERE activo = true GROUP BY tipo ORDER BY tipo;

SELECT '✅ Catálogos cargados correctamente' AS status;