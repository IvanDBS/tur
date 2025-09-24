<template>
  <div class="admin-bookings">

    <!-- Sync Controls -->
    <div class="sync-controls">
      <button 
        @click="syncAllBookings" 
        :disabled="syncing"
        class="btn btn-primary"
        title="Синхронизировать все"
      >
        <span v-if="syncing">Синхронизация...</span>
        <span v-else class="sync-button-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Синхронизировать
        </span>
      </button>
      
      <button 
        @click="openNotificationModal" 
        :disabled="bookings.length === 0"
        class="btn btn-outline"
        title="Отправить уведомления выбранным пользователям"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        Уведомить пользователей ({{ bookings.length }})
      </button>
      
      <span class="sync-info">
        Последняя синхронизация: {{ lastSyncTime || 'Никогда' }}
      </span>
      
      <button 
        @click="clearAllFilters" 
        class="btn btn-outline"
        title="Сбросить все фильтры"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
        Сбросить фильтры
      </button>
    </div>

    <!-- Bookings Table -->
    <div class="bookings-table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка бронирований...</p>
      </div>

      <div v-else class="bookings-table">
        <table class="table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('id')">
                #
                <span v-if="sortField === 'id'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('operator')">
                Оператор
                <span v-if="sortField === 'operator'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('operator_id')">
                ID
                <span v-if="sortField === 'operator_id'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('booking_number')">
                Номера оператора
                <span v-if="sortField === 'booking_number'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('created_at')">
                Дата брони
                <span v-if="sortField === 'created_at'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('country')">
                Страна
                <span v-if="sortField === 'country'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('hotel_name')">
                Отель
                <span v-if="sortField === 'hotel_name'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('check_in')">
                Заезд
                <span v-if="sortField === 'check_in'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('check_out')">
                Выезд
                <span v-if="sortField === 'check_out'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('tourists')">
                Туристы
                <span v-if="sortField === 'tourists'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('departure_flight')">
                Рейс туда
                <span v-if="sortField === 'departure_flight'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('arrival_flight')">
                Рейс назад
                <span v-if="sortField === 'arrival_flight'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('total_amount')">
                Цена
                <span v-if="sortField === 'total_amount'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('user_name')">
                Пользователь
                <span v-if="sortField === 'user_name'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('status')">
                Статус
                <span v-if="sortField === 'status'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('operator_status')">
                Статус оператора
                <span v-if="sortField === 'operator_status'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="actions-column">
                Действия
              </th>
            </tr>
            <!-- Search row -->
            <tr class="search-row">
              <td>
                <BaseInput
                  v-model="searchFilters.id"
                  placeholder="ID..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseSelect
                  v-model="searchFilters.operator"
                  :options="operatorOptions"
                  placeholder="Все"
                  size="xs"
                  @update:model-value="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.operator_id"
                  placeholder="ID оператора..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.booking_number"
                  placeholder="Номер..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <input
                  v-model="searchFilters.created_at"
                  type="date"
                  class="form-input form-input--xs"
                  @change="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.country"
                  placeholder="Страна..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.hotel_name"
                  placeholder="Отель..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <input
                  v-model="searchFilters.check_in"
                  type="date"
                  class="form-input form-input--xs"
                  @change="debouncedSearch"
                />
              </td>
              <td>
                <input
                  v-model="searchFilters.check_out"
                  type="date"
                  class="form-input form-input--xs"
                  @change="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.tourists"
                  placeholder="Туристы..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.departure_flight"
                  placeholder="Номер или дата..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.arrival_flight"
                  placeholder="Номер или дата..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.total_amount"
                  placeholder="Цена..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.user_name"
                  placeholder="Пользователь..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseSelect
                  v-model="searchFilters.status"
                  :options="statusFilterOptions"
                  placeholder="Все"
                  size="xs"
                  @update:model-value="debouncedSearch"
                />
              </td>
              <td>
                <BaseSelect
                  v-model="searchFilters.operator_status"
                  :options="operatorStatusFilterOptions"
                  placeholder="Все"
                  size="xs"
                  @update:model-value="debouncedSearch"
                />
              </td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bookings.length === 0" class="empty-row">
              <td colspan="17" class="empty-message">
                Бронирования не найдены
              </td>
            </tr>
            <tr v-for="booking in bookings" :key="booking.id" class="table-row">
              <td class="booking-id">{{ booking.id }}</td>
              <td class="operator">{{ getOperator() }}</td>
              <td class="operator-id">{{ booking.operator_id || 'N/A' }}</td>
              <td class="booking-number">{{ booking.obs_order_id || 'N/A' }}</td>
              <td class="booking-date">{{ formatDateDDMMYYYY(booking.created_at) }}</td>
              <td class="country">{{ getCountryFromCity(getHotelCity(booking)) }}</td>
              <td class="hotel-info">
                <div class="hotel-name">{{ getHotelName(booking) }}</div>
              </td>
              <td class="check-in">{{ getCheckInDate(booking) }}</td>
              <td class="check-out">{{ getCheckOutDate(booking) }}</td>
              <td class="tourists">
                <div class="tourists-list">{{ getTouristsNames(booking) }}</div>
              </td>
              <td class="departure-flight">
                <div v-if="getDepartureFlight(booking)">
                  <div class="flight-date">{{ normalizeDate(getDepartureFlight(booking).date) || 'N/A' }}</div>
                  <div class="flight-number">{{ getFlightNumber(getDepartureFlight(booking)) }}</div>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="arrival-flight">
                <div v-if="getArrivalFlight(booking)">
                  <div class="flight-date">{{ normalizeDate(getArrivalFlight(booking).date) || 'N/A' }}</div>
                  <div class="flight-number">{{ getFlightNumber(getArrivalFlight(booking)) }}</div>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="amount">{{ booking.total_amount }} €</td>
              <td class="owner">
                <div class="user-name">{{ booking.user.first_name || booking.user.email.split('@')[0] }}</div>
                <div class="user-email">{{ booking.user.email }}</div>
              </td>
              <td class="status">
                <StatusBadge :status="booking.status" class="table-status-badge" />
              </td>
              <td class="operator-status">
                <StatusBadge :status="getOperatorStatus(booking)" class="table-status-badge" />
              </td>
              <td class="actions">
                <button 
                  class="action-btn sync-btn" 
                  @click="syncBooking(booking)"
                  :disabled="syncing"
                  title="Синхронизировать статус"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
                <button 
                  class="action-btn edit-btn" 
                  @click="viewDetails(booking)"
                  :disabled="selectedBooking !== null"
                  title="Просмотреть детали"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && bookings.length > 0" class="pagination-section">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Booking Details Modal -->
    <Suspense>
      <template #default>
        <BookingDetailsModal
          v-if="selectedBooking"
          :booking="selectedBooking"
          :is-admin-mode="true"
          @close="selectedBooking = null"
          @status-changed="handleStatusChanged"
        />
      </template>
      <template #fallback>
        <div v-if="selectedBooking" class="modal-overlay">
          <div class="modal-content">
            <div class="loading-spinner">Загрузка...</div>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- Notification Modal -->
    <NotificationBulkModal
      v-if="showNotificationModal"
      :pre-selected-users="selectedUsersForNotification"
      @close="showNotificationModal = false"
      @created="handleNotificationSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BaseSelect, BaseInput } from '../../components/ui'
