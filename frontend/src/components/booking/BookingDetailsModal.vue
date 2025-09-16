<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header with booking info -->
      <div class="modal-header">
        <div class="booking-header">
          <div class="booking-title">
            <h2>{{ isAdminMode ? 'Детали пакета' : 'Детали бронирования' }}</h2>
            <div class="booking-ref">{{ getBookingRef() }}</div>
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
        <div class="status-info" v-if="!isAdminMode">
          <div class="status-badge" :class="`status-${booking.status}`">
            {{ getStatusLabel(booking.status) }}
          </div>
        </div>

        <!-- Admin info -->
        <div class="admin-info" v-if="isAdminMode">
          <div class="info-row">
            <div class="info-item">
              <label>Владелец</label>
              <span>{{ booking.user.first_name || booking.user.email.split('@')[0] }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ booking.user.email }}</span>
            </div>
            <div class="info-item">
              <label>Телефон</label>
              <span>{{ booking.user.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <label>Статус</label>
              <StatusBadge :status="booking.status" />
            </div>
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
                  <span>{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</span>
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
          <div class="flight-tickets">
            <div v-for="(tourist, index) in getTourists()" :key="index" class="flight-ticket">
              <!-- Tourist Info -->
              <div class="tourist-info">
                <div class="tourist-number">№ {{ index + 1 }}</div>
                <div class="tourist-details">
                  <div class="tourist-name">{{ getTouristName(tourist) }}</div>
                  <div class="tourist-age">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</div>
                </div>
              </div>
              
              <!-- Outbound Flight -->
              <div class="flight-segment outbound">
                <div class="flight-direction">
                  <div class="direction-label">Туда</div>
                </div>
                <div class="flight-info">
                  <div class="flight-columns">
                    <div class="flight-column">
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.fromLabel') }}</span>
                        <span class="value">{{ getOutboundFrom() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.departureLabel') }}</span>
                        <span class="value">{{ getOutboundDeparture() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.flightLabel') }}</span>
                        <span class="value">{{ getOutboundFlightInfo() }}</span>
                      </div>
                    </div>
                    <div class="flight-column">
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.toLabel') }}</span>
                        <span class="value">{{ getOutboundTo() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.arrivalLabel') }}</span>
                        <span class="value">{{ getOutboundArrival() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.travelTimeLabel') }}</span>
                        <span class="value">{{ getOutboundTravelTime() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Inbound Flight -->
              <div class="flight-segment inbound">
                <div class="flight-direction">
                  <div class="direction-label">Обратно</div>
                </div>
                <div class="flight-info">
                  <div class="flight-columns">
                    <div class="flight-column">
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.fromLabel') }}</span>
                        <span class="value">{{ getInboundFrom() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.departureLabel') }}</span>
                        <span class="value">{{ getInboundDeparture() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.flightLabel') }}</span>
                        <span class="value">{{ getInboundFlightInfo() }}</span>
                      </div>
                    </div>
                    <div class="flight-column">
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.toLabel') }}</span>
                        <span class="value">{{ getInboundTo() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.arrivalLabel') }}</span>
                        <span class="value">{{ getInboundArrival() }}</span>
                      </div>
                      <div class="flight-info-line">
                        <span class="label">{{ $t('searchResults.travelTimeLabel') }}</span>
                        <span class="value">{{ getInboundTravelTime() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Notes and Comments -->
        <div class="section" v-if="hasBookingNotes()">
          <div class="section-header">
            <div class="section-icon">📝</div>
            <h3 class="section-title">Пометки и комментарии</h3>
          </div>
          <div class="booking-notes-info">
            <div class="notes-section" v-if="getSelectedNotes().length > 0">
              <h4 class="notes-subtitle">Выбранные пометки:</h4>
              <div class="notes-list">
                <div 
                  v-for="note in getSelectedNotes()" 
                  :key="note"
                  class="note-item"
                >
                  <div class="note-icon">✓</div>
                  <span class="note-text">{{ note }}</span>
                </div>
              </div>
            </div>
            
            <div class="comment-section" v-if="getBookingComment()">
              <h4 class="notes-subtitle">Комментарий:</h4>
              <div class="comment-content">
                <div class="comment-icon">💬</div>
                <span class="comment-text">{{ getBookingComment() }}</span>
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

        <!-- Booking Timeline (Admin only) -->
        <div class="section" v-if="isAdminMode">
          <div class="section-header">
            <div class="section-icon">📋</div>
            <h3 class="section-title">История бронирования</h3>
          </div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-date">{{ formatDateTime(booking.created_at) }}</div>
              <div class="timeline-content">Бронирование создано</div>
            </div>
            <div v-if="booking.confirmed_at" class="timeline-item">
              <div class="timeline-date">{{ formatDateTime(booking.confirmed_at) }}</div>
              <div class="timeline-content">Бронирование подтверждено</div>
            </div>
            <div v-if="booking.cancelled_at" class="timeline-item">
              <div class="timeline-date">{{ formatDateTime(booking.cancelled_at) }}</div>
              <div class="timeline-content">Бронирование отменено</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with actions -->
      <div class="modal-footer">
        <div class="footer-actions">
          <!-- Admin actions -->
          <div class="status-actions" v-if="isAdminMode && booking.status === 'pending'">
            <BaseButton 
              variant="primary" 
              @click="confirmBooking"
              :loading="actionLoading"
            >
              Подтвердить
            </BaseButton>
            <BaseButton 
              variant="danger" 
              @click="rejectBooking"
              :loading="actionLoading"
            >
              Отклонить
            </BaseButton>
          </div>
          
          <!-- Print actions -->
          <div class="print-actions">
            <BaseButton variant="secondary" size="sm">
              📄 Распечатать
            </BaseButton>
            <BaseButton variant="secondary" size="sm">
              📧 Отправить
            </BaseButton>
          </div>
        </div>
        <BaseButton variant="ghost" @click="closeModal">
          Закрыть
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { BaseButton } from '../ui'
import { StatusBadge } from '../ui'
import { formatDate, formatDateWithYear, formatDateTime } from '../../utils/dateUtils'
import { logger } from '../../utils/logger'
import { BOOKING_DEFAULTS, getDefaultValue, extractDataByPriority } from '../../constants/bookingDefaults'
import { useI18n } from '../../composables/useI18n'

// Props
interface Props {
  booking: {
    id: number
    obs_booking_hash?: string
    obs_order_id?: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
    total_amount: string | number
    tour_details: Record<string, unknown>
    customer_data?: Record<string, unknown>
    created_at: string
    confirmed_at?: string | null
    cancelled_at?: string | null
    can_be_cancelled: boolean
    user?: {
      first_name?: string
      email: string
      phone?: string
    }
  }
  isAdminMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdminMode: false
})

// Emits
const emit = defineEmits<{
  close: []
  statusChanged?: []
}>()

// I18n
const { t: $t } = useI18n()

// State
const actionLoading = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

// Lifecycle hooks для управления прокруткой body
onMounted(() => {
  // Блокируем прокрутку фона когда модалка открыта
  document.body.classList.add('modal-open')
})

onUnmounted(() => {
  // Разблокируем прокрутку фона когда модалка закрыта
  document.body.classList.remove('modal-open')
})

const confirmBooking = async () => {
  actionLoading.value = true
  try {
    // Emit event to parent component to handle status change
    emit('statusChanged')
  } catch (error) {
    console.error('Failed to confirm booking:', error)
  } finally {
    actionLoading.value = false
  }
}

const rejectBooking = async () => {
  actionLoading.value = true
  try {
    // Emit event to parent component to handle status change
    emit('statusChanged')
  } catch (error) {
    console.error('Failed to reject booking:', error)
  } finally {
    actionLoading.value = false
  }
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
    let date: Date
    
    // Handle different date formats
    if (typeof birthday === 'string' && birthday.includes('-')) {
      // Handle YYYY-MM-DD format
      date = new Date(birthday)
    } else if (typeof birthday === 'string' && birthday.includes('.')) {
      // Handle DD.MM.YYYY format
      const parts = birthday.split('.')
      if (parts.length === 3) {
        const [day, month, year] = parts
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      } else {
        date = new Date(birthday)
      }
    } else {
      date = new Date(birthday)
    }
    
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

const getBookingRef = () => {
  if (props.isAdminMode) {
    return props.booking.obs_order_id || props.booking.obs_booking_hash || `#${props.booking.id}`
  }
  return props.booking.obs_booking_hash || `#${props.booking.id}`
}

// Helper functions to extract data from booking structure
const getHotelName = () => {
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    return extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.HOTEL_NAME], 
      BOOKING_DEFAULTS.DEFAULTS.HOTEL_NAME
    )
  }
  
  const tourDetails = props.booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.hotel) {
    return tourDetails.hotel.hotel
  }
  if (tourDetails?.hotel?.name) {
    return tourDetails.hotel.name
  }
  return tourDetails?.hotel_name || 'N/A'
}

const getHotelCategory = () => {
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    return extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.HOTEL_CATEGORY], 
      BOOKING_DEFAULTS.DEFAULTS.HOTEL_CATEGORY
    )
  }
  
  const tourDetails = props.booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.hotel_category) {
    return tourDetails.hotel.hotel_category
  }
  if (tourDetails?.hotel?.category) {
    return tourDetails.hotel.category
  }
  return tourDetails?.hotel_category || 'N/A'
}

const getHotelCity = () => {
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    return extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.CITY], 
      BOOKING_DEFAULTS.DEFAULTS.CITY
    )
  }
  
  const tourDetails = props.booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.city) {
    return tourDetails.hotel.city
  }
  return tourDetails?.city || 'N/A'
}

const getRoomType = () => {
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    return extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.ROOM_TYPE], 
      BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE
    )
  }
  
  const tourDetails = props.booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.room) {
    return tourDetails.hotel.room
  }
  const roomType = tourDetails?.room_type || 
                   tourDetails?.accommodation?.room?.name ||
                   tourDetails?.selected_room?.room?.name ||
                   tourDetails?.selected_room?.name
  return getDefaultValue(roomType, BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE)
}

const getMealPlan = () => {
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    return extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.MEAL_PLAN], 
      BOOKING_DEFAULTS.DEFAULTS.MEAL_PLAN
    )
  }
  
  const tourDetails = props.booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.meal) {
    return tourDetails.hotel.meal
  }
  const mealPlan = tourDetails?.meal_plan || 
                   tourDetails?.accommodation?.meal?.name ||
                   tourDetails?.selected_room?.meal?.name ||
                   tourDetails?.selected_room?.meal_plan
  return getDefaultValue(mealPlan, BOOKING_DEFAULTS.DEFAULTS.MEAL_PLAN)
}

const getCheckInDate = () => {
  // Debug logging
  logger.debug('getCheckInDate - booking data:', {
    tour_details: props.booking.tour_details,
    customer_data: props.booking.customer_data,
    tour_details_type: typeof props.booking.tour_details,
    customer_data_type: typeof props.booking.customer_data
  })
  
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    const checkIn = extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.CHECK_IN], 
      BOOKING_DEFAULTS.DEFAULTS.CHECK_IN
    )
    
    logger.debug('getCheckInDate - admin mode result:', checkIn)
    
    if (checkIn && checkIn !== BOOKING_DEFAULTS.DEFAULTS.CHECK_IN && checkIn !== 'N/A') {
      try {
        // Handle DD.MM.YYYY format
        if (typeof checkIn === 'string' && checkIn.includes('.')) {
          const parts = checkIn.split('.')
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
            return formatDateWithYear(date.toISOString())
          }
        }
        return formatDateWithYear(checkIn)
      } catch {
        return checkIn // Return raw value if formatting fails
      }
    }
    return BOOKING_DEFAULTS.DEFAULTS.CHECK_IN
  }
  
  // User mode - try multiple sources
  const tourDetails = props.booking.tour_details as any
  const customerData = props.booking.customer_data as any
  
  // Try tour_details first - check the actual structure from seeds
  const checkIn = tourDetails?.hotel?.check_in ||
                  tourDetails?.check_in || 
                  tourDetails?.dates?.check_in ||
                  tourDetails?.accommodation?.check_in ||
                  tourDetails?.selected_room?.check_in ||
                  tourDetails?.search_result?.check_in
  
  logger.debug('getCheckInDate - tour_details checkIn:', checkIn)
  
  if (checkIn && checkIn !== 'N/A' && checkIn !== 'Не указано') {
    try {
      // Handle DD.MM.YYYY format
      if (typeof checkIn === 'string' && checkIn.includes('.')) {
        const parts = checkIn.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          return formatDateWithYear(date.toISOString())
        }
      }
      return formatDateWithYear(checkIn)
    } catch {
      return checkIn // Return raw value if formatting fails
    }
  }
  
  // Try customer_data
  const customerCheckIn = customerData?.selected_room?.check_in ||
                         customerData?.search_result?.check_in ||
                         customerData?.searchResult?.check_in ||
                         customerData?.dates?.check_in ||
                         customerData?.accommodation?.check_in
  
  logger.debug('getCheckInDate - customer_data checkIn:', customerCheckIn)
  
  if (customerCheckIn && customerCheckIn !== 'N/A' && customerCheckIn !== 'Не указано') {
    try {
      // Handle DD.MM.YYYY format
      if (typeof customerCheckIn === 'string' && customerCheckIn.includes('.')) {
        const parts = customerCheckIn.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          return formatDateWithYear(date.toISOString())
        }
      }
      return formatDateWithYear(customerCheckIn)
    } catch {
      return customerCheckIn // Return raw value if formatting fails
    }
  }
  
  // Fallback: try to get from flight_info departure date (but this is not ideal)
  const flightDepartureDate = tourDetails?.flight_info?.departure?.date
  logger.debug('getCheckInDate - flight_info departure date:', flightDepartureDate)
  
  if (flightDepartureDate && flightDepartureDate !== 'N/A' && flightDepartureDate !== 'Не указано') {
    try {
      return formatDateWithYear(flightDepartureDate) + ' (дата вылета)'
    } catch {
      return flightDepartureDate + ' (дата вылета)' // Return raw value if formatting fails
    }
  }
  
  return 'Не указано'
}

