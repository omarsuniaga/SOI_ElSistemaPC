# Diagnóstico técnico del SOI

**Fecha de revisión:** 11 de octubre de 2026  
**Alcance:** lectura del código/configuración disponible, ejecución de pruebas automatizadas y lectura de estado/asesores Supabase.  
**Evaluación general:** riesgo elevado en la superficie RPC de la base de datos; sistema funcionalmente amplio y con suite significativa, pero actualmente con fallos de pruebas y estabilidad del runner.  
**No se modificó producción, datos, esquema ni despliegues.**

## Resumen ejecutivo

| Área | Resultado | Prioridad sugerida |
|---|---|---|
| RPC Supabase `SECURITY DEFINER` invocables por `anon` | 128 hallazgos | P0 — revisar exposición inmediatamente |
| Vistas `SECURITY DEFINER` | 13 hallazgos, nivel ERROR | P1 — alta |
| Tablas con RLS habilitado y sin políticas | 8 hallazgos | P1 — alta |
| Funciones con `search_path` mutable | 104 advertencias | P1 — alta |
| Claves foráneas sin índice de cobertura | 218 hallazgos | P2 — priorizar con datos de carga |
| Vitest | 2,448 aprobadas, 17 fallidas, 6 omitidas y 71 errores; 56/316 archivos fallidos | P1 — alta |
| Build | Falló: faltan `@vitejs/plugin-react` y `@tailwindcss/vite` en `node_modules` aunque figuran en `package.json` | P1 — bloquea release |
| Lint | 701 advertencias, 0 errores reportados; comando devolvió código 1 | P2 — limpiar/definir umbral |
| Git y deploy Netlify | Estado del árbol y sitio remoto no verificados | Pendiente |

El proyecto Supabase `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`) figura `ACTIVE_HEALTHY`, PostgreSQL 17.6.1.111, región `us-east-2`. “Healthy” confirma disponibilidad de la instancia, no la seguridad o corrección funcional de la aplicación.

## Hallazgos prioritarios

### 1. Superficie RPC con privilegios elevados — riesgo alto

El asesor de seguridad Supabase reporta **128 funciones `SECURITY DEFINER` ejecutables por `anon`** vía RPC. Entre las funciones citadas en el resultado se encuentran `fn_alumno_ficha_360`, `ensure_session_and_save_evaluation`, `crear_reparacion`, `cambiar_estado_activo` y `fn_actualizar_contacto`. La salida con el inventario completo fue truncada por el conector.

`SECURITY DEFINER` ejecuta con privilegios del propietario. El hallazgo no prueba que cada rutina sea explotable: algunas podrían validar autorización internamente o estar deliberadamente disponibles en un flujo público. Pero, dada la cantidad y la clase de operaciones citadas, deben revisarse con urgencia permisos efectivos, autenticación, validación de rol/contexto, argumentos, datos retornados y escrituras posibles. El esquema consultado almacena datos identificativos, familiares, de contacto y médicos de alumnos; una exposición tendría impacto alto.

**Acción recomendada:** obtener lista completa; auditar `EXECUTE` por rol, controles de autorización dentro del cuerpo y exposición de cada rutina. Revocar permisos anónimos salvo casos públicos justificados y probar en staging. No aplicar revocaciones masivas sin analizar consumidores.

[Remediación Supabase: SECURITY DEFINER ejecutable por anon](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)

### 2. Vistas `SECURITY DEFINER`

Se reportan **13 vistas**, nivel **ERROR**, entre ellas `vw_mora_activa`, `vw_estado_familiar`, `vw_asistencias_consolidada`, `v_alumnos_criticos_ausentismo` y vistas de señalización. Una vista con este modo puede aplicar permisos/RLS del propietario, no los del consultante.

**Acción:** revisar definición, propietario, `GRANT`, campos expuestos y uso por cada vista; usar `security_invoker` o restringir acceso cuando corresponda. Validar consultas con usuarios representativos por rol y sin sesión.

