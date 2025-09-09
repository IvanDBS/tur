<template>
  <div class="admin-bookings">
    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <BaseSelect
            v-model="filters.status"
            :options="statusOptions"
            placeholder="Все статусы"
            label="Статус"
            size="sm"
            @update:model-value="loadBookings"
          />
        </div>
        
        <div class="filter-group">
          <BaseInput
            v-model="filters.search"
            placeholder="Поиск по ID или email..."
            label="Поиск"
            size="sm"
            @input="debouncedSearch"
          />
        </div>

        <div class="filter-actions">
          <BaseButton 
            variant="secondary" 
            size="sm" 
            @click="resetFilters"
          >
            Сбросить
          </BaseButton>
        </div>
      </div>
    </div>

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
              <td class="country">{{ getCountryFromCity(booking.tour_details.city) }}</td>
              <td class="hotel-info">
                <div class="hotel-name">{{ booking.tour_details.hotel_name }}</div>
                <div class="hotel-location">{{ booking.tour_details.city }}</div>
              </td>
              <td class="check-in">{{ formatDate(booking.tour_details.check_in) }}</td>
              <td class="check-out">{{ formatDate(booking.tour_details.check_out) }}</td>
              <td class="tourists-count">{{ booking.tour_details.tourists.length }}</td>
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
                <div class="user-name">{{ booking.user.name }}</div>
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
import { BaseButton, BaseSelect, BaseInput } from '../../components/ui'
import { Pagination } from '../../components'
import StatusBadge from './components/admin/StatusBadge.vue'
import BookingDetailsModal from './components/admin/BookingDetailsModal.vue'
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import { debounce } from '../../utils/debounce'
import { useAdminApi } from '../../composables/useAdminApi'
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
const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'В ожидании' },
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'failed', label: 'Ошибка' }
]

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
      bookings?: AdminBooking[]
      pagination?: {
        total_pages: number
        total_count: number
      }
    }
    bookings.value = data.bookings || []
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

const resetFilters = () => {
  filters.value = { status: '', search: '' }
  currentPage.value = 1
  loadBookings()
}

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
    let aValue: any
    let bValue: any
    
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
        aValue = a.tour_details.hotel_name
        bValue = b.tour_details.hotel_name
        break
      case 'check_in':
        aValue = new Date(a.tour_details.check_in)
        bValue = new Date(b.tour_details.check_in)
        break
      case 'check_out':
        aValue = new Date(a.tour_details.check_out)
        bValue = new Date(b.tour_details.check_out)
        break
      case 'tourists_count':
        aValue = a.tour_details.tourists.length
        bValue = b.tour_details.tourists.length
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
        aValue = a.user.name
        bValue = b.user.name
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        return 0
    }
    
    if (aValue < bValue) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
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

// Lifecycle
onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.admin-bookings {
  padding: var(--spacing-xl);
}

.filters-section {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.filters-row {
  display: flex;
  gap: var(--spacing-lg);
  align-items: end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-actions {
  display: flex;
  gap: var(--spacing-sm);
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
@media (max-width: 768px) {
  .admin-bookings {
    padding: var(--spacing-md);
  }

  .filters-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .filter-group {
    min-width: auto;
  }

  .table {
    font-size: var(--font-size-sm);
  }

  .table th,
  .table td {
    padding: var(--spacing-sm);
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
