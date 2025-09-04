<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title animate-fade-in-up">
            Бесплатный сервис бронирования туров.
          </h1>
          <p class="hero-subtitle animate-fade-in-up-delay">
            <span class="brand-bold">migo.md</span> - путешествуй легко и
            бронируй онлайн!
          </p>
        </div>

        <!-- Search Form -->
        <div class="search-wrapper animate-fade-in-up">
          <SearchForm @search="handleSearch" />
        </div>
      </div>
    </section>


    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-container">
        <div class="blue-spinner spinner-medium"></div>
        <p class="spinner-text">Загружаем данные для поиска...</p>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <p>⚠️ {{ error }}</p>
      <button @click="retryLoad" class="retry-btn">Повторить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import SearchForm from '../components/SearchForm.vue'
  import { useSearchData } from '../composables/useSearchData'
  import type { LocationQueryRaw } from 'vue-router'

  const router = useRouter()
  const { loading, error, initializeData, clearError } = useSearchData()

  const handleSearch = (searchParams: Record<string, unknown>) => {
    console.log('Search params:', searchParams)
    // TODO: Implement search functionality
  }

  const retryLoad = async () => {
    clearError()
    await initializeData()
  }

  onMounted(async () => {
    try {
      await initializeData()
    } catch (err) {
      console.error('Failed to initialize search data:', err)
    }
  })
</script>

<style scoped>
  .home-page {
    min-height: calc(100vh - 72px);
    display: flex;
    flex-direction: column;
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
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-secondary);
    margin-bottom: 1rem;
    line-height: 1.2;
    opacity: 0.8;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    color: var(--color-secondary);
    font-weight: 400;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    opacity: 0.8;
  }

  .brand-bold {
    font-weight: 600;
  }

  .search-wrapper {
    width: 100%;
    margin: 2rem auto;
    position: relative;
    z-index: 10;
    padding: 0;
    box-sizing: border-box;
  }

  /* Loading Overlay */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }


  /* Error Banner */
  .error-banner {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 300px;
  }

  .error-banner p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .retry-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.2s;
  }

  .retry-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
    }

    .hero-text {
      margin-bottom: 2rem;
    }

    .hero-section {
      min-height: 70vh;
    }

    .error-banner {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }

  @media (max-width: 480px) {
    .hero-content {
      padding: 1rem;
    }

    .hero-title {
      font-size: 1.75rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }
  }
</style>
