<template>
  <div class="page-layout">
    <div class="container">
      <!-- Search Form with integrated results -->
      <SearchForm />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  
  const SearchForm = defineAsyncComponent(() => import('../components/SearchForm.vue'))
</script>

<style scoped>
  /* Styles are handled by SearchForm component */
</style>