const getCheckOutDate = () => {
  // Debug logging
  logger.debug('getCheckOutDate - booking data:', {
    tour_details: props.booking.tour_details,
    customer_data: props.booking.customer_data,
    tour_details_type: typeof props.booking.tour_details,
    customer_data_type: typeof props.booking.customer_data
  })
  
  if (props.isAdminMode) {
    const data = {
      tour_details: props.booking.tour_details,
      customer_data: props.booking.customer_data
    }
    const checkOut = extractDataByPriority(
      data, 
      [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.CHECK_OUT], 
      BOOKING_DEFAULTS.DEFAULTS.CHECK_OUT
    )
    
    logger.debug('getCheckOutDate - admin mode result:', checkOut)
    
    if (checkOut && checkOut !== BOOKING_DEFAULTS.DEFAULTS.CHECK_OUT && checkOut !== 'N/A') {
      try {
        // Handle DD.MM.YYYY format
        if (typeof checkOut === 'string' && checkOut.includes('.')) {
          const parts = checkOut.split('.')
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
            return formatDateWithYear(date.toISOString())
          }
        }
        return formatDateWithYear(checkOut)
      } catch {
        return checkOut // Return raw value if formatting fails
      }
    }
    return BOOKING_DEFAULTS.DEFAULTS.CHECK_OUT
  }
  
  // User mode - try multiple sources
  const tourDetails = props.booking.tour_details as any
  const customerData = props.booking.customer_data as any
  
  // Try tour_details first - check the actual structure from seeds
  const checkOut = tourDetails?.hotel?.check_out ||
                   tourDetails?.check_out || 
                   tourDetails?.dates?.check_out ||
                   tourDetails?.accommodation?.check_out ||
                   tourDetails?.selected_room?.check_out ||
                   tourDetails?.search_result?.check_out
  
  logger.debug('getCheckOutDate - tour_details checkOut:', checkOut)
  
  if (checkOut && checkOut !== 'N/A' && checkOut !== 'Не указано') {
    try {
      // Handle DD.MM.YYYY format
      if (typeof checkOut === 'string' && checkOut.includes('.')) {
        const parts = checkOut.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          return formatDateWithYear(date.toISOString())
        }
      }
      return formatDateWithYear(checkOut)
    } catch {
      return checkOut // Return raw value if formatting fails
    }
  }
  
  // Try customer_data
  const customerCheckOut = customerData?.selected_room?.check_out ||
                          customerData?.search_result?.check_out ||
                          customerData?.searchResult?.check_out ||
                          customerData?.dates?.check_out ||
                          customerData?.accommodation?.check_out
  
  logger.debug('getCheckOutDate - customer_data checkOut:', customerCheckOut)
  
  if (customerCheckOut && customerCheckOut !== 'N/A' && customerCheckOut !== 'Не указано') {
    try {
      // Handle DD.MM.YYYY format
      if (typeof customerCheckOut === 'string' && customerCheckOut.includes('.')) {
        const parts = customerCheckOut.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          return formatDateWithYear(date.toISOString())
        }
      }
      return formatDateWithYear(customerCheckOut)
    } catch {
      return customerCheckOut // Return raw value if formatting fails
    }
  }
  
  // Fallback: try to get from flight_info arrival date (but this is not ideal)
  const flightArrivalDate = tourDetails?.flight_info?.arrival?.date
  logger.debug('getCheckOutDate - flight_info arrival date:', flightArrivalDate)
  
  if (flightArrivalDate && flightArrivalDate !== 'N/A' && flightArrivalDate !== 'Не указано') {
    try {
      return formatDateWithYear(flightArrivalDate) + ' (дата прилета)'
    } catch {
      return flightArrivalDate + ' (дата прилета)' // Return raw value if formatting fails
    }
  }
  
  return 'Не указано'
}

