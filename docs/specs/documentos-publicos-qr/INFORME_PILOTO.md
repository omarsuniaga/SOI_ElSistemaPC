# Informe de preparación para un piloto real — Programa de mano de El Sistema Punta Cana

Fecha: 2026-10-18 (UTC) · Rama `feat/documentos-qr-publicos` · Producción (`zmhmdvmyeyswunurcyow`): **sin cambios**; sin merge, despliegue ni migraciones en producción; sin recursos facturables.

## 0. Veredicto

**APTO CON CONDICIONES.**

Justificación: el flujo completo (subir PDF e imagen → publicar → QR PNG/SVG que escanea a `/d/<slug>` → lectura pública sin sesión → reemplazo manteniendo URL y QR → historial → despublicación → rechazo a no admins) funciona en un navegador real contra **GoTrue, PostgREST y Storage reales** en una pila local aislada, con 217 comprobaciones de seguridad por rol en PostgreSQL, 51 contra Storage real, 16 contra la Edge Function real y 50 pruebas unitarias. No hay hallazgos bloqueantes abiertos. Quedan condiciones que **no se pueden cerrar sin tocar producción o Netlify** (§6): validar una vez en el entorno alojado (cabeceras de caché, expiración de la URL firmada, panel dentro del portal ADM, QR con teléfono real) y desplegar la verificación de contenido en servidor o aceptar expresamente el riesgo R1 para un piloto de 2 administradores de confianza.

## 1. Qué está verificado y qué no

### Verificado en navegador (evidencia en `docs/specs/documentos-publicos-qr/evidencia/`)

| Requisito | Resultado | Evidencia |
|---|---|---|
| Subida de PDF por la UI | ✔ v1/v2, huella SHA-256, bitácora | `navegador.md` #2, #6 |
| Subida de imagen (PNG) | ✔ publicada y mostrada | #15, `pagina-publica-imagen.jpg` |
| Lectura pública sin sesión (`/d/<slug>`), apertura directa y recarga | ✔ | #7, `netlify_rewrites.txt` |
| QR PNG y SVG descargables | ✔ 26 641 B / 1 584 B | #4, `qr-soi-0f5dadd809.png/.svg` |
| El QR **escanea** a `/d/<slug>` (decodificador independiente jsQR; PNG de 1024 a 128 px y SVG de 256 a 1024 px) | ✔ payload exacto | `qr_scan.txt`, `qr_scan_produccion_like.txt` |
| El QR nunca contiene URL temporal ni ruta del objeto | ✔ prueba unitaria + escaneo | `qrPayload.test.js` |
| Reemplazo de PDF manteniendo URL y QR | ✔ v2 vigente; mismo slug; el PDF descargado es el v2 | #6, #7 |
| Historial de versiones (admin) | ✔ v1/v2, vuelta atrás probada en PG y Storage | #6, `e2e_storage.txt` |
| Despublicación: la URL pública deja de mostrar el documento; una URL firmada **nueva** falla | ✔ "Documento no disponible"; `sign` 400; `/object/authenticated` y `/object/public` 400 | #9–#11 |
| Maestro autenticado no sube ni crea | ✔ lista vacía, "No autorizado", upload denegado por RLS | #13–#14 |
| Lista de verificación del informe de estado §4: `createSignedUrl` como anon, upload/remove/list denegados, sin upsert, Content-Type | ✔ | `e2e_storage.txt` (51/51) |
| Borrador, archivado e inexistente: mismo mensaje, sin archivo | ✔ | `navegador.md`, matriz estado×rol en `postgres_suite.txt` |
| Móvil 375 px | ✔ sin desplazamiento horizontal | VALIDACION_FUNCIONAL §2 |
| Panel admin (listado, detalle, QR, URL, historial, bitácora) | ✔ | `panel-admin-detalle-qr.jpg` |