import { Pagination } from '../../components'
import { StatusBadge } from '../../components/ui'
import BookingDetailsModal from '../../components/booking/BookingDetailsModal.vue'
import { default as NotificationBulkModal } from '../../components/admin/NotificationBulkModal.vue'
import { debounce } from '../../utils/debounce'
import { useAdminApi } from '../../composables/useAdminApi'
import type { AdminBooking } from '../../types/admin'

// Admin API
const { getAdminBookings, syncAllBookings: apiSyncAllBookings, syncBookingStatus: apiSyncBooking } = useAdminApi()
const loading = ref(false)

// State
const allBookings = ref<AdminBooking[]>([])
const selectedBooking = ref<AdminBooking | null>(null)
const currentPage = ref(1)
const syncing = ref(false)
const lastSyncTime = ref<string | null>(null)
const totalPages = ref(1)
const totalCount = ref(0)

// Notification modal state
const showNotificationModal = ref(false)
const selectedUsersForNotification = ref<number[]>([])

// Computed filtered bookings
const bookings = computed(() => {
  let filtered = allBookings.value

  // Filter by ID if specified
  if (searchFilters.value.id && searchFilters.value.id.trim()) {
    const searchId = searchFilters.value.id.trim()
    filtered = filtered.filter(booking => 
      booking.id.toString() === searchId
    )
  }

  // Filter by operator if specified
  if (searchFilters.value.operator && searchFilters.value.operator.trim()) {
    filtered = filtered.filter(() => 
      getOperator() === searchFilters.value.operator
    )
  }

  // Filter by operator_id if specified
  if (searchFilters.value.operator_id && searchFilters.value.operator_id.trim()) {
    filtered = filtered.filter(booking => 
      booking.operator_id && booking.operator_id.toString().includes(searchFilters.value.operator_id)
    )
  }

  // Filter by booking number if specified
  if (searchFilters.value.booking_number && searchFilters.value.booking_number.trim()) {
    const searchNumber = searchFilters.value.booking_number.trim().toLowerCase()
    filtered = filtered.filter(booking => 
      (booking.obs_order_id || '').toLowerCase().includes(searchNumber)
    )
  }

  // Filter by hotel name if specified
  if (searchFilters.value.hotel_name && searchFilters.value.hotel_name.trim()) {
    const searchHotel = searchFilters.value.hotel_name.trim().toLowerCase()
    filtered = filtered.filter(booking => 
      getHotelName(booking).toLowerCase().includes(searchHotel)
    )
  }

  // Filter by user name if specified
  if (searchFilters.value.user_name && searchFilters.value.user_name.trim()) {
    const searchUser = searchFilters.value.user_name.trim().toLowerCase()
    filtered = filtered.filter(booking => 
      (booking.user.first_name || booking.user.email).toLowerCase().includes(searchUser)
    )
  }

  // Filter by status if specified
  if (searchFilters.value.status && searchFilters.value.status.trim()) {
    filtered = filtered.filter(booking => 
      booking.status === searchFilters.value.status
    )
  }

  // Filter by operator status if specified
  if (searchFilters.value.operator_status && searchFilters.value.operator_status.trim()) {
    filtered = filtered.filter(booking => 
      getOperatorStatus(booking) === searchFilters.value.operator_status
    )
  }

  // Filter by departure flight if specified
  if (searchFilters.value.departure_flight && searchFilters.value.departure_flight.trim()) {
    const searchFlight = searchFilters.value.departure_flight.trim().toLowerCase()
    filtered = filtered.filter(booking => {
      const departure = getDepartureFlight(booking)
      if (!departure) return false
      
      const flightNumber = getFlightNumber(departure).toLowerCase()
      const flightDate = formatDateDDMMYYYY(departure.date).toLowerCase()
      
      // Check if search term is a date and try both formats
      if (/^\d{1,2}\.\d{1,2}\.\d{3,4}$/.test(searchFlight)) {
        const parts = searchFlight.split('.')
        if (parts.length === 3) {
          const [first, second, year] = parts
          // Since data is in DD.MM.YYYY format, try both interpretations:
          // 1. User input as DD.MM.YYYY (direct match)
          // 2. User input as MM.DD.YYYY (swap day and month)
          const format1 = `${first.padStart(2, '0')}.${second.padStart(2, '0')}.${year.padStart(4, '0')}` // DD.MM.YYYY
          const format2 = `${second.padStart(2, '0')}.${first.padStart(2, '0')}.${year.padStart(4, '0')}` // MM.DD.YYYY -> DD.MM.YYYY
          
          // Check if either format matches
          return flightNumber.includes(searchFlight) || 
                 flightDate.includes(format1) || 
                 flightDate.includes(format2)
        }
      }
      
      return flightNumber.includes(searchFlight) || flightDate.includes(searchFlight)
    })
  }


  // Filter by arrival flight if specified
  if (searchFilters.value.arrival_flight && searchFilters.value.arrival_flight.trim()) {
    const searchFlight = searchFilters.value.arrival_flight.trim().toLowerCase()
    filtered = filtered.filter(booking => {
      const arrival = getArrivalFlight(booking)
      if (!arrival) return false
      
      const flightNumber = getFlightNumber(arrival).toLowerCase()
      const flightDate = formatDateDDMMYYYY(arrival.date).toLowerCase()
      
      // Check if search term is a date and try both formats
      if (/^\d{1,2}\.\d{1,2}\.\d{3,4}$/.test(searchFlight)) {
        const parts = searchFlight.split('.')
        if (parts.length === 3) {
          const [first, second, year] = parts
          // Since data is in DD.MM.YYYY format, try both interpretations:
          // 1. User input as DD.MM.YYYY (direct match)
          // 2. User input as MM.DD.YYYY (swap day and month)
          const format1 = `${first.padStart(2, '0')}.${second.padStart(2, '0')}.${year.padStart(4, '0')}` // DD.MM.YYYY
          const format2 = `${second.padStart(2, '0')}.${first.padStart(2, '0')}.${year.padStart(4, '0')}` // MM.DD.YYYY -> DD.MM.YYYY
          
          // Check if either format matches
          return flightNumber.includes(searchFlight) || 
                 flightDate.includes(format1) || 
                 flightDate.includes(format2)
        }
      }
      
      return flightNumber.includes(searchFlight) || flightDate.includes(searchFlight)
    })
  }

  // Filter by tourists if specified
  if (searchFilters.value.tourists && searchFilters.value.tourists.trim()) {
    const searchTourists = searchFilters.value.tourists.trim().toLowerCase()
    filtered = filtered.filter(booking => {
      const touristsNames = getTouristsNames(booking).toLowerCase()
      return touristsNames.includes(searchTourists)
    })
  }

  // Filter by created_at date if specified
  if (searchFilters.value.created_at && searchFilters.value.created_at.trim()) {
    const searchDate = searchFilters.value.created_at.trim()
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.created_at)
      const filterDate = new Date(searchDate)
      
      // Compare dates (ignore time)
      return bookingDate.toDateString() === filterDate.toDateString()
    })
  }

  // Filter by check_in date if specified
  if (searchFilters.value.check_in && searchFilters.value.check_in.trim()) {
    const searchDate = searchFilters.value.check_in.trim()
    filtered = filtered.filter(booking => {
      const checkInDate = getCheckInDate(booking)
      if (checkInDate === 'N/A') return false
      
      // Convert DD.MM.YYYY to YYYY-MM-DD for comparison
      const [day, month, year] = checkInDate.split('.')
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      
      return formattedDate === searchDate
    })
  }

  // Filter by check_out date if specified
  if (searchFilters.value.check_out && searchFilters.value.check_out.trim()) {
    const searchDate = searchFilters.value.check_out.trim()
    filtered = filtered.filter(booking => {
      const checkOutDate = getCheckOutDate(booking)
      if (checkOutDate === 'N/A') return false
      
      // Convert DD.MM.YYYY to YYYY-MM-DD for comparison
      const [day, month, year] = checkOutDate.split('.')
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      
      return formattedDate === searchDate
    })
  }

  return filtered
})

