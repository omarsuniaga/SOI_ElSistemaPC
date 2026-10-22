# Lectura global de alumnos por maestros

Decisión de Omar: todos los maestros activos pueden consultar a todos los alumnos, independientemente de las clases en las que estén inscritos. Sustituye la solución de catálogo mínimo propuesta en PR #156.

Se modifican únicamente `f0_read_allow` y `f0_read_scope` de `public.alumnos`: ambas aceptan el rol `maestro` con perfil activo mediante el helper institucional existente. RLS, restricciones de usuario activo, permisos de escritura y permisos sobre matrículas permanecen vigentes. No se agregan funciones, tablas ni acceso anónimo. El portal publicado ya consulta alumnos a través del adapter, por lo que no requiere despliegue de frontend para aprovechar este cambio. Los filtros visuales de estado o instrumento siguen disponibles.

Validación SQL: antes de la corrección un maestro recibía un padrón parcial. Después, todos los perfiles de maestro activos pueden consultar el mismo total de alumnos que el administrador. La prueba comprueba RLS habilitado, ausencia de acceso anónimo y cero filas sin identidad autenticada. La huella de las políticas no SELECT de alumnos coincide antes y después.

Migración aplicada y verificada en SOI el 22 de octubre de 2026. El nombre de archivo coincide con la versión registrada por el servidor. Prueba reproducible: `supabase/tests/all_teachers_student_read.sql`, que revierte la transacción y no modifica alumnos ni inscripciones.

Para observar el cambio en un dispositivo que mantiene el padrón en memoria, recargar el portal y volver a abrir la gestión de clases. La prueba fue de autorización en la base, sin sesión de navegador del maestro.