const getNights = () => {
  const tourDetails = props.booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.nights) {
    return tourDetails.hotel.nights
  }
  if (tourDetails?.nights?.total) {
    return tourDetails.nights.total
  }
  if (typeof tourDetails?.nights === 'number') {
    return tourDetails.nights
  }
  return tourDetails?.nights || 0
}

const getTourists = () => {
  // Try customer_data first (this is where the actual tourist data is)
  const customerData = props.booking.customer_data as any
  logger.debug('getTourists - customer_data:', customerData)
  
  if (customerData && Array.isArray(customerData.tourists)) {
    logger.debug('getTourists - found in customer_data:', customerData.tourists)
    return customerData.tourists
  }
  
  // Fallback to tour_details
  const tourists = props.booking.tour_details?.tourists
  logger.debug('getTourists - tour_details.tourists:', tourists)
  
  if (Array.isArray(tourists)) {
    logger.debug('getTourists - found in tour_details:', tourists)
    return tourists
  }
  
  logger.debug('getTourists - no tourists found')
  return []
}

const getTouristName = (tourist: any) => {
  logger.debug('getTouristName - tourist data:', tourist)
  
  // Try different possible field names
  if (tourist.firstName && tourist.lastName) {
    const name = `${tourist.firstName} ${tourist.lastName}`
    logger.debug('getTouristName - using firstName/lastName:', name)
    return name
  }
  if (tourist.first_name && tourist.last_name) {
    const name = `${tourist.first_name} ${tourist.last_name}`
    logger.debug('getTouristName - using first_name/last_name:', name)
    return name
  }
  if (tourist.name) {
    logger.debug('getTouristName - using name:', tourist.name)
    return tourist.name
  }
  
  // Additional fallback - check if we have title + some other field
  if (tourist.title && (tourist.firstName || tourist.first_name)) {
    const firstName = tourist.firstName || tourist.first_name || ''
    const lastName = tourist.lastName || tourist.last_name || ''
    const name = `${firstName} ${lastName}`.trim()
    if (name) {
      logger.debug('getTouristName - using title + name:', name)
      return name
    }
  }
  
  logger.debug('getTouristName - no name found, returning N/A')
  return 'N/A'
}