const filters = ref({
  status: '',
  search: ''
})

// Search filters for each column
const searchFilters = ref({
  id: '',
  operator: '',
  operator_id: '',
  booking_number: '',
  created_at: '',
  country: '',
  hotel_name: '',
  check_in: '',
  check_out: '',
  tourists: '',
  departure_flight: '',
  arrival_flight: '',
  total_amount: '',
  user_name: '',
  status: '',
  operator_status: ''
})

// Sorting state
const sortField = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Options
// const statusOptions = [
//   { value: '', label: 'Все статусы' },
//   { value: 'pending', label: 'В ожидании' },
//   { value: 'confirmed', label: 'Подтверждено' },
//   { value: 'cancelled', label: 'Отменено' },
//   { value: 'failed', label: 'Ошибка' }
// ]

const statusFilterOptions = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'Ожидающие' },
  { value: 'processing', label: 'Обрабатывается' },
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'changed', label: 'Изменено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'failed', label: 'Ошибка' },
  { value: 'expired', label: 'Истекло' }
]

const operatorStatusFilterOptions = [
  { value: '', label: 'Все' },
  { value: 'wait', label: 'Ожидание' },
  { value: 'changed', label: 'Изменен' },
  { value: 'confirmed', label: 'Подтвержден' },
  { value: 'canceling', label: 'Отменяется' },
  { value: 'canceled', label: 'Отменен' },
  { value: 'not_confirmed', label: 'Не подтвержден' },
  { value: 'penalty', label: 'Штраф' }
]

