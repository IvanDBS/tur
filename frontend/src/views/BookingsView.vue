<template>
  <div class="page-layout">
    <div class="container">
      <h1 class="page-title animate-fade-in-up">Мои бронирования</h1>

      <div v-if="isLoading" class="loading">
        <div class="blue-spinner"></div>
        <p class="loading-text">Загрузка бронирований...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>Ошибка загрузки бронирований: {{ error }}</p>
        <button @click="loadBookings" class="retry-btn">Попробовать снова</button>
      </div>

      <div v-else-if="bookings.length === 0" class="empty-state">
        <p>У вас пока нет бронирований</p>
        <router-link to="/" class="cta-link"> Найти туры </router-link>
      </div>

      <div v-else>
        <div class="refresh-section">
          <button @click="loadBookings" class="refresh-btn">Обновить</button>
        </div>

        <div class="bookings-grid">
        <div v-for="booking in bookings" :key="booking.id" class="booking-card">
          <!-- Hotel Info -->
          <div class="hotel-info">
            <h3 class="hotel-name">{{ getHotelName(booking) }}</h3>
            <div class="hotel-details">
              <span class="stars">{{ getHotelCategory(booking) }}</span>
              <span class="location">{{ getHotelCity(booking) }}</span>
            </div>
          </div>

          <!-- Dates & Duration -->
          <div class="trip-info">
            <div class="dates">
              <span class="date">{{ formatDate(booking.created_at) }}</span>
            </div>
            <div class="duration">
              {{ getNights(booking) }}
              {{ getNightWord(getNights(booking)) }}
            </div>
            <div class="guests">
              {{ getAdults(booking) }} взрослых
              <span v-if="getChildren(booking) > 0">
                , {{ getChildren(booking) }} детей
              </span>
            </div>
          </div>

          <!-- Booking Info -->
          <div class="accommodation-info">
            <div class="booking-id">ID: {{ booking.obs_booking_hash }}</div>
            <div class="booking-date">Создано: {{ formatDate(booking.created_at) }}</div>
            <div v-if="booking.confirmed_at" class="confirmed-date">
              Подтверждено: {{ formatDate(booking.confirmed_at) }}
            </div>
          </div>

          <!-- Price -->
          <div class="price-info">
            <div class="price">{{ booking.total_amount }} EUR</div>
            <div class="price-type">{{ getStatusLabel(booking.status) }}</div>
          </div>

          <!-- Details Button -->
          <button class="details-btn" @click="viewDetails(booking.id)">
            Подробнее
          </button>
        </div>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <BookingDetailsModal 
      v-if="selectedBooking" 
      :booking="selectedBooking" 
      @close="closeModal" 
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { formatDate, getNightWord } from '../utils/dateUtils'
  import { apiClient } from '../utils/api'
  import { logger } from '../utils/logger'
  import BookingDetailsModal from '../components/booking/BookingDetailsModal.vue'

  interface Booking {
    id: number
    obs_booking_hash: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
    total_amount: string | number
    tour_details: Record<string, unknown>
    created_at: string
    confirmed_at?: string | null
    can_be_cancelled: boolean
  }

  // State
  const bookings = ref<Booking[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const selectedBooking = ref<Booking | null>(null)
  const router = useRouter()

  // Methods
  const loadBookings = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken')
      console.log('Auth token:', token ? 'Present' : 'Missing')
      
      logger.apiCall('GET', '/bookings')
      const response = await apiClient.get<{ success: boolean; data: { bookings: Booking[] } }>('/bookings')
      
      console.log('Bookings API response:', response)
      logger.info('Bookings loaded:', response.data?.bookings)
      bookings.value = response.data?.bookings || []
      console.log('Bookings value after assignment:', bookings.value)
      console.log('Bookings length:', bookings.value.length)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings'
      error.value = message
      console.error('Failed to load bookings:', err)
      logger.error('Failed to load bookings:', err)
      bookings.value = []
    } finally {
      isLoading.value = false
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

  const viewDetails = (bookingId: number) => {
    const booking = bookings.value.find(b => b.id === bookingId)
    if (booking) {
      selectedBooking.value = booking
    }
  }

  const closeModal = () => {
    selectedBooking.value = null
  }

  // Helper functions to extract data from booking
  const getHotelName = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getHotelName - tourDetails:', tourDetails)
    
    // Try different possible structures
    return tourDetails?.hotel?.name || 
           tourDetails?.hotel_name || 
           tourDetails?.accommodation?.hotel?.name ||
           tourDetails?.hotel?.hotel_name ||
           'Отель не указан'
  }

  const getHotelCategory = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getHotelCategory - tourDetails:', tourDetails)
    
    return tourDetails?.hotel?.category || 
           tourDetails?.hotel_category || 
           tourDetails?.accommodation?.hotel?.category ||
           tourDetails?.hotel?.hotel_category ||
           'Категория не указана'
  }

  const getHotelCity = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getHotelCity - tourDetails:', tourDetails)
    
    return tourDetails?.hotel?.city || 
           tourDetails?.city || 
           tourDetails?.accommodation?.hotel?.city ||
           tourDetails?.hotel?.hotel_city ||
           'Город не указан'
  }

  const getNights = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getNights - tourDetails:', tourDetails)
    
    return tourDetails?.nights?.total || 
           tourDetails?.nights || 
           tourDetails?.duration ||
           tourDetails?.hotel?.nights ||
           tourDetails?.accommodation?.nights ||
           0
  }

  const getAdults = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getAdults - tourDetails:', tourDetails)
    
    return tourDetails?.adults || 
           tourDetails?.tourists?.adults ||
           tourDetails?.hotel?.adults ||
           tourDetails?.accommodation?.adults ||
           0
  }

  const getChildren = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getChildren - tourDetails:', tourDetails)
    
    return tourDetails?.children || 
           tourDetails?.tourists?.children ||
           tourDetails?.hotel?.children ||
           tourDetails?.accommodation?.children ||
           0
  }

  const getCheckIn = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getCheckIn - tourDetails:', tourDetails)
    
    return tourDetails?.check_in || 
           tourDetails?.hotel?.check_in ||
           tourDetails?.dates?.check_in ||
           tourDetails?.accommodation?.check_in ||
           tourDetails?.selected_room?.check_in ||
           'N/A'
  }

  const getCheckOut = (booking: Booking) => {
    const tourDetails = booking.tour_details as any
    console.log('getCheckOut - tourDetails:', tourDetails)
    
    return tourDetails?.check_out || 
           tourDetails?.hotel?.check_out ||
           tourDetails?.dates?.check_out ||
           tourDetails?.accommodation?.check_out ||
           tourDetails?.selected_room?.check_out ||
           'N/A'
  }

  const getStatusText = (status: string) => {
    return getStatusLabel(status)
  }

  // Lifecycle
  onMounted(() => {
    // Check authentication status
    const token = localStorage.getItem('accessToken')
    console.log('Page mounted - Auth token:', token ? 'Present' : 'Missing')
    
    if (!token) {
      console.warn('No auth token found, redirecting to login')
      router.push({ name: 'home' })
      return
    }
    
    loadBookings()
  })
