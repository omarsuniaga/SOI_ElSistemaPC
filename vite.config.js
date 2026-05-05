import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        admin:    'index.html',
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
    include: ['@supabase/supabase-js', 'idb']
  },
  server: {
    host: true,
    port: 5173
  }
})