const operatorOptions = [
  { value: '', label: 'Все' },
  { value: 'OBS', label: 'OBS' },
  { value: 'operator2', label: 'Оператор 2' },
  { value: 'operator3', label: 'Оператор 3' }
]

// Debounced search
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  // For local filters (ID, operator, etc.), no need to reload from server
  // The computed property will handle filtering
}, 500)

// Methods
const loadBookings = async () => {
  loading.value = true
  try {
    // Combine all search filters into a single search string
    const searchTerms = []
    Object.entries(searchFilters.value).forEach(([key, value]) => {
      if (value && value.trim()) {
        // For ID field, use exact search
        if (key === 'id') {
          searchTerms.push(value.trim())
        } else {
          searchTerms.push(`${key}:${value.trim()}`)
        }
      }
    })
    
    // Also include the main search filter
    if (filters.value.search && filters.value.search.trim()) {
      searchTerms.push(filters.value.search.trim())
    }
    
    const combinedSearch = searchTerms.length > 0 ? searchTerms.join(' ') : undefined
    
    const response = await getAdminBookings({
      page: currentPage.value,
      per_page: 20,
      status: filters.value.status || searchFilters.value.status || undefined,
      search: combinedSearch,
      sort_field: sortField.value || undefined,
      sort_direction: sortDirection.value || undefined,
      _t: Date.now() // Add timestamp to prevent caching
    })
    
    console.log('API Response:', response)
    console.log('Bookings from API:', (response as any).data?.bookings || (response as any).bookings)
    
    
    // API returns data in response.data structure
    const data = (response as any).data || response as {
      bookings?: unknown[]
      pagination?: {
        total_pages: number
        total_count: number
      }
    }
    
    
    // Transform API data to match AdminBooking interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allBookings.value = (data.bookings || []).map((booking: any) => {
      console.log(`Processing booking ${booking.id}: operator_status="${booking.operator_status}"`)
      // Parse tour_details if it's a string
      let tourDetails = booking.tour_details
      if (typeof tourDetails === 'string') {
        try {
          tourDetails = JSON.parse(tourDetails)
        } catch {
          tourDetails = {}
        }
      }
      
      // Parse customer_data if it's a string
      let customerData = booking.customer_data
      if (typeof customerData === 'string') {
        try {
          customerData = JSON.parse(customerData)
        } catch {
          customerData = {}
        }
      }
      
      return {
        id: booking.id,
        user: booking.user,
        status: booking.status,
        operator_status: booking.operator_status,
        total_amount: booking.total_amount,
        tour_details: tourDetails, // Keep original OBS structure
        customer_data: customerData,
        created_at: booking.created_at,
        confirmed_at: booking.confirmed_at,
        cancelled_at: booking.cancelled_at,
        obs_booking_hash: booking.obs_booking_hash,
        obs_order_id: booking.obs_order_id,
        operator_id: booking.operator_id,
        search_query: booking.search_query,
        can_be_cancelled: false
      }
    })
    
    totalPages.value = data.pagination?.total_pages || 1
    totalCount.value = data.pagination?.total_count || 0
    
  } catch (error: any) {
    console.error('Failed to load bookings:', error)
    // Fallback to empty array on error
    allBookings.value = []
    totalPages.value = 1
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// const resetFilters = () => {
//   filters.value = { status: '', search: '' }
//   currentPage.value = 1
//   loadBookings()
// }

const clearAllFilters = () => {
  // Clear main filters
  filters.value = { status: '', search: '' }
  
  // Clear search filters
  searchFilters.value = {
    id: '',
    operator: '',
    operator_id: '',
    booking_number: '',
    created_at: '',
    country: '',
    hotel_name: '',
    check_in: '',
    check_out: '',
    tourists: '',
    departure_flight: '',
    arrival_flight: '',
    total_amount: '',
    user_name: '',
    status: '',
    operator_status: ''
  }
  
  // Clear sorting
  sortField.value = ''
  sortDirection.value = 'asc'
  
  currentPage.value = 1
  loadBookings()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadBookings()
}

const viewDetails = (booking: AdminBooking) => {
  // Предотвращаем множественные клики
  if (selectedBooking.value) {
    return
  }
  
  selectedBooking.value = booking
}


const handleStatusChanged = () => {
  selectedBooking.value = null
  loadBookings()
}

// Notification functions
const openNotificationModal = () => {
  // Get unique user IDs from filtered bookings
  const userIds = [...new Set(bookings.value.map(booking => booking.user.id))]
  console.log('Filtered bookings count:', bookings.value.length)
  console.log('Unique user IDs:', userIds)
  console.log('User IDs count:', userIds.length)
  selectedUsersForNotification.value = userIds
  showNotificationModal.value = true
}

const handleNotificationSent = () => {
  showNotificationModal.value = false
  selectedUsersForNotification.value = []
  console.log('Уведомления отправлены пользователям с заявками на выбранную дату')
}

// Sync functions
const syncAllBookings = async () => {
  try {
    syncing.value = true
    await apiSyncAllBookings()
    
    // Update last sync time
    lastSyncTime.value = new Date().toLocaleString('ru-RU')
    
    console.log('Синхронизация всех заявок запущена')
    
    // Wait for the jobs to complete with retries
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      await loadBookings()
      
      // Check if any bookings have been updated (count bookings with unknown/N/A status)
      const unknownStatusCount = allBookings.value.filter(b => 
        !b.operator_status || b.operator_status === 'unknown' || b.operator_status === 'N/A'
      ).length
      
      console.log(`Попытка ${attempts + 1}/${maxAttempts} - осталось ${unknownStatusCount} заявок с неизвестным статусом`)
      
      if (unknownStatusCount === 0) {
        console.log('Все заявки синхронизированы успешно')
        break
      }
      
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      console.log('Синхронизация может занять больше времени')
    }
    
  } catch (error: unknown) {
    console.error('Failed to sync all bookings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    alert(`Ошибка синхронизации всех заявок: ${errorMessage}`)
  } finally {
    syncing.value = false
  }
}

const syncBooking = async (booking: AdminBooking) => {
  try {
    syncing.value = true
    const originalStatus = booking.operator_status
    await apiSyncBooking(booking.id.toString())
    
    console.log(`Синхронизация заявки ${booking.id} запущена (исходный статус: "${originalStatus}")`)
    
    // Wait for the job to complete with retries
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadBookings()
      
      // Check if the booking status has been updated
      const updatedBooking = allBookings.value.find(b => b.id === booking.id)
      console.log(`Заявка ${booking.id}: исходный статус="${originalStatus}", текущий статус="${updatedBooking?.operator_status}"`)
      
      // Check if status has changed from unknown/N/A to a real status
      if (updatedBooking && updatedBooking.operator_status && 
          updatedBooking.operator_status !== 'unknown' && 
          updatedBooking.operator_status !== 'N/A' &&
          (originalStatus === 'unknown' || originalStatus === 'N/A' || !originalStatus)) {
        console.log(`Заявка ${booking.id} синхронизирована успешно: ${originalStatus} -> ${updatedBooking.operator_status}`)
        break
      }
      
      // Also check if status changed from one real status to another
      if (updatedBooking && updatedBooking.operator_status && 
          updatedBooking.operator_status !== originalStatus &&
          originalStatus && originalStatus !== 'unknown' && originalStatus !== 'N/A') {
        console.log(`Заявка ${booking.id} синхронизирована успешно: ${originalStatus} -> ${updatedBooking.operator_status}`)
        break
      }
      
      attempts++
      console.log(`Попытка ${attempts}/${maxAttempts} для заявки ${booking.id}`)
    }
    
    if (attempts >= maxAttempts) {
      console.log(`Заявка ${booking.id} - синхронизация может занять больше времени`)
    }
    
  } catch (error: unknown) {
    console.error('Failed to sync booking:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    alert(`Ошибка синхронизации заявки ${booking.id}: ${errorMessage}`)
  } finally {
    syncing.value = false
  }
}

// Sorting methods
const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  
  // Apply client-side sorting
  sortBookings()
}

