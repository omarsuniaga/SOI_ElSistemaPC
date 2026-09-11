# Fase 0: contención de seguridad y línea base

## Autorización y estado

Omar aprobó continuar después de revisar el diseño 0.1: «la revision humana aprueba el hallazgo y te pide continuar». Después confirmó: «continua trabajando ya recargamos los tokens». G0 queda aprobado para avanzar. Esta aprobación no convierte las pruebas históricas ni los hallazgos pendientes en verificaciones superadas.

Se implementa el primer bloque de mantenimiento que permite avanzar hacia G2. **La migración no se ha aplicado a producción y el código del portal no se ha desplegado.** F0-01 queda parcial; F0-02 a F0-14 no están ejecutados por este cambio. El producto SOI 2.0 todavía no está implementado.

## Problema reproducido

La rama `release/soi-v1-lts` sigue en `8c90951342ecbee90eb7d675c478f167c223ff12`. Consultas de solo lectura del 11 de septiembre confirman las definiciones vulnerables y el ledger con máximo `20260908052508`. El tag `soi-v1.2-lts` no se modifica.

Los tests anteriores de seguridad comprobaban funciones JavaScript creadas dentro del propio test; no ejercitaban RLS. La nueva suite ejecuta políticas y funciones reales en PostgreSQL con fixtures sintéticos. La primera corrida, antes de corregir implementación, produjo **32 fallos y 10 aciertos**: 27 fallos SQL y 5 del adaptador de cierre. Posteriormente se añadieron casos para privilegios TRUNCATE, edición directa del cierre y vistas.

## Qué cambia

| Superficie | Corrección | Efecto operativo |
|---|---|---|
| Alumnos e inscripciones | Se revoca acceso anónimo y se combinan gates RLS restrictivos con permisos explícitos | Maestro titular/suplente ve su nómina; un perfil pendiente, desactivado o desconocido no obtiene datos |
| Clases y horarios | Se eliminan escrituras públicas y se valida el ámbito en lectura y escritura | Gestión académica explícita; horarios asignados siguen disponibles para el maestro |
| Conversaciones y alertas | Gestión limitada a `admin` activo; `service_role` conserva acceso del worker | No se habilita COM/DIR por un claim antiguo; esa ampliación espera membresías verificadas |
| Fusión de alumnos | Se revocan permisos y el cuerpo se sustituye por un rechazo sin mutaciones | Fusión física suspendida hasta construir revisión de conflictos; ningún historial se elimina |
| Borrado físico de alumnos | Gate restrictivo impide DELETE desde `authenticated` | La administración debe usar estados y revisión, no borrar expedientes |
| Cierre de período | Autoriza `admin` activo, deriva el actor de `auth.uid()`, rechaza actor ajeno y rango distinto al validado | El cierre y su auditoría ocurren en la misma transacción |
| Conteo del cierre | `count(distinct sc.id)` | Dos marcas de asistencia de una misma clase no se convierten en dos sesiones |
| Validación desconocida | NULL o resultado sin booleano válido producen error | No se comunica un cierre satisfactorio cuando no se pudo validar |
| Edición directa | Se revocan permisos sobre campos de cierre, escritura de auditoría y TRUNCATE; se bloquea editar un período cerrado | El navegador no evita el control de la RPC |
| Portal ACM | Una llamada RPC reemplaza inserción de auditoría + actualización separadas | Devuelve el identificador confirmado; un recibo inválido no se considera éxito |
| Vistas personales | `vw_seguimiento_ausentes` y `vw_asistencias_consolidada` usan `security_invoker`; se revoca anon y se limita el consolidado por clase | Se cierra una vía alternativa que evitaba RLS |
| Perfiles y acreditación | Gates sobre escrituras de perfiles; checks explícitos de actor activo y revocación de ejecución anónima en cuatro RPC | Inventarista no puede elevar su perfil; un rol NULL no permite aprobar, rechazar ni cambiar roles |

No se cambian tablas de pagos, cuotas, indicadores ni inventario. La señalización pública conserva su vista de horarios; su definición no contiene teléfonos de representantes ni expedientes de alumnos.

La segunda reproducción detectó escalamiento anónimo en `cambiar_rol_usuario` y cambios anónimos de estado mediante `aprobar_usuario`/`rechazar_usuario`: las comparaciones con un rol NULL no entraban en el rechazo. La suite amplía las pruebas para esos casos y verifica autorización positiva de admin/superadmin. `approve_maestro_profile` conserva su implementación de acreditación y recibe un guard previo de perfil activo; su flujo completo sobre `auth.users` y triggers sigue pendiente de staging.

