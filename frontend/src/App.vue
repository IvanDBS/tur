<template>
  <div id="app">
    <AppHeader />

    <main class="main-content">
      <router-view />
    </main>

    <AppFooter />

    <!-- Auth Modal -->
    <AuthModal :is-open="isAuthModalOpen" @close="closeAuthModal" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import AppHeader from '@/components/AppHeader.vue'
  import AppFooter from '@/components/AppFooter.vue'
  import AuthModal from '@/components/auth/AuthModal.vue'
  import { useAuthModal } from '@/composables/useAuthModal'
  import { useI18n } from '@/composables/useI18n'
  import { useAuthStore } from '@/stores/auth'

  const { isAuthModalOpen, closeAuthModal } = useAuthModal()
  const { initializeLocale } = useI18n()
  const authStore = useAuthStore()

  onMounted(async () => {
    initializeLocale()
    // Восстанавливаем состояние аутентификации при загрузке приложения
    await authStore.initializeAuth()
  })
</script>

<style scoped>
  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding-top: 72px; /* Height of fixed header */
  }

  @media (max-width: 768px) {
    .main-content {
      padding-top: 64px;
    }
  }
</style>
