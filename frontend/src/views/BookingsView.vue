<template>
  <div class="page-layout">
    <div class="container">
      <h1 class="page-title animate-fade-in-up">Мои бронирования</h1>

      <div v-if="isLoading" class="loading">
        <div class="blue-spinner"></div>
        <p class="loading-text">Загрузка бронирований...</p>
      </div>

      <div v-else-if="bookings.length === 0" class="empty-state">
        <p>У вас пока нет бронирований</p>
        <router-link to="/" class="cta-link"> Найти туры </router-link>
      </div>

      <div v-else class="bookings-grid">
        <div v-for="booking in bookings" :key="booking.id" class="booking-card">
          <!-- Hotel Info -->
          <div class="hotel-info">
            <h3 class="hotel-name">{{ booking.tour_details.hotel }}</h3>
            <div class="hotel-details">
              <span class="stars">{{
                booking.tour_details.hotel_category
              }}</span>
              <span class="location">{{ booking.tour_details.city }}</span>
            </div>
          </div>

          <!-- Dates & Duration -->
          <div class="trip-info">
            <div class="dates">
              <span class="date">{{
                formatDate(booking.tour_details.check_in)
              }}</span>
              <span class="separator">—</span>
              <span class="date">{{
                formatDate(booking.tour_details.check_out)
              }}</span>
            </div>
            <div class="duration">
              {{ booking.tour_details.nights }}
              {{ getNightWord(booking.tour_details.nights) }}
            </div>
          </div>

          <!-- Room & Meal -->
          <div class="accommodation-info">
            <div class="room">{{ booking.tour_details.room }}</div>
            <div class="meal">{{ booking.tour_details.meal }}</div>
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
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { formatDate, getNightWord } from '../utils/dateUtils'

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
        meal: 'ULTRA ALL INCLUSIVE',
      },
      created_at: '2024-01-15T10:30:00Z',
      can_be_cancelled: true,
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
        meal: 'ULTRA ALL INCLUSIVE',
      },
      created_at: '2024-01-20T15:45:00Z',
      can_be_cancelled: false,
    },
  ]

  // Methods
  const loadBookings = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      bookings.value = mockBookings
    } catch {
      // Error handling - bookings will remain empty
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
    }
    return statusMap[status] || status
  }

  // TODO: Implement booking confirmation
  // const confirmBooking = async (_bookingId: number) => {
  //   // TODO: API call to confirm booking
  // }

  // TODO: Implement booking cancellation
  // const cancelBooking = async (_bookingId: number) => {
  //   // TODO: API call to cancel booking
  // }

  // const viewDetails = (bookingId: number) => {
  //   // TODO: Navigate to booking details page
  // }

  // Lifecycle
  onMounted(() => {
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
