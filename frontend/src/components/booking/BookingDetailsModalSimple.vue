<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="flex justify-between items-start gap-4 mb-6">
          <div>
            <h2 class="text-xl font-bold text-primary mb-2">
              {{ isAdminMode ? 'Детали пакета' : 'Детали бронирования' }}
            </h2>
            <div class="flex flex-col gap-1">
              <div class="text-sm text-secondary">ID: {{ booking.id }}</div>
              <div class="text-sm text-secondary">
                Создано: {{ formatDate(booking.created_at) }} {{ formatTime(booking.created_at) }}
              </div>
              <div class="text-sm text-secondary">Статус: {{ getStatusLabel(booking.status) }}</div>
            </div>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Admin info -->
        <div v-if="isAdminMode" class="card">
          <div class="grid grid-4 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-secondary uppercase tracking-wide">Владелец</label>
              <span class="text-sm font-medium text-primary">
                {{ booking.user?.first_name || booking.user?.email?.split('@')[0] || '-' }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-secondary uppercase tracking-wide">Email</label>
              <span class="text-sm font-medium text-primary">{{ booking.user?.email || '-' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-secondary uppercase tracking-wide">Телефон</label>
              <span class="text-sm font-medium text-primary">{{ booking.user?.phone || '-' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-secondary uppercase tracking-wide">Статус</label>
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
          <div class="section-content">
            <div class="mb-6">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-lg font-semibold text-primary">{{ getHotelName() }}</span>
                <span class="text-sm text-primary font-medium">{{ getHotelCategory() }}</span>
                <span class="text-sm text-secondary">{{ getHotelCity() }}</span>
              </div>
            </div>
            <div class="grid grid-4 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Тип комнаты</label>
                <span class="text-sm font-medium text-primary">{{ getRoomType() }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Питание</label>
                <span class="text-sm font-medium text-primary">{{ getMealPlan() }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Даты проживания</label>
                <span class="text-sm font-medium text-primary">{{ getCheckInDate() }} - {{ getCheckOutDate() }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Ночей</label>
                <span class="text-sm font-medium text-primary">{{ getNights() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tourists -->
        <div v-if="getTourists().length > 0" class="section">
          <div class="section-header">
            <div class="section-icon">👥</div>
            <h3 class="section-title">Туристы</h3>
          </div>
          <div class="section-content">
            <div v-for="(tourist, index) in getTourists()" :key="index" class="flex gap-4 p-4 bg-soft rounded border mb-4 last:mb-0">
              <div class="text-sm font-semibold text-primary min-w-[40px] flex items-center">№ {{ index + 1 }}</div>
              <div class="grid grid-4 gap-4 flex-1">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-secondary uppercase tracking-wide">ФИО</label>
                  <span class="text-sm font-medium text-primary">{{ getTouristName(tourist) }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-secondary uppercase tracking-wide">ДАТА РОЖДЕНИЯ</label>
                  <span class="text-sm font-medium text-primary">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-secondary uppercase tracking-wide">ПАСПОРТ</label>
                  <span class="text-sm font-medium text-primary">{{ getTouristPassport(tourist) }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-secondary uppercase tracking-wide">ГРАЖДАНСТВО</label>
                  <span class="text-sm font-medium text-primary">{{ tourist.nationality || 'MOLDOVA' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Information -->
        <div v-if="getSelectedFlight()" class="section">
          <div class="section-header">
            <div class="section-icon">✈️</div>
            <h3 class="section-title">Перелет</h3>
          </div>
          <div class="section-content">
            <div v-for="(tourist, index) in getTourists()" :key="index" class="flex gap-4 p-4 bg-soft rounded border mb-4 last:mb-0 items-start">
              <!-- Tourist Info -->
              <div class="flex flex-col gap-2 min-w-[150px] flex-shrink-0">
                <div class="text-sm font-semibold text-primary text-center p-2 bg-white rounded border">№ {{ index + 1 }}</div>
                <div class="flex flex-col gap-1">
                  <div class="text-sm font-semibold text-primary text-center">{{ getTouristName(tourist) }}</div>
                  <div class="text-xs text-secondary text-center">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</div>
                </div>
              </div>
              
              <!-- Flight Info -->
              <div class="flex gap-2 flex-1">
                <!-- Outbound Flight -->
                <div class="flex gap-2 flex-1 p-4 bg-white rounded border">
                  <div class="flex flex-col items-center gap-1 min-w-[80px] flex-shrink-0">
                    <div class="text-sm font-semibold text-primary text-center">Туда</div>
                  </div>
                  <div class="flex flex-col gap-1 flex-1">
                    <div class="flex gap-2">
                      <div class="flex flex-col gap-1 flex-1">
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Из:</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getOutboundFrom() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Вылет</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getOutboundDeparture() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Рейс</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getOutboundFlightInfo() }}</span>
                        </div>
                      </div>
                      <div class="flex flex-col gap-1 flex-1">
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">В:</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getOutboundTo() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Прилет</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getOutboundArrival() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Время в пути:</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getOutboundTravelTime() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Inbound Flight -->
                <div class="flex gap-2 flex-1 p-4 bg-white rounded border">
                  <div class="flex flex-col items-center gap-1 min-w-[80px] flex-shrink-0">
                    <div class="text-sm font-semibold text-primary text-center">Обратно</div>
                  </div>
                  <div class="flex flex-col gap-1 flex-1">
                    <div class="flex gap-2">
                      <div class="flex flex-col gap-1 flex-1">
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Из:</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getInboundFrom() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Вылет</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getInboundDeparture() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Рейс</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getInboundFlightInfo() }}</span>
                        </div>
                      </div>
                      <div class="flex flex-col gap-1 flex-1">
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">В:</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getInboundTo() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Прилет</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getInboundArrival() }}</span>
                        </div>
                        <div class="flex gap-2 items-start">
                          <span class="text-xs font-semibold text-secondary min-w-[35px] flex-shrink-0">Время в пути:</span>
                          <span class="text-xs font-medium text-primary flex-1">{{ getInboundTravelTime() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Services Information -->
        <div v-if="hasAdditionalServices()" class="section">
          <div class="section-header">
            <div class="section-icon">🚌</div>
            <h3 class="section-title">Дополнительные услуги</h3>
          </div>
          <div class="section-content">
            <div class="flex flex-col gap-2 p-4 bg-soft rounded border mb-4 last:mb-0">
              <div class="flex items-center gap-2 mb-1">
                <div class="text-lg w-6 h-6 flex items-center justify-center">🛡️</div>
                <div class="text-base font-semibold text-primary">Страхование</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-sm font-semibold text-secondary">{{ getInsuranceName() }}</div>
                <div class="text-sm text-muted leading-relaxed">{{ getInsuranceDescription() }}</div>
                <div v-if="!getInsuranceIncluded()" class="text-sm font-semibold text-primary text-right">
                  + {{ getInsurancePrice() }} EUR
                </div>
                <div v-else class="text-sm font-semibold text-success text-right">
                  Включено
                </div>
              </div>
            </div>
            
            <div class="flex flex-col gap-2 p-4 bg-soft rounded border mb-4 last:mb-0">
              <div class="flex items-center gap-2 mb-1">
                <div class="text-lg w-6 h-6 flex items-center justify-center">🚐</div>
                <div class="text-base font-semibold text-primary">Трансфер</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-sm font-semibold text-secondary">{{ getTransferName() }}</div>
                <div class="text-sm text-muted leading-relaxed">{{ getTransferDescription() }}</div>
                <div v-if="!getTransferIncluded()" class="text-sm font-semibold text-primary text-right">
                  + {{ getTransferPrice() }} EUR
                </div>
                <div v-else class="text-sm font-semibold text-success text-right">
                  Включено
                </div>
              </div>
            </div>

            <div v-if="getCovidInsuranceType() === 'COVID_19'" class="flex flex-col gap-2 p-4 bg-soft rounded border mb-4 last:mb-0">
              <div class="flex items-center gap-2 mb-1">
                <div class="text-lg w-6 h-6 flex items-center justify-center">🦠</div>
                <div class="text-base font-semibold text-primary">COVID-19 страхование</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-sm font-semibold text-secondary">COVID-19</div>
                <div class="text-sm text-muted leading-relaxed">Дополнительная страховка от COVID-19</div>
                <div class="text-sm font-semibold text-primary text-right">+ {{ getCovidInsurancePrice() }} EUR</div>
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
            <div class="grid grid-4 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Сумма</label>
                <span class="text-lg font-bold text-primary">{{ booking.total_amount }} EUR</span>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Статус оплаты</label>
                <span class="text-sm font-medium text-primary">{{ getPaymentStatus() }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Дата создания</label>
                <span class="text-sm font-medium text-primary">{{ formatDateTime(booking.created_at) }}</span>
              </div>
              <div v-if="booking.confirmed_at" class="flex flex-col gap-1">
                <label class="text-xs font-medium text-secondary uppercase tracking-wide">Дата подтверждения</label>
                <span class="text-sm font-medium text-primary">{{ formatDateTime(booking.confirmed_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with actions -->
      <div class="modal-footer">
        <div class="footer-actions">
          <!-- Admin actions -->
          <div v-if="isAdminMode && booking.status === 'pending'" class="status-actions">
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
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import { logger } from '../../utils/logger'
import { useAdminApi } from '../../composables/useAdminApi'

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
    can_be_cancelled?: boolean
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

// Admin API
const { getObsBookingDetails } = useAdminApi()

// State
const actionLoading = ref(false)
const obsOrderDetails = ref<Record<string, unknown> | null>(null)
const obsOrderLoading = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

// Load OBS order details for flight information
const loadObsOrderDetails = async () => {
  if (!props.isAdminMode || !props.booking.obs_booking_hash) {
    return
  }

  try {
    obsOrderLoading.value = true
    // PRIORITY 1: Use operator_id (numeric ID) for direct OBS API call
    const operatorId = (props.booking as any).operator_id
    if (operatorId) {
      const response = await getObsBookingDetails(props.booking.obs_booking_hash, undefined, undefined, operatorId)
      obsOrderDetails.value = (response as Record<string, unknown>)?.data || response
      logger.info('OBS order details loaded via operator_id:', obsOrderDetails.value)
      return
    }
    
    // PRIORITY 2: Use order_number (TT25-TR/7086) to find the order and get its details
    const orderNumber = props.booking.obs_order_id // This contains the order_number from OBS
    if (orderNumber) {
      const response = await getObsBookingDetails(props.booking.obs_booking_hash, undefined, orderNumber)
      obsOrderDetails.value = (response as Record<string, unknown>)?.data || response
      logger.info('OBS order details loaded via order_number:', obsOrderDetails.value)
      return
    }
    
    logger.warn('No operator_id or order_number available for OBS API call')
  } catch (error) {
    logger.error('Failed to load OBS order details:', error)
  } finally {
    obsOrderLoading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  document.body.classList.add('modal-open')
  loadObsOrderDetails()
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})

const confirmBooking = async () => {
  actionLoading.value = true
  try {
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

// Hotel data methods
const getHotelName = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.hotel) {
    return tourDetails.hotel.hotel
  }
  if (tourDetails?.hotel?.name) {
    return tourDetails.hotel.name
  }
  return tourDetails?.hotel_name || 'Информация об отеле недоступна'
}

const getHotelCategory = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.hotel_category) {
    return tourDetails.hotel.hotel_category
  }
  if (tourDetails?.hotel?.category) {
    return tourDetails.hotel.category
  }
  return tourDetails?.hotel_category || 'Категория не указана'
}

const getHotelCity = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.city) {
    return tourDetails.hotel.city
  }
  return tourDetails?.city || 'Город не указан'
}

const getRoomType = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.room) {
    return tourDetails.hotel.room
  }
  return tourDetails?.room_type || 'Тип комнаты не указан'
}

const getMealPlan = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.meal) {
    return tourDetails.hotel.meal
  }
  return tourDetails?.meal_plan || 'Питание не указано'
}

const getCheckInDate = () => {
  const tourDetails = props.booking.tour_details as any
  const checkIn = tourDetails?.hotel?.check_in || tourDetails?.check_in
  if (checkIn && checkIn !== 'N/A') {
    try {
      return formatDate(checkIn)
    } catch {
      return checkIn
    }
  }
  return 'Не указано'
}

const getCheckOutDate = () => {
  const tourDetails = props.booking.tour_details as any
  const checkOut = tourDetails?.hotel?.check_out || tourDetails?.check_out
  if (checkOut && checkOut !== 'N/A') {
    try {
      return formatDate(checkOut)
    } catch {
      return checkOut
    }
  }
  return 'Не указано'
}

const getNights = () => {
  const tourDetails = props.booking.tour_details as any
  if (tourDetails?.hotel?.nights) {
    return tourDetails.hotel.nights
  }
  return tourDetails?.nights || 0
}

// Tourist data methods
const getTourists = () => {
  const customerData = props.booking.customer_data as any
  if (customerData && Array.isArray(customerData.tourists)) {
    return customerData.tourists
  }
  const tourists = props.booking.tour_details?.tourists
  if (Array.isArray(tourists)) {
    return tourists
  }
  return []
}

const getTouristName = (tourist: any) => {
  if (tourist.firstName && tourist.lastName) {
    return `${tourist.firstName} ${tourist.lastName}`
  }
  if (tourist.first_name && tourist.last_name) {
    return `${tourist.first_name} ${tourist.last_name}`
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
  if (tourist.passport_number) {
    const expiry = tourist.passport_expiry || 'N/A'
    return `${tourist.passport_number} (${expiry})`
  }
  return 'N/A'
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

// Flight data methods
const getSelectedFlight = () => {
  console.log('=== DEBUG: getSelectedFlight called ===')
  console.log('props.booking:', props.booking)
  console.log('props.booking.tour_details:', props.booking.tour_details)
  console.log('props.booking.customer_data:', props.booking.customer_data)
  
  // ONLY SOURCE: OBS API (external operator service)
  if (obsOrderDetails.value?.charter?.[0]) {
    console.log('✅ Using OBS API charter data (EXTERNAL OPERATOR SERVICE):', obsOrderDetails.value.charter[0])
    return obsOrderDetails.value.charter[0]
  }
  
  // NO FALLBACK - if OBS API data is not available, return null
  console.log('❌ OBS API data not available - no fallback to our DB')
  return null
}

const getOutboundFrom = () => {
  const flight = getSelectedFlight() as any
  console.log('=== DEBUG: getOutboundFrom ===')
  console.log('flight:', flight)
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.destination?.airport_from) {
    const airportCode = flight.fly_segments_there[0].destination.airport_from
    // Convert airport code to full name format
    const airportNames: Record<string, string> = {
      'RMO': 'CHISINAU AIRPORT (RMO)',
      'AYT': 'ANTALYA AIRPORT (AYT)',
      'IST': 'ISTANBUL AIRPORT (IST)',
      'SAW': 'SABIHA GOKCEN AIRPORT (SAW)',
      'OTP': 'HENRI COANDĂ INTERNATIONAL AIRPORT (OTP)'
    }
    const result = airportNames[airportCode] || `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getOutboundFrom - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ OBS API data not available for getOutboundFrom')
  return 'N/A'
}

const getInboundFrom = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.destination?.airport_from) {
    const airportCode = flight.fly_segments_back[0].destination.airport_from
    // Convert airport code to full name format
    const airportNames: Record<string, string> = {
      'RMO': 'CHISINAU AIRPORT (RMO)',
      'AYT': 'ANTALYA AIRPORT (AYT)',
      'IST': 'ISTANBUL AIRPORT (IST)',
      'SAW': 'SABIHA GOKCEN AIRPORT (SAW)',
      'OTP': 'HENRI COANDĂ INTERNATIONAL AIRPORT (OTP)'
    }
    const result = airportNames[airportCode] || `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getInboundFrom - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ OBS API data not available for getInboundFrom')
  return 'N/A'
}

const getOutboundDeparture = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.fly_time && flight?.fly_segments_there?.[0]?.departure_date) {
    try {
      const segment = flight.fly_segments_there[0]
      // OBS API format: fly_time = "00:30 - 02:30", departure_date = "30.09.2025"
      const flyTime = segment.fly_time
      const departureDate = segment.departure_date
      
      // Extract departure time from fly_time (format: "00:30 - 02:30")
      const timeParts = flyTime.split(' - ')
      if (timeParts.length === 2) {
        const departureTime = timeParts[0] // "00:30"
        
        // Format date: "30.09.2025" -> "30.09.2025"
        const parts = departureDate.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const formattedDate = `${day}.${month}.${year}`
          
          // Get day of week
          const jsDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          const dayName = dayNames[jsDate.getDay()]
          
          const result = `${departureTime} ${formattedDate} (${dayName})`
          console.log('✅ getOutboundDeparture - using OBS API (external operator):', result)
          return result
        }
      }
      return flyTime
    } catch (error) {
      console.log('Error parsing OBS API departure time:', error)
      return flight.fly_segments_there[0].fly_time
    }
  }
  
  // Our DB format (tour_details.flights) - CORRECT FORMAT
  if (flight?.there?.departure?.time && flight?.there?.date) {
    try {
      console.log('✅ getOutboundDeparture - using DB format')
      console.log('flight.there.date:', flight.there.date)
      console.log('flight.there.departure.time:', flight.there.departure.time)
      
      // For DD.MM.YYYY format, extract day and month directly
      let formattedDate = flight.there.date
      let dayName = ''
      
      if (flight.there.date && flight.there.date.includes('.')) {
        const parts = flight.there.date.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          formattedDate = `${day}.${month}`
          
          // Convert to JavaScript date for day of week
          const jsDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          dayName = dayNames[jsDate.getDay()]
        }
      }
      
      console.log('getOutboundDeparture - formattedDate:', formattedDate)
      return `${flight.there.departure.time} ${formattedDate}${dayName ? ` (${dayName})` : ''}`
    } catch (error) {
      console.log('getOutboundDeparture - error:', error)
      return `${flight.there.departure.time} ${flight.there.date}`
    }
  }
  
  // OBS API format (tour_details.flights) - fallback to just date
  if (flight?.there?.date) {
    try {
      const date = new Date(flight.there.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.there.date)
      return `${formattedDate} (${dayName})`
    } catch {
      return flight.there.date
    }
  }
  
  // OBS order details format
  if (flight?.fly_segments_there?.[0]?.departure_date) {
    try {
      const segment = flight.fly_segments_there[0]
      const date = new Date(segment.departure_date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(segment.departure_date)
      return `${formattedDate} (${dayName})`
    } catch {
      return flight.fly_segments_there[0].departure_date
    }
  }
  
  // Legacy format
  if (flight?.departure?.time && flight?.departure?.date) {
    try {
      const date = new Date(flight.departure.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.departure.date)
      return `${flight.departure.time} ${formattedDate} (${dayName})`
    } catch {
      return `${flight.departure.time} ${flight.departure.date}`
    }
  }
  return 'N/A'
}

const getInboundDeparture = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.fly_time && flight?.fly_segments_back?.[0]?.departure_date) {
    try {
      const segment = flight.fly_segments_back[0]
      // OBS API format: fly_time = "03:30 - 05:30", departure_date = "07.10.2025"
      const flyTime = segment.fly_time
      const departureDate = segment.departure_date
      
      // Extract departure time from fly_time (format: "03:30 - 05:30")
      const timeParts = flyTime.split(' - ')
      if (timeParts.length === 2) {
        const departureTime = timeParts[0] // "03:30"
        
        // Format date: "07.10.2025" -> "07.10.2025"
        const parts = departureDate.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const formattedDate = `${day}.${month}.${year}`
          
          // Get day of week
          const jsDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          const dayName = dayNames[jsDate.getDay()]
          
          const result = `${departureTime} ${formattedDate} (${dayName})`
          console.log('✅ getInboundDeparture - using OBS API (external operator):', result)
          return result
        }
      }
      return flyTime
    } catch (error) {
      console.log('Error parsing OBS API departure time:', error)
      return flight.fly_segments_back[0].fly_time
    }
  }
  
  // OBS API format (tour_details.flights) - use time + date
  if (flight?.back?.departure?.time && flight?.back?.date) {
    try {
      // For DD.MM.YYYY format, use full date
      let formattedDate = flight.back.date
      let dayName = ''
      
      if (flight.back.date && flight.back.date.includes('.')) {
        const parts = flight.back.date.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          formattedDate = `${day}.${month}.${year}` // Use full date format
          
          // Convert to JavaScript date for day of week
          const jsDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          dayName = dayNames[jsDate.getDay()]
        }
      }
      
      return `${flight.back.departure.time} ${formattedDate}${dayName ? ` (${dayName})` : ''}`
    } catch {
      return `${flight.back.departure.time} ${flight.back.date}`
    }
  }
  
  // OBS API format (tour_details.flights) - fallback to just date
  if (flight?.back?.date) {
    try {
      const date = new Date(flight.back.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.back.date)
      return `${formattedDate} (${dayName})`
    } catch {
      return flight.back.date
    }
  }
  
  // OBS order details format
  if (flight?.fly_segments_back?.[0]?.departure_date) {
    try {
      const segment = flight.fly_segments_back[0]
      const date = new Date(segment.departure_date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(segment.departure_date)
      return `${formattedDate} (${dayName})`
    } catch {
      return flight.fly_segments_back[0].departure_date
    }
  }
  
  // Legacy format
  if (flight?.arrival?.time && flight?.arrival?.date) {
    try {
      const date = new Date(flight.arrival.date)
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[date.getDay()]
      const formattedDate = formatDate(flight.arrival.date)
      return `${flight.arrival.time} ${formattedDate} (${dayName})`
    } catch {
      return `${flight.arrival.time} ${flight.arrival.date}`
    }
  }
  return 'N/A'
}

const getOutboundFlightInfo = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]) {
    const segment = flight.fly_segments_there[0]
    const result = `${segment.prefix}${segment.flight} (${segment.airline})`
    console.log('✅ getOutboundFlightInfo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ OBS API data not available for getOutboundFlightInfo')
  return 'N/A'
}

const getInboundFlightInfo = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]) {
    const segment = flight.fly_segments_back[0]
    const result = `${segment.prefix}${segment.flight} (${segment.airline})`
    console.log('✅ getInboundFlightInfo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ OBS API data not available for getInboundFlightInfo')
  return 'N/A'
}