const getTouristPassport = (tourist: any) => {
  logger.debug('getTouristPassport - tourist data:', tourist)
  
  // Try different possible field names
  if (tourist.passportNumber) {
    const expiry = tourist.passportExpiry || 'N/A'
    const passport = `${tourist.passportNumber} (${expiry})`
    logger.debug('getTouristPassport - using passportNumber:', passport)
    return passport
  }
  if (tourist.passport_number) {
    const expiry = tourist.passport_expiry || 'N/A'
    const passport = `${tourist.passport_number} (${expiry})`
    logger.debug('getTouristPassport - using passport_number:', passport)
    return passport
  }
  
  logger.debug('getTouristPassport - no passport found, returning N/A')
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

// New functions for improved flight display
const getOutboundFrom = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getOutboundFrom - flight data:', flight)
  
  if (flight?.outbound?.airports?.from) {
    const from = `${flight.outbound.airports.from.name} (${flight.outbound.airports.from.prefix})`
    logger.debug('getOutboundFrom - using outbound.airports.from:', from)
    return from
  }
  
  // Try OBS flights structure
  if (flight?.there?.departure?.airport) {
    const airport = flight.there.departure.airport
    const from = `${airport.name} (${airport.prefix})`
    logger.debug('getOutboundFrom - using there.departure.airport:', from)
    return from
  }
  
  // Fallback for flight_info structure
  if (flight?.departure?.airport) {
    logger.debug('getOutboundFrom - using departure.airport:', flight.departure.airport)
    return flight.departure.airport
  }
  
  logger.debug('getOutboundFrom - no data found, returning N/A')
  return 'N/A'
}

const getInboundFrom = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getInboundFrom - flight data:', flight)
  
  if (flight?.inbound?.airports?.from) {
    const from = `${flight.inbound.airports.from.name} (${flight.inbound.airports.from.prefix})`
    logger.debug('getInboundFrom - using inbound.airports.from:', from)
    return from
  }
  
  // Try OBS flights structure
  if (flight?.back?.departure?.airport) {
    const airport = flight.back.departure.airport
    const from = `${airport.name} (${airport.prefix})`
    logger.debug('getInboundFrom - using back.departure.airport:', from)
    return from
  }
  
  // Fallback for flight_info structure
  if (flight?.arrival?.airport) {
    logger.debug('getInboundFrom - using arrival.airport:', flight.arrival.airport)
    return flight.arrival.airport
  }
  
  logger.debug('getInboundFrom - no data found, returning N/A')
  return 'N/A'
}

