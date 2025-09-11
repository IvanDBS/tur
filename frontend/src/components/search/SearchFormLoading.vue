<template>
  <div class="loading-overlay">
    <div class="spinner-container">
      <div class="blue-spinner spinner-large"></div>
      <p class="spinner-text">{{ displayMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SearchFormLoadingProps } from '../../types/searchForm'
import { useI18n } from '../../composables/useI18n'
import '../../styles/spinners.css'

// I18n
const { t } = useI18n()

// Props
const props = withDefaults(defineProps<SearchFormLoadingProps>(), {
  message: ''
})

// Computed message with translation
const displayMessage = computed(() => {
  return props.message || t('searchResults.spinner')
})
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-text {
  font-size: 16px;
  color: var(--color-text);
  font-weight: 500;
  margin: 0;
  text-align: center;
}
</style>
