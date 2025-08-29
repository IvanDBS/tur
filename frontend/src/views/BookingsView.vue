<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Мои бронирования
      </h1>
      
      <div v-if="isLoading" class="loading">
        <div class="blue-spinner"></div>
        <p>Загрузка бронирований...</p>
      </div>

      <div v-else-if="bookings.length === 0" class="no-bookings">
        <div class="empty-state">
          <p>У вас пока нет бронирований</p>
          <router-link to="/" class="cta-link">
            Найти туры
          </router-link>
        </div>
      </div>

      <div v-else class="bookings-list">
        <div 
          v-for="booking in bookings" 
          :key="booking.id"
          class="booking-card"
        >
          <!-- Status Badge -->
          <div class="status-badge" :class="booking.status">
            {{ getStatusText(booking.status) }}
          </div>

          <!-- Hotel Info -->
          <div class="booking-info">
            <h3 class="hotel-name">{{ booking.tour_details.hotel }}</h3>
            <div class="hotel-details">
              <span class="category">{{ booking.tour_details.hotel_category }}</span>
              <span class="location">{{ booking.tour_details.city }}</span>
            </div>
          </div>

          <!-- Trip Details -->
          <div class="trip-details">
            <div class="dates">
              <span class="label">Даты:</span>
              <span class="value">
                {{ formatDate(booking.tour_details.check_in) }} — 
                {{ formatDate(booking.tour_details.check_out) }}
              </span>
            </div>
            <div class="nights">
              <span class="label">Ночей:</span>
              <span class="value">{{ booking.tour_details.nights }}</span>
            </div>
            <div class="room">
              <span class="label">Номер:</span>
              <span class="value">{{ booking.tour_details.room }}</span>
            </div>
            <div class="meal">
              <span class="label">Питание:</span>
              <span class="value">{{ booking.tour_details.meal }}</span>
            </div>
          </div>

          <!-- Price & Actions -->
          <div class="booking-actions">
            <div class="price">
              {{ booking.total_amount }} EUR
            </div>
            <div class="actions">
              <button 
                v-if="booking.status === 'pending'" 
                @click="confirmBooking(booking.id)"
                class="action-btn primary"
              >
                Подтвердить
              </button>
              <button 
                v-if="booking.can_be_cancelled" 
                @click="cancelBooking(booking.id)"
                class="action-btn danger"
              >
                Отменить
              </button>
              <button 
                @click="viewDetails(booking.id)"
                class="action-btn secondary"
              >
                Подробнее
              </button>
            </div>
          </div>

          <!-- Booking Date -->
          <div class="booking-meta">
            Забронировано: {{ formatDateTime(booking.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Booking {
  id: number
  status: 'pending' | 'confirmed' | 'cancelled'
  total_amount: number
  tour_details: {
    hotel: string
    hotel_category: string
    city: string
    check_in: string
    check_out: string
    nights: number
    room: string
    meal: string
  }
  created_at: string
  can_be_cancelled: boolean
}

// State
const bookings = ref<Booking[]>([])
const isLoading = ref(true)

// Mock data for demonstration
const mockBookings: Booking[] = [
  {
    id: 1,
    status: 'confirmed',
    total_amount: 1712,
    tour_details: {
      hotel: 'ADALYA ARTSIDE HOTEL',
      hotel_category: '5* / HV1',
      city: 'SIDE',
      check_in: '2024-07-21',
      check_out: '2024-07-28',
      nights: 7,
      room: 'STANDARD ROOM LAND VIEW',
      meal: 'ULTRA ALL INCLUSIVE'
    },
    created_at: '2024-01-15T10:30:00Z',
    can_be_cancelled: true
  },
  {
    id: 2,
    status: 'pending',
    total_amount: 1959,
    tour_details: {
      hotel: 'ADALYA OCEAN DELUXE',
      hotel_category: '5* / HV1',
      city: 'SIDE',
      check_in: '2024-08-15',
      check_out: '2024-08-22',
      nights: 7,
      room: 'STANDARD ROOM LAND VIEW',
      meal: 'ULTRA ALL INCLUSIVE'
    },
    created_at: '2024-01-20T15:45:00Z',
    can_be_cancelled: false
  }
]

// Methods
const loadBookings = async () => {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    bookings.value = mockBookings
  } catch (error) {
    console.error('Failed to load bookings:', error)
    bookings.value = []
  } finally {
    isLoading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтвержден',
    cancelled: 'Отменен'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const confirmBooking = async (bookingId: number) => {
  try {
    // TODO: API call to confirm booking
    console.log('Confirming booking:', bookingId)
    
    // Update local state
    const booking = bookings.value.find(b => b.id === bookingId)
    if (booking) {
      booking.status = 'confirmed'
    }
  } catch (error) {
    console.error('Failed to confirm booking:', error)
  }
}

const cancelBooking = async (bookingId: number) => {
  if (!confirm('Вы уверены, что хотите отменить бронирование?')) return
  
  try {
    // TODO: API call to cancel booking
    console.log('Cancelling booking:', bookingId)
    
    // Update local state
    const booking = bookings.value.find(b => b.id === bookingId)
    if (booking) {
      booking.status = 'cancelled'
      booking.can_be_cancelled = false
    }
  } catch (error) {
    console.error('Failed to cancel booking:', error)
  }
}

const viewDetails = (bookingId: number) => {
  // TODO: Navigate to booking details page
  console.log('Viewing booking details:', bookingId)
}

// Lifecycle
onMounted(() => {
  loadBookings()
})
</script>

<style scoped>


.loading {
  text-align: center;
  padding: 3rem;
}

.blue-spinner {
  position: relative;
  width: 54px;
  height: 54px;
  border-top: 3px solid #A7D8F0;      /* голубой */
  border-bottom: 0;
  border-left: 3px solid #A7D8F0;     /* голубой */
  border-right: 3px solid transparent;
  animation: rotate 1.6s linear infinite;
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.blue-spinner::before {
  content: '';
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23FF5A5F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 11.6C20 10.96 19.44 10.4 18.8 10.4H14.4L10.4 4H8.8L10.8 10.4H6.4L5.2 8.8H4L4.8 11.6L4 14.4H5.2L6.4 12.8H10.8L8.8 19.2H10.4L14.4 12.8H18.8C19.44 12.8 20 12.24 20 11.6Z'/%3E%3C/svg%3E%0A");
  display: block;
  background-size: 30px;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  z-index: 999;
  top: -19px;
  left: 19px;
  width: 100%;
  height: 100%;
  text-align: center;
  transform: rotate(41deg);
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.no-bookings {
  text-align: center;
  padding: 4rem;
}

.empty-state p {
  color: var(--color-text-soft);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.cta-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.cta-link:hover {
  background: var(--color-primary-hover);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.booking-info {
  margin-bottom: 1rem;
}

.hotel-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  padding-right: 8rem; /* Space for status badge */
}

.hotel-details {
  display: flex;
  gap: 1rem;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.trip-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.trip-details > div {
  display: flex;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: var(--color-text-soft);
  min-width: 60px;
}

.value {
  color: var(--color-text);
}

.booking-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn.primary {
  background: var(--color-primary);
  color: white;
}

.action-btn.primary:hover {
  background: var(--color-primary-hover);
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.action-btn.secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.action-btn.secondary:hover {
  background: var(--color-primary);
  color: white;
}

.booking-meta {
  color: var(--color-text-soft);
  font-size: 0.8rem;
  text-align: right;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .hotel-name {
    padding-right: 0;
    margin-bottom: 2rem;
  }
  
  .status-badge {
    position: static;
    display: inline-block;
    margin-bottom: 1rem;
  }
  
  .booking-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .actions {
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
  }
}
</style>
