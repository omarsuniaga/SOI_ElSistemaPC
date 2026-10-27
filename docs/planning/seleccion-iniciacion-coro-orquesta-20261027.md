# SOI — Selección de alumnos de Iniciación para Coro y Orquesta
Fecha: 2026-10-27 | Estado: PR pendiente de validación y migración.

## Problema y decisión
- El interés musical (`instrumento_interes`) no es inscripción ni asignación.
- El instrumento asignado (`instrumento_principal`) tampoco prueba la clase actual.
- La matrícula existe en `alumnos_programas` y `alumnos_clases`.
- «Seleccionado para Orquesta» o «Seleccionado para Coro» refleja una decisión académica **previa** a la inscripción.
- Las dos selecciones son independientes; ninguna escritura toca matrículas, instrumento principal, asistencias o programas.

## Dónde aparece
- Tarjeta del listado ADM de alumnos: insignias verdes solo cuando están activas.
- Ficha ADM: insignias en cabecera y dos interruptores cuando el alumno pertenece a Iniciación Musical o Instrumental o tiene una clase marcada `es_clase_iniciacion`.
- Un cambio de interruptor se guarda de forma independiente y permite revocación sin borrado físico.

## Datos y acceso
- Migración: `supabase/migrations/20261027190000_alumnos_selecciones_iniciacion.sql`.
- Una fila por `(alumno_id,destino)`, con `destino = orquesta | coro`, `activo`, fecha, creador y último actor.
- SQL protege IDs, destino, autor original y registra modificación.
- RLS: solo usuarios del personal escolar autenticados leen decisiones; solo administración, dirección y coordinación académica escriben. El servidor valida que exista matrícula activa de Iniciación para activar, incluso si el frontend intenta saltarse el control.
- `anon`: sin privilegios. `DELETE`: sin privilegios ni políticas.

## Orden de despliegue
1. Validar CI, revisar RLS, probar con un usuario ADM y otro maestro (lectura sin escritura).
2. Aplicar la migración en un entorno de desarrollo o prueba; no ejecutar en producción hasta aprobar PR.
3. Probar búsqueda de alumnos en Iniciación Musical e Instrumental, doble selección, revocación y ausencia de altas en matrícula.
4. Aplicar la migración aprobada a producción **antes** de desplegar el frontend.
5. Fusionar la rama mediante PR y verificar las tarjetas y fichas con el rol administrativo.

## Reversión
- UI: revertir el commit/PR y redeplegar, conservando los registros.
- Base de datos: conservar la tabla para auditoría; su eliminación física requiere decisión expresa y copia de seguridad.
- Una tabla nueva no altera el estado anterior de matrículas.

## Límites conocidos
- No se crea ni se consulta automáticamente una audición; el marcador es manual.
- La selección no realiza promoción automática ni notifica a representantes.
- Se mantiene un registro de estado por destino; no existe aún una bitácora de cada cambio de estado histórico.
- Las pruebas incluidas cubren la lógica de etiquetas y la interacción de ficha; falta su ejecución en CI / entorno de pruebas con RLS real.