const getOutboundTo = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.destination?.airport_to) {
    const airportCode = flight.fly_segments_there[0].destination.airport_to
    // Convert airport code to full name format
    const airportNames: Record<string, string> = {
      'RMO': 'CHISINAU AIRPORT (RMO)',
      'AYT': 'ANTALYA AIRPORT (AYT)',
      'IST': 'ISTANBUL AIRPORT (IST)',
      'SAW': 'SABIHA GOKCEN AIRPORT (SAW)',
      'OTP': 'HENRI COANDĂ INTERNATIONAL AIRPORT (OTP)'
    }
    const result = airportNames[airportCode] || `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getOutboundTo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ OBS API data not available for getOutboundTo')
  return 'N/A'
}

const getInboundTo = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.destination?.airport_to) {
    const airportCode = flight.fly_segments_back[0].destination.airport_to
    // Convert airport code to full name format
    const airportNames: Record<string, string> = {
      'RMO': 'CHISINAU AIRPORT (RMO)',
      'AYT': 'ANTALYA AIRPORT (AYT)',
      'IST': 'ISTANBUL AIRPORT (IST)',
      'SAW': 'SABIHA GOKCEN AIRPORT (SAW)',
      'OTP': 'HENRI COANDĂ INTERNATIONAL AIRPORT (OTP)'
    }
    const result = airportNames[airportCode] || `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getInboundTo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ OBS API data not available for getInboundTo')
  return 'N/A'
}

