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
        <HotelSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Tourists -->
        <TouristsSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Flight Information -->
        <FlightSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Additional Services Information -->
        <AdditionalServicesSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Pricing Information (Admin Mode Only) -->
        <div v-if="isAdminMode" class="section">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h3 class="section-title">Информация о ценах</h3>
          </div>
          
          <div v-if="obsOrderLoading" class="loading">
            <div class="loading__spinner"></div>
            <p class="loading__text">Загрузка информации о ценах...</p>
          </div>
          
          <div v-else-if="obsOrderDetails" class="section-content">
            <div class="grid gap-1">
              <div class="flex justify-between items-center p-2 text-xs">
                <span class="font-medium text-muted">Нетто</span>
                <span class="font-medium text-primary">
                  {{ formatPrice(obsOrderDetails.price?.order_sum || 0) }} {{ getCurrency() }}
                </span>
              </div>
              <div class="flex justify-between items-center p-2 text-xs">
                <span class="font-medium text-muted">Комиссия</span>
                <span class="font-medium text-primary">
                  + {{ formatPrice(obsOrderDetails.price?.commission_sum || 0) }} {{ getCurrency() }}
                </span>
              </div>
              <div class="flex justify-between items-center p-2 text-xs">
                <span class="font-medium text-muted">ВСЕГО</span>
                <span class="font-medium text-primary">
                  {{ formatPrice(obsOrderDetails.price?.total_sum || 0) }} {{ getCurrency() }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-else class="section-content">
            <div class="text-center p-6 bg-soft rounded">
              <p class="text-muted mb-2"><strong>Информация о ценах недоступна</strong></p>
              <p class="text-sm text-muted">Booking Hash: {{ booking.obs_booking_hash || 'Не указан' }}</p>
              <p class="text-sm text-muted">Попробуйте обновить страницу или обратитесь к администратору.</p>
            </div>
          </div>
        </div>

        <!-- Booking Notes and Comments -->
        <div v-if="hasBookingNotesComputed" class="section">
          <div class="section-header">
            <div class="section-icon">📝</div>
            <h3 class="section-title">Пометки и комментарии</h3>
          </div>
          <div class="section-content">
            <div v-if="selectedNotes.length > 0" class="mb-6">
              <h4 class="text-base font-semibold text-primary mb-4 pb-1 border-b border-soft">Выбранные пометки:</h4>
              <div class="flex flex-col gap-2">
                <div v-for="note in selectedNotes" :key="note" class="flex items-center gap-2 p-2 bg-white rounded border border-soft">
                  <div class="w-5 h-5 bg-success text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  <span class="text-sm font-medium text-primary">{{ note }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="bookingComment">
              <h4 class="text-base font-semibold text-primary mb-4 pb-1 border-b border-soft">Комментарий:</h4>
              <div class="flex items-start gap-2 p-4 bg-white rounded border border-soft">
                <div class="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">💬</div>
                <span class="text-sm text-primary leading-relaxed whitespace-pre-wrap break-words">{{ bookingComment }}</span>
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

        <!-- Booking Timeline (Admin only) -->
        <div v-if="isAdminMode" class="section">
          <div class="section-header">
            <div class="section-icon">📋</div>
            <h3 class="section-title">История бронирования</h3>
          </div>
          <div class="section-content">
            <div class="flex flex-col gap-4">
              <div class="flex gap-4 p-4 bg-soft rounded">
                <div class="text-sm text-secondary min-w-[120px]">{{ formatDateTime(booking.created_at) }}</div>
                <div class="text-sm text-primary font-medium">Бронирование создано</div>
              </div>
              <div v-if="booking.confirmed_at" class="flex gap-4 p-4 bg-soft rounded">
                <div class="text-sm text-secondary min-w-[120px]">{{ formatDateTime(booking.confirmed_at) }}</div>
                <div class="text-sm text-primary font-medium">Бронирование подтверждено</div>
              </div>
              <div v-if="booking.cancelled_at" class="flex gap-4 p-4 bg-soft rounded">
                <div class="text-sm text-secondary min-w-[120px]">{{ formatDateTime(booking.cancelled_at) }}</div>
                <div class="text-sm text-primary font-medium">Бронирование отменено</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { BaseButton } from '../ui'
import { StatusBadge } from '../ui'
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import { logger } from '../../utils/logger'
import { useAdminApi } from '../../composables/useAdminApi'
import { useBookingNotes } from '../../composables/useBookingNotes'

// Import section components
import HotelSection from './sections/HotelSection.vue'
import TouristsSection from './sections/TouristsSection.vue'
import FlightSection from './sections/FlightSection.vue'
import AdditionalServicesSection from './sections/AdditionalServicesSection.vue'

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

// Admin API
const { getObsBookingDetails } = useAdminApi()

// Booking notes
const { hasBookingNotes, getSelectedNotes, getBookingComment } = useBookingNotes(props.booking)

// Computed properties for notes
const selectedNotes = computed(() => getSelectedNotes())
const bookingComment = computed(() => getBookingComment())
const hasBookingNotesComputed = computed(() => hasBookingNotes())

// State
const actionLoading = ref(false)
const obsOrderDetails = ref<Record<string, unknown> | null>(null)
const obsOrderLoading = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

// Load OBS order details for pricing information
const loadObsOrderDetails = async () => {
  if (!props.isAdminMode || !props.booking.obs_booking_hash) {
    return
  }

  try {
    obsOrderLoading.value = true
    const response = await getObsBookingDetails(props.booking.obs_booking_hash)
    obsOrderDetails.value = (response as Record<string, unknown>)?.data || response
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

// Format price for display
const formatPrice = (price: number): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0'
  }
  return price.toFixed(2)
}

// Helper functions for OBS pricing information
const getCurrency = () => {
  return (obsOrderDetails.value as any)?.price?.currency || 'EUR'
}
</script>

<script lang="ts">
export default {
  name: 'BookingDetailsModalClean'
}
</script>
