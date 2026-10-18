// "Scans" QR files (PNG and SVG) with an independent decoder (jsQR) and checks that the payload is
// exactly the permanent URL. Also exercises printing sizes and contrast.
// Needs the test-only decoder:  npm i --no-save jsqr     (not a project dependency)
// Usage: node qr_scan_check.mjs <expectedUrl> <file.png|file.svg>...
import fs from 'node:fs';
import sharp from 'sharp';
import jsQR from 'jsqr';

const [expected, ...files] = process.argv.slice(2);
if (!expected || !files.length) throw new Error('usage: qr_scan_check.mjs <expectedUrl> <files...>');

async function decode(buf, { width } = {}) {
  let img = sharp(buf, { density: 300 });
  if (width) img = img.resize(width, width, { kernel: 'nearest' });
  const { data, info } = await img.flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data ?? null;
}

let fail = 0;
for (const f of files) {
  const buf = fs.readFileSync(f);
  const widths = f.endsWith('.svg') ? [256, 512, 1024] : [undefined, 512, 256, 128];
  for (const w of widths) {
    const got = await decode(buf, { width: w });
    const okp = got === expected;
    if (!okp) fail++;
    console.log(`${okp ? 'OK  ' : 'FAIL'} ${f.split(/[\\/]/).pop()} @${w ?? 'native'}px -> ${got}`);
  }
  if (/token|sign|storage|supabase/i.test(expected)) { fail++; console.log('FAIL expected URL looks temporary'); }
}
process.exit(fail ? 1 : 0);
