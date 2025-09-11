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
import { BOOKING_DEFAULTS } from '../constants/bookingDefaults'

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

  // Базовая стоимость тура (без дополнительных услуг)
  const basePrice = computed(() => {
    if (!searchResult.value) return 0
    
    // For grouped results, find the exact price for selected room + flight combination
    if ('roomOptions' in searchResult.value && bookingData.selectedRoom && bookingData.selectedFlight) {
      const groupedResult = searchResult.value as GroupedSearchResult
      
      // Find the selected room option
      const selectedRoomOption = groupedResult.roomOptions?.find(option => 
        option.room.id === bookingData.selectedRoom?.room.id &&
        option.meal.id === bookingData.selectedRoom?.meal.id &&
        option.placement.id === bookingData.selectedRoom?.placement.id
      )
      
      if (selectedRoomOption) {
        // Find the flight option with matching flight IDs
        const selectedFlightOption = selectedRoomOption.flightOptions?.find(option => 
          option.from.id === bookingData.selectedFlight?.outbound.id &&
          option.to.id === bookingData.selectedFlight?.inbound.id
        )
        
        if (selectedFlightOption?.price?.amount) {
          return selectedFlightOption.price.amount
        }
      }
    }
    
    // Fallback: Get price from selected room only
    if (bookingData.selectedRoom?.price?.amount) {
      return bookingData.selectedRoom.price.amount
    }
    
    // Fallback: Get price from selected flight or base price
    if ('flightOptions' in searchResult.value && bookingData.selectedFlight) {
      const groupedResult = searchResult.value as GroupedSearchResult
      const selectedOption = groupedResult.flightOptions?.find(option => {
        const outboundId = bookingData.selectedFlight?.outbound.id
        const inboundId = bookingData.selectedFlight?.inbound.id
        return option.from.id === outboundId && option.to.id === inboundId
      })
      return selectedOption?.price?.amount || groupedResult.price?.amount || 0
    } else {
      return searchResult.value.price?.amount || 0
    }
  })

  // Полная стоимость с дополнительными услугами
  const totalPrice = computed(() => {
    let total = basePrice.value
    
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
    
    // Auto-select first room if available
    if ('roomOptions' in result && result.roomOptions?.length > 0) {
      const firstRoom = result.roomOptions[0]
      bookingData.selectedRoom = {
        room: firstRoom.room,
        meal: firstRoom.meal,
        placement: firstRoom.placement,
        price: firstRoom.price
      }
      logger.info('Auto-selected first room:', bookingData.selectedRoom)
    } else if ('accommodation' in result && result.accommodation) {
      // For regular SearchResult
      bookingData.selectedRoom = {
        room: result.accommodation.room,
        meal: result.accommodation.meal,
        placement: result.accommodation.placement,
        price: result.price
      }
      logger.info('Auto-selected room from regular result:', bookingData.selectedRoom)
    }
    
    // Auto-select first flight if available
    if ('flightOptions' in result && result.flightOptions?.length > 0) {
      const firstFlight = result.flightOptions[0]
      bookingData.selectedFlight = {
        outbound: firstFlight.from,
        inbound: firstFlight.to
      }
      logger.info('Auto-selected first flight:', bookingData.selectedFlight)
    } else if ('tickets' in result && result.tickets) {
      // For regular SearchResult
      bookingData.selectedFlight = {
        outbound: result.tickets.from,
        inbound: result.tickets.to
      }
      logger.info('Auto-selected flight from regular result:', bookingData.selectedFlight)
    }
    
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

  // Update selected room
  const updateSelectedRoom = (room: SelectedRoom) => {
    bookingData.selectedRoom = room
    logger.info('Selected room updated:', room)
  }

  // Reset selected flight (when room changes)
  const resetSelectedFlight = () => {
    bookingData.selectedFlight = undefined
    logger.info('Selected flight reset due to room change')
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

      // For debugging: send data in the format expected by the local booking controller
      const requestData = {
        customer_data: {
          tourists: bookingData.tourists,
          selected_flight: bookingData.selectedFlight,
          selected_room: bookingData.selectedRoom,
          additional_services: bookingData.additionalServices,
          notes: bookingData.notes
        }
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

      // For debugging: send data in the format expected by the local booking controller
      // Use the same structure as seeds for consistency
      const requestData = {
        booking: {
          search_id: searchResult.value.unique_key,
          booking_hash: `LOCAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          total_amount: totalPrice.value,
          tour_details: {
            hotel_name: searchResult.value.hotel?.name || BOOKING_DEFAULTS.DEFAULTS.HOTEL_NAME,
            hotel_category: searchResult.value.hotel?.category || BOOKING_DEFAULTS.DEFAULTS.HOTEL_CATEGORY,
            city: searchResult.value.hotel?.city || searchResult.value.destination?.name || BOOKING_DEFAULTS.DEFAULTS.CITY,
            room_type: bookingData.selectedRoom?.room?.name || null,
            meal_plan: bookingData.selectedRoom?.meal?.name || null,
            check_in: searchResult.value.check_in || null,
            check_out: searchResult.value.check_out || null,
            nights: searchResult.value.nights || 0,
            currency: BOOKING_DEFAULTS.DEFAULTS.CURRENCY,
            tourists: bookingData.tourists || [],
            flight_info: {
              departure: {
                date: bookingData.selectedFlight?.outbound?.departure?.date || 'N/A',
                time: bookingData.selectedFlight?.outbound?.departure?.time || 'N/A',
                airport: bookingData.selectedFlight?.outbound?.airports?.from?.name || 'N/A',
                city: bookingData.selectedFlight?.outbound?.airports?.from?.name || 'N/A'
              },
              arrival: {
                date: bookingData.selectedFlight?.inbound?.departure?.date || 'N/A',
                time: bookingData.selectedFlight?.inbound?.departure?.time || 'N/A',
                airport: bookingData.selectedFlight?.inbound?.airports?.from?.name || 'N/A',
                city: bookingData.selectedFlight?.inbound?.airports?.from?.name || 'N/A'
              }
            }
          },
          customer_data: {
            tourists: bookingData.tourists,
            selected_flight: bookingData.selectedFlight,
            selected_room: bookingData.selectedRoom,
            additional_services: bookingData.additionalServices,
            notes: bookingData.notes
          }
        }
      }

      logger.apiCall('POST', '/bookings')
      const response = await apiClient.post<BookingCreateResponse>('/bookings', requestData)

      logger.info('Booking created successfully:', response)
      
      // Clear saved search state since booking is complete
      try {
        sessionStorage.removeItem('searchState')
        logger.info('🗑️ Search state cleared after successful booking')
      } catch (error) {
        logger.warn('Failed to clear search state:', error)
      }
      
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
    basePrice: computed(() => basePrice.value),
    totalPrice: computed(() => totalPrice.value),
    
    // Data
    searchResult: computed(() => searchResult.value),
    bookingData: computed(() => bookingData),
    
    // Methods
    initializeBooking,
    updateSelectedFlight,
    updateSelectedRoom,
    resetSelectedFlight,
    updateTourist,
    updateAdditionalServices,
    calculateBooking,
    createBooking,
    goBackToSearch,
    resetBooking,
    clearError
  }
}
