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
  const initializeBooking = (result: SearchResult | GroupedSearchResult, preserveSelection = false) => {
    searchResult.value = result
    bookingData.searchResult = result as SearchResult
    
    // Only auto-select if no room is currently selected and we're not preserving selection
    if (!preserveSelection && !bookingData.selectedRoom) {
      if ('roomOptions' in result && result.roomOptions?.length > 0) {
        const firstRoom = result.roomOptions[0]
        bookingData.selectedRoom = {
          room: firstRoom.room,
          meal: firstRoom.meal,
          placement: firstRoom.placement,
          price: firstRoom.price
        }
        logger.booking('Auto-selected first room')
      } else if ('accommodation' in result && result.accommodation) {
        // For regular SearchResult
        bookingData.selectedRoom = {
          room: result.accommodation.room,
          meal: result.accommodation.meal,
          placement: result.accommodation.placement,
          price: result.price
        }
        logger.booking('Auto-selected room from regular result')
      }
    } else if (preserveSelection) {
      logger.booking('Preserved existing room selection')
    }
    
    // Auto-select first flight if available
    if ('flightOptions' in result && result.flightOptions?.length > 0) {
      const firstFlight = result.flightOptions[0]
      bookingData.selectedFlight = {
        outbound: firstFlight.from,
        inbound: firstFlight.to
      }
      logger.booking('Auto-selected first flight')
    } else if ('tickets' in result && result.tickets) {
      // For regular SearchResult
      bookingData.selectedFlight = {
        outbound: result.tickets.from,
        inbound: result.tickets.to
      }
      logger.booking('Auto-selected flight from regular result')
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
    
    logger.booking('Booking initialized')
  }

  // Update selected flight
  const updateSelectedFlight = (flight: SelectedFlight) => {
    bookingData.selectedFlight = flight
    console.log('🔍 updateSelectedFlight called:', {
      outbound: {
        id: flight.outbound.id,
        name: flight.outbound.name,
        airline: flight.outbound.airline?.airline
      },
      inbound: {
        id: flight.inbound.id,
        name: flight.inbound.name,
        airline: flight.inbound.airline?.airline
      },
      outboundId: flight.outbound.id,
      inboundId: flight.inbound.id
    })
    logger.booking('Selected flight updated')
  }

  // Update selected room
  const updateSelectedRoom = (room: SelectedRoom) => {
    bookingData.selectedRoom = room
    console.log('🔍 updateSelectedRoom called:', {
      room: {
        id: room.room.id,
        name: room.room.name
      },
      meal: {
        id: room.meal.id,
        name: room.meal.name
      },
      price: {
        amount: room.price?.amount,
        currency: room.price?.currency
      },
      roomId: room.room.id,
      mealId: room.meal.id
    })
    logger.booking('Selected room updated')
  }

  // Reset selected flight (when room changes)
  const resetSelectedFlight = () => {
    bookingData.selectedFlight = undefined
    // logger.booking('Selected flight reset due to room change')
  }

  // Update tourist data
  const updateTourist = (touristId: string, data: Partial<TouristData>) => {
    const index = bookingData.tourists.findIndex(t => t.id === touristId)
    if (index !== -1) {
      bookingData.tourists[index] = { ...bookingData.tourists[index], ...data }
      // Removed excessive logging to prevent console spam
      // logger.booking('Tourist data updated:', touristId)
    }
  }

  // Update additional services
  const updateAdditionalServices = (services: Partial<AdditionalServices>) => {
    bookingData.additionalServices = { ...bookingData.additionalServices, ...services }
    logger.booking('Additional services updated')
  }

  // Calculate booking price
  const calculateBooking = async (): Promise<BookingCalculationResponse | null> => {
    if (!searchResult.value) return null

    try {
      loading.value = true
      clearError()

      // Create proper OBS booking hash from search result
      const obsBookingHash = searchResult.value.rid && searchResult.value.unique_key 
        ? `${searchResult.value.rid}:${searchResult.value.unique_key}`
        : null

      if (!obsBookingHash) {
        throw new Error('Invalid search result: missing rid or unique_key for calculation')
      }

      const requestData = {
        booking_hash: obsBookingHash,
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

      logger.booking('Booking calculation completed')
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
  const createBooking = async (bookingNotes?: any): Promise<BookingCreateResponse | null> => {
    if (!searchResult.value) return null

    // Validate that user has selected room and flight
    if (!bookingData.selectedRoom) {
      throw new Error('Пожалуйста, выберите тип размещения')
    }
    
    if (!bookingData.selectedFlight) {
      throw new Error('Пожалуйста, выберите перелет')
    }

    try {
      loading.value = true
      clearError()

      // For debugging: send data in the format expected by the local booking controller
      // Use the same structure as seeds for consistency
      
      
      // Create proper OBS booking hash from selected room and flight
      // We need to find the specific result that matches our selection
      let obsBookingHash = null
      
      if (searchResult.value && 'roomOptions' in searchResult.value) {
        const groupedResult = searchResult.value as GroupedSearchResult
        
        console.log('🔍 Searching for matching room and flight:', {
          selectedRoomId: bookingData.selectedRoom?.room.id,
          selectedMealId: bookingData.selectedRoom?.meal.id,
          selectedOutboundId: bookingData.selectedFlight?.outbound.id,
          selectedInboundId: bookingData.selectedFlight?.inbound.id,
          availableRoomOptions: groupedResult.roomOptions?.length
        })
        
        // Find the room option that matches our selection
        const selectedRoomOption = groupedResult.roomOptions?.find(option => 
          option.room.id === bookingData.selectedRoom?.room.id &&
          option.meal.id === bookingData.selectedRoom?.meal.id
        )
        
        console.log('🔍 Selected room option found:', {
          found: !!selectedRoomOption,
          roomId: selectedRoomOption?.room.id,
          mealId: selectedRoomOption?.meal.id,
          flightOptionsCount: selectedRoomOption?.flightOptions?.length
        })
        
        if (selectedRoomOption && bookingData.selectedFlight) {
          console.log('🔍 Available flight options:', selectedRoomOption.flightOptions?.map(flight => ({
            fromId: flight.from.id,
            toId: flight.to.id,
            price: flight.price?.amount,
            rid: flight.rid,
            unique_key: flight.unique_key
          })))
          
          // Find the flight option that matches our selection
          const selectedFlightOption = selectedRoomOption.flightOptions?.find(flight => 
            flight.from.id === bookingData.selectedFlight?.outbound.id &&
            flight.to.id === bookingData.selectedFlight?.inbound.id
          )
          
          console.log('🔍 Selected flight option found:', {
            found: !!selectedFlightOption,
            fromId: selectedFlightOption?.from.id,
            toId: selectedFlightOption?.to.id,
            rid: selectedFlightOption?.rid,
            unique_key: selectedFlightOption?.unique_key
          })
          
          // Now flightOptions have rid/unique_key, so we can use the specific flight option's hash
          if (selectedFlightOption && selectedFlightOption.rid && selectedFlightOption.unique_key) {
            obsBookingHash = `${selectedFlightOption.rid}:${selectedFlightOption.unique_key}`
            console.log('🔍 Using specific flight option booking hash:', {
              rid: selectedFlightOption.rid,
              unique_key: selectedFlightOption.unique_key,
              price: selectedFlightOption.price?.amount
            })
          }
        }
      }
      
      // Fallback to original logic if we couldn't find the specific selection
      if (!obsBookingHash && searchResult.value.rid && searchResult.value.unique_key) {
        obsBookingHash = `${searchResult.value.rid}:${searchResult.value.unique_key}`
        console.log('🔍 Using fallback booking hash from search result')
      }

      if (!obsBookingHash) {
        throw new Error('Invalid search result: missing rid or unique_key for booking')
      }

      console.log('🔍 Creating booking with data:', {
        selectedRoom: {
          roomId: bookingData.selectedRoom?.room?.id,
          roomName: bookingData.selectedRoom?.room?.name,
          mealId: bookingData.selectedRoom?.meal?.id,
          mealName: bookingData.selectedRoom?.meal?.name,
          price: bookingData.selectedRoom?.price?.amount
        },
        selectedFlight: {
          outboundId: bookingData.selectedFlight?.outbound?.id,
          outboundName: bookingData.selectedFlight?.outbound?.name,
          inboundId: bookingData.selectedFlight?.inbound?.id,
          inboundName: bookingData.selectedFlight?.inbound?.name
        },
        totalPrice: totalPrice.value,
        obsBookingHash
      })

      const requestData = {
        booking: {
          // search_id is optional and not needed for booking creation
          // search_id: searchResult.value.unique_key, // This was causing 404 error
          booking_hash: obsBookingHash,
          total_amount: totalPrice.value,
          tour_details: {
            hotel_name: searchResult.value.hotel?.name || BOOKING_DEFAULTS.DEFAULTS.HOTEL_NAME,
            hotel_category: searchResult.value.hotel?.category || BOOKING_DEFAULTS.DEFAULTS.HOTEL_CATEGORY,
            city: searchResult.value.hotel?.city || searchResult.value.destination?.name || BOOKING_DEFAULTS.DEFAULTS.CITY,
            room_type: bookingData.selectedRoom?.room?.name || null,
            meal_plan: bookingData.selectedRoom?.meal?.name || null,
            check_in: searchResult.value.dates?.check_in || null,
            check_out: searchResult.value.dates?.check_out || null,
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
            notes: bookingNotes || bookingData.notes
          }
        }
      }

      logger.apiCall('POST', '/bookings')
      const response = await apiClient.post<any>('/bookings', requestData)

      logger.booking('Booking created successfully')
      
      // Clear saved search state since booking is complete
      try {
        sessionStorage.removeItem('searchState')
        sessionStorage.removeItem('allLoadedResults')
        logger.booking('Search state cleared after successful booking')
      } catch (error) {
        logger.warn('Failed to clear search state:', error)
      }
      
      // Small delay to ensure user sees the success state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to bookings page or show success message
      router.push({ name: 'bookings' })
      
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking'
      logger.error('Booking creation failed:', err)
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
