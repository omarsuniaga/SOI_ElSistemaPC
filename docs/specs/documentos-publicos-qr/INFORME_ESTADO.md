# Documentos públicos y QR — Informe de estado, riesgos y condiciones de piloto

Fecha: 2026-10-17 · Rama: `feat/documentos-qr-publicos` · Producción (`zmhmdvmyeyswunurcyow`): **sin cambios** (solo lecturas de catálogo). Sin merge, sin despliegue, sin migraciones en producción.
Especificación: [`ESPECIFICACION.md`](./ESPECIFICACION.md) · Validación: [`VALIDACION_FUNCIONAL.md`](./VALIDACION_FUNCIONAL.md)

## 1. Estado del módulo

| Área | Estado |
|---|---|
| MVP (subida, publicaciones, versionado, QR PNG/SVG, URL `/d/<slug>`, página pública, estados, auditoría, autorización) | **Terminado** en la rama |
| QR codifica **solo** `https://<dominio>/d/<slug>` (nunca URL firmada ni ruta del objeto) | ✔ por diseño y con prueba (`qrPayload.test.js`) |
| Bucket privado `soi-publico` + URL firmada de 300 s | ✔ **confirmado con Storage real** (pila local) |
| Etapa 2 — verificación de contenido en servidor (Edge Function + RPC verificada) | **Implementada y probada localmente; sin desplegar**. Migración en `supabase/staged/` (a propósito fuera de `migrations/`) |
| Rama al día con `master` | ✔ (merge `1f583df3`; 18 commits de asistencias, sin cambios en `supabase/` ni en archivos del módulo) |

## 2. Revisión de dependencias tras actualizar con master

* `master` avanzó solo en `asistencias`/`progresos` (sin migraciones). Tras el merge: 134/134 pruebas de `src/core`, `src/portales` y el módulo; 217/217 en PostgreSQL.
* Ramas de seguridad **no mergeadas** a master (revisadas por contenido, no por nombre): `anon-write…` (head `e98e1a52`, solo cambió un doc), `r9-permisos-maestros…` (ahora con `20261017190000_secure_permisos_maestros_self_edit.sql`) y `storage-privado…` (`20261017200000`).
* Colisiones de nombres de tablas, funciones, políticas, triggers e índices entre mi migración y las tres: **ninguna** (comparación automática del `CREATE …`). Ninguna menciona `soi-publico` ni `publicaciones_documentos`.
* Dependencia real única: `soi_security.has_role` (en master y producción). Las políticas actuales de `storage.objects` en producción están acotadas por bucket y se probaron con helpers "siempre verdadero".
* Conflicto textual esperable: una línea de `package.json` junto a `test:db:anon-write`.

## 3. Comprobaciones pedidas

| # | Requisito | Evidencia |
|---|---|---|
| 1 | Rama actualizada y dependencias revisadas | §2 |
| 2 | Acceso público sin autenticación; borrador/archivado inaccesibles a **nuevas** solicitudes | PostgreSQL: matriz estado × rol (anon, user, alumno, representante, maestro, coordinación, dirección, inventarista, admin pendiente/inactivo) sobre RPC, objeto y listado. Storage real (`e2e_storage`, 51/51): `anon` firma el publicado y no firma borrador/archivado/antiguo; ruta `/object/public/` y `/object/authenticated/` con anon key denegadas. Navegador: borrador, archivado e inexistente muestran el mismo mensaje |
| 3 | Versiones antiguas no consultables si dejaron de estar autorizadas | La política de lectura pública exige que el objeto sea la **versión vigente** de una publicación `publicado`; la RPC pública solo devuelve esa versión; la tabla de versiones y la bitácora solo las leen admin/superadmin. Probado para todos los roles no admin (RPC, objeto y filas) en PG y con Storage real. Admin conserva acceso a versiones antiguas (autorizado) y puede reactivar una |
| 4 | Rutas de Netlify al abrir el QR y recargar | `netlify.toml` y `public/_redirects` resuelven `/d/*` → `d.html` 200 antes del catch-all (`netlifyRoutes.test.js`, 8 pruebas); navegador contra emulador con las reglas y la CSP reales: apertura directa y recarga OK |
| 5 | Validación funcional en navegador y con Storage real | Pila local aislada (GoTrue/PostgREST/Storage reales) + navegador; procedimiento y checklist de staging en `VALIDACION_FUNCIONAL.md` |
| 6 | Riesgo de validación solo en cliente | §4 R1 y Etapa 2 implementada |

## 4. Riesgos pendientes

