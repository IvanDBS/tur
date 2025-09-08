/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Specific component declarations to fix TypeScript errors
declare module '@/components/Header.vue'
declare module '@/components/Footer.vue'
declare module '@/components/auth/AuthModal.vue'
declare module '@/components/auth/LoginForm.vue'
declare module '@/components/auth/RegisterForm.vue'
declare module '@/components/SearchForm.vue'
declare module '@/composables/useAuthModal'
declare module '@/stores/auth'
