declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// Specific component declarations to fix TypeScript errors
declare module '@/components/Header.vue'
declare module '@/components/Footer.vue'
declare module '@/components/auth/AuthModal.vue'
declare module '@/composables/useAuthModal'
