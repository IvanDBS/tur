<template>
  <div class="admin-bookings">

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
                ID
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
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bookings.length === 0" class="empty-row">
              <td colspan="15" class="empty-message">
                Бронирования не найдены
              </td>
            </tr>
            <tr v-for="booking in bookings" :key="booking.id" class="table-row">
              <td class="booking-id">{{ booking.id }}</td>
              <td class="operator">{{ getOperator(booking) }}</td>
              <td class="booking-number">{{ booking.obs_order_id || 'N/A' }}</td>
              <td class="booking-date">{{ formatDateDDMMYYYY(booking.created_at) }}</td>
              <td class="country">{{ getCountryFromCity(getHotelCity(booking)) }}</td>
              <td class="hotel-info">
                <div class="hotel-name">{{ getHotelName(booking) }}</div>
              </td>
              <td class="check-in">{{ formatDateDDMMYYYY(getCheckInDate(booking)) }}</td>
              <td class="check-out">{{ formatDateDDMMYYYY(getCheckOutDate(booking)) }}</td>
              <td class="tourists">
                <div class="tourists-list">{{ getTouristsNames(booking) }}</div>
              </td>
              <td class="departure-flight">
                <div v-if="booking.tour_details.flight_info?.departure">
                  <div class="flight-date">{{ formatDateDDMMYYYY(booking.tour_details.flight_info.departure.date) }}</div>
                  <div class="flight-number">{{ getFlightNumber(booking.tour_details.flight_info.departure) }}</div>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="arrival-flight">
                <div v-if="booking.tour_details.flight_info?.arrival">
                  <div class="flight-date">{{ formatDateDDMMYYYY(booking.tour_details.flight_info.arrival.date) }}</div>
                  <div class="flight-number">{{ getFlightNumber(booking.tour_details.flight_info.arrival) }}</div>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="amount">{{ booking.total_amount }} €</td>
              <td class="owner">
                <div class="user-name">{{ booking.user.first_name || booking.user.email.split('@')[0] }}</div>
                <div class="user-email">{{ booking.user.email }}</div>
              </td>
              <td class="status">
                <StatusBadge :status="booking.status" />
              </td>
              <td class="actions">
                <button 
                  class="action-btn edit-btn" 
                  @click="viewDetails(booking)"
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
    <BookingDetailsModal
      v-if="selectedBooking"
      :booking="selectedBooking"
      @close="selectedBooking = null"
      @status-changed="handleStatusChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton, BaseSelect, BaseInput } from '../../components/ui'
import { Pagination } from '../../components'
import StatusBadge from './components/admin/StatusBadge.vue'
import BookingDetailsModal from './components/admin/BookingDetailsModal.vue'
import { formatDate } from '../../utils/dateUtils'
import { debounce } from '../../utils/debounce'
import { useAdminApi } from '../../composables/useAdminApi'
import { BOOKING_DEFAULTS, getDefaultValue } from '../../constants/bookingDefaults'
import type { AdminBooking } from '../../types/admin'

// Admin API
const { loading, getBookings, updateBookingStatus } = useAdminApi()

