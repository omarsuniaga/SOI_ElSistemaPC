# Evidencia de la integración semestral

Fecha de trabajo: 22 de octubre de 2026 (República Dominicana; ejecución UTC del 23).

## Historia comprobada

Administración configura convocatoria → jurados registran evidencia → responsable resuelve/publica → consulta preferencia → autoriza dos clases → receptor incorpora → registra seguimiento → jurado final evalúa cada destino → responsable confirma uno y prorroga el otro, conservando teoría/solfeo.

| Frontera | Evidencia | Límite |
|---|---|---|
| UI → DataAdapter demo → persistencia | Recorrido Chromium/Playwright completo de cuatro perfiles; dos destinos; recarga; 390 px sin desbordamiento; cero errores JS | Datos sintéticos en localStorage, no Supabase real |
| RPC → PostgreSQL → respuestas | Migraciones reales cargadas en PGlite, roles authenticated/anon y fixtures mínimos; pruebas de permisos, quórum, recurso, cupo, versiones, rondas y reportes | No copia íntegra de la base ni contención nativa entre conexiones |
| Proveedor real | Una sola RPC y error explícito de migración ausente; identidad y autorización en servidor | No se declara endpoint desplegado ni sesión docente real probada |
| Regresión | Suite de audiciones, navegación docente, gestión de clases y clases | Una prueba histórica de `classHistoryModal.ratings.test.js` falla también en el árbol remoto previo sin cambios |
| Compilación | Build y TypeScript comprobados | Advertencia de tamaño de bundles heredada |
| Política estructural | Sin nuevas tablas huérfanas; exención institucional explícita | Gate arrastra las mismas infracciones R1/R3 que la base previa |

El script reproducible de navegador es `scripts/verification/initiation-semester-browser.mjs`; necesita Playwright y un Chromium utilizable. Puede indicar rutas mediante `SOI_PLAYWRIGHT_PATH` y `SOI_CHROMIUM_EXECUTABLE`. No requiere credenciales ni toca datos reales. El workflow `Initiation auditions verification` ejecuta comprobaciones focalizadas y genera un build demo como artifact.

## Publicación pendiente

Las tablas nuevas siguen ausentes en la lectura del esquema de producción. No se aplicaron migraciones, designaciones ni matrículas reales en este trabajo.

Se requiere comprobar respaldo/restauración y ensayo equivalente de esquema, validar contención entre conexiones independientes y fijar fecha/responsables del piloto. No existe en este entorno una conexión de servidor PostgreSQL de ensayo con varias sesiones: el servidor nativo descargado no puede iniciar como root y el entorno no permite cambiar a otro UID. PGlite sí ejecuta el SQL real, pero sus pruebas no sustituyen esa contención.

Tras consolidar el PR159 sobre master, Netlify inició Deploy Preview y GitHub activó CI. Su resultado y URL se comprueban por separado antes de entregar. La preview permite demo sintética por parámetro explícito y flag exclusivo de deploy-preview; no equivale a backend real activado.

## Resultado final de esta sesión

- Regresión amplia: 284 aprobadas / 285, 35 archivos; única falla heredada reproducida en el commit previo del PR159: informe histórico de valoraciones.
- Nuevas comprobaciones: 25 tests de SQL/UI/adapter (17 PostgreSQL, 6 UI y 2 adapter).
- Recorrido de navegador completo aprobado tanto servido por Vite como abriendo el HTML autónomo descargable; cuatro perfiles, dos destinos, recarga, móvil y cero errores JavaScript.
- Build y TypeScript aprobados. Lint sin errores; advertencias heredadas en vistas antiguas.
- `scripts/verification/build-initiation-preview.mjs` genera el HTML autónomo exclusivamente con datos demo y sin credenciales, para evaluación sin instalar la aplicación.

- Suite focalizada que ejecuta el workflow: 161 tests aprobados en 19 archivos.