### Verificado por pruebas automáticas
PostgreSQL 17 aislado **217/217** (anon, user, alumno, representante, maestro, coordinación, dirección, inventarista, admin pendiente/inactivo, admin, superadmin, service_role; subida/reemplazo/borrado en `storage.objects`; bucket solo lectura de lo publicado; las 8 políticas reales de producción con helpers "siempre verdadero"; rollback y reaplicación); **9/9 mutaciones** detectadas; Storage real local **51/51**; Edge Function real local **16/16**; Vitest del módulo **50/50**.

### NO verificado
- Servicio Storage **alojado** de Supabase (cabeceras de caché/CDN, expiración exacta de la URL firmada, límites de plan).
- Netlify **real** (se usó un emulador con las reglas y la CSP reales).
- Panel dentro del **portal ADM real** con inicio de sesión del portal (se montó la vista real contra la API real, no el shell).
- Lectura del QR con un **teléfono** físico y de un **impreso** (se decodificó con jsQR desde archivos).
- Edge Function **desplegada** (probada solo en el runtime local).
- Interacción con las demás tablas reales de SOI y con las ramas de seguridad ya integradas.

## 2. Flujo operativo para el administrador (programa de mano)

Requisito: usuario con rol `admin` o `superadmin` activo. Menú del portal ADM → *Sistema & Accesos* → **Documentos públicos y QR**.

1. **Nueva publicación** → título (p. ej. "Programa de mano — Concierto de Navidad"), descripción, fecha, categoría *Boletín* → **Crear**. Queda en *Borrador*; la dirección permanente aparece junto al QR.
2. **Subir documento**: elegir el PDF (o JPG/PNG/WebP, máx. 10 MB) → *Motivo* opcional → **Subir**. Si el contenido no corresponde al formato, se rechaza.
3. **Revisar**: botón del ojo en el historial abre la versión (solo admin ve borradores).
4. **Publicar**. Desde este momento `…/d/<slug>` muestra el documento a cualquier persona.
5. **Descargar el QR**: botones **PNG** (1024 px, para maquetar) y **SVG** (vectorial, preferible para imprenta). Verificar que la URL mostrada sea el dominio definitivo antes de imprimir.
6. **Reemplazar** (corrección de repertorio): subir el nuevo archivo con el motivo. **La dirección y el QR no cambian**; los ya impresos muestran la versión nueva. Se puede volver a una versión anterior con el botón de reactivar.
7. **Despublicar** (retirar el programa) o **Archivar** (cerrar definitivamente). El enlace pasa a "Documento no disponible". *Restaurar* devuelve a borrador.
8. **Auditoría**: el registro de actividad del panel indica quién hizo qué y cuándo.

Regla de contenido: no publicar datos personales (nombres de alumnos con datos de contacto, cédulas, etc.); todo lo publicado es de acceso público por definición.

## 3. Recomendaciones de impresión del QR

- **Archivo**: usar el **SVG** para imprenta; PNG solo para maquetación (1024 px). No reescalar con suavizado ni recomprimir en JPG.
- **Tamaño**: lado del símbolo **≥ 2,5 cm** sin contar el margen (≥ 3 cm si el programa se lee con poca luz o a más de 25 cm). Regla práctica: distancia de lectura ÷ 10.
- **Zona de silencio**: el archivo ya incluye 4 módulos de margen blanco; **no recortarlo** ni imprimir texto o bordes dentro de él.
- **Corrección de errores**: nivel **M** (tolera ~15 % de daño). No colocar logotipos encima ni usar QR "decorados".
- **Contraste**: **negro sobre blanco**, no invertir (blanco sobre negro), evitar colores claros o fondos con trama. Papel **mate**; evitar pliegues, brillos y esquinas curvas sobre el símbolo.
- **Longitud de URL**: un dominio corto produce un QR menos denso. Con una URL de producción típica (≈ 50 caracteres) el QR es de versión 4 (33 × 33 módulos, más 4 de margen) y decodifica desde 128 px (`qr_scan_produccion_like.txt`).
- **Prueba antes de imprimir**: leer el impreso de prueba con un iPhone y un Android (cámara nativa) y confirmar que abre el documento correcto.
- Añadir la dirección **en texto** debajo del QR como alternativa.

