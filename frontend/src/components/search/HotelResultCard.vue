<template>
  <div class="hotel-result-card" :class="{ 'stop-sale': result.accommodation.hotel.in_stop }">
    <!-- Flight Information Section -->
    <div class="flight-section">
      <!-- Outbound Flight -->
      <div class="flight-info outbound">
        <div class="flight-label">Вылет туда</div>
        <div class="flight-date-time">
          <div class="date">{{ formatFlightDate(result.tickets?.from?.departure?.date || '') }}</div>
          <div class="time">{{ result.tickets?.from?.departure?.time || '' }}</div>
        </div>
        <div class="flight-route">
          <div class="airport-codes">
            <span class="airport-from">{{ result.tickets?.from?.airports?.from?.prefix || '' }}</span>
            <div class="flight-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
              </svg>
            </div>
            <span class="airport-to">{{ result.tickets?.from?.airports?.to?.prefix || '' }}</span>
          </div>
          <div class="airline-info">
            <div class="airline-logo" :style="{ backgroundColor: result.tickets?.from?.airline?.color || '#ccc' }">
              ✈
            </div>
            <span class="airline-code">{{ result.tickets?.from?.airline?.iata_code || '' }}</span>
            <span class="flight-number">{{ result.tickets?.from?.name || '' }}</span>
          </div>
        </div>
      </div>

      <!-- Return Flight -->
      <div class="flight-info return">
        <div class="flight-label">Вылет оттуда</div>
        <div class="flight-date-time">
          <div class="date">{{ formatFlightDate(result.tickets?.to?.departure?.date || '') }}</div>
          <div class="time">{{ result.tickets?.to?.departure?.time || '' }}</div>
        </div>
        <div class="flight-route">
          <div class="airport-codes">
            <span class="airport-from">{{ result.tickets?.to?.airports?.from?.prefix || '' }}</span>
            <div class="flight-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
              </svg>
            </div>
            <span class="airport-to">{{ result.tickets?.to?.airports?.to?.prefix || '' }}</span>
          </div>
          <div class="airline-info">
            <div class="airline-logo" :style="{ backgroundColor: result.tickets?.to?.airline?.color || '#ccc' }">
              ✈
            </div>
            <span class="airline-code">{{ result.tickets?.to?.airline?.iata_code || '' }}</span>
            <span class="flight-number">{{ result.tickets?.to?.name || '' }}</span>
          </div>
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
        <h3 class="hotel-name">{{ result.accommodation?.hotel?.name || 'Отель' }}</h3>
        <div class="hotel-badges">
          <span v-if="result.accommodation?.hotel?.is_exclusive" class="badge exclusive">Эксклюзив</span>
          <span v-if="result.accommodation?.hotel?.in_stop" class="badge stop-sale">STOP SALE</span>
        </div>
      </div>

      <!-- STOP SALE Warning -->
      <div v-if="result.accommodation?.hotel?.in_stop" class="stop-sale-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Внимание!</strong> Ограниченное количество мест. Бронирование может быть недоступно.
        </div>
      </div>
      
      <div class="hotel-details">
        <div class="hotel-category">{{ result.accommodation?.hotel?.category || '' }}</div>
        <div class="hotel-location">{{ result.accommodation?.hotel?.city || '' }}</div>
      </div>

      <div class="accommodation-details">
        <div class="room-info">
          <span class="room-type">{{ result.accommodation?.room?.name || '' }}</span>
          <span class="placement">{{ result.accommodation?.placement?.name || '' }}</span>
        </div>
        <div class="meal-info">
          <span class="meal-type" :class="getMealClass(result.accommodation?.meal?.name || '')">
            {{ result.accommodation?.meal?.name || '' }}
          </span>
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
        <div v-if="result.accommodation?.hotel?.in_stop" class="stop-sale-price">
          <div class="stop-sale-label">STOP SALE</div>
          <div class="price">{{ result.price?.amount || 0 }} {{ result.price?.currency || '' }}</div>
        </div>
        <div v-else class="normal-price">
          <div class="price">{{ result.price?.amount || 0 }} {{ result.price?.currency || '' }}</div>
        </div>
        <div class="price-type">{{ result.price?.type || '' }}</div>
      </div>

      <div class="action-buttons">
        <button 
          class="action-btn availability" 
          :class="getAvailabilityClass()"
          :title="getAvailabilityTooltip()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
          <span>{{ getAvailabilityText() }}</span>
        </button>
        
        <button class="action-btn details" title="Детали отеля">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2"/>
            <path d="M8 5V3a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <button class="action-btn compare" title="Сравнить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 19c-5 0-7-2-7-7s2-7 7-7 7 2 7 7-2 7-7 7z" stroke="currentColor" stroke-width="2"/>
            <path d="M15 5c5 0 7 2 7 7s-2 7-7 7" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <button class="action-btn book" title="Забронировать" @click="handleBook">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-4" stroke="currentColor" stroke-width="2"/>
            <path d="M9 11V9a2 2 0 012-2h2a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, getNightWord } from '../../utils/dateUtils'