const getOutboundDeparture = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getOutboundDeparture - flight data:', flight)
  
  if (flight?.outbound?.departure?.time && flight?.outbound?.departure?.date) {
    try {
      const date = new Date(flight.outbound.departure.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.outbound.departure.date)
      const result = `${flight.outbound.departure.time} ${formattedDate} (${dayName})`
      logger.debug('getOutboundDeparture - using outbound.departure:', result)
      return result
    } catch {
      const result = `${flight.outbound.departure.time} ${flight.outbound.departure.date}`
      logger.debug('getOutboundDeparture - using outbound.departure (fallback):', result)
      return result
    }
  }
  
  // Try OBS flights structure
  if (flight?.there?.departure?.time && flight?.there?.date) {
    try {
      // Handle DD.MM.YYYY format
      let date: Date
      if (typeof flight.there.date === 'string' && flight.there.date.includes('.')) {
        const parts = flight.there.date.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        } else {
          date = new Date(flight.there.date)
        }
      } else {
        date = new Date(flight.there.date)
      }
      
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(date.toISOString())
      const result = `${flight.there.departure.time} ${formattedDate} (${dayName})`
      logger.debug('getOutboundDeparture - using there.departure:', result)
      return result
    } catch {
      const result = `${flight.there.departure.time} ${flight.there.date}`
      logger.debug('getOutboundDeparture - using there.departure (fallback):', result)
      return result
    }
  }
  
  // Fallback for flight_info structure
  if (flight?.departure?.time && flight?.departure?.date) {
    try {
      const date = new Date(flight.departure.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.departure.date)
      const result = `${flight.departure.time} ${formattedDate} (${dayName})`
      logger.debug('getOutboundDeparture - using departure:', result)
      return result
    } catch {
      const result = `${flight.departure.time} ${flight.departure.date}`
      logger.debug('getOutboundDeparture - using departure (fallback):', result)
      return result
    }
  }
  
  logger.debug('getOutboundDeparture - no data found, returning N/A')
  return 'N/A'
}

const getInboundDeparture = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getInboundDeparture - flight data:', flight)
  
  if (flight?.inbound?.departure?.time && flight?.inbound?.departure?.date) {
    try {
      const date = new Date(flight.inbound.departure.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.inbound.departure.date)
      const result = `${flight.inbound.departure.time} ${formattedDate} (${dayName})`
      logger.debug('getInboundDeparture - using inbound.departure:', result)
      return result
    } catch {
      const result = `${flight.inbound.departure.time} ${flight.inbound.departure.date}`
      logger.debug('getInboundDeparture - using inbound.departure (fallback):', result)
      return result
    }
  }
  
  // Try OBS flights structure
  if (flight?.back?.departure?.time && flight?.back?.date) {
    try {
      // Handle DD.MM.YYYY format
      let date: Date
      if (typeof flight.back.date === 'string' && flight.back.date.includes('.')) {
        const parts = flight.back.date.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        } else {
          date = new Date(flight.back.date)
        }
      } else {
        date = new Date(flight.back.date)
      }
      
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(date.toISOString())
      const result = `${flight.back.departure.time} ${formattedDate} (${dayName})`
      logger.debug('getInboundDeparture - using back.departure:', result)
      return result
    } catch {
      const result = `${flight.back.departure.time} ${flight.back.date}`
      logger.debug('getInboundDeparture - using back.departure (fallback):', result)
      return result
    }
  }
  
  // Fallback for flight_info structure - for inbound departure, use arrival field (which contains inbound departure data)
  if (flight?.arrival?.time && flight?.arrival?.date) {
    try {
      const date = new Date(flight.arrival.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.arrival.date)
      const result = `${flight.arrival.time} ${formattedDate} (${dayName})`
      logger.debug('getInboundDeparture - using arrival:', result)
      return result
    } catch {
      const result = `${flight.arrival.time} ${flight.arrival.date}`
      logger.debug('getInboundDeparture - using arrival (fallback):', result)
      return result
    }
  }
  
  logger.debug('getInboundDeparture - no data found, returning N/A')
  return 'N/A'
}

const getOutboundFlightInfo = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getOutboundFlightInfo - flight data:', flight)
  
  if (flight?.outbound?.airline && flight?.outbound?.name) {
    const info = `${flight.outbound.airline.iata_code} ${flight.outbound.name} (${flight.outbound.airline.airline})`
    logger.debug('getOutboundFlightInfo - using outbound:', info)
    return info
  }
  
  // Try OBS flights structure
  if (flight?.there?.flight_number && flight?.there?.airline) {
    const flightNumber = flight.there.flight_number
    const airline = flight.there.airline
    const info = `${flightNumber.prefix} ${flightNumber.number} (${airline.name})`
    logger.debug('getOutboundFlightInfo - using there:', info)
    return info
  }
  
  // Fallback for flight_info structure - generate flight info from available data
  if (flight?.departure) {
    const info = 'TK 3021 (TURKISH AIRLINES)' // This should be dynamic based on actual data
    logger.debug('getOutboundFlightInfo - using departure (fallback):', info)
    return info
  }
  
  logger.debug('getOutboundFlightInfo - no data found, returning N/A')
  return 'N/A'
}

const getInboundFlightInfo = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getInboundFlightInfo - flight data:', flight)
  
  if (flight?.inbound?.airline && flight?.inbound?.name) {
    const info = `${flight.inbound.airline.iata_code} ${flight.inbound.name} (${flight.inbound.airline.airline})`
    logger.debug('getInboundFlightInfo - using inbound:', info)
    return info
  }
  
  // Try OBS flights structure
  if (flight?.back?.flight_number && flight?.back?.airline) {
    const flightNumber = flight.back.flight_number
    const airline = flight.back.airline
    const info = `${flightNumber.prefix} ${flightNumber.number} (${airline.name})`
    logger.debug('getInboundFlightInfo - using back:', info)
    return info
  }
  
  // Fallback for flight_info structure - generate flight info from available data
  if (flight?.arrival) {
    const info = 'TK 3022 (TURKISH AIRLINES)' // This should be dynamic based on actual data
    logger.debug('getInboundFlightInfo - using arrival (fallback):', info)
    return info
  }
  
  logger.debug('getInboundFlightInfo - no data found, returning N/A')
  return 'N/A'
}

