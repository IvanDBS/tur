<template>
  <div class="hotel-result-card" :class="{ 'stop-sale': result.hotel.in_stop }">
    <!-- Hotel Image Section -->
    <div class="hotel-image-section">
      <div class="hotel-image">
        <img 
          v-if="result.hotel?.image_url" 
          :src="result.hotel.image_url" 
          :alt="result.hotel.name"
          @error="handleImageError"
        />
        <div v-else class="image-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="hotel-badges-overlay">
        <span v-if="result.hotel?.is_exclusive" class="badge exclusive">Эксклюзив</span>
        <span v-if="result.hotel?.in_stop" class="badge stop-sale">STOP SALE</span>
      </div>
    </div>

    <!-- Flight Information Section -->
    <div class="flight-section">
      <!-- Flight Options Summary -->
      <div class="flight-options-summary">
        <div class="flight-label">Варианты перелетов</div>
        <div class="flight-count">
          {{ getFlightOptionsCount() }} {{ getFlightWord(getFlightOptionsCount()) }}
        </div>
        <div class="flight-price-range" v-if="result.minPrice !== result.maxPrice">
          от {{ result.minPrice }} до {{ result.maxPrice }} {{ result.currency }}
        </div>
        <div class="flight-price-range" v-else>
          {{ result.minPrice }} {{ result.currency }}
        </div>
      </div>

      <!-- Duration Period -->
      <div class="duration-info">
        <div class="nights">
          {{ result.nights?.total || 0 }} {{ getNightWord(result.nights?.total || 0) }}
          <span v-if="(result.nights?.on_the_way || 0) > 0" class="on-the-way">+{{ result.nights.on_the_way }}</span>
        </div>
        <div class="dates">
          с {{ formatDateShort(result.dates?.check_in || '') }} по {{ formatDateShort(result.dates?.check_out || '') }}
        </div>
      </div>
    </div>

    <!-- Hotel Information Section -->
    <div class="hotel-section">
      <div class="hotel-header">
        <h3 class="hotel-name">{{ result.hotel?.name || 'Отель' }}</h3>
        <div class="hotel-rating">
          <div class="stars">
            <span v-for="star in getStarRating()" :key="star" class="star">★</span>
          </div>
          <span class="rating-text">{{ result.hotel?.category || '' }}</span>
        </div>
      </div>

      <!-- STOP SALE Warning -->
      <div v-if="result.hotel?.in_stop" class="stop-sale-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Внимание!</strong> Ограниченное количество мест. Бронирование может быть недоступно.
        </div>
      </div>
      
      <div class="hotel-details">
        <div class="hotel-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ result.hotel?.city || '' }}
        </div>
      </div>


      <div class="accommodation-details">
        <div class="room-options-summary">
          <div class="room-label">Варианты проживания</div>
          <div class="room-count">
            {{ result.roomOptions?.length || 1 }} {{ getRoomWord(result.roomOptions?.length || 1) }}
          </div>
          <div class="room-price-range" v-if="result.minPrice !== result.maxPrice">
            от {{ result.minPrice }} до {{ result.maxPrice }} {{ result.currency }}
          </div>
          <div class="room-price-range" v-else>
            {{ result.minPrice }} {{ result.currency }}
          </div>
        </div>
      </div>

      <!-- Additional Services -->
      <div v-if="hasAdditionalServices" class="additional-services">
        <div class="services-label">Дополнительные услуги:</div>
        <div class="services-list">
          <span v-if="(result.never_land_entrance?.length || 0) > 0" class="service-badge neverland">
            🎭 NeverLand
          </span>
          <span v-if="(result.gala_dinner?.length || 0) > 0" class="service-badge gala">
            🍽️ Гала-ужин
          </span>
          <span v-if="(result.aquapark_services?.length || 0) > 0" class="service-badge aquapark">
            🏊 Аквапарк
          </span>
          <span v-if="(result.additional_services?.length || 0) > 0" class="service-badge additional">
            ⭐ Доп. услуги
          </span>
        </div>
      </div>

      <!-- Additional Results Info -->
      <div v-if="(result.hotel_results_counter || 0) > 0" class="additional-results">
        <span class="results-counter">
          Еще {{ result.hotel_results_counter }} вариантов
        </span>
      </div>
    </div>

    <!-- Price and Actions Section -->
    <div class="price-section">
      <div class="price-info">
        <div v-if="result.hotel?.in_stop" class="stop-sale-price">
          <div class="stop-sale-label">STOP SALE</div>
          <div class="price">{{ result.minPrice }} {{ result.currency }}</div>
        </div>
        <div v-else class="normal-price">
          <div class="price" v-if="result.minPrice !== result.maxPrice">
            от {{ result.minPrice }} {{ result.currency }}
          </div>
          <div class="price" v-else>
            {{ result.minPrice }} {{ result.currency }}
          </div>
        </div>
        <div class="price-type">{{ result.price?.type || '' }}</div>
      </div>

      <div class="action-buttons">
        
        <button 
          class="action-btn book" 
          :class="{ 'disabled': !canBook }"
          :title="canBook ? 'Забронировать' : 'Бронирование недоступно'"
          :disabled="!canBook"
          @click="handleBook"
        >
          <span>Забронировать</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate, getNightWord } from '../../utils/dateUtils'
