<template>
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title animate-fade-in-up">
              {{ $t('home.heroTitle') }}
            </h1>
            <p class="hero-subtitle animate-fade-in-up-delay">
              <span class="brand-bold">migo.md</span> - {{ $t('home.heroSubtitle').split(' - ')[1] }}
            </p>
          </div>
  
          <!-- Search Form -->
          <div class="search-wrapper animate-fade-in-up">
            <SearchForm />
          </div>
        </div>
  
        <!-- Decorative Background -->
        <div class="hero-bg"></div>
      </section>
  
      <!-- Features Section -->
      <section class="features-section">
        <div class="features-container">
          <div class="feature-item">
            <svg viewBox="0 0 24 24" class="feature-icon"><path d="M12 2L15 8H9L12 2Z"/></svg>
            <p>{{ $t('home.feature1') }}</p>
          </div>
          <div class="feature-item">
            <svg viewBox="0 0 24 24" class="feature-icon"><circle cx="12" cy="12" r="10"/></svg>
            <p>{{ $t('home.feature2') }}</p>
          </div>
          <div class="feature-item">
            <svg viewBox="0 0 24 24" class="feature-icon"><rect x="4" y="4" width="16" height="16"/></svg>
            <p>{{ $t('home.feature3') }}</p>
          </div>
        </div>
      </section>
  
      <!-- How It Works Section -->
      <section class="steps-section">
        <h2>{{ $t('home.stepsTitle') }}</h2>
        <div class="steps-container">
          <div class="step">
            <span class="step-number">1</span>
            <p>{{ $t('home.step1') }}</p>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <p>{{ $t('home.step2') }}</p>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <p>{{ $t('home.step3') }}</p>
          </div>
        </div>
      </section>
  
      <!-- CTA Section -->
      <section class="cta-section">
        <h2>{{ $t('home.ctaTitle') }}</h2>
        <button class="cta-btn">{{ $t('home.ctaButton') }}</button>
      </section>
    </div>
  </template>
  
  <script setup lang="ts">
    import { defineAsyncComponent } from 'vue'
    const SearchForm = defineAsyncComponent(() => import('../components/SearchForm.vue'))
  </script>
  
  <style scoped>
  /* Hero */
  .hero-section {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: 70vh;
    padding-top: 3rem;
    overflow: hidden;
    background: var(--color-background);
  }
  
  .hero-bg {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
    opacity: 0.15;
    z-index: 1;
  }
  
  /* Features */
  .features-section {
    padding: 4rem 2rem;
    background: var(--color-background-alt);
    text-align: center;
  }
  .features-container {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .feature-item {
    flex: 1 1 200px;
    max-width: 250px;
  }
  .feature-icon {
    width: 40px;
    height: 40px;
    fill: var(--color-primary);
    margin-bottom: 1rem;
  }
  
  /* Steps */
  .steps-section {
    padding: 4rem 2rem;
    text-align: center;
  }
  .steps-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }
  .step {
    flex: 1 1 200px;
    max-width: 250px;
  }
  .step-number {
    display: inline-block;
    background: var(--color-primary);
    color: white;
    font-weight: bold;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin-bottom: 1rem;
  }
  
  /* CTA */
  .cta-section {
    padding: 4rem 2rem;
    text-align: center;
  }
  .cta-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
  }
  .cta-btn:hover {
    opacity: 0.9;
  }
  </style>
  