const getOutboundArrival = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.fly_time && flight?.fly_segments_there?.[0]?.departure_date) {
    try {
      const segment = flight.fly_segments_there[0]
      // OBS API format: fly_time = "00:30 - 02:30", departure_date = "30.09.2025"
      const flyTime = segment.fly_time
      const departureDate = segment.departure_date
      
      // Extract arrival time from fly_time (format: "00:30 - 02:30")
      const timeParts = flyTime.split(' - ')
      if (timeParts.length === 2) {
        const arrivalTime = timeParts[1] // "02:30"
        
        // Format date: "30.09.2025" -> "30.09.2025"
        const parts = departureDate.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const formattedDate = `${day}.${month}.${year}`
          
          // Get day of week
          const jsDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          const dayName = dayNames[jsDate.getDay()]
          
          const result = `${arrivalTime} ${formattedDate} (${dayName})`
          console.log('✅ getOutboundArrival - using OBS API (external operator):', result)
          return result
        }
      }
      return flyTime
    } catch (error) {
      console.log('Error parsing OBS API arrival time:', error)
      return flight.fly_segments_there[0].fly_time
    }
  }
  
  console.log('❌ OBS API data not available for getOutboundArrival')
  return 'N/A'
}

const getInboundArrival = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.fly_time && flight?.fly_segments_back?.[0]?.departure_date) {
    try {
      const segment = flight.fly_segments_back[0]
      // OBS API format: fly_time = "03:30 - 05:30", departure_date = "07.10.2025"
      const flyTime = segment.fly_time
      const departureDate = segment.departure_date
      
      // Extract arrival time from fly_time (format: "03:30 - 05:30")
      const timeParts = flyTime.split(' - ')
      if (timeParts.length === 2) {
        const arrivalTime = timeParts[1] // "05:30"
        
        // Format date: "07.10.2025" -> "07.10.2025"
        const parts = departureDate.split('.')
        if (parts.length === 3) {
          const [day, month, year] = parts
          const formattedDate = `${day}.${month}.${year}`
          
          // Get day of week
          const jsDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
          const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          const dayName = dayNames[jsDate.getDay()]
          
          const result = `${arrivalTime} ${formattedDate} (${dayName})`
          console.log('✅ getInboundArrival - using OBS API (external operator):', result)
          return result
        }
      }
      return flyTime
    } catch (error) {
      console.log('Error parsing OBS API arrival time:', error)
      return flight.fly_segments_back[0].fly_time
    }
  }
  
  console.log('❌ OBS API data not available for getInboundArrival')
  return 'N/A'
}

