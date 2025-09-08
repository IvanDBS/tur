<template>
  <div class="search-results">
    <div v-if="(!results || results.length === 0) && !isLoading" class="empty-state">
      <p>Туры не найдены</p>
      <p class="text-soft">Попробуйте изменить параметры поиска</p>
    </div>

    <div v-else class="results-grid">
      <HotelResultCard
        v-for="result in results"
        :key="result.unique_key"
        :result="result"
        @book="handleBook"
        @details="handleDetails"
        @compare="handleCompare"
      />
    </div>

    <!-- Loading indicator for additional data -->
    <div v-if="isLoadingMore" class="loading-more">
      <div class="spinner"></div>
      <span>Загружаем больше туров...</span>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :prev-page="prevPage"
      :next-page="nextPage"
      @page-change="(page) => { emit('page-change', page) }"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent, watch } from 'vue'
  import { formatDate, getNightWord } from '../utils/dateUtils'
  import type { SearchResult, GroupedSearchResult } from '../types/search'
  
  // Динамический импорт компонентов
  const Pagination = defineAsyncComponent(() => import('./Pagination.vue'))
  const HotelResultCard = defineAsyncComponent(() => import('./search/HotelResultCard.vue'))

  // Props
  interface Props {
    results?: GroupedSearchResult[]
    isLoading?: boolean
    hasMore?: boolean
    currentPage?: number
    totalPages?: number
    prevPage?: number | null
    nextPage?: number | null
    isLoadingMore?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    results: () => [],
    isLoading: false,
    hasMore: false,
    currentPage: 1,
    totalPages: 1,
    prevPage: null,
    nextPage: null,
    isLoadingMore: false,
  })



  // Emits
  const emit = defineEmits<{
    book: [result: GroupedSearchResult]
    details: [result: GroupedSearchResult]
    compare: [result: GroupedSearchResult]
    loadMore: []
    'page-change': [page: number]
  }>()

  // State
  const isLoadingMore = ref(false)

  // Debug logging
  watch(() => props.results, (newResults) => {
    console.log('SearchResults: results changed', {
      results: newResults,
      length: newResults?.length,
      isLoading: props.isLoading,
      currentPage: props.currentPage
    })
  }, { immediate: true })

  // Methods
  const handleBook = (result: GroupedSearchResult) => {
    emit('book', result)
  }

  const handleDetails = (result: GroupedSearchResult) => {
    emit('details', result)
  }

  const handleCompare = (result: GroupedSearchResult) => {
    emit('compare', result)
  }

  const loadMore = () => {
    isLoadingMore.value = true
    emit('loadMore')
    // Reset loading state after parent handles the event
    setTimeout(() => {
      isLoadingMore.value = false
    }, 1000)
  }

  // Явный экспорт для TypeScript
  defineExpose({})
</script>

<style scoped>
  .search-results {
    width: 100%;
    margin: 2rem 0;
    box-sizing: border-box;
  }

  .pagination-debug {
    background: #f0f0f0;
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
  }

  .text-soft {
    color: var(--color-text-soft);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .results-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .load-more {
    text-align: center;
    margin-top: 2rem;
  }

  .load-more-btn {
    padding: 0.75rem 2rem;
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    border-radius: 8px;
    font-family: var(--font-family);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .load-more-btn:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
  }

  .load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Loading more indicator */
  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    color: var(--color-text-soft);
    font-size: 0.9rem;
  }

  .loading-more .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .results-grid {
      gap: 1rem;
    }
  }
</style>
