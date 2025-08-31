<template>
  <div class="arrows-demo">
    <h1 class="demo-title">Демо страница очищена</h1>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.arrows-demo {
  min-height: calc(100vh - 72px - 200px); /* Вычитаем высоту хедера и футера */
  padding-top: 7rem;
  padding-bottom: 2rem;
  background: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-title {
  text-align: center;
  color: var(--color-text);
  font-size: 2.5rem;
  font-weight: 700;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .arrows-demo {
    min-height: calc(100vh - 64px - 200px);
    padding-top: 5rem;
    padding-bottom: 1rem;
  }
  
  .demo-title {
    font-size: 2rem;
  }
}
</style>
