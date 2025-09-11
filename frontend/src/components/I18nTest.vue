<template>
  <div class="i18n-test">
    <h2>Тест системы переводов</h2>
    
    <div class="test-section">
      <h3>Переключатель языка:</h3>
      <LanguageSwitcher />
    </div>

    <div class="test-section">
      <h3>Общие переводы:</h3>
      <p>Поиск: {{ $t('common.search') }}</p>
      <p>Загрузка: {{ $t('common.loading') }}</p>
      <p>Ошибка: {{ $t('common.error') }}</p>
    </div>

    <div class="test-section">
      <h3>Навигация:</h3>
      <p>Главная: {{ $t('navigation.home') }}</p>
      <p>Поиск: {{ $t('navigation.search') }}</p>
      <p>Вход: {{ $t('navigation.login') }}</p>
    </div>

    <div class="test-section">
      <h3>Поиск:</h3>
      <p>Заголовок: {{ $t('search.title') }}</p>
      <p>Направление: {{ $t('search.destination') }}</p>
      <p>Дата: {{ $t('search.date') }}</p>
    </div>

    <div class="test-section">
      <h3>Страны:</h3>
      <p>Турция: {{ $t('countries.TÜRKIYE') }}</p>
      <p>Египет: {{ $t('countries.EGYPT') }}</p>
      <p>Греция: {{ $t('countries.GREECE') }}</p>
    </div>

    <div class="test-section">
      <h3>Города отправления:</h3>
      <p>Кишинёв: {{ $t('cities.departure.CHISINAU') }}</p>
    </div>

    <div class="test-section">
      <h3>Города прилета:</h3>
      <p>Анталья: {{ $t('cities.arrival.ANTALYA') }}</p>
      <p>Стамбул: {{ $t('cities.arrival.ISTANBUL') }}</p>
      <p>Барселона: {{ $t('cities.arrival.BARCELONA') }}</p>
    </div>

    <div class="test-section">
      <h3>Пакеты (только русский):</h3>
      <p>Анталья полный: {{ $t('packages.ANTALYA FULL') }}</p>
      <p>Бодрум полный: {{ $t('packages.EGEE FULL') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import LanguageSwitcher from './ui/LanguageSwitcher.vue'
</script>

<style scoped>
.i18n-test {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.test-section h3 {
  margin-top: 0;
  color: var(--color-primary);
}

.test-section p {
  margin: 0.5rem 0;
  font-family: monospace;
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
