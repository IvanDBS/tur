<template>
  <div class="booking-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <button class="back-button" @click="goBackToSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Назад к поиску
          </button>
          <h1 class="page-title">Бронирование тура</h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка данных бронирования...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
        <button class="retry-button" @click="retryLoad">
          Попробовать снова
        </button>
      </div>

      <!-- Booking Content -->
      <div v-else-if="hasSearchResult" class="booking-content">
        <!-- Hotel Information Block -->
        <HotelInfoBlock 
          :search-result="searchResult" 
          :selected-flight="bookingData.selectedFlight"
          :selected-room="bookingData.selectedRoom"
        />

        <!-- Room Selection Block -->
        <RoomSelectionBlock 
          :search-result="searchResult"
          :selected-room="bookingData.selectedRoom"
          @update:selected-room="updateSelectedRoom"
        />

        <!-- Flight Selection Block -->
        <FlightSelectionBlock 
          :search-result="searchResult"
          :selected-flight="bookingData.selectedFlight"
          @update:selected-flight="updateSelectedFlight"
        />

        <!-- Tourist Data Block -->
        <TouristDataBlock 
          :tourists="bookingData.tourists"
          :errors="touristErrors"
          @update:tourist="updateTourist"
        />

        <!-- Additional Services Block -->
        <AdditionalServicesBlock 
          :services="bookingData.additionalServices"
          :notes="bookingNotes"
          @update:services="updateAdditionalServices"
          @update:notes="updateBookingNotes"
        />

        <!-- Booking Summary and Actions -->
        <div class="booking-summary">
          <div class="summary-content">
            <div class="price-breakdown">
              <div class="price-item">
                <div class="price-name">Базовая стоимость</div>
                <div class="price-description">{{ getBasePriceDescription() }}</div>
                <div class="price-value">{{ basePrice }} {{ searchResult.price?.currency }}</div>
              </div>
              
              <div class="price-item">
                <div class="price-name">Страховка</div>
                <div class="price-description">{{ getInsuranceName() }} - {{ getInsuranceDescription() }}</div>
                <div class="price-value">
                  {{ bookingData.additionalServices.insurance.included ? '0' : '+' + bookingData.additionalServices.insurance.price }}
                </div>
              </div>
              
              <div class="price-item">
                <div class="price-name">Трансфер</div>
                <div class="price-description">{{ getTransferName() }} - {{ getTransferDescription() }}</div>
                <div class="price-value">
                  {{ bookingData.additionalServices.transfer.included ? '0' : '+' + bookingData.additionalServices.transfer.price }}
                </div>
              </div>
              
              <div v-if="bookingData.additionalServices.covidInsurance.type === 'COVID_19'" class="price-item">
                <div class="price-name">COVID-19 страховка</div>
                <div class="price-description">Дополнительная страховка COVID-19</div>
                <div class="price-value">+ {{ bookingData.additionalServices.covidInsurance.price }} €</div>
              </div>
              
              <div class="price-item total">
                <div class="price-name">Итого</div>
                <div class="price-description"></div>
                <div class="price-value">{{ totalPrice }} {{ searchResult.price?.currency }}</div>
              </div>
            </div>

            <div class="booking-actions">
              <button 
                class="book-button"
                @click="handleBook"
                :disabled="!canProceedToBooking"
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Search Result -->
      <div v-else class="no-result-state">
        <div class="no-result-icon">🔍</div>
        <h3>Результат поиска не найден</h3>
        <p>Не удалось найти данные для бронирования. Вернитесь к поиску и попробуйте снова.</p>
        <button class="back-to-search-button" @click="goBackToSearch">
          Вернуться к поиску
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooking } from '../composables/useBooking'
import { useSearchData } from '../composables/useSearchData'
// Import components dynamically to avoid TypeScript issues
const HotelInfoBlock = defineAsyncComponent(() => import('../components/booking/HotelInfoBlock.vue'))
const RoomSelectionBlock = defineAsyncComponent(() => import('../components/booking/RoomSelectionBlock.vue'))
const FlightSelectionBlock = defineAsyncComponent(() => import('../components/booking/FlightSelectionBlock.vue'))
const TouristDataBlock = defineAsyncComponent(() => import('../components/booking/TouristDataBlock.vue'))
const AdditionalServicesBlock = defineAsyncComponent(() => import('../components/booking/AdditionalServicesBlock.vue'))
import type { SearchResult, GroupedSearchResult } from '../types/search'
import type { BookingNotes } from '../types/booking'

