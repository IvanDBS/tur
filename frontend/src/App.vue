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
  import AppHeader from '@/components/AppHeader.vue'
  import AppFooter from '@/components/AppFooter.vue'
  import AuthModal from '@/components/auth/AuthModal.vue'
  import { useAuthModal } from '@/composables/useAuthModal'

  const { isAuthModalOpen, closeAuthModal } = useAuthModal()
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
