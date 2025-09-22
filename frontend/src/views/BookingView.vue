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
            {{ $t('searchResults.backToSearch') }}
          </button>
          <h1 class="page-title">{{ $t('searchResults.tourBooking') }}</h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="booking-loading">
        <div class="spinner-container">
          <div class="blue-spinner spinner-large"></div>
          <p class="spinner-text">{{ $t('bookingSummary.processingBooking') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>{{ $t('bookingSummary.errorLoading') }}</h3>
        <p>{{ error }}</p>
        <button class="retry-button" @click="retryLoad">
          {{ $t('bookingSummary.tryAgain') }}
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
          :selected-flight="bookingData.selectedFlight"
          @update:selected-room="updateSelectedRoom"
          @reset:selected-flight="resetSelectedFlight"
        />

        <!-- Flight Selection Block -->
        <FlightSelectionBlock 
          :search-result="searchResult"
          :selected-flight="bookingData.selectedFlight"
          :selected-room="bookingData.selectedRoom"
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
                <div class="price-name">{{ $t('bookingSummary.baseCost') }}</div>
                <div class="price-description">{{ getBasePriceDescription() }}</div>
                <div class="price-value">{{ basePrice }} €</div>
              </div>
              
              <div class="price-item">
                <div class="price-name">{{ $t('bookingSummary.insurance') }}</div>
                <div class="price-description">{{ getInsuranceName() }} - {{ getInsuranceDescription() }}</div>
                <div class="price-value">
                  {{ bookingData.additionalServices.insurance.included ? '0' : '+' + bookingData.additionalServices.insurance.price }}
                </div>
              </div>
              
              <div class="price-item">
                <div class="price-name">{{ $t('bookingSummary.transfer') }}</div>
                <div class="price-description">{{ getTransferName() }} - {{ getTransferDescription() }}</div>
                <div class="price-value">
                  {{ bookingData.additionalServices.transfer.included ? '0' : '+' + bookingData.additionalServices.transfer.price + ' €' }}
                </div>
              </div>
              
              <div v-if="bookingData.additionalServices.covidInsurance.type === 'COVID_19'" class="price-item">
                <div class="price-name">{{ $t('bookingSummary.covidInsurance') }}</div>
                <div class="price-description">{{ $t('additionalServices.additionalCovid') }}</div>
                <div class="price-value">+ {{ bookingData.additionalServices.covidInsurance.price }} €</div>
              </div>
              
              <div class="price-item total">
                <div class="price-name">{{ $t('searchResults.total') }}</div>
                <div class="price-description"></div>
                <div class="price-value">{{ totalPrice }} €</div>
              </div>
            </div>

            <div class="booking-actions">
              <button 
                class="book-button"
                @click="handleBook"
                :disabled="!canProceedToBooking"
              >
                {{ $t('hotelCard.book') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Search Result -->
      <div v-else class="no-result-state">
        <div class="no-result-icon">🔍</div>
        <h3>{{ $t('bookingSummary.searchResultNotFound') }}</h3>
        <p>{{ $t('bookingSummary.searchResultNotFoundDesc') }}</p>
        <button class="back-to-search-button" @click="goBackToSearch">
          {{ $t('bookingSummary.backToSearch') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useBooking } from '../composables/useBooking'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../composables/useNotifications'
import '../styles/spinners.css'
// Import components directly
import HotelInfoBlock from '../components/booking/HotelInfoBlock.vue'
import RoomSelectionBlock from '../components/booking/RoomSelectionBlock.vue'
import FlightSelectionBlock from '../components/booking/FlightSelectionBlock.vue'
import TouristDataBlock from '../components/booking/TouristDataBlock.vue'
import AdditionalServicesBlock from '../components/booking/AdditionalServicesBlock.vue'
import type { BookingNotes, TouristData } from '../types/booking'

// Props
interface Props {
  searchResultId: string
}

const props = defineProps<Props>()

// I18n
const { t: $t } = useI18n()

// Composables
const authStore = useAuthStore()
const { showError } = useNotifications()

// Wrapper for updateTourist to match TouristDataBlock emit signature
const updateTourist = (touristId: string, field: keyof TouristData, value: string | number | boolean) => {
  updateTouristOriginal(touristId, { [field]: value })
}
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
  resetSelectedFlight,
  updateTourist: updateTouristOriginal,
  updateAdditionalServices,
  createBooking,
  goBackToSearch,
  clearError
} = useBooking()


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
        // Loaded search result from sessionStorage
        
        // Validate search result structure
        if (!searchResult || typeof searchResult !== 'object') {
          throw new Error('Invalid search result format')
        }
        
        initializeBooking(searchResult)
        return
      } catch {
        // Failed to parse stored search result
        sessionStorage.removeItem('bookingSearchResult')
      }
    }
    
    // Try to get search result from router state
    const stateSearchResult = history.state?.searchResult
    if (stateSearchResult) {
      initializeBooking(stateSearchResult)
      return
    }
    
    // Load search result from sessionStorage
    if (!props.searchResultId) {
      throw new Error('Search result ID is required')
    }
    
    // Try to load from bookingSearchResult first (most recent)
    const bookingSearchResult = sessionStorage.getItem('bookingSearchResult')
    if (bookingSearchResult) {
      const result = JSON.parse(bookingSearchResult)
      initializeBooking(result)
      return
    }
    
    // Try to load from searchState
    const searchState = sessionStorage.getItem('searchState')
    if (searchState) {
      const parsedState = JSON.parse(searchState)
      const searchResults = parsedState.searchResults
      
      if (searchResults && searchResults[props.searchResultId]) {
        const result = searchResults[props.searchResultId]
        initializeBooking(result)
        return
      }
    }
    
    // If not found in sessionStorage, try to load from allLoadedResults
    const allLoadedResults = sessionStorage.getItem('allLoadedResults')
    if (allLoadedResults) {
      const parsedResults = JSON.parse(allLoadedResults)
      if (parsedResults[props.searchResultId]) {
        const result = parsedResults[props.searchResultId]
        initializeBooking(result)
        return
      }
    }
    
    throw new Error('Search result not found')
    
  } catch (err) {
    // Failed to load search result
    // Set error state to show error message to user
    if (err instanceof Error) {
      // You might want to set an error state here
    }
  }
}

