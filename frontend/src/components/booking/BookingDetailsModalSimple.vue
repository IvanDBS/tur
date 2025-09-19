<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="flex justify-between items-start gap-4 mb-6">
          <div>
            <h2 class="text-xl font-bold text-primary mb-4">
              {{ isAdminMode ? 'Детали пакета' : 'Детали бронирования' }}
            </h2>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="modal-body">
        <!-- Booking Information -->
        <div class="section">
          <div class="section-content">
            <div class="header-table">
              <div class="table-row">
                <div class="table-cell">
                  <label class="uppercase tracking-wide">ID</label>
                </div>
                <div class="table-cell">
                  <label class="uppercase tracking-wide">Создано</label>
                </div>
                <div class="table-cell">
                  <label class="uppercase tracking-wide">Пользователь</label>
                </div>
                <div class="table-cell">
                  <label class="uppercase tracking-wide">Email</label>
                </div>
                <div class="table-cell">
                  <label class="uppercase tracking-wide">Телефон</label>
                </div>
                <div class="table-cell">
                  <label class="uppercase tracking-wide">Статус</label>
                </div>
              </div>
              <div class="table-row">
                <div class="table-cell">
                  <span>{{ booking.id }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ formatDateWithYear(booking.created_at) }} {{ formatTime(booking.created_at) }}</span>
                </div>
                <div class="table-cell">
                  <span>
                    {{ booking.user?.first_name || booking.user?.email?.split('@')[0] || '-' }}
                  </span>
                </div>
                <div class="table-cell">
                  <span>{{ booking.user?.email || '-' }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ booking.user?.phone || '-' }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getStatusLabel(booking.status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hotel Information -->
        <div class="section">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <div class="section-icon">
                <img :src="HotelIcon" alt="Hotel" class="icon-svg" />
              </div>
              <h3 class="section-title">Отель</h3>
              <div class="section-status">
                <span class="text-sm text-secondary">Статус: </span>
                <span class="text-sm" :class="booking.status === 'pending' ? 'text-warning' : 'text-secondary'">{{ getStatusLabel(booking.status) }}</span>
              </div>
            </div>
          </div>
          <div class="section-content">
            <div class="mb-6" style="padding-left: 1.5rem;">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-lg font-semibold text-primary">{{ getHotelName() }}</span>
                <span class="text-sm text-primary font-medium">{{ getHotelCategory() }}</span>
                <span class="text-sm text-secondary">{{ getHotelCity() }}</span>
              </div>
            </div>
            <div class="hotel-table">
              <div class="table-row">
                <div class="table-cell">
                  <label class="text-xs font-medium text-secondary uppercase tracking-wide">Тип комнаты</label>
                </div>
                <div class="table-cell">
                  <label class="text-xs font-medium text-secondary uppercase tracking-wide">Питание</label>
                </div>
                <div class="table-cell">
                  <label class="text-xs font-medium text-secondary uppercase tracking-wide">Даты проживания</label>
                </div>
                <div class="table-cell">
                  <label class="text-xs font-medium text-secondary uppercase tracking-wide">Ночей</label>
                </div>
                <div class="table-cell">
                  <label class="text-xs font-medium text-secondary uppercase tracking-wide">Оператор</label>
                </div>
              </div>
              <div class="table-row">
                <div class="table-cell">
                  <span class="text-sm font-medium text-primary">{{ getRoomType() }}</span>
                </div>
                <div class="table-cell">
                  <span class="text-sm font-medium text-primary">{{ getMealPlan() }}</span>
                </div>
                <div class="table-cell">
                  <span class="text-sm font-medium text-primary">{{ getCheckInDate() }} - {{ getCheckOutDate() }}</span>
                </div>
                <div class="table-cell">
                  <span class="text-sm font-medium text-primary">{{ getNights() }}</span>
                </div>
                <div class="table-cell">
                  <span class="text-sm font-medium text-primary">{{ getOperator() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tourists -->
        <div v-if="getTourists().length > 0" class="section">
          <div class="section-header">
            <div class="section-icon">
              <img :src="PeopleIcon" alt="People" class="icon-svg" />
            </div>
            <h3 class="section-title">Туристы</h3>
          </div>
          <div class="section-content">
            <div v-for="(tourist, index) in getTourists()" :key="index" class="tourist-item">
              <div class="tourist-number">№ {{ index + 1 }}</div>
              <div class="tourist-info">
                <div class="info-item">
                  <label class="info-label">ФИО</label>
                  <span class="info-value">{{ getTouristName(tourist) }}</span>
                </div>
                <div class="info-item">
                  <label class="info-label">Дата рождения</label>
                  <span class="info-value">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</span>
                </div>
                <div class="info-item">
                  <label class="info-label">Паспорт</label>
                  <span class="info-value">{{ getTouristPassport(tourist) }}</span>
                </div>
                <div class="info-item">
                  <label class="info-label">Гражданство</label>
                  <span class="info-value">{{ tourist.nationality || 'MOLDOVA' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Information -->
        <div v-if="getSelectedFlight()" class="section">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <div class="section-icon">
                <img :src="PlaneIcon" alt="Plane" class="icon-svg" />
              </div>
              <h3 class="section-title">Перелет</h3>
              <div class="section-status">
                <span class="text-sm text-secondary">Статус: </span>
                <span class="text-sm" :class="getFlightStatusClass()">{{ getFlightStatus() }}</span>
              </div>
            </div>
          </div>
          <div class="section-content">
            <div class="flight-table">
              <div class="table-row">
                <div class="table-cell">
                  <label>Турист</label>
                </div>
                <div class="table-cell">
                  <label>Из</label>
                </div>
                <div class="table-cell">
                  <label>В</label>
                </div>
                <div class="table-cell">
                  <label>Вылет</label>
                </div>
                <div class="table-cell">
                  <label>Прилет</label>
                </div>
                <div class="table-cell">
                  <label>Рейс</label>
                </div>
                <div class="table-cell">
                  <label>Время в пути</label>
                </div>
              </div>
              <div v-for="(tourist, index) in getTourists()" :key="index" class="table-row">
                <div class="table-cell">
                  <div class="tourist-info">
                    <div class="tourist-name">{{ getTouristName(tourist) }}</div>
                    <div class="tourist-birthday">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</div>
                  </div>
                </div>
                <div class="table-cell">
                  <span>{{ getOutboundFrom() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getOutboundTo() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getOutboundDeparture() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getOutboundArrival() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getOutboundFlightInfo() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getOutboundTravelTime() }}</span>
                </div>
              </div>
              <div v-for="(tourist, index) in getTourists()" :key="`back-${index}`" class="table-row">
                <div class="table-cell">
                  <div class="tourist-info">
                    <div class="tourist-name">{{ getTouristName(tourist) }}</div>
                    <div class="tourist-birthday">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</div>
                  </div>
                </div>
                <div class="table-cell">
                  <span>{{ getInboundFrom() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getInboundTo() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getInboundDeparture() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getInboundArrival() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getInboundFlightInfo() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getInboundTravelTime() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Services Information -->
        <div v-if="hasAdditionalServices()" class="section">
          <div class="section-header services-section">
            <div class="section-icon">
              <img :src="AdditionalServicesIcon" alt="Services" class="icon-svg" />
            </div>
            <h3 class="section-title">Дополнительные услуги</h3>
          </div>
          <div class="section-content">
            <div class="services-table">
              <div class="table-row">
                <div class="table-cell">
                  <label>Услуга</label>
                </div>
                <div class="table-cell">
                  <label>Название</label>
                </div>
                <div class="table-cell">
                  <label>Описание</label>
                </div>
                <div class="table-cell">
                  <label>Статус</label>
                </div>
              </div>
              <div class="table-row">
                <div class="table-cell">
                  <div class="service-info">
                    <div class="service-icon">
                      <img :src="InsuranceIcon" alt="Insurance" class="icon-svg" />
                    </div>
                    <div class="service-name">Страхование</div>
                  </div>
                </div>
                <div class="table-cell">
                  <span>{{ getInsuranceName() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getInsuranceDescription() }}</span>
                </div>
                <div class="table-cell">
                  <span v-if="!getInsuranceIncluded()" class="text-primary">+ {{ getInsurancePrice() }} EUR</span>
                  <span v-else class="text-success">Включено</span>
                </div>
              </div>
              <div class="table-row">
                <div class="table-cell">
                  <div class="service-info">
                    <div class="service-icon">
                      <img :src="BusIcon" alt="Transfer" class="icon-svg" />
                    </div>
                    <div class="service-name">Трансфер</div>
                  </div>
                </div>
                <div class="table-cell">
                  <span>{{ getTransferName() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ getTransferDescription() }}</span>
                </div>
                <div class="table-cell">
                  <span v-if="!getTransferIncluded()" class="text-primary">+ {{ getTransferPrice() }} EUR</span>
                  <span v-else class="text-success">Включено</span>
                </div>
              </div>
              <div v-if="getCovidInsuranceType() === 'COVID_19'" class="table-row">
                <div class="table-cell">
                  <div class="service-info">
                    <div class="service-icon">
                      <img :src="InsuranceIcon" alt="COVID-19" class="icon-svg" />
                    </div>
                    <div class="service-name">COVID-19</div>
                  </div>
                </div>
                <div class="table-cell">
                  <span>COVID-19</span>
                </div>
                <div class="table-cell">
                  <span>Дополнительная страховка от COVID-19</span>
                </div>
                <div class="table-cell">
                  <span class="text-primary">+ {{ getCovidInsurancePrice() }} EUR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">
              <img :src="BillIcon" alt="Payment" class="icon-svg" />
            </div>
            <h3 class="section-title">Оплата</h3>
          </div>
          <div class="section-content">
            <div class="payment-table">
              <div class="table-row">
                <div class="table-cell">
                  <label>Сумма</label>
                </div>
                <div class="table-cell">
                  <label>Статус оплаты</label>
                </div>
                <div class="table-cell">
                  <label>Дата создания</label>
                </div>
                <div v-if="booking.confirmed_at" class="table-cell">
                  <label>Дата подтверждения</label>
                </div>
              </div>
              <div class="table-row">
                <div class="table-cell">
                  <span class="text-lg font-bold text-primary">{{ booking.total_amount }} EUR</span>
                </div>
                <div class="table-cell">
                  <span>{{ getPaymentStatus() }}</span>
                </div>
                <div class="table-cell">
                  <span>{{ formatDateTime(booking.created_at) }}</span>
                </div>
                <div v-if="booking.confirmed_at" class="table-cell">
                  <span>{{ formatDateTime(booking.confirmed_at) }}</span>
                </div>
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
import { formatDate, formatDateTime, formatDateWithYear } from '../../utils/dateUtils'
import { logger } from '../../utils/logger'
import { useAdminApi } from '../../composables/useAdminApi'

// Icon paths
const HotelIcon = '/src/assets/icons/hotel.svg'
const PeopleIcon = '/src/assets/icons/people.svg'
const PlaneIcon = '/src/assets/icons/plane.svg'
const BusIcon = '/src/assets/icons/bus-03.svg'
const InsuranceIcon = '/src/assets/icons/insurance-hand.svg'
const BillIcon = '/src/assets/icons/bill.svg'
const AdditionalServicesIcon = '/src/assets/icons/file-addition-one.svg'

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
  
  // PRIORITY 1: Check OBS API data (external operator service)
  if (obsOrderDetails.value?.hotels?.[0]?.name) {
    return obsOrderDetails.value.hotels[0].name
  }
  
  // PRIORITY 2: Check tour_details data
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
  
  // PRIORITY 1: Check OBS API data (external operator service)
  if (obsOrderDetails.value?.hotels?.[0]?.category) {
    return obsOrderDetails.value.hotels[0].category
  }
  
  // PRIORITY 2: Check tour_details data
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
  
  // PRIORITY 1: Check OBS API data (external operator service)
  if (obsOrderDetails.value?.hotels?.[0]?.city) {
    return obsOrderDetails.value.hotels[0].city
  }
  
  // PRIORITY 2: Check tour_details data
  if (tourDetails?.hotel?.city) {
    return tourDetails.hotel.city
  }
  return tourDetails?.city || 'Город не указан'
}

const getRoomType = () => {
  const tourDetails = props.booking.tour_details as any
  
  // PRIORITY 1: Check OBS API data (external operator service)
  if (obsOrderDetails.value?.hotels?.[0]?.room) {
    return obsOrderDetails.value.hotels[0].room
  }
  
  // PRIORITY 2: Check tour_details data
  if (tourDetails?.hotel?.room) {
    return tourDetails.hotel.room
  }
  return tourDetails?.room_type || 'Тип комнаты не указан'
}

const getMealPlan = () => {
  const tourDetails = props.booking.tour_details as any
  
  // PRIORITY 1: Check OBS API data (external operator service)
  if (obsOrderDetails.value?.hotels?.[0]?.meal) {
    return obsOrderDetails.value.hotels[0].meal
  }
  
  // PRIORITY 2: Check tour_details data
  if (tourDetails?.hotel?.meal) {
    return tourDetails.hotel.meal
  }
  return tourDetails?.meal_plan || 'Питание не указано'
}

const getCheckInDate = () => {
  const tourDetails = props.booking.tour_details as any
  
  // PRIORITY 1: Check OBS API data (external operator service)
  if (obsOrderDetails.value?.hotels?.[0]?.check_in) {
    const checkIn = obsOrderDetails.value.hotels[0].check_in
    if (checkIn && checkIn !== 'N/A') {
      try {
        return formatDate(checkIn)
      } catch {
        return checkIn
      }
    }
  }
  
  // PRIORITY 2: Check tour_details data
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

const getOperator = () => {
  const tourDetails = props.booking.tour_details as any
  
  // Debug logging
  console.log('🔍 getOperator - tourDetails:', tourDetails)
  console.log('🔍 getOperator - obsOrderDetails:', obsOrderDetails.value)
  console.log('🔍 getOperator - obsOrderDetails.hotels:', obsOrderDetails.value?.hotels)
  console.log('🔍 getOperator - obsOrderDetails.hotels[0]:', obsOrderDetails.value?.hotels?.[0])
  console.log('🔍 getOperator - obsOrderDetails.hotels[0].operator:', obsOrderDetails.value?.hotels?.[0]?.operator)
  
  // PRIORITY 1: Check OBS API data (external operator service) - hotels[0].operator
  if (obsOrderDetails.value?.hotels?.[0]?.operator) {
    console.log('✅ Found operator in OBS API hotels[0].operator:', obsOrderDetails.value.hotels[0].operator)
    return obsOrderDetails.value.hotels[0].operator
  }
  
  // PRIORITY 2: Check tour_details API format: hotels[0].operator
  if (tourDetails?.hotels?.[0]?.operator) {
    console.log('✅ Found operator in tour_details hotels[0].operator:', tourDetails.hotels[0].operator)
    return tourDetails.hotels[0].operator
  }
  
  // PRIORITY 3: Check old format: hotel.operator
  if (tourDetails?.hotel?.operator) {
    console.log('✅ Found operator in hotel.operator:', tourDetails.hotel.operator)
    return tourDetails.hotel.operator
  }
  
  // PRIORITY 4: Check direct operator field
  if (tourDetails?.operator) {
    console.log('✅ Found operator in operator:', tourDetails.operator)
    return tourDetails.operator
  }
  
  console.log('❌ No operator found')
  return 'Не указано'
}

const getFlightStatus = () => {
  const flight = getSelectedFlight() as any
  if (flight?.fly_segments_there?.[0]?.status) {
    const status = flight.fly_segments_there[0].status
    return status === 'confirmed' ? 'Подтвержден' : status
  }
  if (flight?.fly_segments_back?.[0]?.status) {
    const status = flight.fly_segments_back[0].status
    return status === 'confirmed' ? 'Подтвержден' : status
  }
  return 'Не указано'
}

const getFlightStatusClass = () => {
  const flight = getSelectedFlight() as any
  if (flight?.fly_segments_there?.[0]?.status) {
    const status = flight.fly_segments_there[0].status
    if (status === 'confirmed') return 'text-success'
    if (status === 'pending' || status === 'В ожидании') return 'text-warning'
  }
  if (flight?.fly_segments_back?.[0]?.status) {
    const status = flight.fly_segments_back[0].status
    if (status === 'confirmed') return 'text-success'
    if (status === 'pending' || status === 'В ожидании') return 'text-warning'
  }
  return ''
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
  
  // PRIORITY 1: OBS API (external operator service)
  if (obsOrderDetails.value?.charter?.[0]) {
    console.log('✅ Using OBS API charter data (EXTERNAL OPERATOR SERVICE):', obsOrderDetails.value.charter[0])
    return obsOrderDetails.value.charter[0]
  }
  
  // PRIORITY 2: API data from tour_details.flights
  if (props.booking.tour_details?.flights) {
    console.log('✅ Using API data from tour_details.flights:', props.booking.tour_details.flights)
    return props.booking.tour_details.flights
  }
  
  console.log('❌ No flight data available')
  return null
}

const getOutboundFrom = () => {
  const flight = getSelectedFlight() as any
  console.log('=== DEBUG: getOutboundFrom ===')
  console.log('flight:', flight)
  
  // Use API data from flights.there.departure.airport
  if (flight?.there?.departure?.airport) {
    const airport = flight.there.departure.airport
    const result = `${airport.name} (${airport.prefix})`
    console.log('✅ getOutboundFrom - using API data:', result)
    return result
  }
  
  // Fallback to OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.destination?.airport_from) {
    const airportCode = flight.fly_segments_there[0].destination.airport_from
    const result = `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getOutboundFrom - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ No airport data available for getOutboundFrom')
  return 'N/A'
}

const getInboundFrom = () => {
  const flight = getSelectedFlight() as any
  
  // Use API data from flights.back.departure.airport
  if (flight?.back?.departure?.airport) {
    const airport = flight.back.departure.airport
    const result = `${airport.name} (${airport.prefix})`
    console.log('✅ getInboundFrom - using API data:', result)
    return result
  }
  
  // Fallback to OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.destination?.airport_from) {
    const airportCode = flight.fly_segments_back[0].destination.airport_from
    const result = `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getInboundFrom - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ No airport data available for getInboundFrom')
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
  
  // Use API data from flights.there
  if (flight?.there?.flight_number && flight?.there?.airline) {
    const flightNumber = flight.there.flight_number
    const airline = flight.there.airline
    const prefix = flightNumber.prefix || ''
    const number = flightNumber.number || ''
    const result = `${prefix}${number} (${airline.name})`
    console.log('✅ getOutboundFlightInfo - using API data:', result)
    return result
  }
  
  // Fallback to OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]) {
    const segment = flight.fly_segments_there[0]
    const result = `${segment.prefix}${segment.flight} (${segment.airline})`
    console.log('✅ getOutboundFlightInfo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ No flight info available for getOutboundFlightInfo')
  return 'N/A'
}

const getInboundFlightInfo = () => {
  const flight = getSelectedFlight() as any
  
  // Use API data from flights.back
  if (flight?.back?.flight_number && flight?.back?.airline) {
    const flightNumber = flight.back.flight_number
    const airline = flight.back.airline
    const prefix = flightNumber.prefix || ''
    const number = flightNumber.number || ''
    const result = `${prefix}${number} (${airline.name})`
    console.log('✅ getInboundFlightInfo - using API data:', result)
    return result
  }
  
  // Fallback to OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]) {
    const segment = flight.fly_segments_back[0]
    const result = `${segment.prefix}${segment.flight} (${segment.airline})`
    console.log('✅ getInboundFlightInfo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ No flight info available for getInboundFlightInfo')
  return 'N/A'
}

const getOutboundTo = () => {
  const flight = getSelectedFlight() as any
  
  // Use API data from flights.there.arrival.airport
  if (flight?.there?.arrival?.airport) {
    const airport = flight.there.arrival.airport
    const result = `${airport.name} (${airport.prefix})`
    console.log('✅ getOutboundTo - using API data:', result)
    return result
  }
  
  // Fallback to OBS API (external operator service)
  if (flight?.fly_segments_there?.[0]?.destination?.airport_to) {
    const airportCode = flight.fly_segments_there[0].destination.airport_to
    const result = `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getOutboundTo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ No airport data available for getOutboundTo')
  return 'N/A'
}

const getInboundTo = () => {
  const flight = getSelectedFlight() as any
  
  // Use API data from flights.back.arrival.airport
  if (flight?.back?.arrival?.airport) {
    const airport = flight.back.arrival.airport
    const result = `${airport.name} (${airport.prefix})`
    console.log('✅ getInboundTo - using API data:', result)
    return result
  }
  
  // Fallback to OBS API (external operator service)
  if (flight?.fly_segments_back?.[0]?.destination?.airport_to) {
    const airportCode = flight.fly_segments_back[0].destination.airport_to
    const result = `${airportCode} AIRPORT (${airportCode})`
    console.log('✅ getInboundTo - using OBS API (external operator):', result)
    return result
  }
  
  console.log('❌ No airport data available for getInboundTo')
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
  
  // Use API data from flights.there.flight_time
  if (flight?.there?.flight_time) {
    const flightTime = flight.there.flight_time
    // Convert "01:50" to "1ч 50м"
    try {
      const result = flightTime.replace(':', 'ч ') + 'м'
      console.log('✅ getOutboundTravelTime - using API data:', result)
      return result
    } catch (error) {
      console.log('Error converting travel time:', error)
      return flightTime
    }
  }
  
  // Fallback to OBS API (external operator service)
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
  
  console.log('❌ No travel time data available for getOutboundTravelTime')
  return 'N/A'
}

const getInboundTravelTime = () => {
  const flight = getSelectedFlight() as any
  
  // Use API data from flights.back.flight_time
  if (flight?.back?.flight_time) {
    const flightTime = flight.back.flight_time
    // Convert "01:50" to "1ч 50м"
    try {
      const result = flightTime.replace(':', 'ч ') + 'м'
      console.log('✅ getInboundTravelTime - using API data:', result)
      return result
    } catch (error) {
      console.log('Error converting travel time:', error)
      return flightTime
    }
  }
  
  // Fallback to OBS API (external operator service)
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
  
  console.log('❌ No travel time data available for getInboundTravelTime')
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

<style scoped>
.section-content {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

/* Специальное выравнивание для иконок, которые должны быть по центру текста */
.section-header:not(.services-section) .section-icon {
  align-items: flex-start;
  padding-top: 0.125rem;
}

.section-status {
  font-size: 0.75rem;
  color: #6b7280;
}

.header-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  table-layout: fixed;
}

.hotel-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.flight-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  table-layout: fixed;
}

.flight-table .table-cell:first-child {
  width: 25%;
}

.flight-table .table-cell span {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.services-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  table-layout: fixed;
}

.payment-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  table-layout: fixed;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.service-icon {
  font-size: 0.875rem;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-name {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.text-warning {
  color: #f59e0b;
}

.text-success {
  color: #10b981;
}

.icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  object-fit: contain;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
}

.table-cell:first-child {
  padding-left: 1.5rem;
}

.table-cell:last-child {
  padding-right: 1.5rem;
}

.tourist-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.tourist-item:last-child {
  border-bottom: none;
}

.tourist-number {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
  min-width: 40px;
  display: flex;
  align-items: center;
}

.tourist-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  flex: 1;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
  text-transform: none;
  letter-spacing: normal;
}

.info-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.flight-table .tourist-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.flight-table .tourist-name {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.flight-table .tourist-birthday {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
}

.table-row:first-child .table-cell {
  border-bottom: 1px solid var(--color-border);
  background-color: #f8fafc;
  font-weight: normal;
  font-size: 0.75rem;
  color: #6b7280;
}

.table-row:last-child .table-cell {
  border-bottom: none;
}

@media (max-width: 768px) {
  .header-table,
  .hotel-table,
  .flight-table,
  .services-table,
  .payment-table {
    display: block;
  }
  
  .table-row {
    display: block;
    margin-bottom: 1rem;
  }
  
  .table-cell {
    display: block;
    padding: 0.5rem 0;
    border-bottom: none;
  }
  
  .table-row:first-child .table-cell {
    border-bottom: 1px solid var(--color-border);
    background-color: transparent;
  }
}
</style>