`es_admin()` incluye `inventarista` en producción. Los gates nuevos no lo usan. El cierre conserva el permiso institucional `admin` activo que ya exige la política de lectura de su auditoría. Los perfiles existentes observados tienen roles `admin` y `maestro`. Otros roles de lectura se corresponden con el catálogo vigente; ampliar cierre o comunicaciones requiere una asignación institucional verificada.

## Verificación reproducible

```sh
cd tools/security-regression
npm ci
npm test
```

La suite no necesita claves, conexión a Supabase ni datos reales. Instala versiones exactas con lockfile y tiene un workflow independiente de GitHub Actions. Los resultados de la ejecución local se registran en `verification.json`.

Se ejecutan las definiciones recuperadas de funciones/políticas y las estructuras de las tablas afectadas. Se prueban identidad de maestro distinta de usuario Auth, suplencia, acceso del worker, perfiles desconocidos/inactivos, rechazo de fusión, actor falso, conteo, justificación, cierre duplicado y rollback al fallar la auditoría. Las vistas se cargan desde sus definiciones recuperadas, no desde una simulación JavaScript.

**Límite:** PGlite 0.5.8 ejecuta PostgreSQL 18.3; producción usa PostgreSQL 17.6. Los fixtures no reproducen todos los triggers, restricciones, extensiones ni funciones del sistema. `fn_es_dia_lectivo` es una dependencia sintética que devuelve true; las reglas de calendario no se certifican aquí. No se prueba concurrencia entre conexiones, PostgREST ni sesiones Auth reales. La prueba positiva de cierre usa un período sintético, nunca uno de producción. No se reejecutó la suite completa histórica de v1.

## Secuencia de despliegue y bloqueos concretos

1. Obtener una copia **solo de esquema**, con cuerpos de funciones, propietarios, ACL, políticas, vistas, triggers y extensiones, usando `pg_dump --schema-only --format=custom` en el entorno autorizado. No incluir datos personales ni secretos en el repositorio. El snapshot SQL actual contiene firmas, no todos los cuerpos.
2. Restaurar ese esquema en un Supabase/PostgreSQL 17 aislado y reconciliar funciones instaladas manualmente con el ledger. El entorno de esta revisión no dispone de un dump completo restaurable ni de esa instancia compatible; G1 permanece abierto.
3. Ejecutar esta migración y los casos de aceptación sobre esa restauración, especialmente vistas, creación/edición de períodos, asignaciones titular/suplente y el consumidor de WhatsApp. Revisar todos los caminos de `SECURITY DEFINER`, privilegios por columna y propietarios que puedan evitar los gates. Este cambio no certifica la totalidad de las 263 funciones.
4. No ejecutar `supabase db push` indiscriminadamente. La migración antigua `20260910170000_harden_rls_and_security_definer_v1_lts.sql` contiene borrado ante colisiones y referencias que no coinciden con el esquema actual. Este parche la sustituye para las superficies descritas; no incorpora todas sus demás modificaciones. Reconciliarla explícitamente antes de reproducir el historial completo.
5. Con G1 y compatibilidad satisfechos, aplicar **únicamente** `20260911020424_f0_security_containment.sql` por el mecanismo de migración controlado; registrar su versión. El timeout de locks limita esperas y toda la migración es transaccional.
6. Ejecutar `supabase/verify_f0_security.sql`, exigir que todos los checks sean true, revisar advisors y probar los recorridos operativos autorizados. No usar una fusión ni un cierre real como prueba.
7. Desplegar el adaptador ACM y verificar el resultado mediante un período sintético en staging. La versión anterior del adaptador intenta escrituras que la migración prohíbe; habrá que coordinar la actualización para evitar una ventana con el botón de cierre fallando.

No se solicita nuevamente autorización de diseño: ya está concedida. Los bloqueos anteriores son evidencia técnica pendiente, no una repetición de G0.

## Reversión

Un error durante la migración revierte la transacción. Después de una instalación correcta, no restaurar sobre producción una copia antigua de datos ni reabrir permisos públicos como rollback. Mantener la contención, retirar temporalmente la acción afectada y hacer una corrección hacia adelante basada en la definición previamente capturada. La fusión permanece suspendida hasta aprobar y probar un reemplazo que preserve la unión de historiales y trate conflictos sin DELETE.

## Trabajo que continúa pendiente

G2 se cierra solo tras instalación y verificación de catálogo. G3 requiere recorridos completos de identidad, asistencia, justificación, pagos y demás contratos. La autenticación biométrica basada en caché, el estado de cumplimiento que transforma errores en éxito y la atomicidad de aprobación de ausencias no se modifican en esta entrega. La nueva aplicación deberá excluir esos comportamientos. El plan F0 aprobado sigue siendo la referencia; este parche no equivale a terminar la Fase 0.
