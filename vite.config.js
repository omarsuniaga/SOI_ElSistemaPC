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
    host: true,
    port: 5173,
    strictPort: false,
    // HMR configuration - allow it to work properly without WebSocket hanging
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  }
})