## 4. Riesgos residuales

| ID | Riesgo | Gravedad | Mitigación / estado |
|---|---|---|---|
| R1 | Validación de firma solo en cliente: un admin puede registrar bytes arbitrarios por la API (demostrado) | Media | Edge Function + migración staged implementadas y probadas (16/16); **sin desplegar**. Para el piloto: 2 admins de confianza o desplegar antes |
| R2 | **Expiración de URLs firmadas**: la emitida antes de despublicar sigue válida ≤ 300 s (comprobado) | Baja | TTL corto; subida con `cacheControl: 60 s`. Verificar en alojado que la URL **expirada** falla y no la sirve una caché |
| R3 | **Caché de CDN**: la URL firmada y su token forman la clave de caché; un token nuevo tras despublicar falla (comprobado localmente), pero el CDN real no se ha probado | Media | Verificación en alojado (§6 C4); `Cache-Control` ahora 60 s; `d.html` es un shell estático sin datos |
| R4 | **Descargas masivas / abuso**: la RPC pública y `createSignedUrl` son anónimas; 10 MB por archivo; el egreso consume cuota | Media | Sin limitación de tasa propia. Mitigación: monitorear egreso en el panel de Supabase; límite por plan; si hay abuso, **interruptor de emergencia** (§7) y/o regla de rate limiting en Netlify/Cloudflare delante del dominio |
| R5 | Enumeración de slugs (40 bits) | Baja | Lo no publicado no revela nada y no distingue inexistente de borrador |
| R6 | Un PDF válido puede contener contenido activo | Media | Solo admins suben; considerar antivirus antes de ampliar roles |
| R7 | Versiones reemplazadas permanecen en el bucket (nadie puede borrarlas por política) | Media | Procedimiento de purga por superadmin/servicio por definir; regla "sin datos personales" |
| R8 | Las URLs firmadas se sirven sin `X-Content-Type-Options` | Baja | `Content-Type` almacenado y 4 tipos permitidos; confirmar en alojado |
| R9 | El shell ADM no aplica `ROUTE_PERMISSIONS`: coordinación ve el menú | Baja | El panel muestra "Acceso restringido" (prueba) y la BD rechaza toda escritura |
| R10 | `VITE_PUBLIC_BASE_URL` ausente → el QR usaría el dominio desde el que se abra el panel | Media | Variable obligatoria en Netlify; verificar la URL visible antes de imprimir |
| R11 | Modo Demo por `localStorage.demo_mode` también afecta a `/d/…` en ese navegador | Baja | Solo si el usuario lo activa; en producción rige `VITE_DEMO_MODE` |
| R12 | Sin `institucion_id` (exención R3 declarada) | Baja | Plan en la especificación |

## 5. Checklist previo al despliegue

**Variables y Netlify**
- [ ] `VITE_PUBLIC_BASE_URL=https://<dominio-definitivo>` en Netlify (sin barra final) y confirmado en el panel (URL mostrada junto al QR).
- [ ] `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` ya definidas; **no** definir `VITE_DEMO_MODE`.
- [ ] Si se despliega la Edge Function: `VITE_DOCS_SERVER_VERIFY=true`.
- [ ] Deploy preview de Netlify: abrir `https://<preview>/d/<slug>` en frío y recargar; `/documentos-publicos` (admin) no debe ser capturado por `/d/*`; la CSP vigente permite `connect-src https://*.supabase.co` e imágenes `https:`.

