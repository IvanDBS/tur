<template>
  <div id="app">
    <nav class="nav-header fixed top-0 left-0 right-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-primary-600">
              OBS Tours
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Поиск
            </router-link>
            <router-link 
              to="/bookings" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Мои бронирования
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="pt-16">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// App component logic
</script>