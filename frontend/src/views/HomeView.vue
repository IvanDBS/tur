<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Найдите свой идеальный отдых
          </h1>
          <p class="hero-subtitle">
            Откройте мир незабываемых путешествий с migo.md
          </p>
        </div>
        
        <!-- Search Form -->
        <div class="search-wrapper">
          <SearchForm @search="handleSearch" />
        </div>
      </div>
      

    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 class="feature-title">Лучшие предложения</h3>
            <p class="feature-description">
              Эксклюзивные туры по выгодным ценам от проверенных операторов
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <h3 class="feature-title">Быстрое бронирование</h3>
            <p class="feature-description">
              Забронируйте тур за несколько кликов и получите мгновенное подтверждение
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3 class="feature-title">Поддержка 24/7</h3>
            <p class="feature-description">
              Наша команда готова помочь вам в любое время до, во время и после поездки
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import SearchForm from '@/components/SearchForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSearch = (searchParams: any) => {
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

/* Hero Section */
.hero-section {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  background: var(--color-background);
  padding-top: 2rem;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  width: 100%;
  padding: 2rem 1.5rem;
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
  color: var(--color-text);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-soft);
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.search-wrapper {
  max-width: 1000px;
  margin: 2rem auto;
  position: relative;
  z-index: 10;
}



/* Features Section */
.features-section {
  padding: 4rem 0;
  background: var(--color-background-soft);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border-soft);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: var(--color-primary-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--color-primary);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--color-text-soft);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Mobile Responsive */
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
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
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
  
  .features-section {
    padding: 2rem 0;
  }
}
</style>