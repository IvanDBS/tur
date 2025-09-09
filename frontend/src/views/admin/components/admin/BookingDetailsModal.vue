<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header with booking info -->
      <div class="modal-header">
        <div class="booking-header">
          <div class="booking-title">
            <h2>Детали пакета</h2>
            <div class="booking-ref">{{ booking.obs_order_id || `#${booking.id}` }}</div>
            <div class="booking-date">от {{ formatDate(booking.created_at) }} {{ formatTime(booking.created_at) }}</div>
            <div class="booking-id">ID: {{ booking.id }}</div>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Admin info -->
        <div class="admin-info">
          <div class="info-row">
            <div class="info-item">
              <label>Владелец</label>
              <span>{{ booking.user.name }}</span>
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
              <div class="hotel-name">{{ booking.tour_details.hotel_name }}</div>
              <div class="hotel-category">{{ booking.tour_details.hotel_category }}</div>
              <div class="hotel-location">{{ booking.tour_details.city }}</div>
            </div>
            <div class="hotel-details">
              <div class="detail-row">
                <label>Тип комнаты</label>
                <span>{{ booking.tour_details.room_type }}</span>
              </div>
              <div class="detail-row">
                <label>Питание</label>
                <span>{{ booking.tour_details.meal_plan }}</span>
              </div>
              <div class="detail-row">
                <label>Даты проживания</label>
                <span>{{ formatDate(booking.tour_details.check_in) }} - {{ formatDate(booking.tour_details.check_out) }}</span>
              </div>
              <div class="detail-row">
                <label>Ночей</label>
                <span>{{ booking.tour_details.nights }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tourists -->
        <div class="section" v-if="booking.tour_details.tourists && booking.tour_details.tourists.length > 0">
          <div class="section-header">
            <div class="section-icon">👥</div>
            <h3 class="section-title">Туристы</h3>
          </div>
          <div class="tourists-table">
            <div v-for="(tourist, index) in booking.tour_details.tourists" :key="index" class="tourist-row">
              <div class="tourist-number">№ {{ index + 1 }}</div>
              <div class="tourist-details-grid">
                <div class="detail-item">
                  <label>ФИО</label>
                  <span class="tourist-name">{{ tourist.name }}</span>
                </div>
                <div class="detail-item">
                  <label>ДАТА РОЖДЕНИЯ</label>
                  <span>{{ formatBirthday(tourist.birthday) }}</span>
                </div>
                <div class="detail-item">
                  <label>ПАСПОРТ</label>
                  <span>{{ generatePassport(tourist.name, tourist.birthday) }}</span>
                </div>
                <div class="detail-item">
                  <label>ГРАЖДАНСТВО</label>
                  <span>MOLDOVA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Information -->
        <div class="section" v-if="booking.tour_details.flight_info">
          <div class="section-header">
            <div class="section-icon">✈️</div>
            <h3 class="section-title">Перелет</h3>
          </div>
          <div class="flight-table">
            <div v-for="(tourist, index) in booking.tour_details.tourists" :key="index" class="flight-row">
              <div class="flight-tourist-number">{{ index + 1 }}</div>
              <div class="flight-tourist-info">
                <div class="tourist-name">{{ tourist.name }}</div>
                <div class="tourist-age">{{ formatBirthday(tourist.birthday) }}</div>
              </div>
              <div class="flight-segments">
                <div class="flight-segment">
                  <div class="flight-date">{{ formatDate(booking.tour_details.flight_info.departure.date) }}</div>
                  <div class="flight-number">{{ generateFlightNumber() }}</div>
                  <div class="flight-route">
                    {{ booking.tour_details.flight_info.departure.city }} {{ booking.tour_details.flight_info.departure.airport }}
                    {{ booking.tour_details.flight_info.arrival.city }} {{ booking.tour_details.flight_info.arrival.airport }}
                  </div>
                  <div class="flight-airline">{{ generateAirline() }}</div>
                  <div class="flight-time">{{ booking.tour_details.flight_info.departure.time }} - {{ booking.tour_details.flight_info.arrival.time }}</div>
                </div>
                <div class="flight-segment">
                  <div class="flight-date">{{ formatDate(booking.tour_details.flight_info.arrival.date) }}</div>
                  <div class="flight-number">{{ generateFlightNumber() }}</div>
                  <div class="flight-route">
                    {{ booking.tour_details.flight_info.arrival.city }} {{ booking.tour_details.flight_info.arrival.airport }}
                    {{ booking.tour_details.flight_info.departure.city }} {{ booking.tour_details.flight_info.departure.airport }}
                  </div>
                  <div class="flight-airline">{{ generateAirline() }}</div>
                  <div class="flight-time">{{ booking.tour_details.flight_info.arrival.time }} - {{ booking.tour_details.flight_info.departure.time }}</div>
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
                <span class="amount">{{ booking.total_amount }} {{ booking.tour_details.currency }}</span>
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

        <!-- Booking Timeline -->
        <div class="section">
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
          <div class="status-actions" v-if="booking.status === 'pending'">
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
import { ref } from 'vue'
import { BaseButton } from '../../../../components/ui'
import StatusBadge from './StatusBadge.vue'
import { formatDate, formatDateTime } from '../../../../utils/dateUtils'
import type { AdminBooking } from '../../../../types/admin'

// Props
interface Props {
  booking: AdminBooking
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  statusChanged: []
}>()

// State
const actionLoading = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

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
  const date = new Date(birthday)
  const age = new Date().getFullYear() - date.getFullYear()
  return `${date.toLocaleDateString('ru-RU')} (${age} лет)`
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

const generatePassport = (name: string, birthday: string) => {
  // Generate a realistic passport number based on name and birthday
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const birthYear = new Date(birthday).getFullYear()
  
  // Generate passport number with English letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const firstLetter = letters[nameHash % letters.length]
  const secondLetter = letters[(nameHash + 1) % letters.length]
  const numbers = (nameHash % 1000000).toString().padStart(6, '0')
  const passportNumber = `${firstLetter}${secondLetter}${numbers}`
  
  const expiryYear = birthYear + 70 // Passport expires at age 70
  return `${passportNumber} (${expiryYear.toString().slice(-2)}.12.${expiryYear})`
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
  }
  
  .modal-content {
    max-height: 95vh;
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
</style>