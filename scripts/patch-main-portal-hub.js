import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

// 1. Patch main.js
const mainPath = path.join(root, 'src', 'main.js')
let mainContent = fs.readFileSync(mainPath, 'utf8')

// Add portalHubModal import if missing
if (!mainContent.includes('portalHubModal.js')) {
  mainContent = mainContent.replace(
    "import { renderPortalModuleMatrixView } from './core/portalModuleMatrixView.js'",
    "import { renderPortalModuleMatrixView } from './core/portalModuleMatrixView.js'\nimport { abrirModalConmutadorPortales } from './portales/_shared/portalHubModal.js'"
  )
}

// Add Portales group to NAV_GROUPS
const portalesGroupDef = `  {
    id: 'portales',
    label: 'Portales Departamentales',
    icon: 'bi-grid-fill',
    items: [
      { id: 'portal-adm', label: 'Administración (ADM)', icon: 'bi-building-gear', href: '/adm.html' },
      { id: 'portal-fin', label: 'Finanzas & Caja (FIN)', icon: 'bi-bank2', href: '/fin.html' },
      { id: 'portal-acm', label: 'Academia & Malla (ACM)', icon: 'bi-mortarboard', href: '/acm.html' },
      { id: 'portal-lut', label: 'Lutería & Taller (LUT)', icon: 'bi-tools', href: '/lut.html' },
      { id: 'portal-inv', label: 'Inventario & Stock (INV)', icon: 'bi-box-seam', href: '/inventario.html' },
      { id: 'portal-cal', label: 'Calendario & Citas (CAL)', icon: 'bi-calendar3', href: '/calendario.html' },
      { id: 'portal-com', label: 'Comunicaciones (COM)', icon: 'bi-broadcast', href: '/com.html' },
      { id: 'portal-mae', label: 'Portal Maestros (MAE)', icon: 'bi-person-video3', href: '/index.html' },
      { id: 'portal-sim', label: 'Simulador de Reglas (SIM)', icon: 'bi-cpu', href: '/simulador.html' },
    ],
  },
  {
    id: 'direccion',`

if (!mainContent.includes("id: 'portales'")) {
  mainContent = mainContent.replace("const NAV_GROUPS = [\n  {\n    id: 'direccion',", "const NAV_GROUPS = [\n" + portalesGroupDef)
}

// Add quick switcher button to sidebar header in main.js
if (!mainContent.includes('sidebarBtnHub')) {
  mainContent = mainContent.replace(
    `<span class="sidebar-brand-text">SOI</span>`,
    `<span class="sidebar-brand-text">SOI</span>
      <button class="btn btn-sm btn-outline-light rounded-pill ms-auto me-1 py-0 px-2" id="sidebarBtnHub" title="Hub de Portales Departamentales">
        <i class="bi bi-grid-3x3-gap"></i>
      </button>`
  )
}

// Ensure nav-item-btn has data-href
if (!mainContent.includes('data-href="${item.href || \'\'}"')) {
  mainContent = mainContent.replace(
    `<button class="nav-item-btn \${item.id === currentRoute ? 'active' : ''}" data-route="\${item.id}">`,
    `<button class="nav-item-btn \${item.id === currentRoute ? 'active' : ''}" data-route="\${item.id}" data-href="\${item.href || ''}">`
  )
}

// Update click listener in main.js
if (!mainContent.includes('if (btn.dataset.href)')) {
  mainContent = mainContent.replace(
    `if (btn.dataset.route === 'audiciones') {`,
    `if (btn.dataset.href) {
        window.location.href = btn.dataset.href
      } else if (btn.dataset.route === 'audiciones') {`
  )
}

// Add sidebarBtnHub click listener
if (!mainContent.includes("sidebar.querySelector('#sidebarBtnHub')")) {
  mainContent = mainContent.replace(
    `sidebar.querySelector('#sidebarBtnHelp').addEventListener('click', () => {`,
    `sidebar.querySelector('#sidebarBtnHub')?.addEventListener('click', (e) => {
    e.stopPropagation()
    abrirModalConmutadorPortales()
  })

  sidebar.querySelector('#sidebarBtnHelp').addEventListener('click', () => {`
  )
}

fs.writeFileSync(mainPath, mainContent, 'utf8')
console.log('✓ main.js patched successfully')

// 2. Patch adminPortalShell.js
const shellPath = path.join(root, 'src', 'portales', '_shared', 'adminPortalShell.js')
let shellContent = fs.readFileSync(shellPath, 'utf8')

if (!shellContent.includes('portalHubModal.js')) {
  shellContent = "import { abrirModalConmutadorPortales } from './portalHubModal.js'\n" + shellContent
}

if (!shellContent.includes('sidebarBtnHub')) {
  shellContent = shellContent.replace(
    `<span class="sidebar-brand-text">\${profile.brandText}</span>`,
    `<span class="sidebar-brand-text">\${profile.brandText}</span>
      <button class="btn btn-sm btn-outline-light rounded-pill ms-auto me-1 py-0 px-2" id="sidebarBtnHub" title="Hub de Portales Departamentales">
        <i class="bi bi-grid-3x3-gap"></i>
      </button>`
  )
}

if (!shellContent.includes("sidebar.querySelector('#sidebarBtnHub')")) {
  shellContent = shellContent.replace(
    `sidebar.querySelector('#sidebarBtnTheme').addEventListener(`,
    `sidebar.querySelector('#sidebarBtnHub')?.addEventListener(
    'click',
    (e) => {
      e.stopPropagation()
      abrirModalConmutadorPortales()
    },
    { signal },
  )

  sidebar.querySelector('#sidebarBtnTheme').addEventListener(`
  )
}

fs.writeFileSync(shellPath, shellContent, 'utf8')
console.log('✓ adminPortalShell.js patched successfully')
