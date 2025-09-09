<template>
  <div class="hotel-info-block">
    <div class="block-header">
      <h2 class="block-title">Информация об отеле</h2>
    </div>

    <div class="hotel-content">
      <!-- Hotel Image -->
      <div class="hotel-image-section">
        <div class="hotel-image">
          <img 
            v-if="hotelImageUrl" 
            :src="hotelImageUrl" 
            :alt="hotel.name"
            @error="handleImageError"
          />
          <div v-else class="image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        <div class="hotel-badges">
          <span v-if="hotel.is_exclusive" class="badge exclusive">Эксклюзив</span>
          <span v-if="hotel.in_stop === true" class="badge stop-sale">STOP SALE</span>
        </div>
      </div>

      <!-- Hotel Details -->
      <div class="hotel-details">
        <div class="hotel-header">
          <h3 class="hotel-name">{{ hotel.name }}</h3>
          <div class="hotel-rating">
            <div class="stars">
              <span v-for="star in starRating" :key="star" class="star">★</span>
            </div>
            <span class="rating-text">{{ hotel.category }}</span>
          </div>
        </div>

        <div class="hotel-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ hotel.city }}
        </div>

        <!-- Accommodation Details -->
        <div class="accommodation-details">
          <div class="detail-row">
            <span class="detail-label">Размещение:</span>
            <span class="detail-value">{{ placement.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Питание:</span>
            <span class="detail-value">
              {{ meal.full_name }}
            </span>
          </div>
        </div>

        <!-- Dates and Duration -->
        <div class="dates-section">
          <div class="detail-row">
            <span class="detail-label">Даты проживания:</span>
            <span class="detail-value">
              {{ formatDate(dates.check_in) }} - {{ formatDate(dates.check_out) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Количество ночей:</span>
            <span class="detail-value">{{ nights.total }} ночей</span>
          </div>
        </div>

        <!-- Price -->
        <div class="price-section">
          <div class="price-display">
            <span class="price-amount">{{ price.amount }}</span>
            <span class="price-currency">{{ price.currency }}</span>
          </div>
          <div class="price-type">Базовая стоимость тура</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SearchResult, GroupedSearchResult } from '../../types/search'
import type { SelectedFlight, SelectedRoom } from '../../types/booking'

interface Props {
  searchResult: SearchResult | GroupedSearchResult
  selectedFlight?: SelectedFlight
  selectedRoom?: SelectedRoom
}

const props = defineProps<Props>()

// State
const imageError = ref(false)

// Computed
const hotel = computed(() => {
  if (isGroupedResult.value) {
    return (props.searchResult as GroupedSearchResult).hotel || {}
  } else {
    return (props.searchResult as SearchResult).accommodation?.hotel || {}
  }
})

const room = computed(() => {
  // Если выбрана комната, используем её
  if (props.selectedRoom) {
    return props.selectedRoom.room
  }
  
  if (isGroupedResult.value) {
    const groupedResult = props.searchResult as GroupedSearchResult
    // Используем первую доступную комнату
    return groupedResult.roomOptions?.[0]?.room || {}
  } else {
    return (props.searchResult as SearchResult).accommodation?.room || {}
  }
})

const placement = computed(() => {
  // Если выбрана комната, используем её размещение
  if (props.selectedRoom) {
    return props.selectedRoom.placement
  }
  
  if (isGroupedResult.value) {
    const groupedResult = props.searchResult as GroupedSearchResult
    // Используем размещение первой доступной комнаты
    return groupedResult.roomOptions?.[0]?.placement || {}
  } else {
    return (props.searchResult as SearchResult).accommodation?.placement || {}
  }
})

const meal = computed(() => {
  // Если выбрана комната, используем её питание
  if (props.selectedRoom) {
    return props.selectedRoom.meal
  }
  
  if (isGroupedResult.value) {
    const groupedResult = props.searchResult as GroupedSearchResult
    // Используем питание первой доступной комнаты
    return groupedResult.roomOptions?.[0]?.meal || {}
  } else {
    return (props.searchResult as SearchResult).accommodation?.meal || {}
  }
})

const dates = computed(() => props.searchResult.dates || {})
const nights = computed(() => props.searchResult.nights || {})
// Check if this is a grouped result with room options
const isGroupedResult = computed(() => 'roomOptions' in props.searchResult)

// Calculate price based on selected room and flight
const price = computed(() => {
  // For grouped results, find the exact price for selected room + flight combination
  if (isGroupedResult.value && props.selectedRoom && props.selectedFlight) {
    const groupedResult = props.searchResult as GroupedSearchResult
    
    // Find the selected room option
    const selectedRoomOption = groupedResult.roomOptions?.find(option => 
      option.room.id === props.selectedRoom?.room.id &&
      option.meal.id === props.selectedRoom?.meal.id &&
      option.placement.id === props.selectedRoom?.placement.id
    )
    
    if (selectedRoomOption) {
      // Find the flight option with matching flight IDs
      const selectedFlightOption = selectedRoomOption.flightOptions?.find(option => 
        option.from.id === props.selectedFlight?.outbound.id &&
        option.to.id === props.selectedFlight?.inbound.id
      )
      
      if (selectedFlightOption?.price) {
        return selectedFlightOption.price
      }
    }
  }
  
  // Fallback: If room is selected, use its price
  if (props.selectedRoom) {
    return props.selectedRoom.price
  }
  
  // For regular SearchResult, return the base price
  if ('accommodation' in props.searchResult) {
    return props.searchResult.price || {}
  }
  
  // For grouped result, use first room option price
  if (isGroupedResult.value) {
    const groupedResult = props.searchResult as GroupedSearchResult
    return groupedResult.roomOptions?.[0]?.price || {}
  }
  
  return {}
})

const starRating = computed(() => {
  const category = (hotel.value as any)?.category || ''
  const match = category.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
})

const hotelImageUrl = computed(() => {
  if (imageError.value) return null
  // TODO: Implement TripAdvisor API integration
  // For now, return null to show placeholder
  return null
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}


const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.hotel-info-block {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin-bottom: 2rem;
}

.block-header {
  padding: 1.5rem 1.5rem 0;
}

.block-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 1.5rem;
}

.hotel-content {
  display: flex;
  gap: 1.5rem;
  padding: 0 1.5rem 1.5rem;
}

.hotel-image-section {
  flex: 0 0 200px;
  position: relative;
}

.hotel-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-background);
  position: relative;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: var(--color-background);
}

.hotel-badges {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.exclusive {
  background: var(--color-primary);
  color: white;
}

.badge.stop-sale {
  background: #ef4444;
  color: white;
}

.hotel-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.hotel-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0;
  line-height: 1.3;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #fbbf24;
  font-size: 1rem;
}

.rating-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.accommodation-details,
.dates-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.detail-value {
  font-weight: 600;
  color: var(--color-secondary);
  text-align: right;
}


.price-section {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 2px solid var(--color-border);
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-currency {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
}

.price-type {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .hotel-content {
    flex-direction: column;
  }
  
  .hotel-image-section {
    flex: none;
  }
  
  .hotel-image {
    height: 200px;
  }
  
  .hotel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
