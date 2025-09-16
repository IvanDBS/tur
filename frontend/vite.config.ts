import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            if (id.includes('@vueform') || id.includes('@vuepic') || id.includes('vuejs-paginate')) {
              return 'ui-vendor'
            }
            if (id.includes('vue-i18n')) {
              return 'i18n-vendor'
            }
            return 'vendor'
          }
          
          // Feature chunks
          if (id.includes('/src/stores/auth.ts') || id.includes('/src/utils/authApi.ts') || id.includes('/src/components/auth/')) {
            return 'auth'
          }
          if (id.includes('/src/composables/useSearch') || id.includes('/src/components/search/')) {
            return 'search'
          }
          if (id.includes('/src/composables/useBooking') || id.includes('/src/components/booking/')) {
            return 'booking'
          }
          if (id.includes('/src/composables/useAdminApi') || id.includes('/src/views/admin/')) {
            return 'admin'
          }
        }
      }
    },
    // Увеличиваем лимит для предупреждений о размере чанков
    chunkSizeWarningLimit: 1000
  }
})