const getOutboundTravelTime = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.fly_time) {
    const flyTime = flight.fly_segments_there[0].fly_time
    // Convert "00:30 - 02:30" to "2ч 30м"
    try {
      const timeParts = flyTime.split(' - ')
      if (timeParts.length === 2) {
        const [departureTime, arrivalTime] = timeParts
        const [depHours, depMinutes] = departureTime.split(':').map(Number)
        const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number)
        
        const depTotalMinutes = depHours * 60 + depMinutes
        const arrTotalMinutes = arrHours * 60 + arrMinutes
        
        let totalMinutes = arrTotalMinutes - depTotalMinutes
        if (totalMinutes < 0) {
          totalMinutes += 24 * 60 // Add 24 hours if arrival is next day
        }
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        
        const result = `${hours}ч ${minutes}м`
        console.log('✅ getOutboundTravelTime - converted:', flyTime, 'to:', result)
        return result
      }
    } catch (error) {
      console.log('Error converting travel time:', error)
    }
    
    console.log('✅ getOutboundTravelTime - using OBS API (external operator):', flyTime)
    return flyTime
  }
  
  console.log('❌ OBS API data not available for getOutboundTravelTime')
  return 'N/A'
}

const getInboundTravelTime = () => {
  const flight = getSelectedFlight() as any
  
  // ONLY SOURCE: OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.fly_time) {
    const flyTime = flight.fly_segments_back[0].fly_time
    // Convert "03:30 - 05:30" to "2ч 0м"
    try {
      const timeParts = flyTime.split(' - ')
      if (timeParts.length === 2) {
        const [departureTime, arrivalTime] = timeParts
        const [depHours, depMinutes] = departureTime.split(':').map(Number)
        const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number)
        
        const depTotalMinutes = depHours * 60 + depMinutes
        const arrTotalMinutes = arrHours * 60 + arrMinutes
        
        let totalMinutes = arrTotalMinutes - depTotalMinutes
        if (totalMinutes < 0) {
          totalMinutes += 24 * 60 // Add 24 hours if arrival is next day
        }
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        
        const result = `${hours}ч ${minutes}м`
        console.log('✅ getInboundTravelTime - converted:', flyTime, 'to:', result)
        return result
      }
    } catch (error) {
      console.log('Error converting travel time:', error)
    }
    
    console.log('✅ getInboundTravelTime - using OBS API (external operator):', flyTime)
    return flyTime
  }
  
  console.log('❌ OBS API data not available for getInboundTravelTime')
  return 'N/A'
}

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Additional services methods
const hasAdditionalServices = (): boolean => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  
  return !!(additionalServices.insurance || additionalServices.transfer || additionalServices.covidInsurance)
}