const sortBookings = () => {
  if (!sortField.value) return
  
  bookings.value.sort((a, b) => {
    let aValue: unknown
    let bValue: unknown
    
    switch (sortField.value) {
      case 'id':
        aValue = Number(a.id)
        bValue = Number(b.id)
        break
      case 'booking_number':
        aValue = a.obs_order_id || ''
        bValue = b.obs_order_id || ''
        break
      case 'created_at':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      case 'country':
        aValue = getCountryFromCity(a.tour_details.city || '')
        bValue = getCountryFromCity(b.tour_details.city || '')
        break
      case 'hotel_name':
        aValue = getHotelName(a)
        bValue = getHotelName(b)
        break
      case 'check_in':
        aValue = getCheckInDate(a)
        bValue = getCheckInDate(b)
        break
      case 'check_out':
        aValue = getCheckOutDate(a)
        bValue = getCheckOutDate(b)
        break
      case 'tourists_count':
        aValue = getTouristsCount(a)
        bValue = getTouristsCount(b)
        break
      case 'departure_flight':
        aValue = getDepartureFlight(a)?.date || ''
        bValue = getDepartureFlight(b)?.date || ''
        break
      case 'arrival_flight':
        aValue = getArrivalFlight(a)?.date || ''
        bValue = getArrivalFlight(b)?.date || ''
        break
      case 'total_amount':
        aValue = a.total_amount
        bValue = b.total_amount
        break
      case 'user_name':
        aValue = a.user.first_name || a.user.email.split('@')[0]
        bValue = b.user.first_name || b.user.email.split('@')[0]
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'operator_status':
        aValue = getOperatorStatus(a)
        bValue = getOperatorStatus(b)
        break
      case 'operator':
        aValue = getOperator()
        bValue = getOperator()
        break
      case 'operator_id':
        aValue = a.operator_id || 0
        bValue = b.operator_id || 0
        break
      case 'tourists':
        aValue = getTouristsNames(a)
        bValue = getTouristsNames(b)
        break
      default:
        return 0
    }
    
    // Handle numeric comparison for ID field
    if (sortField.value === 'id') {
      const aNum = Number(aValue)
      const bNum = Number(bValue)
      if (aNum < bNum) {
        return sortDirection.value === 'asc' ? -1 : 1
      }
      if (aNum > bNum) {
        return sortDirection.value === 'asc' ? 1 : -1
      }
      return 0
    }
    
    // Handle string comparison for other fields
    if (String(aValue) < String(bValue)) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (String(aValue) > String(bValue)) {
      return sortDirection.value === 'asc' ? 1 : -1
    }
    return 0
  })
}

