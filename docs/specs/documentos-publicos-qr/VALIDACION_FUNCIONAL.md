# Validación funcional — Documentos públicos y QR

Todo lo de este documento se ejecuta en **Docker local** o en un **staging** de Supabase; ninguna instrucción toca el proyecto de producción (`zmhmdvmyeyswunurcyow`).

## 1. Pila local aislada (Storage real)

`supabase/tests/documentos-qr/local-stack/` contiene la configuración de un stack Supabase **independiente** (`project_id = docqr`, puertos 54420-54439, sin Studio/Realtime/Analytics) con GoTrue, PostgREST y el **servicio Storage real**. Solo aplica un subconjunto de producción (`profiles`, `soi_security.has_role`) y la migración del módulo.

```bash
bash supabase/tests/documentos-qr/local-stack/start.sh        # levanta y aplica la migración
npx supabase status --workdir "${DOCQR_STACK_DIR:-/tmp/docqr-stack}" -o env   # URL y claves LOCALES
```

Los scripts se niegan a ejecutarse contra cualquier URL que no sea `localhost`/`127.0.0.1`.

| Comando | Qué valida | Resultado (2026-10-17) |
|---|---|---|
| `node supabase/tests/documentos-qr/e2e_storage.mjs` | API real: RLS de tablas, subida/reemplazo/borrado en Storage, URL firmada como `anon`, borrador/archivado/versiones antiguas cerrados a nuevas solicitudes, historial, límites de tamaño y MIME del bucket | **51/51** |
| `node supabase/tests/documentos-qr/seed_local.mjs` | Crea publicaciones de ejemplo (imagen, PDF, borrador, archivada) y un admin descartable | — |
| `node supabase/tests/documentos-qr/serve_dist.mjs <dist> 4180 http://127.0.0.1:54421` | Emulador de Netlify: aplica **las reglas y cabeceras reales** de `netlify.toml` (incluida la CSP) a un `dist` construido con `VITE_SUPABASE_URL` local | usado abajo |
| `node supabase/tests/documentos-qr/e2e_stage2.mjs` | Etapa 2 con `supabase functions serve` real y la migración staged aplicada | **16/16** |

`e2e_storage.mjs` valida la Etapa 1; si ya aplicó la migración staged, la RPC directa está cerrada (diseño) y la sección 2 de ese script fallará: use un stack nuevo.

## 2. Validación en navegador (realizada contra la pila local)

Construcción: `VITE_SUPABASE_URL=… VITE_SUPABASE_ANON_KEY=… VITE_PUBLIC_BASE_URL=http://127.0.0.1:4180 npx vite build --outDir <dir>` y emulador de Netlify.

| Comprobación | Resultado |
|---|---|
| Abrir `/d/<slug>` directamente (sin sesión) | ✔ regla `[rewrite] /d/… → /d.html (200)`; página renderiza |
| Recargar la página | ✔ mismo resultado |
| Imagen publicada se muestra en línea (CSP real de `netlify.toml`) | ✔ 64×64 cargada |
| PDF: "Abrir" y "Descargar" | ✔ 200 `application/pdf`; la descarga lleva `Content-Disposition: attachment` |
| Borrador, archivado y slug inexistente | ✔ mismo mensaje "Documento no disponible" (no revela existencia) |
| Móvil 375 px | ✔ sin scroll horizontal, botones a ancho completo |
| Panel admin (montado contra la pila real con sesión admin): listado, detalle, QR SVG, URL permanente, reemplazo de archivo con la UI, historial v1/v2, bitácora | ✔; el slug/QR no cambian al reemplazar |
| Fecha mostrada | Se detectó y **corrigió** un desfase de un día (parseo UTC de fechas); ahora local |

No validado en navegador: el panel dentro del **shell real** del portal ADM (inicio de sesión y menú), la lectura de un QR con un teléfono físico y la descarga de PNG/SVG con clic real. Ver §4.

## 3. Lista de verificación para staging (rama de Supabase / proyecto de prueba)

Requiere autorización y, si es una rama de pago, aprobación del costo.

1. Aplicar `20261018120000_documentos_publicos_qr.sql` (no la staged).
2. Los scripts `e2e_*` solo corren contra `localhost` por seguridad; en staging se hace la lista manual equivalente: `anon` firma el objeto publicado, no firma borrador/antiguo/archivado, no sube/borra; `maestro` no sube; `admin` sube con ruta `<id>/<uuid>.<ext>`; descargas en navegador.
3. Desplegar la Edge Function `registrar-version-documento` en staging, probarla con `e2e_stage2`-equivalente manual (válido → 200; ejecutable renombrado → 422 y objeto borrado; maestro → 403) y solo entonces mover la migración staged a `supabase/migrations/` y aplicarla.
4. Netlify (deploy preview): abrir `https://<preview>/d/<slug>` en frío y recargar; verificar que `/documentos-publicos` (admin) sigue pasando por el portal ADM y que `/d` no captura otras rutas.
5. Fijar `VITE_PUBLIC_BASE_URL` al dominio definitivo; imprimir un QR de prueba y leerlo con dos teléfonos (iOS/Android).
6. Revisar en la consola de Supabase que las políticas `docs_publicos_*` existen y que `documentos`, `signage`, `instrumentos-fotos` no cambiaron.

## 4. Condiciones para la prueba piloto real

Ver `INFORME_ESTADO.md` §5.
