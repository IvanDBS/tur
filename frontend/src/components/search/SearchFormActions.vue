<template>
  <div class="action-buttons">
    <div class="action-buttons-row">
      <div class="results-count">
        <span v-if="hasResults">
          Найдено туров: {{ totalResults }}
        </span>
        <!-- Окно с ошибкой, когда результатов нет -->
        <div v-if="showNoResultsError" class="no-results-warning">
          <img src="/src/assets/icons/alert-triangle.svg" alt="Warning" class="warning-icon" />
          <div class="warning-text">
            Туры не найдены. Попробуйте изменить параметры поиска.
          </div>
        </div>
      </div>
      <button 
        type="button" 
        @click="emit('reset')" 
        class="reset-btn"
        :disabled="isLoading"
      >
        {{ $t('search.resetParams') }}
      </button>
      <button 
        type="button" 
        @click="emit('search')" 
        class="search-btn"
        :disabled="isLoading || isSearchPending"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {{ getButtonText() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { SearchFormActionsProps, SearchFormActionsEmits } from '../../types/searchForm'

const { t: $t } = useI18n()

// Props
const props = withDefaults(defineProps<SearchFormActionsProps>(), {
  hasResults: false,
  totalResults: 0,
  isLoading: false,
  isSearchPending: false,
  hasSearched: false
})

// Emits
const emit = defineEmits<SearchFormActionsEmits>()

// Computed
const showNoResultsError = computed(() => {
  return props.hasSearched && !props.isLoading && !props.isSearchPending && !props.hasResults
})

// Methods
const getButtonText = () => {
  return $t('search.searchButton')
}
</script>

<style scoped>
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebebeb;
}

.action-buttons-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

/* Стили для окна с предупреждением */
.no-results-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  width: 100%;
  height: 40px;
}

.no-results-warning .warning-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.no-results-warning .warning-text {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 500;
  margin: 0;
}


.results-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.reset-btn {
  background: white;
  border: 1px solid var(--color-dark-gray);
  color: var(--color-dark-gray);
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 180px;
  height: 40px;
}

.reset-btn:hover:not(:disabled) {
  background: var(--color-dark-gray-muted);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn {
  background: white;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 6px;
  padding: 10px 24px;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 140px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn svg {
  transition: transform 0.2s;
}

.search-btn:hover:not(:disabled) svg {
  transform: scale(1.1);
}


/* Mobile Responsive */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons-row {
    flex-direction: column;
    align-items: stretch;
  }

  .results-count {
    text-align: center;
    margin-right: 0;
    margin-bottom: 8px;
  }

  .reset-btn,
  .search-btn {
    min-width: auto;
    width: 100%;
  }
}
</style>
