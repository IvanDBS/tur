<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header with booking info -->
      <div class="modal-header">
        <div class="booking-header">
          <div class="booking-title">
            <h2>{{ isAdminMode ? 'Детали пакета' : 'Детали бронирования' }}</h2>
            <div class="booking-info">
              <div class="booking-id">ID: {{ booking.id }}</div>
              <div class="booking-date">Создано: {{ formatDate(booking.created_at) }} {{ formatTime(booking.created_at) }}</div>
              <div class="booking-status">Статус: {{ getStatusLabel(booking.status) }}</div>
            </div>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Admin info -->
        <div class="admin-info" v-if="isAdminMode">
          <div class="info-row">
            <div class="info-item">
              <label>Владелец</label>
              <span>{{ booking.user?.first_name || booking.user?.email?.split('@')[0] || '-' }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ booking.user?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <label>Телефон</label>
              <span>{{ booking.user?.phone || '-' }}</span>
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
        <HotelSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Tourists -->
        <TouristsSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Flight Information -->
        <FlightSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Additional Services Information -->
        <AdditionalServicesSection :booking="booking" :is-admin-mode="isAdminMode" />

        <!-- Pricing Information (Admin Mode Only) -->
        <div class="section" v-if="isAdminMode">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h3 class="section-title">Информация о ценах</h3>
          </div>
          
          <div v-if="obsOrderLoading" class="loading-pricing">
            <div class="spinner"></div>
            <p>Загрузка информации о ценах...</p>
          </div>
          
          <div v-else-if="obsOrderDetails" class="pricing-breakdown">
            <div class="pricing-grid">
              <!-- Net Total -->
              <div class="pricing-item">
                <div class="pricing-label">Нетто</div>
                <div class="pricing-value">{{ formatPrice(obsOrderDetails.price?.order_sum || 0) }} {{ getCurrency() }}</div>
              </div>
              
              <!-- Commission -->
              <div class="pricing-item">
                <div class="pricing-label">Комиссия</div>
                <div class="pricing-value">+ {{ formatPrice(obsOrderDetails.price?.commission_sum || 0) }} {{ getCurrency() }}</div>
              </div>
              
              <!-- Grand Total -->
              <div class="pricing-item">
                <div class="pricing-label">ВСЕГО</div>
                <div class="pricing-value">{{ formatPrice(obsOrderDetails.price?.total_sum || 0) }} {{ getCurrency() }}</div>
              </div>
            </div>
          </div>
          
          <div v-else class="pricing-error">
            <div class="error-message">
              <p><strong>Информация о ценах недоступна</strong></p>
              <p v-if="isAdminMode">Booking Hash: {{ booking.obs_booking_hash || 'Не указан' }}</p>
              <p>Попробуйте обновить страницу или обратитесь к администратору.</p>
            </div>
          </div>
        </div>

        <!-- Booking Notes and Comments -->
        <div class="section" v-if="hasBookingNotesComputed">
          <div class="section-header">
            <div class="section-icon">📝</div>
            <h3 class="section-title">Пометки и комментарии</h3>
          </div>
          <div class="booking-notes-info">
            <div class="notes-section" v-if="selectedNotes.length > 0">
              <h4 class="notes-subtitle">Выбранные пометки:</h4>
              <div class="notes-list">
                <div 
                  v-for="note in selectedNotes" 
                  :key="note"
                  class="note-item"
                >
                  <div class="note-icon">✓</div>
                  <span class="note-text">{{ note }}</span>
                </div>
              </div>
            </div>
            
            <div class="comment-section" v-if="bookingComment">
              <h4 class="notes-subtitle">Комментарий:</h4>
              <div class="comment-content">
                <div class="comment-icon">💬</div>
                <span class="comment-text">{{ bookingComment }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { BaseButton } from '../ui'
import { StatusBadge } from '../ui'
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import { logger } from '../../utils/logger'
// import { useI18n } from '../../composables/useI18n' // Not used
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

// I18n
// const { t: $t } = useI18n() // Not used in this component

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
  logger.info('loadObsOrderDetails called:', {
    isAdminMode: props.isAdminMode,
    obsOrderId: props.booking.obs_order_id,
    bookingId: props.booking.id
  })
  
  if (!props.isAdminMode) {
    logger.info('Not in admin mode, skipping OBS order details load')
    return
  }
  
  if (!props.booking.obs_booking_hash) {
    logger.warn('No OBS booking hash found for booking:', props.booking.id)
    return
  }

  try {
    obsOrderLoading.value = true
    logger.info('Loading OBS order details for booking hash:', props.booking.obs_booking_hash)
    
    const response = await getObsBookingDetails(props.booking.obs_booking_hash)
    obsOrderDetails.value = (response as Record<string, unknown>)?.data || response
    
    logger.info('OBS order details loaded successfully:', obsOrderDetails.value)
  } catch (error) {
    logger.error('Failed to load OBS order details:', error)
  } finally {
    obsOrderLoading.value = false
  }
}

// Lifecycle hooks для управления прокруткой body
onMounted(() => {
  // Блокируем прокрутку фона когда модалка открыта
  document.body.classList.add('modal-open')
  
  // Load OBS order details if in admin mode
  loadObsOrderDetails()
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
  return obsOrderDetails.value?.price?.currency || 'EUR'
}
</script>

<script lang="ts">
export default {
  name: 'BookingDetailsModalRefactored'
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
  padding-top: 80px;
  overflow: hidden;
}

:global(body.modal-open) {
  overflow: hidden;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 1200px;
  width: 100%;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  display: block;
}

.modal-header {
  padding: var(--spacing-xl) var(--spacing-xl) 0 var(--spacing-xl);
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

.booking-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.booking-id,
.booking-date,
.booking-status {
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
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: white;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
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

/* Pricing Information Styles */
.loading-pricing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  text-align: center;
}

.loading-pricing .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

.pricing-breakdown {
  padding: 4px;
}

.pricing-grid {
  display: grid;
  gap: 2px;
}

.pricing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
}

.pricing-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.pricing-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.pricing-error {
  padding: var(--spacing-lg);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  text-align: center;
}

.error-message {
  color: var(--color-text-muted);
}

.error-message p {
  margin: 0 0 var(--spacing-sm) 0;
}

.error-message p:last-child {
  margin-bottom: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-sm);
    padding-top: 60px;
  }
  
  .modal-content {
    max-height: calc(100vh - 80px);
  }
  
  .modal-header {
    padding: var(--spacing-lg) var(--spacing-lg) 0 var(--spacing-lg);
  }
  
  .modal-body,
  .modal-footer {
    padding: var(--spacing-lg);
  }
  
  .info-row {
    grid-template-columns: 1fr;
  }
  
  .payment-details {
    grid-template-columns: 1fr;
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
</style>
