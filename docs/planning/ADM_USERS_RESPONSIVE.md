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

18 pruebas de vista/API y suite completa: 4.843 aprobadas, 7 omitidas.
CI del PR #168 aprobado: lint global, TypeScript, build y regresiones SQL de asistencia.
El control estructural falla también en el commit base con salida idéntica: deuda preexistente;
no se modifica su baseline ni se agregan tablas.
Vista previa Netlify lista, sin secretos detectados. La inspección visual autenticada
queda pendiente: el navegador solicita inicio de sesión del SOI.

## Publicación

PR #168 fusionado: `595d3731d6b2de3a747cf051a39cde3b9d1e3599`.
La primera publicación fue cancelada por la regla ignore al comparar la caché de preview
con el mismo contenido del merge. Se corrigió para que producción siempre compile;
las vistas previas conservan su filtro de cambios. Tres casos de la regla verificados:
producción con árbol idéntico compila, preview idéntico se omite y preview modificado compila.
Commit publicado: `270d587a275aa13144f6a4be2aa5f3498e0999c1`.
Deploy `6af69e10fb188ea178350f8c`, estado ready, publicado el 13/11/2026 a las 01:20 a. m.
(Hora de Santo Domingo). URL: https://soi-el-sistema-pc.netlify.app/adm.html#/gestion-usuarios.
El despliegue incorpora también los cambios de master que no se habían publicado desde octubre.
No incluye los PR #166 y #167, que continúan separados.
