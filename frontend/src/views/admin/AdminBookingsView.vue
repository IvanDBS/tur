<template>
  <div class="admin-bookings">

    <!-- Bookings Table -->
    <div class="bookings-table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка бронирований...</p>
      </div>

      <div v-else-if="bookings.length === 0" class="empty-state">
        <p>Бронирования не найдены</p>
      </div>

      <div v-else class="bookings-table">
        <table class="table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('id')">
                ID#
                <span v-if="sortField === 'id'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('booking_number')">
                Номер
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
                Отели
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
              <th class="sortable" @click="sortBy('tourists_count')">
                Туристы
                <span v-if="sortField === 'tourists_count'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('departure_flight')">
                Отправление рейс
                <span v-if="sortField === 'departure_flight'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('arrival_flight')">
                Прибытие рейс
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
              <th>Действия</th>
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
                <BaseInput
                  v-model="searchFilters.booking_number"
                  placeholder="Номер..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.created_at"
                  placeholder="Дата..."
                  size="xs"
                  @input="debouncedSearch"
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
                <BaseInput
                  v-model="searchFilters.check_in"
                  placeholder="Заезд..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.check_out"
                  placeholder="Выезд..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.tourists_count"
                  placeholder="Кол-во..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.departure_flight"
                  placeholder="Отправление..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.arrival_flight"
                  placeholder="Прибытие..."
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
                <BaseButton 
                  variant="ghost" 
                  size="xs" 
                  @click="clearAllFilters"
                >
                  Очистить
                </BaseButton>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id" class="table-row">
              <td class="booking-id">#{{ booking.id }}</td>
              <td class="booking-number">{{ booking.obs_order_id || 'N/A' }}</td>
              <td class="booking-date">{{ formatDate(booking.created_at) }}</td>
              <td class="country">{{ getCountryFromCity(getHotelCity(booking)) }}</td>
              <td class="hotel-info">
                <div class="hotel-name">{{ getHotelName(booking) }}</div>
                <div class="hotel-location">{{ getHotelCity(booking) }}</div>
              </td>
              <td class="check-in">{{ getCheckInDate(booking) }}</td>
              <td class="check-out">{{ getCheckOutDate(booking) }}</td>
              <td class="tourists-count">{{ getTouristsCount(booking) }}</td>
              <td class="departure-flight">
                <div v-if="booking.tour_details.flight_info?.departure">
                  <div class="flight-date">{{ formatDate(booking.tour_details.flight_info.departure.date) }}</div>
                  <div class="flight-time">{{ booking.tour_details.flight_info.departure.time }}</div>
                  <div class="flight-airport">{{ booking.tour_details.flight_info.departure.airport }}</div>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="arrival-flight">
                <div v-if="booking.tour_details.flight_info?.arrival">
                  <div class="flight-date">{{ formatDate(booking.tour_details.flight_info.arrival.date) }}</div>
                  <div class="flight-time">{{ booking.tour_details.flight_info.arrival.time }}</div>
                  <div class="flight-airport">{{ booking.tour_details.flight_info.arrival.airport }}</div>
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
                <div class="action-buttons">
                  <BaseButton 
                    variant="ghost" 
                    size="sm" 
                    @click="viewDetails(booking)"
                  >
                    Подробнее
                  </BaseButton>
                  <BaseButton 
                    v-if="booking.status === 'pending'"
                    variant="primary" 
                    size="sm" 
                    @click="confirmBooking(booking)"
                  >
                    Подтвердить
                  </BaseButton>
                  <BaseButton 
                    v-if="booking.status === 'pending'"
                    variant="danger" 
                    size="sm" 
                    @click="rejectBooking(booking)"
                  >
                    Отклонить
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-section">
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
import { ref, onMounted } from 'vue'
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
const bookings = ref<AdminBooking[]>([])
const selectedBooking = ref<AdminBooking | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)

const filters = ref({
  status: '',
  search: ''
})

// Search filters for each column
const searchFilters = ref({
  id: '',
  booking_number: '',
  created_at: '',
  country: '',
  hotel_name: '',
  check_in: '',
  check_out: '',
  tourists_count: '',
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

// Debounced search
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadBookings()
}, 500)

// Methods
const loadBookings = async () => {
  try {
    // Combine all search filters into a single search string
    const searchTerms = []
    Object.entries(searchFilters.value).forEach(([key, value]) => {
      if (value && value.trim()) {
        searchTerms.push(`${key}:${value.trim()}`)
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
    bookings.value = (data.bookings || []).map((booking: any) => {
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
    
    console.log('Bookings loaded:', bookings.value.length)
  } catch (error) {
    console.error('Failed to load bookings:', error)
    // Fallback to empty array on error
    bookings.value = []
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
    booking_number: '',
    created_at: '',
    country: '',
    hotel_name: '',
    check_in: '',
    check_out: '',
    tourists_count: '',
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
  padding: var(--spacing-xl);
}


.bookings-table-container {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
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
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.table th {
  background: var(--color-background-soft);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-size: var(--font-size-sm);
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
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
}

.user-info {
  min-width: 150px;
}

.user-email {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.user-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.hotel-info {
  min-width: 200px;
}

.hotel-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.hotel-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.dates {
  min-width: 120px;
}

.check-in,
.check-out {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.booking-number {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.booking-date {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.country {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.tourists-count {
  text-align: center;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.departure-flight,
.arrival-flight {
  min-width: 120px;
}

.flight-date {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.flight-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
}

.flight-airport {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
}

.owner {
  min-width: 150px;
}

.owner .user-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.owner .user-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.amount {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.created {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.actions {
  min-width: 200px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.pagination-section {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
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
  .admin-bookings {
    padding: var(--spacing-sm);
  }

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
    min-width: 800px;
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

  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .action-buttons .btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
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
  .admin-bookings {
    padding: var(--spacing-xs);
  }

  .table {
    min-width: 600px;
    font-size: 10px;
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
}
</style>