// Props
interface Props {
  searchResultId: string
}

const props = defineProps<Props>()

// Composables
const route = useRoute()
const router = useRouter()
const { 
  loading, 
  error, 
  hasSearchResult, 
  canProceedToBooking, 
  basePrice,
  totalPrice,
  searchResult,
  bookingData,
  initializeBooking,
  updateSelectedFlight,
  updateSelectedRoom,
  updateTourist,
  updateAdditionalServices,
  calculateBooking,
  createBooking,
  goBackToSearch,
  clearError
} = useBooking()

const { performSearch } = useSearchData()

// State
const touristErrors = ref<Record<string, Record<string, string>>>({})
const bookingNotes = ref<BookingNotes>({
  honeymooners: false,
  regularGuest: false,
  twinBeds: false,
  groundFloor: false,
  notGroundFloor: false,
  babyCot: false,
  handicapAccessible: false,
  doubleBed: false,
  comment: ''
})

// Methods
const loadSearchResult = async () => {
  try {
    // Try to get search result from sessionStorage first
    const storedSearchResult = sessionStorage.getItem('bookingSearchResult')
    if (storedSearchResult) {
      try {
        const searchResult = JSON.parse(storedSearchResult)
        console.log('Loaded search result from sessionStorage:', searchResult)
        
        // Validate search result structure
        if (!searchResult || typeof searchResult !== 'object') {
          throw new Error('Invalid search result format')
        }
        
        initializeBooking(searchResult)
        return
      } catch (parseError) {
        console.warn('Failed to parse stored search result:', parseError)
        sessionStorage.removeItem('bookingSearchResult')
      }
    }
    
    // Try to get search result from router state
    const stateSearchResult = history.state?.searchResult
    if (stateSearchResult) {
      initializeBooking(stateSearchResult)
      return
    }
    
    // TODO: Implement loading search result by ID from API/store
    // For now, we'll need to get the search result from the search results
    // This should be implemented based on how search results are stored/managed
    
    console.log('Loading search result for ID:', props.searchResultId)
    
    // For now, show error if no search result ID
    if (!props.searchResultId) {
      throw new Error('Search result ID is required')
    }
    
    // TODO: Replace with actual search result loading logic
    // const result = await loadSearchResultById(props.searchResultId)
    // initializeBooking(result)
    
  } catch (err) {
    console.error('Failed to load search result:', err)
    // Set error state to show error message to user
    if (err instanceof Error) {
      // You might want to set an error state here
      console.error('Error details:', err.message)
    }
  }
}

const retryLoad = () => {
  clearError()
  loadSearchResult()
}

const handleCalculate = async () => {
  const result = await calculateBooking()
  if (result) {
    console.log('Booking calculated:', result)
    // TODO: Show calculation results to user
  }
}

const handleBook = async () => {
  const result = await createBooking()
  if (result) {
    console.log('Booking created:', result)
    // User will be redirected to bookings page
  }
}

const updateBookingNotes = (notes: Partial<BookingNotes>) => {
  bookingNotes.value = { ...bookingNotes.value, ...notes }
}

// Helper methods for getting service names and descriptions
const getInsuranceName = () => {
  const insurance = bookingData.value.additionalServices.insurance
  switch (insurance.type) {
    case 'STANDARD':
      return 'STANDARD 10000 EUR'
    case 'STANDARD_PLUS':
      return 'STANDARD PLUS TR 30 000 EUR'
    case 'NONE':
      return 'Без страховки'
    default:
      return insurance.type
  }
}

const getInsuranceDescription = () => {
  const insurance = bookingData.value.additionalServices.insurance
  switch (insurance.type) {
    case 'STANDARD':
      return 'Стандартная страховка'
    case 'STANDARD_PLUS':
      return 'Расширенная страховка'
    case 'NONE':
      return 'Отказ от страховки'
    default:
      return insurance.coverage || ''
  }
}

