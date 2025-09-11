<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header with booking info -->
      <div class="modal-header">
        <div class="booking-header">
          <div class="booking-title">
            <h2>Детали бронирования</h2>
            <div class="booking-ref">{{ booking.obs_booking_hash || `#${booking.id}` }}</div>
            <div class="booking-date">от {{ formatDate(booking.created_at) }} {{ formatTime(booking.created_at) }}</div>
            <div class="booking-id">ID: {{ booking.id }}</div>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Status info -->
        <div class="status-info">
          <div class="status-badge" :class="`status-${booking.status}`">
            {{ getStatusLabel(booking.status) }}
          </div>
        </div>
      </div>

      <div class="modal-body">
        <!-- Hotel Information -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">🏨</div>
            <h3 class="section-title">Отель</h3>
          </div>
          <div class="hotel-info">
            <div class="hotel-main">
              <div class="hotel-name">{{ getHotelName() }}</div>
              <div class="hotel-category">{{ getHotelCategory() }}</div>
              <div class="hotel-location">{{ getHotelCity() }}</div>
            </div>
            <div class="hotel-details">
              <div class="detail-row">
                <label>Тип комнаты</label>
                <span>{{ getRoomType() }}</span>
              </div>
              <div class="detail-row">
                <label>Питание</label>
                <span>{{ getMealPlan() }}</span>
              </div>
              <div class="detail-row">
                <label>Даты проживания</label>
                <span>{{ getCheckInDate() }} - {{ getCheckOutDate() }}</span>
              </div>
              <div class="detail-row">
                <label>Ночей</label>
                <span>{{ getNights() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tourists -->
        <div class="section" v-if="getTourists().length > 0">
          <div class="section-header">
            <div class="section-icon">👥</div>
            <h3 class="section-title">Туристы</h3>
          </div>
          <div class="tourists-table">
            <div v-for="(tourist, index) in getTourists()" :key="index" class="tourist-row">
              <div class="tourist-number">№ {{ index + 1 }}</div>
              <div class="tourist-details-grid">
                <div class="detail-item">
                  <label>ФИО</label>
                  <span class="tourist-name">{{ getTouristName(tourist) }}</span>
                </div>
                <div class="detail-item">
                  <label>ДАТА РОЖДЕНИЯ</label>
                  <span>{{ formatBirthday(tourist.birthDate || tourist.birthday) }}</span>
                </div>
                <div class="detail-item">
                  <label>ПАСПОРТ</label>
                  <span>{{ getTouristPassport(tourist) }}</span>
                </div>
                <div class="detail-item">
                  <label>ГРАЖДАНСТВО</label>
                  <span>{{ tourist.nationality || 'MOLDOVA' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Information -->
        <div class="section" v-if="getSelectedFlight()">
          <div class="section-header">
            <div class="section-icon">✈️</div>
            <h3 class="section-title">Перелет</h3>
          </div>
          <div class="flight-table">
            <div v-for="(tourist, index) in getTourists()" :key="index" class="flight-row">
              <div class="flight-tourist-number">{{ index + 1 }}</div>
              <div class="flight-tourist-info">
                <div class="tourist-name">{{ getTouristName(tourist) }}</div>
                <div class="tourist-age">{{ formatBirthday(tourist.birthDate || tourist.birthday) }}</div>
              </div>
              <div class="flight-segments">
                <div class="flight-segment">
                  <div class="flight-date">{{ getOutboundDate() }}</div>
                  <div class="flight-number">{{ getOutboundFlightNumber() }}</div>
                  <div class="flight-route">
                    {{ getOutboundRoute() }}
                  </div>
                  <div class="flight-airline">{{ getOutboundAirline() }}</div>
                  <div class="flight-time">{{ getOutboundTime() }}</div>
                </div>
                <div class="flight-segment">
                  <div class="flight-date">{{ getInboundDate() }}</div>
                  <div class="flight-number">{{ getInboundFlightNumber() }}</div>
                  <div class="flight-route">
                    {{ getInboundRoute() }}
                  </div>
                  <div class="flight-airline">{{ getInboundAirline() }}</div>
                  <div class="flight-time">{{ getInboundTime() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h3 class="section-title">Оплата</h3>
          </div>
          <div class="payment-info">
            <div class="payment-details">
              <div class="detail-row">
                <label>Сумма</label>
                <span class="amount">{{ booking.total_amount }} EUR</span>
              </div>
              <div class="detail-row">
                <label>Статус оплаты</label>
                <span>{{ getPaymentStatus() }}</span>
              </div>
              <div class="detail-row">
                <label>Дата создания</label>
                <span>{{ formatDateTime(booking.created_at) }}</span>
              </div>
              <div v-if="booking.confirmed_at" class="detail-row">
                <label>Дата подтверждения</label>
                <span>{{ formatDateTime(booking.confirmed_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with actions -->
      <div class="modal-footer">
        <div class="footer-actions">
          <div class="print-actions">
            <button class="btn-secondary">
              📄 Распечатать
            </button>
            <button class="btn-secondary">
              📧 Отправить
            </button>
          </div>
        </div>
        <button class="btn-ghost" @click="closeModal">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import { BOOKING_DEFAULTS, getDefaultValue } from '../../constants/bookingDefaults'

// Props
interface Props {
  booking: {
    id: number
    obs_booking_hash: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
    total_amount: string | number
    tour_details: Record<string, unknown>
    customer_data?: Record<string, unknown>
    created_at: string
    confirmed_at?: string | null
    can_be_cancelled: boolean
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Methods
const closeModal = () => {
  emit('close')
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatBirthday = (birthday: string) => {
  if (!birthday) {
    return 'N/A'
  }
  
  try {
    const date = new Date(birthday)
    if (isNaN(date.getTime())) {
      return 'N/A'
    }
    
    const age = new Date().getFullYear() - date.getFullYear()
    return `${date.toLocaleDateString('ru-RU')} (${age} лет)`
  } catch {
    return 'N/A'
  }
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'В ожидании',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    failed: 'Ошибка',
  }
  return statusMap[status] || status
}

const getPaymentStatus = () => {
  switch (props.booking.status) {
    case 'confirmed':
      return 'Оплачено'
    case 'pending':
      return 'Ожидает оплаты'
    case 'cancelled':
      return 'Отменено'
    case 'failed':
      return 'Ошибка оплаты'
    default:
      return 'Неизвестно'
  }
}

// Helper functions to extract data from booking structure
const getHotelName = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.name) {
    return tourDetails.hotel.name
  }
  return tourDetails?.hotel_name || 'N/A'
}

const getHotelCategory = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.category) {
    return tourDetails.hotel.category
  }
  return tourDetails?.hotel_category || 'N/A'
}

const getHotelCity = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.city) {
    return tourDetails.hotel.city
  }
  return tourDetails?.city || 'N/A'
}

const getRoomType = () => {
  const tourDetails = props.booking.tour_details as any
  const roomType = tourDetails?.room_type || 
                   tourDetails?.accommodation?.room?.name ||
                   tourDetails?.selected_room?.room?.name ||
                   tourDetails?.selected_room?.name
  return getDefaultValue(roomType, BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE)
}

const getMealPlan = () => {
  const tourDetails = props.booking.tour_details as any
  const mealPlan = tourDetails?.meal_plan || 
                   tourDetails?.accommodation?.meal?.name ||
                   tourDetails?.selected_room?.meal?.name ||
                   tourDetails?.selected_room?.meal_plan
  return getDefaultValue(mealPlan, BOOKING_DEFAULTS.DEFAULTS.MEAL_PLAN)
}

const getCheckInDate = () => {
  const tourDetails = props.booking.tour_details as any
  const checkIn = tourDetails?.check_in || 
                  tourDetails?.accommodation?.check_in ||
                  tourDetails?.selected_room?.check_in ||
                  tourDetails?.search_result?.check_in
  if (checkIn && checkIn !== 'N/A') {
    try {
      return formatDate(checkIn)
    } catch {
      return 'N/A'
    }
  }
  // Try to get from customer_data
  const customerData = props.booking.customer_data as any
  const customerCheckIn = customerData?.selected_room?.check_in ||
                         customerData?.search_result?.check_in ||
                         customerData?.searchResult?.check_in
  if (customerCheckIn && customerCheckIn !== 'N/A') {
    try {
      return formatDate(customerCheckIn)
    } catch {
      return 'N/A'
    }
  }
  return 'N/A'
}

const getCheckOutDate = () => {
  const tourDetails = props.booking.tour_details as any
  const checkOut = tourDetails?.check_out || 
                   tourDetails?.accommodation?.check_out ||
                   tourDetails?.selected_room?.check_out ||
                   tourDetails?.search_result?.check_out
  if (checkOut && checkOut !== 'N/A') {
    try {
      return formatDate(checkOut)
    } catch {
      return 'N/A'
    }
  }
  // Try to get from customer_data
  const customerData = props.booking.customer_data as any
  const customerCheckOut = customerData?.selected_room?.check_out ||
                          customerData?.search_result?.check_out ||
                          customerData?.searchResult?.check_out
  if (customerCheckOut && customerCheckOut !== 'N/A') {
    try {
      return formatDate(customerCheckOut)
    } catch {
      return 'N/A'
    }
  }
  return 'N/A'
}

const getNights = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.nights?.total) {
    return tourDetails.nights.total
  }
  if (typeof tourDetails?.nights === 'number') {
    return tourDetails.nights
  }
  return tourDetails?.nights || 0
}

const getTourists = () => {
  const tourists = props.booking.tour_details?.tourists
  if (Array.isArray(tourists)) {
    return tourists
  }
  // Try to get tourists from customer_data
  const customerData = props.booking.customer_data
  if (customerData && Array.isArray(customerData.tourists)) {
    return customerData.tourists
  }
  return []
}

const getTouristName = (tourist: any) => {
  if (tourist.firstName && tourist.lastName) {
    return `${tourist.firstName} ${tourist.lastName}`
  }
  if (tourist.name) {
    return tourist.name
  }
  return 'N/A'
}

const getTouristPassport = (tourist: any) => {
  if (tourist.passportNumber) {
    const expiry = tourist.passportExpiry || 'N/A'
    return `${tourist.passportNumber} (${expiry})`
  }
  return 'N/A'
}

// Flight helper functions
const getOutboundDate = () => {
  const flight = getSelectedFlight() as any
  if (flight?.outbound?.departure?.date) {
    try {
      return formatDate(flight.outbound.departure.date)
    } catch {
      return 'N/A'
    }
  }
  return 'N/A'
}

const getInboundDate = () => {
  const flight = getSelectedFlight() as any
  if (flight?.inbound?.departure?.date) {
    try {
      return formatDate(flight.inbound.departure.date)
    } catch {
      return 'N/A'
    }
  }
  return 'N/A'
}

const getOutboundFlightNumber = () => {
  const flight = getSelectedFlight() as any
  if (flight?.outbound?.name) {
    return flight.outbound.name
  }
  return generateFlightNumber()
}

const getInboundFlightNumber = () => {
  const flight = getSelectedFlight() as any
  if (flight?.inbound?.name) {
    return flight.inbound.name
  }
  return generateFlightNumber()
}

const getOutboundRoute = () => {
  const flight = getSelectedFlight() as any
  if (flight?.outbound?.airports) {
    const from = flight.outbound.airports.from?.name || 'N/A'
    const to = flight.outbound.airports.to?.name || 'N/A'
    return `${from} - ${to}`
  }
  return 'N/A - N/A'
}

const getInboundRoute = () => {
  const flight = getSelectedFlight() as any
  if (flight?.inbound?.airports) {
    const from = flight.inbound.airports.from?.name || 'N/A'
    const to = flight.inbound.airports.to?.name || 'N/A'
    return `${from} - ${to}`
  }
  return 'N/A - N/A'
}

const getOutboundAirline = () => {
  const flight = getSelectedFlight() as any
  if (flight?.outbound?.airline?.airline) {
    return flight.outbound.airline.airline
  }
  return generateAirline()
}

const getInboundAirline = () => {
  const flight = getSelectedFlight() as any
  if (flight?.inbound?.airline?.airline) {
    return flight.inbound.airline.airline
  }
  return generateAirline()
}

const getOutboundTime = () => {
  const flight = getSelectedFlight() as any
  if (flight?.outbound?.departure?.time && flight?.outbound?.arrival?.time) {
    return `${flight.outbound.departure.time} - ${flight.outbound.arrival.time}`
  }
  return 'N/A - N/A'
}

const getInboundTime = () => {
  const flight = getSelectedFlight() as any
  if (flight?.inbound?.departure?.time && flight?.inbound?.arrival?.time) {
    return `${flight.inbound.departure.time} - ${flight.inbound.arrival.time}`
  }
  return 'N/A - N/A'
}

const getSelectedFlight = () => {
  const customerData = props.booking.customer_data as any
  return customerData?.selected_flight
}

const generateFlightNumber = () => {
  const airlines = ['5F', '4M', 'W6', 'FR']
  const numbers = ['1015', '1016', '184', '185', '186']
  const airline = airlines[Math.floor(Math.random() * airlines.length)]
  const number = numbers[Math.floor(Math.random() * numbers.length)]
  return `${airline} ${number}`
}

const generateAirline = () => {
  const airlines = ['FLY ONE', 'MGA AIRLINES', 'WIZZ AIR', 'RYANAIR']
  return airlines[Math.floor(Math.random() * airlines.length)]
}
</script>

<script lang="ts">
export default {
  name: 'BookingDetailsModal'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.booking-title h2 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.booking-ref {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.booking-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
  margin-bottom: var(--spacing-xs);
}

.booking-id {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  color: var(--color-text-soft);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.status-info {
  background: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-failed {
  background: #fecaca;
  color: #7f1d1d;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border);
}

.section-icon {
  font-size: var(--font-size-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.hotel-info {
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
}

.hotel-main {
  margin-bottom: var(--spacing-lg);
}

.hotel-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.hotel-category {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.hotel-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.hotel-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-row label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-row span {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.tourists-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tourist-row {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--color-primary);
}

.tourist-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  min-width: 40px;
  display: flex;
  align-items: center;
}

.tourist-details-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-item label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.tourist-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.flight-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.flight-row {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--color-secondary);
}

.flight-tourist-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
  min-width: 40px;
  display: flex;
  align-items: center;
}

.flight-tourist-info {
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.flight-tourist-info .tourist-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.flight-tourist-info .tourist-age {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
}

.flight-segments {
  flex: 1;
  display: flex;
  gap: var(--spacing-lg);
}

.flight-segment {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.flight-date {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.flight-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.flight-route {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.flight-airline {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
  font-weight: var(--font-weight-medium);
}

.flight-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
  font-weight: var(--font-weight-medium);
}

.payment-info {
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
}

.payment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.print-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-secondary-hover);
}

.btn-ghost {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  color: var(--color-text-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-lg);
  }
  
  .hotel-details,
  .tourist-details-grid,
  .payment-details {
    grid-template-columns: 1fr;
  }
  
  .tourist-row,
  .flight-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .flight-segments {
    flex-direction: column;
  }
  
  .footer-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
  
  .print-actions {
    justify-content: center;
  }
}
</style>
