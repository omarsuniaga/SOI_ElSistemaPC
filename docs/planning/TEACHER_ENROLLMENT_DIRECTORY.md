# Corrección de búsqueda de alumnos para inscripción

## Caso y causa comprobada

el maestro no encuentra a un alumno de otra clase para Coro Niños Cantores aunque administración sí ve su ficha. Las políticas restrictivas `f0_read_allow` / `f0_read_scope` de `alumnos` permiten al maestro leer expedientes únicamente de sus clases. La vista reutilizaba ese listado como si fuera el padrón general. Con el contexto autenticado de el maestro se obtuvieron un padrón parcial y cero coincidencias para el alumno.

## Contrato y corrección

`obtenerAlumnosParaInscripcion()` es un método del DataAdapter de alumnos, con implementación real y demo. Retorna solamente `id`, `nombre_completo`, `instrumento_principal`, `activo`, `sin_clase`. Incluye alumnos activos aunque estén en otras clases o no tengan instrumento. Pagina en lotes de 500 con orden estable por nombre e ID.

La RPC pública es SECURITY INVOKER y llama a un helper privado en `soi_security`. El helper es una capacidad deliberada de lectura del directorio mínimo: comprueba sesión, perfil activo y rol, maestro activo y permiso de inscripción vigente (booleano o alias de permisos). No devuelve teléfonos, salud, representantes ni expedientes. No altera ninguna política RLS ni permiso de escritura. Anónimos y maestros sin permiso no acceden. Esta separación evita ampliar SELECT sobre toda la tabla `alumnos`.

La vista consume el directorio y calcula «Sin clase» con el indicador global que retorna el servidor, en lugar de deducirlo de las matrículas visibles del maestro. Los errores de carga se muestran, no se convierten en listas vacías. La búsqueda conserva la coincidencia por texto: buscar una parte del nombre encuentra al alumno; los nombres distintos no se convierten automáticamente en coincidencias.

## Validación

- Regresión roja reproducida antes del cambio: el alumno externo al padrón del maestro no aparecía.
- Pruebas de portal: búsqueda, selección e inscripción del alumno externo a través del adapter; error visible; filtros y selección existentes.
- Adapter: más de 500 resultados, ausencia de instrumento, denegación explícita y contrato mínimo en demo.
- SQL probado en transacción con ROLLBACK en la base SOI: el directorio retorna el padrón activo completo, incluye a el alumno, mantiene la ficha completa fuera del alcance previo a inscripción, bloquea sesión sin identidad y maestro sin permiso; anónimo no tiene EXECUTE.
- 163 pruebas aprobadas en módulos de alumnos y vista de gestión.
- Build y TypeScript aprobados. ESLint de archivos modificados sin errores (advertencias preexistentes).
- `policy:check` falla por las mismas tablas históricas R1/R3 que en `origin/master`; no se agrega ninguna tabla.

## Entrega y publicación

Código y migración juntos en este PR. Antes de desplegar el frontend, aplicar `20261022164558_teacher_enrollment_directory.sql` y ejecutar `supabase/tests/teacher_enrollment_directory.sql` (transacción que revierte todo). Desplegar el frontend y probar con el maestro: buscar una parte del nombre, verificar la identidad, seleccionar e inscribir. La inscripción definitiva la decide el maestro.

Las validaciones de esta sesión no dejaron cambios persistentes en la base ni inscribieron definitivamente al alumno. La publicación requiere aplicar la migración y desplegar el frontend. Reversión: regresar el frontend y retirar las dos funciones nuevas; RLS permanece intacto.