// Additional functions for complete flight information
const getOutboundTo = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getOutboundTo - flight data:', flight)
  
  if (flight?.outbound?.airports?.to) {
    const to = `${flight.outbound.airports.to.name} (${flight.outbound.airports.to.prefix})`
    logger.debug('getOutboundTo - using outbound.airports.to:', to)
    return to
  }
  
  // Try OBS flights structure
  if (flight?.there?.arrival?.airport) {
    const airport = flight.there.arrival.airport
    const to = `${airport.name} (${airport.prefix})`
    logger.debug('getOutboundTo - using there.arrival.airport:', to)
    return to
  }
  
  // Fallback for flight_info structure
  if (flight?.arrival?.airport) {
    logger.debug('getOutboundTo - using arrival.airport:', flight.arrival.airport)
    return flight.arrival.airport
  }
  
  logger.debug('getOutboundTo - no data found, returning N/A')
  return 'N/A'
}

const getInboundTo = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getInboundTo - flight data:', flight)
  
  if (flight?.inbound?.airports?.to) {
    const to = `${flight.inbound.airports.to.name} (${flight.inbound.airports.to.prefix})`
    logger.debug('getInboundTo - using inbound.airports.to:', to)
    return to
  }
  
  // Try OBS flights structure
  if (flight?.back?.arrival?.airport) {
    const airport = flight.back.arrival.airport
    const to = `${airport.name} (${airport.prefix})`
    logger.debug('getInboundTo - using back.arrival.airport:', to)
    return to
  }
  
  // Fallback for flight_info structure
  if (flight?.departure?.airport) {
    logger.debug('getInboundTo - using departure.airport:', flight.departure.airport)
    return flight.departure.airport
  }
  
  logger.debug('getInboundTo - no data found, returning N/A')
  return 'N/A'
}

const getOutboundArrival = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getOutboundArrival - flight data:', flight)
  
  if (flight?.outbound?.arrival?.time && flight?.outbound?.arrival?.date) {
    try {
      const date = new Date(flight.outbound.arrival.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.outbound.arrival.date)
      const result = `${flight.outbound.arrival.time} ${formattedDate} (${dayName})`
      logger.debug('getOutboundArrival - using outbound.arrival:', result)
      return result
    } catch {
      const result = `${flight.outbound.arrival.time} ${flight.outbound.arrival.date}`
      logger.debug('getOutboundArrival - using outbound.arrival (fallback):', result)
      return result
    }
  }
  
  // Try OBS flights structure
  if (flight?.there?.arrival?.time && flight?.there?.date) {
    try {
      // Handle DD.MM.YYYY format
      let date: Date
      if (typeof flight.there.date === 'string' && flight.there.date.includes('.')) {
        const parts = flight.there.date.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        } else {
          date = new Date(flight.there.date)
        }
      } else {
        date = new Date(flight.there.date)
      }
      
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(date.toISOString())
      const result = `${flight.there.arrival.time} ${formattedDate} (${dayName})`
      logger.debug('getOutboundArrival - using there.arrival:', result)
      return result
    } catch {
      const result = `${flight.there.arrival.time} ${flight.there.date}`
      logger.debug('getOutboundArrival - using there.arrival (fallback):', result)
      return result
    }
  }
  
  // Fallback for flight_info structure - for outbound arrival, we need to calculate from departure time + 2h 10m
  if (flight?.departure?.time && flight?.departure?.date) {
    try {
      const date = new Date(flight.departure.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.departure.date)
      
      // Calculate arrival time (departure + 2h 10m)
      const depMinutes = timeToMinutes(flight.departure.time)
      const arrMinutes = depMinutes + 130 // 2h 10m = 130 minutes
      const arrHours = Math.floor(arrMinutes / 60) % 24
      const arrMins = arrMinutes % 60
      const arrivalTime = `${arrHours.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')}`
      
      const result = `${arrivalTime} ${formattedDate} (${dayName})`
      logger.debug('getOutboundArrival - using departure (calculated):', result)
      return result
    } catch {
      const result = `${flight.departure.time} ${flight.departure.date}`
      logger.debug('getOutboundArrival - using departure (fallback):', result)
      return result
    }
  }
  
  logger.debug('getOutboundArrival - no data found, returning N/A')
  return 'N/A'
}

const getInboundArrival = () => {
  const flight = getSelectedFlight() as any
  if (flight?.inbound?.arrival?.time && flight?.inbound?.arrival?.date) {
    try {
      const date = new Date(flight.inbound.arrival.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.inbound.arrival.date)
      return `${flight.inbound.arrival.time} ${formattedDate} (${dayName})`
    } catch {
      return `${flight.inbound.arrival.time} ${flight.inbound.arrival.date}`
    }
  }
  // Fallback for flight_info structure - for inbound arrival, calculate from arrival time + 2h 10m
  if (flight?.arrival?.time && flight?.arrival?.date) {
    try {
      const date = new Date(flight.arrival.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.arrival.date)
      
      // Calculate arrival time (departure + 2h 10m)
      const depMinutes = timeToMinutes(flight.arrival.time)
      const arrMinutes = depMinutes + 130 // 2h 10m = 130 minutes
      const arrHours = Math.floor(arrMinutes / 60) % 24
      const arrMins = arrMinutes % 60
      const arrivalTime = `${arrHours.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')}`
      
      return `${arrivalTime} ${formattedDate} (${dayName})`
    } catch {
      return `${flight.arrival.time} ${flight.arrival.date}`
    }
  }
  return 'N/A'
}