import type { SearchResult, GroupedSearchResult } from '../../types/search'

// Get router instance at the top level of setup()
const router = useRouter()

interface Props {
  result: GroupedSearchResult
}

const props = defineProps<Props>()

const emit = defineEmits<{
  book: [result: GroupedSearchResult]
  saveSearchState: []
}>()

// Format flight date (show day of week)
const formatFlightDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('ru-RU', { month: 'short' })
  const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'short' })
  return `${day} ${month} ${dayOfWeek}`
}

// Format short date for duration period
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}.${month}`
}


// Check if has additional services
const hasAdditionalServices = computed(() => {
  return (props.result.never_land_entrance?.length || 0) > 0 ||
         (props.result.gala_dinner?.length || 0) > 0 ||
         (props.result.aquapark_services?.length || 0) > 0
})


// Check if booking is available
const canBook = computed(() => {
  // Check if any room option has available flights
  if ('roomOptions' in props.result) {
    const groupedResult = props.result as GroupedSearchResult
    const hasAvailableTickets = groupedResult.roomOptions.some(roomOption => 
      roomOption.flightOptions.some(flightOption => 
        flightOption.has_tickets !== false
      )
    )
    return hasAvailableTickets
  }
  
  // For regular SearchResult, check tickets directly
  if ('accommodation' in props.result) {
    const regularResult = props.result as SearchResult
    return regularResult.tickets.has_tickets !== false
  }
  
  return true
})


// Handle booking
const handleBook = () => {
  console.log('Booking button clicked!', props.result)
  
  // Create unique key for grouped result
  const uniqueKey = `${props.result.hotel.id}`
  
  // Navigate to booking page with search result data
  console.log('Navigating to booking page with ID:', uniqueKey)
  
  // Store search result in sessionStorage for the booking page
  try {
    sessionStorage.setItem('bookingSearchResult', JSON.stringify(props.result))
  } catch (error) {
    console.warn('Failed to store search result in sessionStorage:', error)
  }
  
  // Emit event to parent to save search state before navigation
  emit('saveSearchState')
  
  router.push({
    name: 'booking',
    params: {
      searchResultId: uniqueKey
    }
  }).then(() => {
    console.log('Navigation successful')
  }).catch((error) => {
    console.error('Navigation failed:', error)
    alert('Ошибка перехода на страницу бронирования: ' + error.message)
  })
}



// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  img.parentElement?.querySelector('.image-placeholder')?.classList.add('show')
}

// Get star rating
const getStarRating = () => {
  const category = props.result.hotel?.category || ''
  const match = category.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// Get flight word with correct declension
const getFlightWord = (count: number) => {
  if (count === 1) return 'вариант'
  if (count >= 2 && count <= 4) return 'варианта'
  return 'вариантов'
}

// Get room word with correct declension
const getRoomWord = (count: number) => {
  if (count === 1) return 'вариант'
  if (count >= 2 && count <= 4) return 'варианта'
  return 'вариантов'
}

// Get flight options count
const getFlightOptionsCount = () => {
  if ('roomOptions' in props.result) {
    const groupedResult = props.result as GroupedSearchResult
    // Считаем общее количество вариантов перелетов для всех комнат
    return groupedResult.roomOptions.reduce((total, roomOption) => 
      total + roomOption.flightOptions.length, 0
    )
  }
  
  // For regular SearchResult, return 1
  return 1
}

// Export component
defineExpose({})
</script>

<style scoped>
.hotel-result-card {
  display: flex;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 200px;
}

.hotel-result-card:hover {
  border-color: var(--color-secondary);
  box-shadow: 0 8px 24px rgba(26, 60, 97, 0.12);
  transform: translateY(-2px);
}

.hotel-result-card.stop-sale {
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border-color: #fecaca;
}

/* Hotel Image Section */
.hotel-image-section {
  flex: 0 0 200px;
  position: relative;
  overflow: hidden;
}

.hotel-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hotel-image:hover img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-soft);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-placeholder.show {
  opacity: 1;
}

.hotel-badges-overlay {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hotel-badges-overlay .badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.9);
}

.hotel-badges-overlay .badge.exclusive {
  color: #1e40af;
}

.hotel-badges-overlay .badge.stop-sale {
  color: #dc2626;
}

/* Flight Section */
.flight-section {
  flex: 0 0 320px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.flight-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  position: relative;
}

.flight-label {
  position: absolute;
  top: 0.25rem;
  left: 0;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.flight-info:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-border), transparent);
}

.duration-info {
  padding: 1rem 0;
  margin-top: 0;
  border-top: 1px solid var(--color-border);
}

.flight-date-time {
  flex: 0 0 60px;
  text-align: center;
}

.flight-date-time .date {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
}

.flight-date-time .time {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 0.25rem;
}

.flight-route {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.airport-codes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.airport-from, .airport-to {
  color: var(--color-text);
  font-family: 'Courier New', monospace;
}

.flight-icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.airline-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.airline-code {
  font-size: 0.8rem;
  color: var(--color-text);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.airline-logo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
}

.flight-number {
  font-size: 0.8rem;
  color: var(--color-text-soft);
  font-family: 'Courier New', monospace;
}


.nights {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.on-the-way {
  color: var(--color-primary);
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

.dates {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-top: 0.25rem;
}

/* Hotel Section */
.hotel-section {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hotel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.hotel-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  margin: 0;
  flex: 1;
}

.hotel-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #fbbf24;
  font-size: 0.9rem;
}

.rating-text {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  font-weight: 500;
}

.hotel-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.exclusive {
  background: #dbeafe;
  color: #1e40af;
}

.badge.stop-sale {
  background: #fecaca;
  color: #dc2626;
}

/* STOP SALE Warning */
.stop-sale-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  margin-top: 0.75rem;
}

.warning-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.warning-text {
  font-size: 0.8rem;
  color: #dc2626;
  line-height: 1.4;
}

.warning-text strong {
  font-weight: 600;
}

.hotel-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.hotel-location {
  color: var(--color-text-soft);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}


.accommodation-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.room-options-summary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.room-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.room-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.room-price-range {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}

.meal-type {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.meal-type.all-inclusive {
  background: #dcfce7;
  color: #166534;
}

.meal-type.ultra-all-inclusive {
  background: #dbeafe;
  color: #1e40af;
}

.meal-type.half-board {
  background: #fef3c7;
  color: #92400e;
}

.meal-type.full-board {
  background: #e0e7ff;
  color: #3730a3;
}

.meal-type.bed-breakfast {
  background: #f3e8ff;
  color: #7c3aed;
}

.meal-type.room-only {
  background: #f1f5f9;
  color: #475569;
}

.meal-type.other {
  background: var(--color-background-soft);
  color: var(--color-text-soft);
}

/* Price Section */
.price-section {
  flex: 0 0 200px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 1px solid var(--color-border);
}

.price-info {
  text-align: right;
  width: 100%;
}

.stop-sale-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.stop-sale-label {
  background: #dc2626;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.normal-price, .stop-sale-price .price {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}

.price-type {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  font-size: 0.7rem;
  color: var(--color-text-soft);
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
  color: var(--color-text-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
}

.action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.action-btn.book {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  width: auto;
  min-width: 120px;
  height: 40px;
  padding: 0 1rem;
  font-size: 0.8rem;
}

.action-btn.book:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.action-btn.book.disabled {
  background: #9ca3af;
  color: #6b7280;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.book.disabled:hover {
  background: #9ca3af;
  transform: none;
}

.action-btn.availability {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.action-btn.availability:hover {
  background: #bbf7d0;
}

.action-btn.availability.high-availability {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.action-btn.availability.medium-availability {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.action-btn.availability.low-availability {
  background: #fecaca;
  color: #dc2626;
  border-color: #fca5a5;
}

.action-btn.availability.on-request {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.action-btn.availability.no-tickets {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.action-btn.availability.no-tickets:hover {
  background: #f3f4f6;
  transform: none;
}

/* Additional Services */
.additional-services {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.services-label {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.service-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.service-badge.neverland {
  background: #f3e8ff;
  color: #7c3aed;
}

.service-badge.gala {
  background: #fef3c7;
  color: #92400e;
}

.service-badge.aquapark {
  background: #dbeafe;
  color: #1e40af;
}

.service-badge.additional {
  background: #dcfce7;
  color: #166534;
}

/* Additional Results */
.additional-results {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.results-counter {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
  background: #e0e7ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .hotel-result-card {
    flex-direction: column;
    min-height: auto;
  }
  
  .hotel-image-section {
    flex: none;
    height: 200px;
  }
  
  .flight-section {
    flex: none;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .price-section {
    flex: none;
    border-left: none;
    border-top: 1px solid var(--color-border);
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .action-buttons {
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .flight-section {
    padding: 1rem;
  }
  
  .hotel-section {
    padding: 1rem;
  }
  
  .price-section {
    padding: 1rem;
  }
  
  .hotel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .hotel-badges {
    align-self: flex-start;
  }
  
  .hotel-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .accommodation-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-btn.book {
    min-width: 140px;
    height: 44px;
    font-size: 0.85rem;
  }
  
}
</style>
