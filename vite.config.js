import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index:    'index.html',
        admin:    'admin.html',
        maestros: 'maestros.html',
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
  },
  // Plugin para manejar rutas multi-página limpias
  plugins: [
    {
      name: 'handle-admin-route',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin' || req.url === '/admin/') {
            req.url = '/admin.html'
          }
          next()
        })
      }
    }
  ]
})