// Helper function to get country from city
const getCountryFromCity = (city: string): string => {
  // Simple mapping for common cities to countries
  const cityToCountry: Record<string, string> = {
    'Анталья': 'Турция',
    'Стамбул': 'Турция',
    'Анкара': 'Турция',
    'Измир': 'Турция',
    'Бодрум': 'Турция',
    'Кемер': 'Турция',
    'Сиде': 'Турция',
    'Алания': 'Турция',
    'Мармарис': 'Турция',
    'Кушадасы': 'Турция',
    'Фетхие': 'Турция',
    'Чешме': 'Турция',
    'Дидим': 'Турция',
    'Белек': 'Турция',
    'Каш': 'Турция',
    'Даламан': 'Турция',
    'Газипаша': 'Турция',
    'Трабзон': 'Турция',
    'Ризе': 'Турция',
    'Самсун': 'Турция'
  }
  
  return cityToCountry[city] || 'Турция' // Default to Turkey if city not found
}

// Helper functions for booking data extraction
const getHotelName = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  // Try OBS structure first
  if (tourDetails?.hotel?.hotel) {
    return tourDetails.hotel.hotel
  }
  if (tourDetails?.hotel?.name) {
    return tourDetails.hotel.name
  }
  if (tourDetails?.hotel_name) {
    return tourDetails.hotel_name
  }
  return 'Отель не указан'
}

const getHotelCity = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  if (tourDetails?.hotel?.city) {
    return tourDetails.hotel.city
  }
  return tourDetails?.city || 'N/A'
}

const getCheckInDate = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  // Try OBS structure first
  const checkIn = tourDetails?.hotel?.check_in ||
                  tourDetails?.check_in || 
                  tourDetails?.accommodation?.check_in ||
                  tourDetails?.selected_room?.check_in ||
                  tourDetails?.search_result?.check_in
  if (checkIn && checkIn !== 'N/A') {
    return normalizeDate(checkIn)
  }
  // Try to get from customer_data
  const customerData = booking.customer_data as any
  const customerCheckIn = customerData?.selected_room?.check_in ||
                         customerData?.search_result?.check_in ||
                         customerData?.searchResult?.check_in
  if (customerCheckIn && customerCheckIn !== 'N/A') {
    return normalizeDate(customerCheckIn)
  }
  return 'N/A'
}

const getCheckOutDate = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  // Try OBS structure first
  const checkOut = tourDetails?.hotel?.check_out ||
                   tourDetails?.check_out || 
                   tourDetails?.accommodation?.check_out ||
                   tourDetails?.selected_room?.check_out ||
                   tourDetails?.search_result?.check_out
  if (checkOut && checkOut !== 'N/A') {
    return normalizeDate(checkOut)
  }
  // Try to get from customer_data
  const customerData = booking.customer_data as any
  const customerCheckOut = customerData?.selected_room?.check_out ||
                          customerData?.search_result?.check_out ||
                          customerData?.searchResult?.check_out
  if (customerCheckOut && customerCheckOut !== 'N/A') {
    return normalizeDate(customerCheckOut)
  }
  return 'N/A'
}

const getTouristsCount = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  const tourists = tourDetails?.tourists
  if (Array.isArray(tourists)) {
    return tourists.length
  }
  // Try to get tourists from customer_data
  const customerData = booking.customer_data as any
  if (customerData && Array.isArray(customerData.tourists)) {
    return customerData.tourists.length
  }
  return 0
}

// New helper functions
const getOperator = () => {
  // For now, return OBS as default, can be extended based on booking data
  return 'OBS'
}