// State
const allBookings = ref<AdminBooking[]>([])
const selectedBooking = ref<AdminBooking | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)

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
    filtered = filtered.filter(booking => 
      getOperator(booking) === searchFilters.value.operator
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

  // Filter by departure flight if specified
  if (searchFilters.value.departure_flight && searchFilters.value.departure_flight.trim()) {
    const searchFlight = searchFilters.value.departure_flight.trim().toLowerCase()
    filtered = filtered.filter(booking => {
      const departure = booking.tour_details.flight_info?.departure
      if (!departure) return false
      
      const flightNumber = getFlightNumber(departure).toLowerCase()
      const flightDate = formatDateDDMMYYYY(departure.date).toLowerCase()
      
      return flightNumber.includes(searchFlight) || flightDate.includes(searchFlight)
    })
  }

  // Filter by arrival flight if specified
  if (searchFilters.value.arrival_flight && searchFilters.value.arrival_flight.trim()) {
    const searchFlight = searchFilters.value.arrival_flight.trim().toLowerCase()
    filtered = filtered.filter(booking => {
      const arrival = booking.tour_details.flight_info?.arrival
      if (!arrival) return false
      
      const flightNumber = getFlightNumber(arrival).toLowerCase()
      const flightDate = formatDateDDMMYYYY(arrival.date).toLowerCase()
      
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
  status: ''
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
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'failed', label: 'Ошибка' }
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
    
    console.log('Loading bookings...', {
      page: currentPage.value,
      per_page: 20,
      status: filters.value.status || searchFilters.value.status || undefined,
      search: combinedSearch,
      sort_field: sortField.value || undefined,
      sort_direction: sortDirection.value || undefined
    })
    
    const response = await getBookings({
      page: currentPage.value,
      per_page: 20,
      status: filters.value.status || searchFilters.value.status || undefined,
      search: combinedSearch,
      sort_field: sortField.value || undefined,
      sort_direction: sortDirection.value || undefined
    })
    
    console.log('Bookings response:', response)
    
    // API returns data in response.data structure
    const data = (response.data || response) as {
      bookings?: unknown[]
      pagination?: {
        total_pages: number
        total_count: number
      }
    }
    
    // Transform API data to match AdminBooking interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allBookings.value = (data.bookings || []).map((booking: any) => {
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
        total_amount: booking.total_amount,
        tour_details: {
          hotel_name: tourDetails?.hotel_name || tourDetails?.hotel?.name || 'N/A',
          hotel_category: tourDetails?.hotel_category || tourDetails?.hotel?.category || 'N/A',
          city: tourDetails?.city || tourDetails?.hotel?.city || 'N/A',
          room_type: tourDetails?.room_type || tourDetails?.accommodation?.room?.name || 'N/A',
          meal_plan: tourDetails?.meal_plan || tourDetails?.accommodation?.meal?.full_name || 'N/A',
          check_in: tourDetails?.check_in || tourDetails?.dates?.check_in || 'N/A',
          check_out: tourDetails?.check_out || tourDetails?.dates?.check_out || 'N/A',
          nights: tourDetails?.nights || tourDetails?.nights?.total || 0,
          currency: tourDetails?.currency || 'EUR',
          tourists: tourDetails?.tourists || customerData?.tourists || [],
          flight_info: tourDetails?.flight_info || {
            departure: {
              date: 'N/A',
              time: 'N/A',
              airport: 'N/A',
              city: 'N/A'
            },
            arrival: {
              date: 'N/A',
              time: 'N/A',
              airport: 'N/A',
              city: 'N/A'
            }
          }
        },
        customer_data: customerData,
        created_at: booking.created_at,
        confirmed_at: booking.confirmed_at,
        cancelled_at: booking.cancelled_at,
        obs_booking_hash: booking.obs_booking_hash,
        obs_order_id: booking.obs_order_id,
        search_query: booking.search_query
      }
    })
    
    totalPages.value = data.pagination?.total_pages || 1
    totalCount.value = data.pagination?.total_count || 0
    
    console.log('Bookings loaded:', allBookings.value.length)
  } catch (error) {
    console.error('Failed to load bookings:', error)
    // Fallback to empty array on error
    allBookings.value = []
    totalPages.value = 1
    totalCount.value = 0
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
    status: ''
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
  selectedBooking.value = booking
}

const confirmBooking = async (booking: AdminBooking) => {
  try {
    await updateBookingStatus(booking.id, 'confirmed')
    booking.status = 'confirmed'
    booking.confirmed_at = new Date().toISOString()
  } catch (error) {
    console.error('Failed to confirm booking:', error)
  }
}

const rejectBooking = async (booking: AdminBooking) => {
  try {
    await updateBookingStatus(booking.id, 'cancelled')
    booking.status = 'cancelled'
    booking.cancelled_at = new Date().toISOString()
  } catch (error) {
    console.error('Failed to reject booking:', error)
  }
}

