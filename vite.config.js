import { defineConfig } from 'vite'

// Content Security Policy shared across dev server and production build.
// Keep both vite.config.js and _headers in sync when adding new external origins.
const CSP = [
  // Only load resources from our own origin by default
  "default-src 'self'",
  // Scripts: self + dynamic imports (Vite HMR needs 'self')
  // pdf.js, mammoth, tesseract loaded dynamically from cdnjs/jsdelivr
  "script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
  // Styles: unsafe-inline needed — Bootstrap and component styles are inline
  "style-src 'self' 'unsafe-inline'",
  // Images: self, data URIs (avatars), blob (canvas/pdf previews), Supabase Storage
  "img-src 'self' data: blob: https://*.supabase.co",
  // Fonts: self only (no Google Fonts)
  "font-src 'self'",
  // API calls: Supabase REST + Realtime, Groq AI
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://docs.google.com",
  // Workers: blob (pdf.js spawns a worker from blob URL)
  "worker-src 'self' blob:",
  // Media: self + blob (audio recording)
  "media-src 'self' blob:",
  // Frames: none
  "frame-src 'none'",
  // Object/embed: none
  "object-src 'none'",
  // Base URI locked to self
  "base-uri 'self'",
  // Forms only to self
  "form-action 'self'",
].join('; ')

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index:      'index.html',
        admin:      'admin.html',
        maestros:   'maestros.html',
        audiciones: 'audiciones.html',
        fin:        'fin.html',
        inventario: 'inventario.html',
        calendario: 'calendario.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('supabase')) return 'supabase'
          if (id.includes('bootstrap')) return 'vendor'
          if (id.includes('idb'))       return 'idb'
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
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  // Plugin para manejar rutas multi-página limpias
  plugins: [
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
          } else if (pathname === '/inventario' || pathname === '/inventario/') {
            req.url = '/inventario.html' + search
          } else if (pathname === '/calendario' || pathname === '/calendario/') {
            req.url = '/calendario.html' + search
          } else if (pathname === '/audiciones' || pathname === '/audiciones/') {
            req.url = '/audiciones.html' + search
          }
          next()
        })
      }
    }
  ]
})
