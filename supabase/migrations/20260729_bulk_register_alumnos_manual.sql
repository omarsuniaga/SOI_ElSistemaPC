-- Migration: Registro masivo manual de 64 alumnos desde data excel/tabla
-- Run this in the Supabase Dashboard SQL Editor
ALTER TABLE public.alumnos ALTER COLUMN familia_id DROP NOT NULL;
ALTER TABLE public.alumnos ADD COLUMN IF NOT EXISTS genero TEXT;

-- Register Dyakenson Lamerique
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Dyakenson Lamerique', '2011-01-01', 'Violín 1', CURRENT_DATE, '829-928-7837', '829-928-7837', 'ID Inventario: ESPCVLN42MU | Edad registrada: 15', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Emmanuel De los Santos Tavarez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Emmanuel De los Santos Tavarez', '2017-01-01', 'Violín 1', CURRENT_DATE, '829-886-1050', '829-886-1050', 'ID Inventario: 23,066 | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Elianny Mejia
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Elianny Mejia', '2014-01-01', 'Violín 1', CURRENT_DATE, '809-982-1853', '809-982-1853', 'ID Inventario: 22,083 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Edelyn Abreu Mejia
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Edelyn Abreu Mejia', '2012-01-01', 'Violín 1', CURRENT_DATE, '829-863-6465', '829-863-6465', 'ID Inventario: 23,056 | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Yeiri Alexandra Germain Michel
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Yeiri Alexandra Germain Michel', '2013-01-01', 'Violín 1', CURRENT_DATE, '809-258-5632', '809-258-5632', 'ID Inventario: 23,059 | Edad registrada: 13', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Escarlet Lisbeth Martinez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Escarlet Lisbeth Martinez', '2015-01-01', 'Violín 1', CURRENT_DATE, '849-266-5100', '849-266-5100', 'ID Inventario: 22,081 | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Angenie St Juste Philogene
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Angenie St Juste Philogene', '2013-01-01', 'Violín 1', CURRENT_DATE, '829-557-7515', '829-557-7515', 'ID Inventario: 23,061 | Edad registrada: 13', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Yurma Stjuste Philogene
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Yurma Stjuste Philogene', '2013-01-01', 'Violín 1', CURRENT_DATE, '849-868-2014', '849-868-2014', 'ID Inventario: 23,062 | Edad registrada: 13', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Angelita St Juste  Philogene
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Angelita St Juste  Philogene', '2015-01-01', 'Violín 1', CURRENT_DATE, '829-557-7515', '829-557-7515', 'ID Inventario: 22,087 | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Cesar Andres Mendoza Gimenez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Cesar Andres Mendoza Gimenez', '2011-09-01', 'Violín 2', '2025-01-31', '829-840-6942', '829-840-6942', 'ID Inventario: 23,058 | Asignación Instrumento: 2025-06-28 | Edad registrada: 13', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Santa Isaura Castillo Díaz
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Santa Isaura Castillo Díaz', '2017-01-01', 'Violín 2', CURRENT_DATE, '809-979-9258', '809-979-9258', 'ID Inventario: ESPCVLN28SG | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Gabriela Jireh Marte Colome
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Gabriela Jireh Marte Colome', '2014-01-01', 'Violín 2', CURRENT_DATE, '829-753-9979', '829-753-9979', 'ID Inventario: 23,055 | Asignación Instrumento: 2025-06-10 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Yereni Esther Germain Michel
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Yereni Esther Germain Michel', '2017-01-01', 'Violín 2', CURRENT_DATE, '809-258-5632', '809-258-5632', 'ID Inventario: 24.090. | Asignación Instrumento: 2025-06-06 | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Amelia Marlin Gutierrez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Amelia Marlin Gutierrez', '2016-01-01', 'Violín 2', CURRENT_DATE, '809-967-6171', '809-967-6171', 'ID Inventario: 22.090. | Asignación Instrumento: 2025-06-17 | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Lia Annelise Lopez Matos
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Lia Annelise Lopez Matos', '2016-08-23', 'Violín 2', '2025-02-10', '829-853-3972', '829-853-3972', 'ID Inventario: ESPCVLN45SG | Asignación Instrumento: 2025-06-10 | Edad registrada: 8', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Jeydhen Andres Peguero Cortorreal
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Jeydhen Andres Peguero Cortorreal', '2016-01-01', 'Violín 2', CURRENT_DATE, '809-841-9649', '809-841-9649', 'ID Inventario: PERSONAL | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Rosyairy Gabriel Reyes
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Rosyairy Gabriel Reyes', '2017-01-01', 'Violín 2', CURRENT_DATE, '809-364-2097', '809-364-2097', 'ID Inventario: ESPCVLN34RO | Asignación Instrumento: 2025-06-10 | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Ruth Esther Camille Jn Simon
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Ruth Esther Camille Jn Simon', '2011-01-01', 'Clarinete', CURRENT_DATE, '809-999-6334', '809-999-6334', 'ID Inventario: 22,101 | Asignación Instrumento: 2025-06-18 | Edad registrada: 15', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Geily Yosairy Diviche
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Geily Yosairy Diviche', '2013-01-01', 'Clarinete', CURRENT_DATE, '809-460-9313', '809-460-9313', 'ID Inventario: 22,102 | Asignación Instrumento: 2025-06-12 | Edad registrada: 13', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Yangel Jair Medina Ramirez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Yangel Jair Medina Ramirez', '2016-01-01', 'Clarinete', CURRENT_DATE, '829-324-6576', '829-324-6576', 'ID Inventario: 23.070. | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Williams Abraham Fariñas Solano
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Williams Abraham Fariñas Solano', '2009-01-01', 'Contrabajo', CURRENT_DATE, '809-648-5562', '809-648-5562', 'ID Inventario: 22,086 | Edad registrada: 17', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Nairoby Jean
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Nairoby Jean', '2010-01-01', 'Contrabajo', CURRENT_DATE, '829-840-9444', '829-840-9444', 'ID Inventario: 23,051 | Edad registrada: 16', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Julianny Dalexa Mendez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Julianny Dalexa Mendez', '2014-06-02', 'Contrabajo', '2025-02-12', '809-804-6949', '809-804-6949', 'ID Inventario: COMPARTIDO | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Laura Gil Santana
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Laura Gil Santana', '2015-01-01', 'Contrabajo', CURRENT_DATE, '829-663-8698', '829-663-8698', 'ID Inventario: ESPCCTB10YA | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Christina Pierre
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Christina Pierre', '2014-01-01', 'Contrabajo', CURRENT_DATE, '829-839-7825', '829-839-7825', 'ID Inventario: ESPCCTB11YA | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Maia Santana Aracena
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Maia Santana Aracena', '2013-01-01', 'Contrabajo', CURRENT_DATE, '829-663-8698', '829-663-8698', 'ID Inventario: ESPCCTB12YA | Edad registrada: 13', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Diafreisi Dumond
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Diafreisi Dumond', '2011-01-01', 'Corno', CURRENT_DATE, '809-961-7864', '809-961-7864', 'ID Inventario: 24,094 | Edad registrada: 15', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Alegna Cuello Medina
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Alegna Cuello Medina', '2017-01-01', 'Flauta', CURRENT_DATE, '809-875-5523', '809-875-5523', 'ID Inventario: 22,095 | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Zara Isabella Diaz Bodre
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Zara Isabella Diaz Bodre', '2014-01-01', 'Flauta', CURRENT_DATE, '829-394-1017', '829-394-1017', 'ID Inventario: 22,095 | Asignación Instrumento: 2025-06-07 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Alina Marola Jimenez Vargas
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Alina Marola Jimenez Vargas', '2016-01-01', 'Flauta', CURRENT_DATE, '809-304-2080', '809-304-2080', 'ID Inventario: 22,097 | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Ansherlin Zoe Contreras Polanco
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Ansherlin Zoe Contreras Polanco', '2016-01-01', 'Flauta', CURRENT_DATE, '829-977-4033', '829-977-4033', 'ID Inventario: 24,091 | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Jacob David Rojas Arellán
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Jacob David Rojas Arellán', '2019-01-01', 'Flauta', CURRENT_DATE, '809-437-7577', '809-437-7577', 'ID Inventario: ESPCFLT08NU | Edad registrada: 7', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Josias Alejandro Fariñas Solano
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Josias Alejandro Fariñas Solano', '2012-01-01', 'Oboe', CURRENT_DATE, '829-648-5562', '829-648-5562', 'ID Inventario: 23,067 | Asignación Instrumento: 2024-09-06 | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Cher Akemi Corredor
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Cher Akemi Corredor', '2015-01-01', 'Oboe', CURRENT_DATE, '829-439-8064', '829-439-8064', 'ID Inventario: 23,068 | Asignación Instrumento: 2025-06-06 | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Elisha Sosa
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Elisha Sosa', '2014-01-01', 'Percusión', CURRENT_DATE, '829-750-1155', '829-750-1155', 'Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Marthin Alejandro Ramos
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Marthin Alejandro Ramos', '2016-01-01', 'Percusión', CURRENT_DATE, '809-215-9387', '809-215-9387', 'Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Zoe García Acevedo
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Zoe García Acevedo', '2011-01-01', 'Percusión', CURRENT_DATE, '829-850-0005', '829-850-0005', 'Edad registrada: 15', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Mauricio José Urquia
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Mauricio José Urquia', '2014-01-01', 'Trombón', CURRENT_DATE, '829-355-1711', '829-355-1711', 'ID Inventario: 22,109 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Mathias Alejandro Ramos
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Mathias Alejandro Ramos', '2015-01-01', 'Trompeta', CURRENT_DATE, '809-215-9387', '809-215-9387', 'ID Inventario: 22,111 | Asignación Instrumento: 2025-06-09 | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Yeseña Joseph Bless
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Yeseña Joseph Bless', '2012-01-01', 'Trompeta', CURRENT_DATE, '809-280-5920', '809-280-5920', 'ID Inventario: 22,114 | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Feder de los Santos Gonzales
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Feder de los Santos Gonzales', '2014-01-01', 'Trompeta', CURRENT_DATE, '829-928-1188', '829-928-1188', 'ID Inventario: 22,115 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Jose Tomás Lorenzo Ogando
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Jose Tomás Lorenzo Ogando', '2014-01-01', 'Trompeta', CURRENT_DATE, '809-803-3158', '809-803-3158', 'ID Inventario: 22.110. | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Jhoennsy Sariel Castillo Batista
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Jhoennsy Sariel Castillo Batista', '2016-01-01', 'Tuba', CURRENT_DATE, '809-228-1971', '809-228-1971', 'ID Inventario: 22,121 | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register María Naroldy Hilario
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('María Naroldy Hilario', '2011-01-01', 'Viola', CURRENT_DATE, '849-873-0530', '849-873-0530', 'ID Inventario: 23,053 | Edad registrada: 15', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Jaime de la Cruz
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Jaime de la Cruz', '2011-01-01', 'Viola', CURRENT_DATE, '829-278-9337', '829-278-9337', 'ID Inventario: 23,054 | Edad registrada: 15', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Branyan Francisco Peguero
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Branyan Francisco Peguero', '2012-01-01', 'Viola', CURRENT_DATE, '829-558-0279', '829-558-0279', 'ID Inventario: ESPCVLA21JA | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Dariel Aquino Mejia
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Dariel Aquino Mejia', '2014-01-01', 'Viola', CURRENT_DATE, '829-887-7671', '829-887-7671', 'ID Inventario: ESPCVLA22EX | Asignación Instrumento: 2025-06-06 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Argeiris Yudeny Pacheco Pinales
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Argeiris Yudeny Pacheco Pinales', '2012-01-01', 'Viola', CURRENT_DATE, '849-456-1545', '849-456-1545', 'ID Inventario: ESPCVLA23EX | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Jhouse Manuel Lacen
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Jhouse Manuel Lacen', '2014-01-01', 'Viola', CURRENT_DATE, '829-558-3023', '829-558-3023', 'ID Inventario: ESPCVLN39EX | Asignación Instrumento: 2025-06-07 | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Helen Sofia Alvarado Pérez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Helen Sofia Alvarado Pérez', '2017-01-01', 'Viola', CURRENT_DATE, '809-710-6176', '809-710-6176', 'ID Inventario: ESPCVLN44RO | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Lucas Gutierrez Pérez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Lucas Gutierrez Pérez', '2019-01-01', 'Flauta', CURRENT_DATE, '', '', 'ID Inventario: 22,088 | Asignación Instrumento: 2025-06-17 | Edad registrada: 7', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Eva Taveras
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Eva Taveras', '2016-01-01', 'Violín 2', CURRENT_DATE, '829-672-6826', '829-672-6826', 'ID Inventario: 22,089 | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Alanna Pilier
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Alanna Pilier', '2018-01-01', 'Violín 2', CURRENT_DATE, '829-680-7245', '829-680-7245', 'ID Inventario: ESPCVLN25SG | Edad registrada: 8', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Nicole Castillo Díaz
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Nicole Castillo Díaz', '2016-01-01', 'Violín 2', CURRENT_DATE, '809-979-9258', '809-979-9258', 'ID Inventario: ESPCVLN26SG | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Ashley Saint Philippe
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Ashley Saint Philippe', '2016-01-01', 'Violín 2', CURRENT_DATE, '829-604-8490', '829-604-8490', 'ID Inventario: ESPCVLN37RO | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Alejandra Annaly Pérez
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Alejandra Annaly Pérez', '2014-01-01', 'Violín 2', CURRENT_DATE, '849-245-8848', '849-245-8848', 'ID Inventario: ESPCVLN46YS | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Daniel Monfismon Peralte
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Daniel Monfismon Peralte', '2018-01-01', 'Violín 2', CURRENT_DATE, '829-274-8894', '829-274-8894', 'Edad registrada: 8', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Amy Balbuena
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Amy Balbuena', '2012-01-01', 'Violoncello', CURRENT_DATE, '829-913-6681', '829-913-6681', 'ID Inventario: 24,087 | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Ysabella Valentina Brito Suniaga
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Ysabella Valentina Brito Suniaga', '2014-01-01', 'Violoncello', CURRENT_DATE, '809-215-6273', '809-215-6273', 'ID Inventario: 24.250. | Edad registrada: 12', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Alondra Lorenzo Ogando
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Alondra Lorenzo Ogando', '2010-01-01', 'Violoncello', CURRENT_DATE, '809-803-3158', '809-803-3158', 'ID Inventario: ESPCVLC14EX | Edad registrada: 16', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Lia Bonilla Santana
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Lia Bonilla Santana', '2012-01-01', 'Violoncello', CURRENT_DATE, '829-846-8470', '829-846-8470', 'ID Inventario: ESPCVLC17EX | Asignación Instrumento: 2025-05-29 | Edad registrada: 14', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Sol Marte
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Sol Marte', '2017-01-01', 'Violoncello', CURRENT_DATE, '809-617-5724', '809-617-5724', 'ID Inventario: ESPCVLC19RO | Asignación Instrumento: 2025-06-24 | Edad registrada: 9', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Dinora Amanda Evangelista Paniagua
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Dinora Amanda Evangelista Paniagua', '2016-01-01', 'Violoncello', CURRENT_DATE, '809-219-8782', '809-219-8782', 'ID Inventario: ESPCVLC20RO | Edad registrada: 10', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;

-- Register Aarón Di Lorenzo
INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, fecha_ingreso, representante_tlf, tlf_alumno, observaciones_generales, activo)
VALUES ('Aarón Di Lorenzo', '2015-01-01', 'Violoncello', CURRENT_DATE, '829-341-7693', '829-341-7693', 'ID Inventario: PERSONAL | Edad registrada: 11', true)
ON CONFLICT (nombre_completo) DO UPDATE
SET fecha_nacimiento = EXCLUDED.fecha_nacimiento,
    instrumento_principal = EXCLUDED.instrumento_principal,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    representante_tlf = EXCLUDED.representante_tlf,
    tlf_alumno = EXCLUDED.tlf_alumno,
    observaciones_generales = EXCLUDED.observaciones_generales;
