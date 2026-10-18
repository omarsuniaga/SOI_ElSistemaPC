// Seeds publications into the LOCAL stack for the manual browser validation. Local only.
// Prints JSON with the slugs and the credentials of the throw-away admin it creates.
import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import zlib from 'node:zlib';

const URL_ = process.env.SUPABASE_URL;
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(URL_ ?? '')) throw new Error('Refusing to run against a non-local URL');
const mk = (k) => createClient(URL_, k, { auth: { persistSession: false, autoRefreshToken: false } });
const svc = mk(process.env.SUPABASE_SERVICE_ROLE_KEY);

// Minimal valid 64x64 PNG (solid colour) so the browser can actually render it.
function png(w = 64, h = 64, rgb = [30, 90, 200]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: w }, () => rgb).flat())]);
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
const pdf = () => new TextEncoder().encode('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
const sha = async (b) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map((x) => x.toString(16).padStart(2, '0')).join('');

const email = `seed-admin-${randomUUID().slice(0, 6)}@docqr.test`;
const password = randomBytes(15).toString('base64url');
const u = await svc.auth.admin.createUser({ email, password, email_confirm: true });
if (u.error) throw u.error;
await svc.from('profiles').insert({ id: u.data.user.id, rol: 'admin', estado: 'activo', activo: true });
const admin = mk(process.env.SUPABASE_ANON_KEY);
await admin.auth.signInWithPassword({ email, password });

async function make(titulo, bytes, ext, mime, estado) {
  const p = (await admin.rpc('crear_publicacion_documento', { p_titulo: titulo, p_descripcion: `Documento de validación (${estado})`, p_fecha: null, p_categoria: 'comunicado' })).data;
  const path = `${p.id}/${randomUUID()}.${ext}`;
  const up = await admin.storage.from('soi-publico').upload(path, bytes, { contentType: mime, upsert: false });
  if (up.error) throw up.error;
  const r = await admin.rpc('registrar_version_documento', { p_publicacion_id: p.id, p_storage_path: path, p_mime: mime, p_size: bytes.length, p_sha256: await sha(bytes), p_nombre_original: `seed.${ext}`, p_motivo: null });
  if (r.error) throw r.error;
  if (estado === 'publicado') await admin.rpc('cambiar_estado_publicacion_documento', { p_id: p.id, p_estado: 'publicado' });
  if (estado === 'archivado') await admin.rpc('cambiar_estado_publicacion_documento', { p_id: p.id, p_estado: 'archivado' });
  return { id: p.id, slug: p.slug };
}

const out = {
  admin: { email, password },
  imagen_publicada: await make('Afiche de bienvenida', png(), 'png', 'image/png', 'publicado'),
  pdf_publicado: await make('Reglamento interno', pdf(), 'pdf', 'application/pdf', 'publicado'),
  borrador: await make('Borrador sin publicar', pdf(), 'pdf', 'application/pdf', 'borrador'),
  archivado: await make('Documento archivado', pdf(), 'pdf', 'application/pdf', 'archivado'),
};
console.log(JSON.stringify(out, null, 2));