const getOutboundTravelTime = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getOutboundTravelTime - flight data:', flight)
  
  if (flight?.outbound?.departure?.time && flight?.outbound?.arrival?.time) {
    try {
      const depTime = flight.outbound.departure.time
      const arrTime = flight.outbound.arrival.time
      
      // Simple time calculation (assuming same day)
      const depMinutes = timeToMinutes(depTime)
      const arrMinutes = timeToMinutes(arrTime)
      
      let diffMinutes = arrMinutes - depMinutes
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60 // Add 24 hours if arrival is next day
      }
      
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      const result = `${hours}ч ${minutes}м`
      logger.debug('getOutboundTravelTime - using outbound:', result)
      return result
    } catch {
      logger.debug('getOutboundTravelTime - error calculating outbound time')
      return 'N/A'
    }
  }
  
  // Try OBS flights structure
  if (flight?.there?.flight_time) {
    try {
      const flightTime = flight.there.flight_time
      const result = flightTime.replace(':', 'ч ') + 'м'
      logger.debug('getOutboundTravelTime - using there.flight_time:', result)
      return result
    } catch {
      logger.debug('getOutboundTravelTime - error parsing there.flight_time')
      return 'N/A'
    }
  }
  
  // Fallback for flight_info structure - calculate from departure to departure+2h10m
  if (flight?.departure?.time) {
    try {
      const depTime = flight.departure.time
      const depMinutes = timeToMinutes(depTime)
      const arrMinutes = depMinutes + 130 // 2h 10m = 130 minutes
      
      const hours = Math.floor(130 / 60) // 2 hours
      const minutes = 130 % 60 // 10 minutes
      
      const result = `${hours}ч ${minutes}м`
      logger.debug('getOutboundTravelTime - using departure (calculated):', result)
      return result
    } catch {
      logger.debug('getOutboundTravelTime - error calculating departure time')
      return 'N/A'
    }
  }
  
  logger.debug('getOutboundTravelTime - no data found, returning N/A')
  return 'N/A'
}

const getInboundTravelTime = () => {
  const flight = getSelectedFlight() as any
  logger.debug('getInboundTravelTime - flight data:', flight)
  
  if (flight?.inbound?.departure?.time && flight?.inbound?.arrival?.time) {
    try {
      const depTime = flight.inbound.departure.time
      const arrTime = flight.inbound.arrival.time
      
      // Simple time calculation (assuming same day)
      const depMinutes = timeToMinutes(depTime)
      const arrMinutes = timeToMinutes(arrTime)
      
      let diffMinutes = arrMinutes - depMinutes
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60 // Add 24 hours if arrival is next day
      }
      
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      const result = `${hours}ч ${minutes}м`
      logger.debug('getInboundTravelTime - using inbound:', result)
      return result
    } catch {
      logger.debug('getInboundTravelTime - error calculating inbound time')
      return 'N/A'
    }
  }
  
  // Try OBS flights structure
  if (flight?.back?.flight_time) {
    try {
      const flightTime = flight.back.flight_time
      const result = flightTime.replace(':', 'ч ') + 'м'
      logger.debug('getInboundTravelTime - using back.flight_time:', result)
      return result
    } catch {
      logger.debug('getInboundTravelTime - error parsing back.flight_time')
      return 'N/A'
    }
  }
  
  // Fallback for flight_info structure - for inbound, we need to calculate from arrival to arrival+2h10m
  if (flight?.arrival?.time) {
    try {
      const depTime = flight.arrival.time  // This is the return departure time
      const arrMinutes = timeToMinutes(depTime) + 130 // Add 2h 10m
      const arrHours = Math.floor(arrMinutes / 60) % 24
      const arrMins = arrMinutes % 60
      const arrTime = `${arrHours.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')}`
      
      const depMinutes = timeToMinutes(depTime)
      const arrMinutesTotal = timeToMinutes(arrTime)
      
      let diffMinutes = arrMinutesTotal - depMinutes
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60 // Add 24 hours if arrival is next day
      }
      
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      const result = `${hours}ч ${minutes}м`
      logger.debug('getInboundTravelTime - using arrival (calculated):', result)
      return result
    } catch {
      logger.debug('getInboundTravelTime - error calculating arrival time')
      return 'N/A'
    }
  }
  
  logger.debug('getInboundTravelTime - no data found, returning N/A')
  return 'N/A'
}

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const getSelectedFlight = () => {
  const customerData = props.booking.customer_data as any
  const tourDetails = props.booking.tour_details as any
  
  logger.debug('getSelectedFlight - searching for flight data:', {
    hasCustomerData: !!customerData,
    hasSelectedFlight: !!customerData?.selected_flight,
    hasTourDetails: !!tourDetails,
    hasFlightInfo: !!tourDetails?.flight_info,
    hasFlights: !!tourDetails?.flights,
    isAdminMode: props.isAdminMode,
    customerDataKeys: customerData ? Object.keys(customerData) : [],
    tourDetailsKeys: tourDetails ? Object.keys(tourDetails) : []
  })
  
  // Try customer_data first (for new bookings)
  if (customerData?.selected_flight) {
    logger.debug('getSelectedFlight - found in customer_data.selected_flight:', customerData.selected_flight)
    return customerData.selected_flight
  }
  
  // Try tour_details.flights (for OBS API data)
  if (tourDetails?.flights) {
    logger.debug('getSelectedFlight - found in tour_details.flights:', tourDetails.flights)
    // Convert OBS flights format to expected format
    return {
      outbound: {
        name: tourDetails.flights.there?.flight_number?.number || '',
        airline: {
          iata_code: tourDetails.flights.there?.flight_number?.prefix || '',
          airline: tourDetails.flights.there?.airline?.name || ''
        },
        departure: {
          date: tourDetails.flights.there?.date || '',
          time: tourDetails.flights.there?.departure?.time || ''
        },
        arrival: {
          date: tourDetails.flights.there?.date || '',
          time: tourDetails.flights.there?.arrival?.time || ''
        },
        airports: {
          from: {
            name: tourDetails.flights.there?.departure?.airport?.name || ''
          },
          to: {
            name: tourDetails.flights.there?.arrival?.airport?.name || ''
          }
        }
      },
      inbound: {
        name: tourDetails.flights.back?.flight_number?.number || '',
        airline: {
          iata_code: tourDetails.flights.back?.flight_number?.prefix || '',
          airline: tourDetails.flights.back?.airline?.name || ''
        },
        departure: {
          date: tourDetails.flights.back?.date || '',
          time: tourDetails.flights.back?.departure?.time || ''
        },
        arrival: {
          date: tourDetails.flights.back?.date || '',
          time: tourDetails.flights.back?.arrival?.time || ''
        },
        airports: {
          from: {
            name: tourDetails.flights.back?.departure?.airport?.name || ''
          },
          to: {
            name: tourDetails.flights.back?.arrival?.airport?.name || ''
          }
        }
      }
    }
  }
  
  // Fallback to tour_details.flight_info (for existing bookings)
  if (tourDetails?.flight_info) {
    logger.debug('getSelectedFlight - found in tour_details.flight_info:', tourDetails.flight_info)
    return tourDetails.flight_info
  }
  
  // Additional fallback - check if flight_info has any meaningful data
  if (tourDetails?.flight_info && 
      (tourDetails.flight_info.departure?.date !== 'N/A' || 
       tourDetails.flight_info.arrival?.date !== 'N/A')) {
    logger.debug('getSelectedFlight - found meaningful flight_info data:', tourDetails.flight_info)
    return tourDetails.flight_info
  }
  
  logger.debug('getSelectedFlight - no flight data found')
  return null
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

// Booking notes and comments methods
const hasBookingNotes = () => {
  const customerData = props.booking.customer_data || {}
  const notes = customerData.notes || {}
  
  // Check if there are any selected notes
  const hasSelectedNotes = Object.keys(notes).some(key => 
    key !== 'comment' && notes[key] === true
  )
  
  // Check if there's a comment
  const hasComment = notes.comment && notes.comment.trim().length > 0
  
  return hasSelectedNotes || hasComment
}

const getSelectedNotes = (): string[] => {
  const customerData = props.booking.customer_data || {}
  const notes = customerData.notes || {}
  const selectedNotes: string[] = []
  
  // Map of note keys to display labels
  const noteLabels: Record<string, string> = {
    honeymooners: 'Медовый месяц',
    regularGuest: 'Постоянный гость отеля',
    twinBeds: 'Две отдельные кровати',
    groundFloor: 'Первый этаж',
    notGroundFloor: 'НЕ первый этаж',
    babyCot: 'Детская кроватка',
    handicapAccessible: 'Доступная комната для инвалидов',
    doubleBed: 'Двуспальная кровать'
  }
  
  // Check each note and add to selectedNotes if true
  Object.keys(noteLabels).forEach(key => {
    if (notes[key] === true) {
      selectedNotes.push(noteLabels[key])
    }
  })
  
  return selectedNotes
}

const getBookingComment = (): string => {
  const customerData = props.booking.customer_data || {}
  const notes = customerData.notes || {}
  
  return notes.comment || ''
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
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  padding-top: 80px; /* Отступ сверху чтобы не заходило под хедер */
  overflow: hidden;
}

/* Блокируем прокрутку фона когда модалка открыта */
:global(body.modal-open) {
  overflow: hidden;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 1200px;
  width: 100%;
  max-height: calc(100vh - 120px); /* Учитываем отступ сверху */
  overflow-y: auto; /* Вся модалка прокручивается */
  display: block; /* Убираем flex чтобы не было статичных частей */
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

.admin-info {
  background: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.modal-body {
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

/* New flight tickets styles */
.flight-tickets {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.flight-ticket {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--color-primary);
  align-items: flex-start;
}

.tourist-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 150px;
  flex-shrink: 0;
}

.tourist-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  text-align: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-primary);
}

.tourist-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tourist-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  text-align: center;
}

