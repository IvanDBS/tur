<template>
  <div class="error-component">
    <div class="error-message">
      <h3>Ошибка загрузки компонента</h3>
      <p>Не удалось загрузить компонент. Попробуйте обновить страницу.</p>
      <button @click="reload" class="reload-button">Обновить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const reload = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-component {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin: 1rem 0;
}

.error-message {
  text-align: center;
}

.error-message h3 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.error-message p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.reload-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.reload-button:hover {
  background: #0056b3;
}
</style>
