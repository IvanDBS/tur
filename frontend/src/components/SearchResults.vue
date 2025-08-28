<template>
  <div class="search-results">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Поиск туров...</p>
    </div>

    <div v-else-if="results.length === 0" class="no-results">
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

    <!-- Load More -->
    <div v-if="hasMore" class="load-more">
      <button @click="loadMore" :disabled="isLoadingMore" class="load-more-btn">
        {{ isLoadingMore ? 'Загрузка...' : 'Показать еще' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
}

const props = withDefaults(defineProps<Props>(), {
  results: () => [],
  isLoading: false,
  hasMore: false
})

// Emits
const emit = defineEmits<{
  book: [result: SearchResult]
  loadMore: []
}>()

// State
const isLoadingMore = ref(false)

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  })
}

const getNightWord = (count: number) => {
  if (count === 1) return 'ночь'
  if (count >= 2 && count <= 4) return 'ночи'
  return 'ночей'
}

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
</script>

<style scoped>
.search-results {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-soft);
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
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
}

.result-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.hotel-info {
  grid-column: 1;
}

.hotel-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.hotel-details {
  display: flex;
  gap: 1rem;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.stars {
  font-weight: 500;
}

.trip-info {
  margin-top: 1rem;
}

.dates {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.separator {
  color: var(--color-text-soft);
}

.duration {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.accommodation-info {
  margin-top: 1rem;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.room {
  margin-bottom: 0.25rem;
}

.price-info {
  grid-column: 2;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-type {
  color: var(--color-text-soft);
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-background-soft);
  border-radius: 4px;
}

.book-btn {
  grid-column: 2;
  grid-row: 2;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
}

.book-btn:hover {
  background: var(--color-primary-hover);
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
    grid-template-columns: 1fr;
    text-align: left;
  }
  
  .price-info,
  .book-btn {
    grid-column: 1;
    text-align: left;
    align-items: flex-start;
  }
  
  .book-btn {
    width: 100%;
    margin-top: 1rem;
  }
}
</style>
