/**
 * Genera iconos PNG para PWA
 * Ejecutar: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Asegurar que existe la carpeta
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG base para el icono (un "S" simple para SOI)
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d6efd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a58ca;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">S</text>
  <circle cx="400" cy="112" r="40" fill="#ffc107"/>
  <text x="400" y="135" font-family="Arial" font-size="40" font-weight="bold" fill="#212529" text-anchor="middle">O</text>
</svg>
`;

async function generateIcons() {
  const sizes = [72, 96, 128, 192, 384, 512];
  
  console.log('🎨 Generando iconos PWA...\n');
  
  // Generar cada tamaño
  for (const size of sizes) {
    const filename = `icon-${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(filepath);
    
    console.log(`  ✅ ${filename} (${size}x${size})`);
  }
  
  // Generar icono para notification (96x96)
  await sharp(Buffer.from(svgIcon))
    .resize(96, 96)
    .png()
    .toFile(path.join(iconsDir, 'notification-icon.png'));
  
  console.log('  ✅ notification-icon.png (96x96)\n');
  
  // Generar maskable icon (192x192)
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon.png'));
  
  console.log('  ✅ maskable-icon.png (192x192)\n');
  
  console.log('✨ Iconos generados en /public/icons/');
}

generateIcons().catch(console.error);