**Orden de migraciones frente a las ramas de seguridad** (todas pendientes de merge a `master`; sin objetos en común con este módulo, ver `INFORME_ESTADO.md` §2):
1. `20261017180000` — anon-write (catálogo y registros de clase). Independiente.
2. `20261017190000` — R9 (`permisos_maestros`). Independiente.
3. `20261017200000` — storage (**publicar primero el frontend de esa rama**, luego la migración, según su cabecera). No toca `soi-publico` ni `signage` público.
4. `20261018120000` — **este módulo** (tablas + RPC + bucket `soi-publico` + políticas `docs_publicos_*`). Puede aplicarse antes o después de 1–3; se recomienda **después** para que la verificación posterior cubra el estado final.
5. (Opcional, tras desplegar la función) mover `supabase/staged/20261018130000_…` a `migrations/` y aplicarla.
- [ ] Tras cada merge de una rama de seguridad: `npm run test:db:documentos-qr` (217 comprobaciones, 9 mutaciones).
- [ ] `soi_security.has_role` presente y con la definición de producción (lectura de `pg_proc`).
- [ ] Copia de seguridad/estado previo anotado; `policy:check` sin deuda nueva atribuible al módulo.
- [ ] Autorización expresa del titular para la migración en producción.

## 6. Condiciones para el piloto (cierran el "APTO CON CONDICIONES")

Obligatorias:
- **C1.** Autorización expresa para aplicar la migración y desplegar el frontend; rollback ensayado (§7).
- **C2.** Smoke test en producción **antes de imprimir**, con un documento de prueba no sensible: `anon` abre `/d/<slug>`; descarga; despublicar → página "no disponible" y URL firmada **nueva** falla; **esperar >5 min** y comprobar que la URL firmada **antigua** ya no responde (cierra R2/R3); revisar cabeceras `Cache-Control` y `Content-Type` de la respuesta.
- **C3.** Recorrido del panel dentro del portal ADM con un admin real, y comprobar que coordinación ve "Acceso restringido".
- **C4.** Lectura del QR impreso de prueba con un iPhone y un Android.
- **C5.** `VITE_PUBLIC_BASE_URL` fijada y verificada (R10).
- **C6.** Decidir R1: desplegar la Edge Function **o** aceptar por escrito el riesgo para 2 administradores de confianza durante el piloto.
- **C7.** Nombrar responsables (quién administra y quién aprueba el contenido) y la regla "sin datos personales".

Alcance sugerido: **un** documento (el programa de mano), 2 administradores, una semana; revisar a diario el egreso de Storage y la bitácora (`publicaciones_documentos_eventos`).

## 7. Plan de rollback

1. **Retirar contenido (inmediato, sin SQL):** *Despublicar* desde el panel. El enlace muestra "no disponible".
2. **Interruptor de emergencia (SQL, 1 línea, reversible):** cortar la lectura pública sin borrar datos:
   `REVOKE EXECUTE ON FUNCTION public.obtener_publicacion_publica(text), public.storage_objeto_publicado(text) FROM anon;` (restaurar con `GRANT … TO anon`). Con esto anon no obtiene metadatos ni puede firmar objetos.
3. **Frontend:** revertir el deploy de Netlify; la ruta `/d/*` deja de existir (los QR impresos mostrarían la página de la app) y el panel desaparece; la BD queda inerte.
4. **Esquema:** (si se aplicó la etapa 2: `supabase/rollback/20261018130000_…rollback.sql` primero) y luego `supabase/rollback/20261018120000_documentos_publicos_qr.rollback.sql`. **Destructivo** para publicaciones/versiones/bitácora (exportar antes). Antes, vaciar el bucket `soi-publico` por la API de Storage (el script solo elimina el bucket si está vacío). No toca otros buckets ni políticas.
5. Probado: el rollback y la reaplicación están en la suite PostgreSQL (sección H) y el de la etapa 2 en la sección J.

## 8. Reproducibilidad

```bash
bash supabase/tests/documentos-qr/local-stack/start.sh          # pila local sin costo
node supabase/tests/documentos-qr/run_tests.mjs                  # PostgreSQL aislado (+ --mutate 1..9)
node supabase/tests/documentos-qr/e2e_storage.mjs                # Storage real local
node supabase/tests/documentos-qr/e2e_stage2.mjs                 # Edge Function real local (tras aplicar la staged)
npm i --no-save jsqr && node supabase/tests/documentos-qr/qr_scan_check.mjs <url> <archivos>
```
Detalle en `VALIDACION_FUNCIONAL.md` y `ESPECIFICACION.md` §14.