import type { SearchResult } from '../../types/search'

interface Props {
  result: SearchResult
}

const props = defineProps<Props>()

const emit = defineEmits<{
  book: [result: SearchResult]
  details: [result: SearchResult]
  compare: [result: SearchResult]
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

// Get meal type CSS class
const getMealClass = (mealType: string) => {
  const mealMap: Record<string, string> = {
    'AI': 'all-inclusive',
    'UAI': 'ultra-all-inclusive', 
    'HB': 'half-board',
    'FB': 'full-board',
    'BB': 'bed-breakfast',
    'RO': 'room-only'
  }
  return mealMap[mealType] || 'other'
}

// Check if has additional services
const hasAdditionalServices = computed(() => {
  return (props.result.never_land_entrance?.length || 0) > 0 ||
         (props.result.gala_dinner?.length || 0) > 0 ||
         (props.result.aquapark_services?.length || 0) > 0 ||
         (props.result.additional_services?.length || 0) > 0
})

// Get availability text
const getAvailabilityText = () => {
  const tickets = props.result.tickets
  if (!tickets) return '10+'
  
  const fromTickets = tickets.from?.tickets
  const toTickets = tickets.to?.tickets
  
  if (tickets.has_tickets === false) {
    return 'Нет мест'
  }
  
  if (tickets.on_request === 'y') {
    return 'На запрос'
  }
  
  // Get minimum available tickets
  const minTickets = Math.min(
    fromTickets || 10,
    toTickets || 10
  )
  
  return minTickets >= 10 ? '10+' : minTickets.toString()
}

// Get availability tooltip
const getAvailabilityTooltip = () => {
  const tickets = props.result.tickets
  if (!tickets) return 'Информация недоступна'
  
  const fromTickets = tickets.from?.tickets
  const toTickets = tickets.to?.tickets
  
  if (tickets.has_tickets === false) {
    return 'Билеты недоступны'
  }
  
  if (tickets.on_request === 'y') {
    return 'Билеты на запрос - требуется подтверждение'
  }
  
  const fromText = fromTickets ? `${fromTickets} мест` : '10+ мест'
  const toText = toTickets ? `${toTickets} мест` : '10+ мест'
  
  return `Туда: ${fromText}, Обратно: ${toText}`
}

// Get availability CSS class
const getAvailabilityClass = () => {
  const tickets = props.result.tickets
  if (!tickets) return 'high-availability'
  
  if (tickets.has_tickets === false) {
    return 'no-tickets'
  }
  
  if (tickets.on_request === 'y') {
    return 'on-request'
  }
  
  const fromTickets = tickets.from?.tickets
  const toTickets = tickets.to?.tickets
  const minTickets = Math.min(fromTickets || 10, toTickets || 10)
  
  if (minTickets <= 2) {
    return 'low-availability'
  } else if (minTickets <= 5) {
    return 'medium-availability'
  } else {
    return 'high-availability'
  }
}

// Handle booking
const handleBook = () => {
  emit('book', props.result)
}

// Handle details
const handleDetails = () => {
  emit('details', props.result)
}

// Handle compare
const handleCompare = () => {
  emit('compare', props.result)
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
  min-height: 140px;
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
}

.hotel-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  margin: 0;
  flex: 1;
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
}

.hotel-category {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.hotel-location {
  color: var(--color-text-soft);
  font-size: 0.85rem;
}

.accommodation-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.room-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.room-type {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.85rem;
}

.placement {
  background: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-soft);
}

.meal-info {
  display: flex;
  align-items: center;
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
}

.action-btn.book:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
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
}
</style>