const retryLoad = () => {
  clearError()
  loadSearchResult()
}

// const handleCalculate = async () => {
//   const result = await calculateBooking()
//   if (result) {
//     // Booking calculated
//   }
// }

const handleBook = async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    showError($t('auth.loginRequired'), $t('auth.loginRequiredForBooking'))
    return
  }
  
  // Scroll to top to show the spinner
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  const result = await createBooking(bookingNotes.value)
  if (result) {
    // Booking created
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
      return 'STANDARD 10000 €'
    case 'STANDARD_PLUS':
      return 'STANDARD PLUS TR 30 000 €'
    case 'NONE':
      return $t('additionalServices.noInsurance')
    default:
      return insurance.type
  }
}

const getInsuranceDescription = () => {
  const insurance = bookingData.value.additionalServices.insurance
  switch (insurance.type) {
    case 'STANDARD':
      return $t('additionalServices.standardInsurance')
    case 'STANDARD_PLUS':
      return $t('additionalServices.extendedInsurance')
    case 'NONE':
      return $t('additionalServices.insuranceDecline')
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
      return $t('additionalServices.groupBus')
    case 'INDIVIDUAL':
      return $t('additionalServices.individualTransfer')
    case 'VIP':
      return $t('additionalServices.vipTransfer')
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
    parts.push($t('bookingSummary.flight'))
  }
  
  // Добавляем проживание
  parts.push($t('bookingSummary.accommodation'))
  
  // Добавляем питание из выбранной комнаты
  let mealName = 'питание'
  if (bookingData.value.selectedRoom?.meal?.full_name) {
    mealName = bookingData.value.selectedRoom.meal.full_name
  } else if (bookingData.value.selectedRoom?.meal?.name) {
    mealName = bookingData.value.selectedRoom.meal.name
  } else if ('accommodation' in result && result.accommodation?.meal?.full_name) {
    mealName = result.accommodation.meal.full_name
  } else if ('accommodation' in result && result.accommodation?.meal?.name) {
    mealName = result.accommodation.meal.name
  }
  
  // Форматируем питание: "питание по системе {НАЗВАНИЕ}"
  const mealDescription = `${$t('bookingSummary.mealBySystem')} ${mealName.toUpperCase()}`
  parts.push(mealDescription)
  
  return parts.join(' + ')
}

// Validation
const validateTouristData = () => {
  const errors: Record<string, Record<string, string>> = {}
  
  bookingData.value.tourists.forEach((tourist) => {
    const touristErrors: Record<string, string> = {}
    
    // Валидация имени
    if (!tourist.firstName.trim()) {
      touristErrors.firstName = $t('bookingSummary.nameRequired')
    }
    
    // Валидация фамилии
    if (!tourist.lastName.trim()) {
      touristErrors.lastName = $t('bookingSummary.lastNameRequired')
    }
    
    // Строгая валидация даты рождения
    if (!tourist.birthDate) {
      touristErrors.birthDate = $t('bookingSummary.birthDateRequired')
    } else {
      const date = new Date(tourist.birthDate)
      const today = new Date()
      
      if (isNaN(date.getTime())) {
        touristErrors.birthDate = 'Неверный формат даты рождения'
      } else if (date > today) {
        touristErrors.birthDate = 'Дата рождения не может быть из будущего'
      } else {
        // Проверяем возраст
        const age = today.getFullYear() - date.getFullYear()
        const monthDiff = today.getMonth() - date.getMonth()
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age
        
        if (actualAge < 0) {
          touristErrors.birthDate = 'Возраст не может быть отрицательным'
        } else if (actualAge > 120) {
          touristErrors.birthDate = 'Возраст не может быть больше 120 лет'
        } else if (tourist.title === 'CHD' && actualAge >= 18) {
          touristErrors.birthDate = 'Ребенок не может быть старше 17 лет'
        } else if (tourist.title !== 'CHD' && actualAge < 18) {
          touristErrors.birthDate = 'Взрослый не может быть младше 18 лет'
        }
      }
    }
    
    // Валидация номера паспорта
    if (!tourist.passportNumber.trim()) {
      touristErrors.passportNumber = $t('bookingSummary.passportNumberRequired')
    }
    
    // Валидация срока действия паспорта
    if (!tourist.passportExpiry) {
      touristErrors.passportExpiry = $t('bookingSummary.passportExpiryRequired')
    } else {
      const expiryDate = new Date(tourist.passportExpiry)
      const today = new Date()
      
      if (isNaN(expiryDate.getTime())) {
        touristErrors.passportExpiry = 'Неверный формат даты'
      } else if (expiryDate <= today) {
        touristErrors.passportExpiry = 'Паспорт должен быть действителен'
      }
    }
    
    // Валидация гражданства
    if (!tourist.nationality) {
      touristErrors.nationality = $t('bookingSummary.nationalityRequired')
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
  // Check if user is authenticated when page loads
  if (!authStore.isAuthenticated) {
    showError($t('auth.loginRequired'), $t('auth.loginRequiredForBooking'))
    return
  }
  
  try {
    await loadSearchResult()
  } catch {
    // Error in BookingView onMounted
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

.booking-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 2rem;
}

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