const getOperatorStatus = (booking: AdminBooking) => {
  // Return operator_status from API if available
  if (booking.operator_status && booking.operator_status !== 'unknown') {
    return booking.operator_status
  }
  
  // Try to get from tour_details (OBS structure)
  const tourDetails = booking.tour_details as any
  if (tourDetails?.info?.order_status?.name) {
    return tourDetails.info.order_status.name
  }
  
  // Try to get from customer_data
  const customerData = booking.customer_data as any
  if (customerData?.info?.order_status?.name) {
    return customerData.info.order_status.name
  }
  
  // If we have an obs_booking_hash but no status, it means we need to sync
  if (booking.obs_booking_hash && !booking.operator_status) {
    return 'unknown'
  }
  
  return 'N/A'
}

const getTouristsNames = (booking: AdminBooking) => {
  // Try customer_data first (this is where the actual tourist data is)
  const customerData = booking.customer_data as any
  if (customerData && Array.isArray(customerData.tourists)) {
    const firstTwo = customerData.tourists.slice(0, 2)
    return firstTwo.map((tourist: any) => {
      const firstName = tourist.first_name || tourist.firstName || ''
      const lastName = tourist.last_name || tourist.lastName || ''
      return `${firstName} ${lastName}`.trim()
    }).join('\n')
  }
  
  // Fallback to tour_details
  const tourDetails = booking.tour_details as any
  const tourists = tourDetails?.tourists || []
  
  if (Array.isArray(tourists) && tourists.length > 0) {
    // Get first two tourists, each on separate line
    const firstTwo = tourists.slice(0, 2)
    return firstTwo.map((tourist: any) => {
      const firstName = tourist.first_name || tourist.firstName || ''
      const lastName = tourist.last_name || tourist.lastName || ''
      return `${firstName} ${lastName}`.trim()
    }).join('\n')
  }
  
  return 'N/A'
}

const formatDateDDMMYYYY = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A'
  
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  } catch {
    return 'N/A'
  }
}

const normalizeDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A'
  
  // If already in DD.MM.YYYY format, return as is
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    return dateString
  }
  
  // If in YYYY-MM-DD format, convert to DD.MM.YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-')
    return `${day}.${month}.${year}`
  }
  
  // Try to parse as Date and format
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }
  } catch {
    // If all else fails, return original string
  }
  
  return dateString
}

const getDepartureFlight = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  // Try OBS flights structure first
  if (tourDetails?.flights?.there) {
    return tourDetails.flights.there
  }
  return null
}

const getArrivalFlight = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  // Try OBS flights structure first
  if (tourDetails?.flights?.back) {
    return tourDetails.flights.back
  }
  return null
}


const getFlightNumber = (flightInfo: any) => {
  if (!flightInfo) return 'N/A'
  
  // Try OBS flight structure first
  if (flightInfo.flight_number?.number) {
    const prefix = flightInfo.flight_number.prefix || ''
    const number = flightInfo.flight_number.number || ''
    return `${prefix}${number}`.trim()
  }
  if (flightInfo.flight_number) {
    return flightInfo.flight_number
  }
  if (flightInfo.flightNumber) {
    return flightInfo.flightNumber
  }
  if (flightInfo.number) {
    return flightInfo.number
  }
  if (flightInfo.code) {
    return flightInfo.code
  }
  return 'N/A'
}

// Lifecycle
onMounted(() => {
  // Check if we have user filter from URL
  const route = useRoute()
  if (route.query.user_id || route.query.user_email) {
    // Set user filter in search filters
    if (route.query.user_email) {
      searchFilters.value.user_name = route.query.user_email as string
    }
  }
  
  loadBookings()
})
</script>

<style scoped>
.admin-bookings {
  width: 100%;
}

.sync-button-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.sync-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.btn-secondary {
  background: var(--color-secondary);
  color: white;
  border: 1px solid var(--color-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-secondary-hover);
  border-color: var(--color-secondary-hover);
}

.flight-filter {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flight-date-filter {
  font-size: 10px;
  padding: 2px 4px;
}


.bookings-table-container {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-soft);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.bookings-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.table th,
.table td {
  padding: 2px 6px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--color-text);
  line-height: 1.2;
}

/* Уменьшаем размер шрифта для статусов в таблице */
.table-status-badge {
  font-size: var(--font-size-xs) !important;
  font-weight: var(--font-weight-normal) !important;
  padding: 2px 6px !important;
}

.table th {
  background: var(--color-background-soft);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  text-align: center;
}

.table th:first-child,
.table td:first-child {
  text-align: center;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background: var(--color-border);
}

.sort-icon {
  margin-left: var(--spacing-xs);
  font-weight: bold;
  color: var(--color-secondary);
}

.search-row {
  background: var(--color-background-soft);
}

.search-row td {
  padding: 2px 4px;
  border-bottom: 1px solid var(--color-border);
}

.search-row .form-field {
  margin: 0;
}

.search-row .form-field input,
.search-row .form-field select {
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  height: var(--input-height);
  min-height: var(--input-height);
  box-sizing: border-box;
}

.table-row:hover {
  background: var(--color-background-soft);
}

