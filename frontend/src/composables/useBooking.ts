import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '../utils/api'
import { logger } from '../utils/logger'
import type { 
  BookingData, 
  SelectedFlight, 
  TouristData, 
  AdditionalServices,
  BookingCreateRequest,
  BookingCreateResponse,
  BookingCalculationResponse
} from '../types/booking'
import type { SearchResult, GroupedSearchResult } from '../types/search'

export const useBooking = () => {
  const router = useRouter()
  
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchResult = ref<SearchResult | GroupedSearchResult | null>(null)
  
  // Booking data
  const bookingData = reactive<BookingData>({
    searchResult: {} as SearchResult,
    selectedFlight: undefined,
    tourists: [],
    additionalServices: {
      insurance: {
        type: 'STANDARD',
        coverage: '10000 EUR',
        price: 0,
        included: true
      },
      covidInsurance: {
        type: 'INCLUDED',
        price: 0
      },
      transfer: {
        type: 'GROUP',
        price: 0,
        included: true
      }
    },
    notes: ''
  })

  // Computed
  const hasSearchResult = computed(() => searchResult.value !== null)
  const canProceedToBooking = computed(() => {
    return hasSearchResult.value && 
           bookingData.tourists.length > 0 &&
           bookingData.tourists.every(tourist => 
             tourist.firstName && 
             tourist.lastName && 
             tourist.birthDate && 
             tourist.passportNumber
           )
  })

  const totalPrice = computed(() => {
    if (!searchResult.value) return 0
    
    let total = searchResult.value.price?.amount || 0
    
    // Add additional services prices
    if (!bookingData.additionalServices.insurance.included) {
      total += bookingData.additionalServices.insurance.price
    }
    if (bookingData.additionalServices.covidInsurance.type === 'COVID_19') {
      total += bookingData.additionalServices.covidInsurance.price
    }
    if (!bookingData.additionalServices.transfer.included) {
      total += bookingData.additionalServices.transfer.price
    }
    
    return total
  })

  // Methods
  const clearError = () => {
    error.value = null
  }

  const setError = (message: string) => {
    error.value = message
    logger.error('Booking Error:', message)
  }

  // Initialize booking with search result
  const initializeBooking = (result: SearchResult | GroupedSearchResult) => {
    searchResult.value = result
    bookingData.searchResult = result as SearchResult
    
    // Initialize tourists based on search result
    const adults = result.tourists?.adults || 1
    const children = result.tourists?.children_ages?.length || 0
    
    bookingData.tourists = []
    
    // Add adults
    for (let i = 0; i < adults; i++) {
      bookingData.tourists.push({
        id: `adult_${i + 1}`,
        title: 'MR',
        firstName: '',
        lastName: '',
        birthDate: '',
        passportNumber: '',
        passportExpiry: '',
        nationality: 'MOLDOVA',
        fiscalCode: ''
      })
    }
    
    // Add children
    for (let i = 0; i < children; i++) {
      bookingData.tourists.push({
        id: `child_${i + 1}`,
        title: 'MR',
        firstName: '',
        lastName: '',
        birthDate: '',
        passportNumber: '',
        passportExpiry: '',
        nationality: 'MOLDOVA',
        fiscalCode: ''
      })
    }
    
    logger.info('Booking initialized with search result:', result)
  }

  // Update selected flight
  const updateSelectedFlight = (flight: SelectedFlight) => {
    bookingData.selectedFlight = flight
    logger.info('Selected flight updated:', flight)
  }

  // Update tourist data
  const updateTourist = (touristId: string, data: Partial<TouristData>) => {
    const index = bookingData.tourists.findIndex(t => t.id === touristId)
    if (index !== -1) {
      bookingData.tourists[index] = { ...bookingData.tourists[index], ...data }
      logger.info('Tourist data updated:', touristId, data)
    }
  }

  // Update additional services
  const updateAdditionalServices = (services: Partial<AdditionalServices>) => {
    bookingData.additionalServices = { ...bookingData.additionalServices, ...services }
    logger.info('Additional services updated:', services)
  }

  // Calculate booking price
  const calculateBooking = async (): Promise<BookingCalculationResponse | null> => {
    if (!searchResult.value) return null

    try {
      loading.value = true
      clearError()

      const requestData: BookingCreateRequest = {
        search_result_id: searchResult.value.unique_key,
        selected_flight: bookingData.selectedFlight,
        tourists: bookingData.tourists,
        additional_services: bookingData.additionalServices,
        notes: bookingData.notes
      }

      logger.apiCall('POST', '/bookings/calculate')
      const response = await apiClient.post<BookingCalculationResponse>('/bookings/calculate', requestData)

      logger.info('Booking calculation response:', response)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate booking'
      setError(message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create booking
  const createBooking = async (): Promise<BookingCreateResponse | null> => {
    if (!searchResult.value) return null

    try {
      loading.value = true
      clearError()

      const requestData: BookingCreateRequest = {
        search_result_id: searchResult.value.unique_key,
        selected_flight: bookingData.selectedFlight,
        tourists: bookingData.tourists,
        additional_services: bookingData.additionalServices,
        notes: bookingData.notes
      }

      logger.apiCall('POST', '/bookings')
      const response = await apiClient.post<BookingCreateResponse>('/bookings', requestData)

      logger.info('Booking created successfully:', response)
      
      // Redirect to bookings page or show success message
      router.push({ name: 'bookings' })
      
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking'
      setError(message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Navigate back to search
  const goBackToSearch = () => {
    router.push({ name: 'search' })
  }

  // Reset booking data
  const resetBooking = () => {
    searchResult.value = null
    bookingData.searchResult = {} as SearchResult
    bookingData.selectedFlight = undefined
    bookingData.tourists = []
    bookingData.additionalServices = {
      insurance: {
        type: 'STANDARD',
        coverage: '10000 EUR',
        price: 0,
        included: true
      },
      covidInsurance: {
        type: 'INCLUDED',
        price: 0
      },
      transfer: {
        type: 'GROUP',
        price: 0,
        included: true
      }
    }
    bookingData.notes = ''
    clearError()
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    hasSearchResult: computed(() => hasSearchResult.value),
    canProceedToBooking: computed(() => canProceedToBooking.value),
    totalPrice: computed(() => totalPrice.value),
    
    // Data
    searchResult: computed(() => searchResult.value),
    bookingData: computed(() => bookingData),
    
    // Methods
    initializeBooking,
    updateSelectedFlight,
    updateTourist,
    updateAdditionalServices,
    calculateBooking,
    createBooking,
    goBackToSearch,
    resetBooking,
    clearError
  }
}
