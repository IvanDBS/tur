<template>
  <div class="search-results">
    <div v-if="results.length === 0 && !isLoading" class="empty-state">
      <p>Туры не найдены</p>
      <p class="text-soft">Попробуйте изменить параметры поиска</p>
    </div>

    <div v-else class="results-grid">
      <div
        v-for="result in results"
        :key="result.unique_key"
        class="result-card"
        @click="selectResult(result)"
      >
        <!-- Hotel Info -->
        <div class="hotel-info">
          <h3 class="hotel-name">{{ result.accommodation.hotel.name }}</h3>
          <div class="hotel-details">
            <span class="stars">{{ result.accommodation.hotel.category }}</span>
            <span class="location">{{ result.accommodation.hotel.city }}</span>
          </div>
        </div>

        <!-- Dates & Duration -->
        <div class="trip-info">
          <div class="dates">
            <span class="date">{{ formatDate(result.dates.check_in) }}</span>
            <span class="separator">—</span>
            <span class="date">{{ formatDate(result.dates.check_out) }}</span>
          </div>
          <div class="duration">
            {{ result.nights.total }} {{ getNightWord(result.nights.total) }}
          </div>
        </div>

        <!-- Room & Meal -->
        <div class="accommodation-info">
          <div class="room">{{ result.accommodation.room.name }}</div>
          <div class="meal">{{ result.accommodation.meal.full_name }}</div>
        </div>

        <!-- Price -->
        <div class="price-info">
          <div class="price">
            {{ result.price.amount }} {{ result.price.currency }}
          </div>
          <div class="price-type">{{ result.price.type }}</div>
        </div>

        <!-- Book Button -->
        <button class="book-btn" @click.stop="book(result)">
          Забронировать
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :prev-page="prevPage"
      :next-page="nextPage"
      @page-change="(page) => { console.log('🔥 SearchResults received page-change:', page); emit('page-change', page) }"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent, watch } from 'vue'
  import { formatDate, getNightWord } from '../utils/dateUtils'
  
  // Динамический импорт компонента пагинации
  const Pagination = defineAsyncComponent(() => import('./Pagination.vue'))

  interface SearchResult {
    unique_key: string
    rid: string
    accommodation: {
      hotel: {
        name: string
        category: string
        city: string
      }
      room: {
        name: string
      }
      meal: {
        full_name: string
      }
    }
    dates: {
      check_in: string
      check_out: string
    }
    nights: {
      total: number
    }
    price: {
      amount: number
      currency: string
      type: string
    }
  }

  // Props
  interface Props {
    results?: SearchResult[]
    isLoading?: boolean
    hasMore?: boolean
    currentPage?: number
    totalPages?: number
    prevPage?: number | null
    nextPage?: number | null
  }

  const props = withDefaults(defineProps<Props>(), {
    results: () => [],
    isLoading: false,
    hasMore: false,
    currentPage: 1,
    totalPages: 1,
    prevPage: null,
    nextPage: null,
  })



  // Emits
  const emit = defineEmits<{
    book: [result: SearchResult]
    loadMore: []
    'page-change': [page: number]
  }>()

  // State
  const isLoadingMore = ref(false)

  // Methods

  const selectResult = (result: SearchResult) => {
    // Could navigate to hotel details or expand card
    console.log('Selected result:', result)
  }

  const book = (result: SearchResult) => {
    emit('book', result)
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
    gap: 1rem;
  }

  .result-card {
    background: white;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: grid;
    grid-template-columns: 3fr 1.5fr 2fr 1.5fr auto;
    gap: 1.5rem;
    align-items: center;
    min-height: 70px;
  }

  .result-card:hover {
    border-color: var(--color-secondary);
    box-shadow: 0 4px 12px rgba(26, 60, 97, 0.1);
  }

  .hotel-info {
    grid-column: 1;
  }

  .hotel-name {
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
    font-size: 1rem;
    line-height: 1.3;
  }

  .hotel-details {
    display: flex;
    gap: 0.5rem;
    color: var(--color-text-soft);
    font-size: 0.85rem;
  }

  .stars {
    font-weight: 500;
  }

  .trip-info {
    grid-column: 2;
    margin-top: 0;
  }

  .dates {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    margin-bottom: 0.15rem;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .separator {
    color: var(--color-text-soft);
  }

  .duration {
    color: var(--color-text-soft);
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .accommodation-info {
    grid-column: 3;
    margin-top: 0;
    color: var(--color-text-soft);
    font-size: 0.85rem;
  }

  .room {
    margin-bottom: 0.15rem;
    font-size: 0.85rem;
    line-height: 1.3;
  }

  .meal {
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .price-info {
    grid-column: 4;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .price {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-dark-gray);
    line-height: 1.2;
  }

  .price-type {
    color: var(--color-text-soft);
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    background: var(--color-background-soft);
    border-radius: 4px;
  }

  .book-btn {
    grid-column: 5;
    padding: 0.5rem 1rem;
    background: white;
    color: var(--color-secondary);
    border: 1px solid var(--color-secondary);
    border-radius: 6px;
    font-family: var(--font-family);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .book-btn:hover {
    background: var(--color-secondary-muted);
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

  /* Mobile responsive */
  @media (max-width: 768px) {
    .result-card {
      grid-template-columns: 1fr auto;
      text-align: left;
      min-height: 60px;
      gap: 1rem;
      padding: 1rem;
    }

    .hotel-info {
      grid-column: 1;
    }

    .trip-info {
      grid-column: 1;
      margin-top: 0.25rem;
    }

    .accommodation-info {
      grid-column: 1;
      margin-top: 0.25rem;
    }

    .price-info {
      grid-column: 2;
      grid-row: 1 / span 3;
      text-align: right;
      align-items: flex-end;
    }

    .book-btn {
      grid-column: 1 / span 2;
      margin-top: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
  }
</style>
