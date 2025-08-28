<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          OBS Tours
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Найдите и забронируйте идеальный тур
        </p>
        
        <!-- Search Form -->
        <SearchForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchForm from '@/components/SearchForm.vue'
</script>