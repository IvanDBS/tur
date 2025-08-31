<template>
  <div id="app">
    <Header />

    <main class="main-content">
      <router-view />
    </main>

    <Footer />

    <!-- Auth Modal -->
    <AuthModal :is-open="isAuthModalOpen" @close="closeAuthModal" />
  </div>
</template>

<script setup lang="ts">
  import Header from '@/components/Header.vue'
  import Footer from '@/components/Footer.vue'
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