const getTransferName = () => {
  const transfer = bookingData.value.additionalServices.transfer
  switch (transfer.type) {
    case 'GROUP':
      return 'GROUP (BUS)'
    case 'INDIVIDUAL':
      return 'INDIVIDUAL TRANSFER'
    case 'VIP':
      return 'VIP IND TRANSFER'
    default:
      return transfer.type
  }
}

const getTransferDescription = () => {
  const transfer = bookingData.value.additionalServices.transfer
  switch (transfer.type) {
    case 'GROUP':
      return 'Групповой трансфер на автобусе'
    case 'INDIVIDUAL':
      return 'Индивидуальный трансфер'
    case 'VIP':
      return 'VIP индивидуальный трансфер'
    default:
      return ''
  }
}

const getBasePriceDescription = () => {
  const result = searchResult.value
  if (!result) return ''
  
  const parts = []
  
  // Проверяем, есть ли перелет (для GroupedSearchResult)
  if ('flightOptions' in result && Array.isArray(result.flightOptions) && result.flightOptions.length > 0) {
    parts.push('Перелет')
  }
  
  // Добавляем проживание
  parts.push('проживание')
  
  // Добавляем питание
  let mealName = 'питание'
  if ('meal' in result && result.meal && typeof result.meal === 'object' && result.meal !== null) {
    mealName = (result.meal as any).name || 'питание'
  } else if ('accommodation' in result && result.accommodation?.meal) {
    mealName = result.accommodation.meal.name || 'питание'
  }
  
  // Форматируем питание: "питание по системе {НАЗВАНИЕ}"
  const mealDescription = `питание по системе ${mealName.toUpperCase()}`
  parts.push(mealDescription)
  
  return parts.join(' + ')
}

// Validation
const validateTouristData = () => {
  const errors: Record<string, Record<string, string>> = {}
  
  bookingData.value.tourists.forEach(tourist => {
    const touristErrors: Record<string, string> = {}
    
    if (!tourist.firstName.trim()) {
      touristErrors.firstName = 'Имя обязательно для заполнения'
    }
    
    if (!tourist.lastName.trim()) {
      touristErrors.lastName = 'Фамилия обязательна для заполнения'
    }
    
    if (!tourist.birthDate) {
      touristErrors.birthDate = 'Дата рождения обязательна для заполнения'
    }
    
    if (!tourist.passportNumber.trim()) {
      touristErrors.passportNumber = 'Номер паспорта обязателен для заполнения'
    }
    
    if (!tourist.passportExpiry) {
      touristErrors.passportExpiry = 'Срок действия паспорта обязателен для заполнения'
    }
    
    if (!tourist.nationality) {
      touristErrors.nationality = 'Гражданство обязательно для заполнения'
    }
    
    if (Object.keys(touristErrors).length > 0) {
      errors[tourist.id] = touristErrors
    }
  })
  
  touristErrors.value = errors
  return Object.keys(errors).length === 0
}

// Watchers
watch(() => bookingData.value.tourists, () => {
  validateTouristData()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  try {
    await loadSearchResult()
  } catch (error) {
    console.error('Error in BookingView onMounted:', error)
  }
})
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin: 0;
}

.loading-state,
.error-state,
.no-result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.no-result-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3,
.no-result-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 1rem;
}

.error-state p,
.no-result-state p {
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  max-width: 400px;
}

.retry-button,
.back-to-search-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover,
.back-to-search-button:hover {
  background: var(--color-primary-dark);
}

.booking-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.booking-summary {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 2rem;
  margin-top: 2rem;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.price-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
}

.price-item.total {
  border-top: 2px solid var(--color-border);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.price-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
}

.price-item.total .price-name {
  font-weight: 600;
  color: var(--color-secondary);
}

.price-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.price-value {
  font-weight: 600;
  color: var(--color-secondary);
  text-align: right;
}

.price-item.total .price-value {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.booking-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.book-button {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-primary);
  color: white;
}

.book-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.book-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .summary-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .book-button {
    width: 100%;
  }
  
  .price-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    text-align: left;
  }
  
  .price-value {
    text-align: left;
  }
}
</style>
