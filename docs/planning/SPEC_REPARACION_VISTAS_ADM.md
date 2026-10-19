# Reparación de cinco vistas ADM

## Historia de usuario
Como administrador quiero consultar y gestionar asistencias, solicitudes, seguimiento de alumnos y salones desde teléfono, iPad o escritorio sin recargar ni perder el contexto.

## Alcance autorizado
Control de asistencias, Gestión de ausencias, Ausentismo de alumnos, Alumnos Críticos y Salones y espacios. Sin migraciones ni cambios de permisos o umbrales institucionales.

## Tareas y aceptación
- [x] Asistencias: un solo listener delegado; búsqueda conserva foco; errores visibles y reintento; última consulta prevalece.
- [x] Ausencias: historial escapado y enlaces seguros; solicitudes visibles sin esperar IA; respuestas antiguas descartadas; controles adaptables.
- [x] Ausentismo: errores independientes; validar fechas; indicar alcance del rango.
- [x] Críticos: búsqueda y paginación; lista compacta; historial plegable; evitar justificaciones duplicadas y refrescar detalle.
- [x] Salones: clic y teclado abren detalle; limpieza de eventos; CSV filtrado; cuadrícula adaptable.
- [x] Pruebas de regresión, lint, tipos y build.
- [ ] Validación visual real en navegador/dispositivos.
- [ ] Gate global: resolver o aceptar fallos preexistentes ajenos a este cambio.

## Validación
Pruebas Vitest en las fronteras de cada vista; revisión de layout a 360/390/768/1024/1440 px cuando el entorno lo permita. No afirmar validación manual autenticada sin realizarla.

## Evidencia y límites de revisión
- Vitest focalizado: cubre foco, registro único de eventos, errores, carga sin IA, HTML/enlaces seguros, respuestas antiguas, paginación/búsqueda, guardado único, actualización del detalle y exportación filtrada.
- Lint global: sin errores; advertencias heredadas. Tipos y compilación correctos.
- `policy:check` falla con exactamente la misma salida en el commit base y en esta rama; no se cambian migraciones ni baseline.
- Una prueba de `progressHistoryFormatter`, una de `bitacora.model` y dos de `calendarioView-bug-today` fallan también en el commit base (verificación aislada).
- No se pudo instalar Chromium: la descarga devuelve un archivo inválido. No se afirma revisión visual ni prueba autenticada en producción.
- La criticidad continúa usando el servicio existente y la vista `v_alumnos_criticos_ausentismo`. No se altera su cálculo ni se inventa un período que la API no expone. Falta verificar la definición desplegada antes de mostrar un umbral o ventana temporal específicos.
- Se entrega una rama consolidada por compartir estilos y pruebas; no se fusiona automáticamente con producción mientras falte revisión visual.

## Publicación
Omar autorizó explícitamente publicar la rama y abrir PR. Git por HTTPS no tiene credenciales locales; se utiliza la conexión de GitHub. Producción sigue sin modificar.

Suite completa: 4.722 pruebas aprobadas, 4 fallos preexistentes en tres archivos y 7 omitidas. Pruebas focalizadas: 31 aprobadas.
