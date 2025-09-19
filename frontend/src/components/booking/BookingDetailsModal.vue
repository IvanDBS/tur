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
import { formatDateTime, formatDateWithYear } from '../../utils/dateUtils'
import { logger } from '../../utils/logger'
import { useAdminApi } from '../../composables/useAdminApi'
import { useBookingData } from '../../composables/useBookingData'
import { useFlightData } from '../../composables/useFlightData'
import { useAdditionalServices } from '../../composables/useAdditionalServices'

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
    operator_id?: number
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
  statusChanged: []
}>()

// State
const actionLoading = ref(false)
const obsOrderDetails = ref<Record<string, unknown> | null>(null)
const obsOrderLoading = ref(false)

// Use composables
const { getHotelName, getHotelCategory, getHotelCity, getRoomType, getMealPlan, getCheckInDate, getCheckOutDate, getNights, getTourists, getTouristName, getTouristPassport } = useBookingData(props.booking, props.isAdminMode)
const { getSelectedFlight, getFlightStatus, getFlightStatusClass, getOutboundFrom, getInboundFrom, getOutboundDeparture, getInboundDeparture, getOutboundFlightInfo, getInboundFlightInfo, getOutboundTo, getInboundTo, getOutboundArrival, getInboundArrival, getOutboundTravelTime, getInboundTravelTime } = useFlightData(props.booking, obsOrderDetails)
const { hasAdditionalServices, getInsuranceName, getInsuranceDescription, getInsuranceIncluded, getInsurancePrice, getTransferName, getTransferDescription, getTransferIncluded, getTransferPrice, getCovidInsuranceType, getCovidInsurancePrice } = useAdditionalServices(props.booking)

// Admin API
const { getObsBookingDetails } = useAdminApi()

// Methods
const closeModal = () => {
  emit('close')
}

// Load OBS order details for flight information
const loadObsOrderDetails = async () => {
  if (!props.booking.obs_booking_hash) {
    return
  }

  try {
    obsOrderLoading.value = true
    // PRIORITY 1: Use operator_id (numeric ID) for direct OBS API call
    const operatorId = (props.booking as any).operator_id
    if (operatorId) {
      const response = await getObsBookingDetails(props.booking.obs_booking_hash, undefined, undefined, operatorId)
      obsOrderDetails.value = (response as any)?.data || (response as any)
      logger.info('OBS order details loaded via operator_id:', obsOrderDetails.value)
      console.log('OBS order details loaded via operator_id:', obsOrderDetails.value)
      return
    }
    
    // PRIORITY 2: Use order_number (TT25-TR/7086) to find the order and get its details
    const orderNumber = props.booking.obs_order_id // This contains the order_number from OBS
    if (orderNumber) {
      const response = await getObsBookingDetails(props.booking.obs_booking_hash, undefined, orderNumber)
      obsOrderDetails.value = (response as any)?.data || (response as any)
      logger.info('OBS order details loaded via order_number:', obsOrderDetails.value)
      console.log('OBS order details loaded via order_number:', obsOrderDetails.value)
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

// Hotel data methods - now using useBookingData composable

const getOperator = () => {
  const tourDetails = props.booking.tour_details as any
  
  // PRIORITY 1: Check OBS API data (external operator service) - hotels[0].operator
  if ((obsOrderDetails.value as any)?.hotels?.[0]?.operator) {
    return (obsOrderDetails.value as any).hotels[0].operator
  }
  
  // PRIORITY 2: Check tour_details API format: hotels[0].operator
  if (tourDetails?.hotels?.[0]?.operator) {
    return tourDetails.hotels[0].operator
  }
  
  // PRIORITY 3: Check old format: hotel.operator
  if (tourDetails?.hotel?.operator) {
    return tourDetails.hotel.operator
  }
  
  // PRIORITY 4: Check direct operator field
  if (tourDetails?.operator) {
    return tourDetails.operator
  }
  return 'Не указано'
}

// Flight status functions removed - now using useFlightData composable

// Tourist data methods - now using useBookingData composable

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

// Flight data methods - now using useFlightData composable

// Flight functions removed - now using useFlightData composable

// All flight functions removed - now using useFlightData composable

// getOutboundDeparture removed - now using useFlightData composable

// getInboundDeparture removed - now using useFlightData composable

// getOutboundFlightInfo removed - now using useFlightData composable

// getInboundFlightInfo removed - now using useFlightData composable

// getOutboundTo removed - now using useFlightData composable

// getInboundTo removed - now using useFlightData composable

// getOutboundArrival removed - now using useFlightData composable

// getInboundArrival removed - now using useFlightData composable

// getOutboundTravelTime removed - now using useFlightData composable

// getInboundTravelTime removed - now using useFlightData composable

// timeToMinutes removed - no longer needed

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