</script>

<style scoped>
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

  .error-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-soft);
  }

  .retry-btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 1rem;
  }

  .retry-btn:hover {
    background: var(--color-primary-hover);
  }

  .refresh-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .refresh-btn {
    padding: 0.5rem 1rem;
    background: var(--color-secondary);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .refresh-btn:hover {
    background: var(--color-secondary-hover);
  }

  .bookings-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .booking-card {
    background: white;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: grid;
    grid-template-columns: 3fr 1.5fr 2fr 1.5fr auto;
    gap: 1.5rem;
    align-items: center;
    min-height: 70px;
    width: 100%;
  }

  .booking-card:hover {
    border-color: var(--color-secondary);
    box-shadow: 0 4px 12px rgba(26, 60, 97, 0.1);
  }

  .hotel-info {
    grid-column: 1;
  }

  .hotel-name {
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
    font-size: 1rem;
    line-height: 1.3;
  }

  .hotel-details {
    display: flex;
    gap: 0.5rem;
    color: var(--color-text-soft);
    font-size: 0.85rem;
  }

  .stars {
    font-weight: 500;
  }

  .trip-info {
    grid-column: 2;
    margin-top: 0;
  }

  .dates {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    margin-bottom: 0.15rem;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .separator {
    color: var(--color-text-soft);
  }

  .duration {
    color: var(--color-text-soft);
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .guests {
    color: var(--color-text-soft);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .accommodation-info {
    grid-column: 3;
    margin-top: 0;
    color: var(--color-text-soft);
    font-size: 0.85rem;
  }

  .room {
    margin-bottom: 0.15rem;
    font-size: 0.85rem;
    line-height: 1.3;
  }

  .meal {
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .booking-id {
    font-size: 0.75rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .booking-date {
    font-size: 0.75rem;
    margin-bottom: 0.15rem;
  }

  .confirmed-date {
    font-size: 0.75rem;
    color: var(--color-primary);
    font-weight: 500;
  }

  .price-info {
    grid-column: 4;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .price {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-dark-gray);
    line-height: 1.2;
  }

  .price-type {
    color: var(--color-text-soft);
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    background: var(--color-background-soft);
    border-radius: 4px;
  }

  .details-btn {
    grid-column: 5;
    padding: 0.5rem 1rem;
    background: white;
    color: var(--color-secondary);
    border: 1px solid var(--color-secondary);
    border-radius: 6px;
    font-family: var(--font-family);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .details-btn:hover {
    background: var(--color-secondary-muted);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .bookings-page {
      min-height: calc(100vh - 64px - 200px);
      padding-top: 5rem;
      padding-bottom: 1rem;
    }

    .container {
      padding: 0 1rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .booking-card {
      grid-template-columns: 1fr auto;
      text-align: left;
      min-height: 60px;
      gap: 1rem;
      padding: 1rem;
    }

    .hotel-info {
      grid-column: 1;
    }

    .trip-info {
      grid-column: 1;
      margin-top: 0.25rem;
    }

    .accommodation-info {
      grid-column: 1;
      margin-top: 0.25rem;
    }

    .price-info {
      grid-column: 2;
      grid-row: 1 / span 3;
      text-align: right;
      align-items: flex-end;
    }

    .details-btn {
      grid-column: 1 / span 2;
      margin-top: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
  }
</style>
