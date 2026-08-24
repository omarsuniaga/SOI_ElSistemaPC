import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content Security Policy shared across dev server and production build.
// Keep both vite.config.js and _headers in sync when adding new external origins.
const CSP = [
  // Only load resources from our own origin by default
  "default-src 'self'",
  // Scripts: self + dynamic imports (Vite HMR needs 'self')
  // pdf.js, mammoth, tesseract loaded dynamically from cdnjs/jsdelivr
  "script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
  // Styles: unsafe-inline needed — Bootstrap and component styles are inline; Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Images: self, data URIs (avatars), blob (canvas/pdf previews), Supabase Storage, Unsplash (Procurement/Store)
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
  // Fonts: self + Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com data:",
  // API calls: Supabase REST + Realtime, Groq AI, Ollama Local
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://docs.google.com http://localhost:11434 ws://localhost:11434",
  // Workers: blob (pdf.js spawns a worker from blob URL)
  "worker-src 'self' blob:",
  // Media: self + blob (audio recording)
  "media-src 'self' blob:",
  // Frames: self + blob + data (ReportViewerModal and document previews)
  "frame-src 'self' blob: data:",
  // Object/embed: none
  "object-src 'none'",
  // Base URI locked to self
  "base-uri 'self'",
  // Forms only to self
  "form-action 'self'",
].join('; ')

// Dev-server-only relaxation: Vite's client, React Fast Refresh preamble,
// and browser dev tools inject inline scripts in dev mode (never in production).
// In CSP Level 2/3, specifying a sha256 hash causes the browser to IGNORE 'unsafe-inline'.
// Therefore, in CSP_DEV we use 'unsafe-inline' without the hash so dev scripts execute cleanly.
const CSP_DEV = CSP.replace(
  "script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net"
)

export default defineConfig({
  base: '/',
  build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          index:        'index.html',
          admin:        'admin.html',
          audiciones:   'audiciones.html',
          fin:          'fin.html',
          'soi-finanzas': 'soi-finanzas.html',
          acm:          'acm.html',
          adm:          'adm.html',
          com:          'com.html',
          tecnico:      'tecnico.html',
          inventario:   'inventario.html',
          calendario:   'calendario.html',
          luteria:      'luteria.html',
          lut:          'lut.html',
          simulador:    'simulador.html',
        },
      output: {
        manualChunks(id) {
          if (id.includes('supabase')) return 'supabase'
          if (id.includes('bootstrap')) return 'vendor'
          if (id.includes('idb'))       return 'idb'
          if (id.includes('three'))     return 'three'
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js', 
      'idb', 
      'bootstrap', 
      'xlsx', 
      'jspdf', 
      'jspdf-autotable'
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // HMR configuration - auto-detect port
    hmr: {
      protocol: 'ws',
      host: undefined, // Let Vite auto-detect from window.location
      port: undefined, // Let Vite auto-detect the actual port
    },
    // Middleware para mejorar compatibilidad
    middlewareMode: false,
    // Configuración CORS para permitir WebSocket
    cors: true,
    headers: {
      'Content-Security-Policy': CSP_DEV,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  // Plugin para manejar rutas multi-página limpias
  plugins: [
    // React/Tailwind are scoped to soi-finanzas only (via `include`) so the
    // existing vanilla-JS portals are never passed through Babel/Fast Refresh
    // or Tailwind's CSS pipeline. @vitejs/plugin-react's default `include` is
    // /\.[tj]sx?$/, which matches every .js file in the project unless narrowed.
    react({
      include: /[\\/]portales[\\/]soi-finanzas[\\/].*\.[tj]sx?$/,
    }),
    tailwindcss(),
    {
      name: 'handle-admin-route',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const parsedUrl = new URL(req.url, 'http://localhost')
          const pathname = parsedUrl.pathname
          const search = parsedUrl.search

          if (pathname === '/admin' || pathname === '/admin/') {
            req.url = '/admin.html' + search
          } else if (pathname === '/fin' || pathname === '/fin/') {
            req.url = '/fin.html' + search
          } else if (pathname === '/soi-finanzas' || pathname === '/soi-finanzas/') {
            req.url = '/soi-finanzas.html' + search
          } else if (pathname === '/acm' || pathname === '/acm/') {
            req.url = '/acm.html' + search
          } else if (pathname === '/adm' || pathname === '/adm/') {
            req.url = '/adm.html' + search
          } else if (pathname === '/com' || pathname === '/com/') {
            req.url = '/com.html' + search
          } else if (pathname === '/tecnico' || pathname === '/tecnico/') {
            req.url = '/tecnico.html' + search
          } else if (pathname === '/inventario' || pathname === '/inventario/') {
            req.url = '/inventario.html' + search
          } else if (pathname === '/calendario' || pathname === '/calendario/') {
            req.url = '/calendario.html' + search
          } else if (pathname === '/audiciones' || pathname === '/audiciones/') {
            req.url = '/audiciones.html' + search
          } else if (pathname === '/luteria' || pathname === '/luteria/') {
            req.url = '/luteria.html' + search
          } else if (pathname === '/simulador' || pathname === '/simulador/') {
            req.url = '/simulador.html' + search
          }
          next()
        })
      }
    }
  ]
})