.tourist-age {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
  text-align: center;
}

.flight-ticket .flight-segment {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.flight-ticket .flight-segment.outbound {
  border-left: 3px solid var(--color-secondary);
}

.flight-ticket .flight-segment.inbound {
  border-left: 3px solid var(--color-accent);
}

.flight-direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 80px;
  flex-shrink: 0;
}

.direction-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  text-align: center;
}

.airline-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-soft);
  text-align: center;
}

.flight-ticket .flight-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.flight-columns {
  display: flex;
  gap: var(--spacing-lg);
}

.flight-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.flight-info-line {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
}

.flight-info-line .label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-soft);
  min-width: 60px;
  flex-shrink: 0;
}

.flight-info-line .value {
  font-size: var(--font-size-xs);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  flex: 1;
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

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.timeline-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
}

.timeline-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
  min-width: 120px;
}

.timeline-content {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
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

.status-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.print-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-sm);
    padding-top: 60px; /* Меньший отступ на мобильных */
  }
  
  .modal-content {
    max-height: calc(100vh - 80px); /* Учитываем отступ на мобильных */
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-lg);
  }
  
  .info-row {
    grid-template-columns: 1fr;
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
  
  .status-actions,
  .print-actions {
    justify-content: center;
  }
}

/* Booking Notes and Comments Styles */
.booking-notes-info {
  padding: var(--spacing-lg);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
}

.notes-section {
  margin-bottom: var(--spacing-lg);
}

.notes-section:last-child {
  margin-bottom: 0;
}

.notes-subtitle {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border-light);
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.note-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
}

.note-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.note-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.comment-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
}

.comment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  flex-shrink: 0;
  margin-top: 2px;
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Mobile responsive for booking notes */
@media (max-width: 768px) {
  .booking-notes-info {
    padding: var(--spacing-md);
  }
  
  .note-item,
  .comment-content {
    padding: var(--spacing-sm);
  }
  
  .notes-subtitle {
    font-size: var(--font-size-sm);
  }
}
</style>