const getInsuranceName = (): string => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const insurance = additionalServices.insurance || {}
  
  switch (insurance.type) {
    case 'STANDARD':
      return 'STANDARD 10000 EUR'
    case 'STANDARD_PLUS':
      return 'STANDARD PLUS TR 30 000 EUR'
    case 'NONE':
      return 'Без страхования'
    default:
      return insurance.type || 'Тип страхования не указан'
  }
}

const getInsuranceDescription = (): string => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const insurance = additionalServices.insurance || {}
  
  switch (insurance.type) {
    case 'STANDARD':
      return 'Стандартная страховка на 10000 EUR'
    case 'STANDARD_PLUS':
      return 'Расширенная страховка на 30000 EUR'
    case 'NONE':
      return 'Страхование отключено'
    default:
      return insurance.coverage || ''
  }
}

const getInsuranceIncluded = (): boolean => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const insurance = additionalServices.insurance || {}
  
  return insurance.included === true
}

const getInsurancePrice = (): number => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const insurance = additionalServices.insurance || {}
  
  return insurance.price || 0
}

const getTransferName = (): string => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const transfer = additionalServices.transfer || {}
  
  switch (transfer.type) {
    case 'GROUP':
      return 'GROUP (BUS)'
    case 'INDIVIDUAL':
      return 'INDIVIDUAL TRANSFER'
    case 'VIP':
      return 'VIP IND TRANSFER'
    default:
      return transfer.type || 'Тип трансфера не указан'
  }
}

const getTransferDescription = (): string => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const transfer = additionalServices.transfer || {}
  
  switch (transfer.type) {
    case 'GROUP':
      return 'Групповой трансфер на автобусе'
    case 'INDIVIDUAL':
      return 'Индивидуальный трансфер'
    case 'VIP':
      return 'VIP индивидуальный трансфер'
    default:
      return ''
  }
}

const getTransferIncluded = (): boolean => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const transfer = additionalServices.transfer || {}
  
  return transfer.included === true
}

const getTransferPrice = (): number => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const transfer = additionalServices.transfer || {}
  
  return transfer.price || 0
}

const getCovidInsuranceType = (): string => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const covidInsurance = additionalServices.covidInsurance || {}
  
  return covidInsurance.type || 'INCLUDED'
}

const getCovidInsurancePrice = (): number => {
  const customerData = props.booking.customer_data as any || {}
  const additionalServices = customerData.additional_services || {}
  const covidInsurance = additionalServices.covidInsurance || {}
  
  return covidInsurance.price || 0
}
</script>

<script lang="ts">
export default {
  name: 'BookingDetailsModalSimple'
}
</script>