[Remediación Supabase: vistas SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

### 3. Ocho tablas RLS habilitado, sin políticas

El asesor reporta: `public.fin_service_accounts`, `public.fin_service_balance_snapshots`, `public.fin_service_providers`, `public.fin_service_refresh_runs`, `public.fin_service_refresh_state`, `public.montaje_pasaje_compases`, `public.plantillas_planificacion` y `soi_security.enrollment_events`.

Sin políticas, las operaciones de roles sujetos a RLS suelen denegarse; puede ser una decisión intencional para tablas internas, pero también causar fallos o motivar rutas privilegiadas. Confirmar propietarios, acceso indirecto desde RPC y propósito de cada tabla.

[Remediación Supabase: RLS habilitado sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)

### 4. 104 funciones con `search_path` mutable

El asesor advierte que **104 funciones** no fijan `search_path`. El impacto depende de permisos y objetos referenciados; en funciones privilegiadas aumenta riesgo de resolución ambigua de objetos.

**Acción:** priorizar funciones `SECURITY DEFINER`, fijar un `search_path` explícito y mínimo, calificar nombres de objetos y revisar permisos `CREATE` de los esquemas involucrados. Desplegar mediante migraciones pequeñas con pruebas.

[Remediación Supabase: search_path mutable](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

### 5. Rendimiento: 218 claves foráneas sin índice

El asesor de rendimiento reporta **218 claves foráneas sin índice de cobertura**. El efecto no es uniforme: depende del tamaño de tabla, joins, borrados/actualizaciones de claves referenciadas y consultas reales.

**Acción:** priorizar con estadísticas de uso, cardinalidad y `EXPLAIN`; comprobar índices compuestos existentes antes de crear nuevos. Aplicar cambios medidos, concurrentemente cuando sea adecuado, y comparar latencia/costo.

[Remediación Supabase: claves foráneas sin índice](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)

También se reportaron `pg_trgm` y `pg_net` instaladas en `public`; evaluar dependencias y compatibilidad antes de moverlas.

## Pruebas y calidad del código

La ejecución de `npm run test:run` terminó con código 1. Resultados de Vitest:

- **316** archivos: 258 aprobados, 56 fallidos y 2 omitidos.
- **2,471** pruebas: 2,448 aprobadas, 17 fallidas y 6 omitidas.
- **71 errores no controlados**, principalmente fallas al iniciar workers (“Timeout waiting for worker to respond”). Duración reportada: **842.16 s**; tiempo agregado de entornos: **3,488.24 s** entre workers.

Fallos funcionales concretos mostrados al final de la salida:

- `evaluacionClaseService`: discrepancia entre mensajes esperados y validación real de campos requeridos.
- `crearAlumno.familia`: mock de `supabase.rpc` no compatible con `.catch`; mensaje de error RLS no traducido al texto accionable esperado.
- `realAlumnosService`: prueba esperaba `idia = 40`, recibió `0`.
- `AppModal`: contenido del modal nuevo se vacía/cierra al vencer un temporizador anterior.
- Suites de programas y periodos expiran a los 5 segundos.
- También fallaron workers de test por timeout de arranque; separar estos errores de las fallas deterministas del código.

**Siguiente prueba recomendada:** repetir primero los tests fallidos individualmente o con concurrencia reducida, en equipo estable; clasificar test flaky/infraestructura frente a regresión real y corregir agrupaciones de contratos. No se repitió la suite después de recuperar conexión porque ya había terminado y sus resultados se conservaron.

## Arquitectura, configuración y mantenimiento

- Stack observado: Vite, JavaScript ES Modules, múltiples páginas HTML y módulos de dominio; Supabase como persistencia real, con infraestructura offline descrita en el README.
- `AGENTS.md` identifica DataAdapter como arquitectura objetivo y reconoce que aún hay servicios que llaman a Supabase directamente. Esto supone acoplamiento, más dificultad para probar con mocks y riesgo de divergencia Demo/Real; es una brecha de evolución, no una incidencia de seguridad confirmada.
- Se contaron **212 archivos locales de migración**. El historial remoto muestra actividad reciente hasta septiembre de 2026. Mantener comparación automatizada local/staging/producción y orden reproducible de migraciones.
- La CSP de `netlify.toml` y la CSP declarada en `vite.config.js` no coinciden. Netlify permite `'unsafe-inline'` y `'unsafe-eval'`, más `openrouter.ai`; Vite lista CDNs y `docs.google.com`, y define directivas adicionales. Consolidar la fuente de CSP y comprobar compatibilidad funcional primero en modo de reporte; no endurecer a ciegas.
- `package.json` exige Node `>=20.19`; Netlify fija `NODE_VERSION = "20"`. Verificar la versión exacta disponible en el build antes de asumir compatibilidad.
- El listado superficial mostró `.env`, `.env.local` y `.env.test`; no se leyó su contenido. No pudo comprobarse si están versionados, ya que Git informó “not a git repository” y el directorio `.git` denegó lectura. Confirmar con `git ls-files -- .env .env.local .env.test` desde un terminal con acceso. Si algún secreto real quedó en historial remoto, revocarlo/rotarlo siguiendo procedimiento institucional.

## Plan de trabajo recomendado

### Inmediato
1. Obtener el inventario completo del asesor Supabase; revisar las 128 RPC y 13 vistas, priorizando lectura/escritura anónima y datos personales.
2. Probar escenarios anónimos y roles de usuario en staging, en especial consultas y mutaciones de datos de alumnos.
3. Confirmar el estado de `.env*` en Git sin imprimir secretos; rotar claves solo si se evidencia exposición.
4. Respaldar configuración y preparar migraciones revisables antes de corregir permisos.

### Siguiente iteración
1. Corregir grants y vistas con pruebas de regresión por rol.
2. Endurecer `search_path` primero en funciones privilegiadas.
3. Alinear CSP desde una fuente central y validar en entorno de prueba.
4. Aislar y resolver fallos deterministas de tests; estabilizar workers y tiempos del runner.

### Evolución
1. Priorizar los 218 índices faltantes con carga real y planes de consulta.
2. Añadir CI con build, lint, formato, pruebas y controles de seguridad antes de release.
3. Migrar DataAdapter módulo por módulo, manteniendo equivalencia Demo/Real.
4. Automatizar verificación de deriva de migraciones y smoke tests en staging.

## Evidencia y límites de esta revisión

- Leídos: `AGENTS.md`, `README.md`, `package.json`, `vite.config.js`, `vitest.config.js`, `netlify.toml`; estructura superficial de módulos.
- Supabase MCP: proyecto, tablas (respuesta extensa y truncada), migraciones y asesores de seguridad/rendimiento.
- Pruebas: `npm run test:run`, resultados arriba.
- `npm run lint`: 701 warnings, 0 errors, pero código de salida 1; investigar por qué la tarea CI retorna error pese a que ESLint solo informa advertencias.
- `npm run build`: falla al cargar Vite por falta de `@vitejs/plugin-react` y `@tailwindcss/vite` en `node_modules`. Ambos aparecen declarados en `devDependencies`, por lo que comprobar instalación/reproducibilidad del lockfile. No se instaló ni actualizó ninguna dependencia.
- El hook `prebuild` sí se ejecutó antes de fallar y estampó `public/signage/build.js` y `public/signage/device.js`. No se intentó revertir ni limpiar esos archivos automáticamente.
- **No verificados:** estado Git/tracking de secretos y sitio/deploy Netlify; el directorio `.git` no fue accesible en la sesión.
- La disponibilidad `ACTIVE_HEALTHY` y RLS habilitado en tablas consultadas no certifican los permisos efectivos ni sustituyen pruebas de acceso por rol.