| ID | Riesgo | Gravedad | Estado / mitigación |
|---|---|---|---|
| R1 | Validación de firma solo en cliente: un admin (o una sesión admin robada) puede subir bytes arbitrarios con MIME/extensión permitidos y **registrarlos** vía RPC directa. **Demostrado** (`e2e_storage` §7: Storage acepta un `.exe` declarado PDF y la RPC lo registra) | Media (solo admins; bucket sin HTML/SVG; nunca se sirve inline por el sitio) | Etapa 2: Edge Function verifica firma/tamaño en servidor, calcula el SHA-256 real, borra el objeto inválido y registra con la RPC `service_role`; la RPC directa se revoca. Probado local 16/16. **Falta desplegar** (autorización) |
| R2 | URL firmada ya emitida sigue válida ≤300 s tras despublicar/reemplazar | Baja | Aceptado; TTL ajustable en `SIGNED_URL_SECONDS` |
| R3 | Las URLs firmadas se sirven **sin** `X-Content-Type-Options` ni `Cache-Control` (observado en Storage local) | Baja | `Content-Type` es el almacenado y el bucket solo admite 4 tipos; confirmar en staging y, si procede, cabeceras vía proxy |
| R4 | Un PDF válido puede contener contenido activo/malicioso (JavaScript embebido); la firma no lo detecta | Media | Solo admins suben; considerar antivirus (p. ej. ClamAV en la Edge Function) antes de abrir la subida a más roles |
| R5 | Panel probado con sesión admin real contra la API real, pero **no dentro del shell ADM** con inicio de sesión del portal | Media | Condición de piloto (§5) |
| R6 | Reglas de Netlify validadas con emulador fiel a `netlify.toml`/`_redirects` y a sus cabeceras, no con Netlify real; el orden `_redirects` vs `netlify.toml` es el mismo resultado en ambos | Baja | Probar un deploy preview |
| R7 | Dominio del QR depende de `VITE_PUBLIC_BASE_URL`; si falta, usa `window.location.origin` (puede ser preview) | Media | Fijar en Netlify y verificar la URL visible antes de imprimir |
| R8 | QR no leído con teléfono físico | Baja | Condición de piloto |
| R9 | Versiones reemplazadas permanecen en el bucket (historial); si contuvieran datos personales por error siguen almacenadas y nadie puede borrarlas por política | Media | Procedimiento de retención/purga (superadmin vía SQL/servicio) por definir; política de publicación: no subir datos personales |
| R10 | Enumeración: 40 bits de slug; sin limitación de tasa propia en la RPC pública | Baja | Los no publicados no revelan nada; confiar en los límites de la plataforma; vigilar logs |
| R11 | R3: sin `institucion_id` (exención declarada) | Baja hoy | Plan en la especificación |
| R12 | Cuota/costo de Storage y egreso (10 MB por archivo, sin límite por publicación) | Baja | Monitorear |
| R13 | Mover la migración staged **antes** de desplegar la función rompe el registro de versiones | Media | Orden documentado en el encabezado de la migración; rollback inmediato |
| R14 | Dependencias de master no mergeadas (3 ramas de seguridad) pueden cambiar `soi_security.has_role` o políticas de storage al integrarse | Baja | Reejecutar `npm run test:db:documentos-qr` tras cada merge de seguridad |

## 5. Condiciones para la prueba piloto real

Obligatorias:
1. Autorización expresa para staging (o rama de Supabase; mostrar costo) y para el piloto en producción.
2. Aplicar la migración `20261018120000` y ejecutar en staging la lista de `VALIDACION_FUNCIONAL.md` §3 (incluye Storage real con la URL de staging).
3. Desplegar la Edge Function y pasar a producción la migración staged **antes** de abrir el piloto a usuarios reales (cierra R1), con `VITE_DOCS_SERVER_VERIFY=true`.
4. Fijar `VITE_PUBLIC_BASE_URL` al dominio definitivo; deploy preview de Netlify y prueba de `/d/<slug>` en frío y con recarga.
5. Recorrer el panel dentro del portal ADM con un administrador real (menú "Documentos públicos y QR", ruta solo-admin) y confirmar que un maestro/coordinación no ve la entrada ni accede a la ruta.
6. Imprimir un QR de prueba y leerlo con al menos un iOS y un Android.
7. Definir quién administra (hoy `admin`/`superadmin`), qué se puede publicar y la regla "sin datos personales".

Recomendadas: antivirus (R4), procedimiento de purga (R9), cabeceras en URL firmada (R3), alerta de logs de la RPC pública (R10).

Alcance sugerido del piloto: 2–3 documentos no sensibles (calendario, comunicado), 2 administradores, una semana, con revisión de logs de Storage y de la bitácora `publicaciones_documentos_eventos`.

## 6. Pruebas (resultado actual)

| Suite | Resultado |
|---|---|
| PostgreSQL 17 aislado, `node supabase/tests/documentos-qr/run_tests.mjs` (roles, Storage, matriz estado×rol, versiones antiguas, etapa 2, rollback y reaplicación) | **217 / 217** |
| Mutaciones 1–9 de la migración | **9 / 9 detectadas** |
| Storage real local, `e2e_storage.mjs` | **51 / 51** |
| Edge Function real local, `e2e_stage2.mjs` | **16 / 16** |
| Vitest del módulo | **48 / 48** |
| Vitest `src/core` + `src/portales` | 134 / 134 |
| `vite build` | OK (`d.html`) |
| `npm run policy:check` | falla solo por deuda previa (29 tablas sin escritor); las tablas del módulo no aparecen |

## 7. Qué NO se hizo (por instrucción)

Merge a master, despliegue, migraciones o DDL en producción, despliegue de la Edge Function, ramas de Supabase de pago.
