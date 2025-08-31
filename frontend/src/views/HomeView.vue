<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title animate-fade-in-up">
            Путешествуй легко — бронируй онлайн!
          </h1>
          <p class="hero-subtitle animate-fade-in-up-delay">
            Находи и бронируй туры онлайн быстро, удобно и выгодно.
          </p>
        </div>
        
        <!-- Search Form -->
        <div class="search-wrapper animate-fade-in-up">
          <SearchForm @search="handleSearch" />
        </div>
      </div>
    </section>
    

  </div>
</template>

<script setup lang="ts">
import SearchForm from '@/components/SearchForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSearch = (searchParams: Record<string, unknown>) => {
  // Navigate to search page with params
  router.push({
    name: 'search',
    query: searchParams
  })
}
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
}

/* Анимации появления */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in-up-delay {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.animate-fade-in-up-delay-2 {
  animation: fadeInUp 1s ease-out 0.6s both;
}

/* Hero Section */
.hero-section {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 60vh;
  background: var(--color-background);
  padding-top: 7rem;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  width: 100%;
  padding: 1rem 1.5rem 2rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-text {
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-secondary);
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.8;
}

.search-wrapper {
  width: 100%;
  margin: 2rem auto;
  position: relative;
  z-index: 10;
  padding: 0;
  box-sizing: border-box;
}





/* Адаптивность */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-text {
    margin-bottom: 2rem;
  }
  
  .hero-section {
    min-height: 70vh;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>