.booking-id {
  text-align: center !important;
  width: 50px;
  max-width: 50px;
  min-width: 50px;
}

.operator-id {
  text-align: center !important;
  width: 60px;
  max-width: 60px;
  min-width: 60px;
}

.status,
.operator-status {
  width: 120px;
  max-width: 120px;
  min-width: 120px;
  text-align: center;
}

.user-info {
  min-width: 150px;
}

.hotel-info {
  min-width: 200px;
}

.hotel-name {
  margin-bottom: var(--spacing-xs);
}


.dates {
  min-width: 120px;
}

.check-in,
.check-out {
  width: 70px;
  max-width: 70px;
  min-width: 70px;
}


.booking-date {
  width: 70px;
  max-width: 70px;
  min-width: 70px;
}

.amount {
  width: 80px;
  max-width: 80px;
  min-width: 80px;
  text-align: right;
}


.tourists-count {
  text-align: center;
}

.departure-flight,
.arrival-flight {
  min-width: 80px;
  width: 80px;
  max-width: 80px;
}

.tourists {
  min-width: 200px;
  width: 200px;
}

.tourists-list {
  white-space: pre-line;
  line-height: 1.4;
}

/* Style date inputs but keep functionality */
.form-input[type="date"] {
  cursor: pointer;
}

.form-input[type="date"]::-webkit-inner-spin-button,
.form-input[type="date"]::-webkit-clear-button {
  display: none;
}

/* Компактные стили для полей дат в админке */
.search-row .form-input[type="date"] {
  padding: var(--spacing-xs);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  height: var(--input-height);
  min-height: var(--input-height);
  box-sizing: border-box;
}

/* Скрываем только внутренние кнопки, но оставляем календарь */
.search-row .form-input[type="date"]::-webkit-inner-spin-button,
.search-row .form-input[type="date"]::-webkit-clear-button {
  display: none;
}

.owner {
  min-width: 150px;
}

.actions-column {
  width: 80px;
  max-width: 80px;
  min-width: 80px;
  text-align: center;
}

.actions {
  text-align: center;
  padding: 2px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: white;
  color: var(--color-text-soft);
  cursor: pointer;
  margin-left: 8px; /* Смещаем правее для центрирования */
  /* Убираем все анимации и hover эффекты */
}

/* Убираем все hover эффекты */
.action-btn:hover,
.edit-btn:hover {
  background: white;
  color: var(--color-text-soft);
  border-color: var(--color-border);
}

/* Стили для отключенной кнопки */
.action-btn:disabled,
.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-background-soft);
}



.empty-row {
  background: var(--color-background-soft);
}

.empty-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-soft);
  font-style: italic;
  font-size: var(--font-size-md);
}



.pagination-section {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
  background: white;
  border: 1px solid var(--color-border);
}

/* Стили для загрузочного спиннера */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  font-size: var(--font-size-md);
  color: var(--color-text-soft);
}

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
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Mobile responsive */
@media (max-width: 1200px) {
  .table-container {
    overflow-x: auto;
  }
  
  .table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {

  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .page-title {
    font-size: var(--font-size-lg);
  }

  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .search-filters {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .filter-group {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .filter-group label {
    margin-bottom: var(--spacing-xs);
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .table {
    font-size: var(--font-size-xs);
    min-width: 600px; /* Уменьшаем минимальную ширину */
  }

  /* Скрываем менее важные столбцы на мобильных */
  .table th:nth-child(3), /* Номера оператора */
  .table td:nth-child(3),
  .table th:nth-child(4), /* Дата брони */
  .table td:nth-child(4),
  .table th:nth-child(5), /* Страна */
  .table td:nth-child(5),
  .table th:nth-child(9), /* Рейс туда */
  .table td:nth-child(9),
  .table th:nth-child(10), /* Рейс назад */
  .table td:nth-child(10) {
    display: none;
  }

  .table th,
  .table td {
    padding: var(--spacing-xs);
    white-space: nowrap;
  }

  .table th:nth-child(1),
  .table td:nth-child(1) {
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
  }

  /* Адаптация для столбца действий на мобильных */
  .actions-column {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    margin-left: 4px;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }


  .pagination {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .pagination-info {
    text-align: center;
  }
}

@media (max-width: 480px) {

  .table {
    min-width: 400px; /* Еще больше уменьшаем для маленьких экранов */
    font-size: 10px;
  }

  /* Скрываем еще больше столбцов на очень маленьких экранах */
  .table th:nth-child(6), /* Заезд */
  .table td:nth-child(6),
  .table th:nth-child(7), /* Выезд */
  .table td:nth-child(7),
  .table th:nth-child(8), /* Туристы */
  .table td:nth-child(8) {
    display: none;
  }

  .table th,
  .table td {
    padding: 4px;
  }

  .btn {
    font-size: 10px;
    padding: 4px 8px;
  }

  .page-title {
    font-size: var(--font-size-md);
  }

  /* Адаптация для очень маленьких экранов */
  .actions-column {
    width: 50px;
    max-width: 50px;
    min-width: 50px;
  }

  .action-btn {
    width: 24px;
    height: 24px;
    margin-left: 2px;
  }

  .action-btn svg {
    width: 12px;
    height: 12px;
  }

}
</style>
