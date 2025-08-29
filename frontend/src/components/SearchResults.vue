<template>
  <div class="search-results">
    <div v-if="isLoading" class="loading">
      <div class="blue-spinner"></div>
      <p class="loading-text">Поиск лучших вариантов...</p>
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
import { ref } from 'vue'

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
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 20px;
  box-sizing: border-box;
}



.loading {
  text-align: center;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  color: var(--color-text-soft);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.blue-spinner {
  position: relative;
  width: 54px;
  height: 54px;
  border-top: 3px solid #A7D8F0;      /* голубой */
  border-bottom: 0;
  border-left: 3px solid #A7D8F0;     /* голубой */
  border-right: 3px solid transparent;
  animation: rotate 1.6s linear infinite;
  border-radius: 50%;
}

.blue-spinner::before {
  content: '';
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23FF5A5F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 11.6C20 10.96 19.44 10.4 18.8 10.4H14.4L10.4 4H8.8L10.8 10.4H6.4L5.2 8.8H4L4.8 11.6L4 14.4H5.2L6.4 12.8H10.8L8.8 19.2H10.4L14.4 12.8H18.8C19.44 12.8 20 12.24 20 11.6Z'/%3E%3C/svg%3E%0A");
  display: block;
  background-size: 30px;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  z-index: 999;
  top: -19px;
  left: 19px;
  width: 100%;
  height: 100%;
  text-align: center;
  transform: rotate(41deg);
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
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