const handleStatusChanged = () => {
  selectedBooking.value = null
  loadBookings()
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
        aValue = a.id
        bValue = b.id
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
        aValue = getCountryFromCity(a.tour_details.city)
        bValue = getCountryFromCity(b.tour_details.city)
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
        aValue = a.tour_details.flight_info?.departure?.date || ''
        bValue = b.tour_details.flight_info?.departure?.date || ''
        break
      case 'arrival_flight':
        aValue = a.tour_details.flight_info?.arrival?.date || ''
        bValue = b.tour_details.flight_info?.arrival?.date || ''
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
      case 'operator':
        aValue = getOperator(a)
        bValue = getOperator(b)
        break
      case 'tourists':
        aValue = getTouristsNames(a)
        bValue = getTouristsNames(b)
        break
      default:
        return 0
    }
    
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
  if (tourDetails?.hotel?.name) {
    return tourDetails.hotel.name
  }
  return tourDetails?.hotel_name || 'N/A'
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
  const checkIn = tourDetails?.check_in || 
                  tourDetails?.accommodation?.check_in ||
                  tourDetails?.selected_room?.check_in ||
                  tourDetails?.search_result?.check_in
  if (checkIn && checkIn !== 'N/A') {
    try {
      return formatDate(checkIn)
    } catch {
      return 'N/A'
    }
  }
  // Try to get from customer_data
  const customerData = booking.customer_data as any
  const customerCheckIn = customerData?.selected_room?.check_in ||
                         customerData?.search_result?.check_in ||
                         customerData?.searchResult?.check_in
  if (customerCheckIn && customerCheckIn !== 'N/A') {
    try {
      return formatDate(customerCheckIn)
    } catch {
      return 'N/A'
    }
  }
  return 'N/A'
}

const getCheckOutDate = (booking: AdminBooking) => {
  const tourDetails = booking.tour_details as any
  const checkOut = tourDetails?.check_out || 
                   tourDetails?.accommodation?.check_out ||
                   tourDetails?.selected_room?.check_out ||
                   tourDetails?.search_result?.check_out
  if (checkOut && checkOut !== 'N/A') {
    try {
      return formatDate(checkOut)
    } catch {
      return 'N/A'
    }
  }
  // Try to get from customer_data
  const customerData = booking.customer_data as any
  const customerCheckOut = customerData?.selected_room?.check_out ||
                          customerData?.search_result?.check_out ||
                          customerData?.searchResult?.check_out
  if (customerCheckOut && customerCheckOut !== 'N/A') {
    try {
      return formatDate(customerCheckOut)
    } catch {
      return 'N/A'
    }
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
const getOperator = (booking: AdminBooking) => {
  // For now, return OBS as default, can be extended based on booking data
  return 'OBS'
}

const getTouristsNames = (booking: AdminBooking) => {
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
  
  // Try to get from customer_data
  const customerData = booking.customer_data as any
  if (customerData && Array.isArray(customerData.tourists)) {
    const firstTwo = customerData.tourists.slice(0, 2)
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

const getFlightNumber = (flightInfo: any) => {
  if (!flightInfo) return 'N/A'
  
  // Try different possible field names for flight number
  return flightInfo.flight_number || 
         flightInfo.flightNumber || 
         flightInfo.number || 
         flightInfo.code || 
         'N/A'
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
}

.table th,
.table td {
  padding: var(--spacing-xs);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--color-text);
}

.table th {
  background: var(--color-background-soft);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.table th:first-child,
.table td:first-child {
  width: 60px;
  max-width: 60px;
  min-width: 60px;
  text-align: center;
}

.table th:nth-child(4),
.table th:nth-child(7),
.table th:nth-child(8) {
  width: 100px;
  max-width: 100px;
  min-width: 100px;
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
  padding: var(--spacing-xs);
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
}

.table-row:hover {
  background: var(--color-background-soft);
}

.booking-id {
  width: 60px;
  max-width: 60px;
  min-width: 60px;
  text-align: center !important;
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
  width: 100px;
  max-width: 100px;
  min-width: 100px;
}


.booking-date {
  width: 100px;
  max-width: 100px;
  min-width: 100px;
}


.tourists-count {
  text-align: center;
}

.departure-flight,
.arrival-flight {
  min-width: 120px;
}



.tourists {
  min-width: 150px;
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
  padding: var(--spacing-xs);
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
  border-radius: var(--border-radius-lg);
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
