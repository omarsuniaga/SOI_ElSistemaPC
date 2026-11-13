# Gestión de Usuarios y Portales: adaptación responsive

Solicitud de Omar, 13 de noviembre de 2026. Ruta ADM: `#/gestion-usuarios`.

## Resultado

- Formulario lateral acotado en escritorio y una columna por debajo de 992 px.
- Listado antes de credenciales recientes; tarjetas que conservan nombres y correos largos.
- Acciones en filas flexibles y objetivos táctiles de 44 px en móvil.
- Selector de portales adaptable, controles de contraseña sin compresión y búsqueda etiquetada.
- Modal de portales con altura dinámica, pie visible y cuerpo desplazable.
- Navegación por teclado en selectores de origen y contraseña.

Solo presentación: no cambia asignación de roles, accesos ni operaciones de cuentas.

## Validación

18 pruebas existentes de vista/API aprobadas. Build, TypeScript y ESLint focalizado aprobados.
El control estructural falla también en el commit base con salida idéntica: deuda preexistente;
no se modifica su baseline ni se agregan tablas.
Revisión visual y despliegue se registrarán al cierre.
