<template>
  <div id="app">
    <Header />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
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