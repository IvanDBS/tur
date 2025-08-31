<template>
  <div class="about-page">
    <div class="container">
      <h1 class="page-title animate-fade-in-up">О нас</h1>
      <p class="page-content animate-fade-in-up-delay">Страница находится в разработке...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// About page component
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 72px - 200px); /* Вычитаем высоту хедера и футера */
  padding-top: 7rem;
  padding-bottom: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.page-content {
  font-size: 1.1rem;
  color: var(--color-text-soft);
  line-height: 1.6;
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

@media (max-width: 768px) {
  .about-page {
    min-height: calc(100vh - 64px - 200px);
    padding-top: 5rem;
    padding-bottom: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
}
</style>
