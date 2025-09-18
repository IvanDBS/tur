import { computed } from 'vue'
import { BOOKING_DEFAULTS, getDefaultValue, extractDataByPriority } from '../constants/bookingDefaults'
import { logger } from '../utils/logger'

export function useBookingData(booking: any, isAdminMode: boolean = false) {
  // Hotel data
  const getHotelName = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      return extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.HOTEL_NAME], 
        BOOKING_DEFAULTS.DEFAULTS.HOTEL_NAME
      )
    }
    
    const tourDetails = booking.tour_details as any
    if (tourDetails?.hotel?.hotel) {
      return tourDetails.hotel.hotel
    }
    if (tourDetails?.hotel?.name) {
      return tourDetails.hotel.name
    }
    return tourDetails?.hotel_name || 'Информация об отеле недоступна'
  }

  const getHotelCategory = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      return extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.HOTEL_CATEGORY], 
        BOOKING_DEFAULTS.DEFAULTS.HOTEL_CATEGORY
      )
    }
    
    const tourDetails = booking.tour_details as any
    if (tourDetails?.hotel?.hotel_category) {
      return tourDetails.hotel.hotel_category
    }
    if (tourDetails?.hotel?.category) {
      return tourDetails.hotel.category
    }
    return tourDetails?.hotel_category || 'Категория не указана'
  }

  const getHotelCity = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      return extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.CITY], 
        BOOKING_DEFAULTS.DEFAULTS.CITY
      )
    }
    
    const tourDetails = booking.tour_details as any
    if (tourDetails?.hotel?.city) {
      return tourDetails.hotel.city
    }
    return tourDetails?.city || 'Город не указан'
  }

  const getRoomType = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      return extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.ROOM_TYPE], 
        BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE
      )
    }
    
    const tourDetails = booking.tour_details as any
    if (tourDetails?.hotel?.room) {
      return tourDetails.hotel.room
    }
    const roomType = tourDetails?.room_type || 
                     tourDetails?.accommodation?.room?.name ||
                     tourDetails?.selected_room?.room?.name ||
                     tourDetails?.selected_room?.name
    return getDefaultValue(roomType, BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE)
  }

  const getMealPlan = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      return extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.MEAL_PLAN], 
        BOOKING_DEFAULTS.DEFAULTS.MEAL_PLAN
      )
    }
    
    const tourDetails = booking.tour_details as any
    if (tourDetails?.hotel?.meal) {
      return tourDetails.hotel.meal
    }
    const mealPlan = tourDetails?.meal_plan || 
                     tourDetails?.accommodation?.meal?.name ||
                     tourDetails?.selected_room?.meal?.name ||
                     tourDetails?.selected_room?.meal_plan
    return getDefaultValue(mealPlan, BOOKING_DEFAULTS.DEFAULTS.MEAL_PLAN)
  }

  const getCheckInDate = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      const checkIn = extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.CHECK_IN], 
        BOOKING_DEFAULTS.DEFAULTS.CHECK_IN
      )
      
      if (checkIn && checkIn !== BOOKING_DEFAULTS.DEFAULTS.CHECK_IN && checkIn !== 'N/A') {
        try {
          if (typeof checkIn === 'string' && checkIn.includes('.')) {
            const parts = checkIn.split('.')
            if (parts.length === 3) {
              const [day, month, year] = parts
              const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
              return formatDateWithYear(date.toISOString())
            }
          }
          return formatDateWithYear(checkIn)
        } catch {
          return checkIn
        }
      }
      return BOOKING_DEFAULTS.DEFAULTS.CHECK_IN
    }
    
    const tourDetails = booking.tour_details as any
    const customerData = booking.customer_data as any
    
    const checkIn = tourDetails?.hotel?.check_in ||
                    tourDetails?.check_in || 
                    tourDetails?.dates?.check_in ||
                    tourDetails?.accommodation?.check_in ||
                    tourDetails?.selected_room?.check_in ||
                    tourDetails?.search_result?.check_in
    
    if (checkIn && checkIn !== 'N/A' && checkIn !== 'Не указано') {
      try {
        if (typeof checkIn === 'string' && checkIn.includes('.')) {
          const parts = checkIn.split('.')
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
            return formatDateWithYear(date.toISOString())
          }
        }
        return formatDateWithYear(checkIn)
      } catch {
        return checkIn
      }
    }
    
    const customerCheckIn = customerData?.selected_room?.check_in ||
                           customerData?.search_result?.check_in ||
                           customerData?.searchResult?.check_in ||
                           customerData?.dates?.check_in ||
                           customerData?.accommodation?.check_in
    
    if (customerCheckIn && customerCheckIn !== 'N/A' && customerCheckIn !== 'Не указано') {
      try {
        if (typeof customerCheckIn === 'string' && customerCheckIn.includes('.')) {
          const parts = customerCheckIn.split('.')
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
            return formatDateWithYear(date.toISOString())
          }
        }
        return formatDateWithYear(customerCheckIn)
      } catch {
        return customerCheckIn
      }
    }
    
    return 'Не указано'
  }

  const getCheckOutDate = () => {
    if (isAdminMode) {
      const data = {
        tour_details: booking.tour_details,
        customer_data: booking.customer_data
      }
      const checkOut = extractDataByPriority(
        data, 
        [...BOOKING_DEFAULTS.EXTRACTION_PRIORITY.CHECK_OUT], 
        BOOKING_DEFAULTS.DEFAULTS.CHECK_OUT
      )
      
      if (checkOut && checkOut !== BOOKING_DEFAULTS.DEFAULTS.CHECK_OUT && checkOut !== 'N/A') {
        try {
          if (typeof checkOut === 'string' && checkOut.includes('.')) {
            const parts = checkOut.split('.')
            if (parts.length === 3) {
              const [day, month, year] = parts
              const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
              return formatDateWithYear(date.toISOString())
            }
          }
          return formatDateWithYear(checkOut)
        } catch {
          return checkOut
        }
      }
      return BOOKING_DEFAULTS.DEFAULTS.CHECK_OUT
    }
    
    const tourDetails = booking.tour_details as any
    const customerData = booking.customer_data as any
    
    const checkOut = tourDetails?.hotel?.check_out ||
                     tourDetails?.check_out || 
                     tourDetails?.dates?.check_out ||
                     tourDetails?.accommodation?.check_out ||
                     tourDetails?.selected_room?.check_out ||
                     tourDetails?.search_result?.check_out
    
    if (checkOut && checkOut !== 'N/A' && checkOut !== 'Не указано') {
      try {
        if (typeof checkOut === 'string' && checkOut.includes('.')) {
          const parts = checkOut.split('.')
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
            return formatDateWithYear(date.toISOString())
          }
        }
        return formatDateWithYear(checkOut)
      } catch {
        return checkOut
      }
    }
    
    const customerCheckOut = customerData?.selected_room?.check_out ||
                            customerData?.search_result?.check_out ||
                            customerData?.searchResult?.check_out ||
                            customerData?.dates?.check_out ||
                            customerData?.accommodation?.check_out
    
    if (customerCheckOut && customerCheckOut !== 'N/A' && customerCheckOut !== 'Не указано') {
      try {
        if (typeof customerCheckOut === 'string' && customerCheckOut.includes('.')) {
          const parts = customerCheckOut.split('.')
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
            return formatDateWithYear(date.toISOString())
          }
        }
        return formatDateWithYear(customerCheckOut)
      } catch {
        return customerCheckOut
      }
    }
    
    return 'Не указано'
  }

  const getNights = () => {
    const tourDetails = booking.tour_details as any
    if (tourDetails?.hotel?.nights) {
      return tourDetails.hotel.nights
    }
    if (tourDetails?.nights?.total) {
      return tourDetails.nights.total
    }
    if (typeof tourDetails?.nights === 'number') {
      return tourDetails.nights
    }
    return tourDetails?.nights || 0
  }

  // Tourist data
  const getTourists = () => {
    const customerData = booking.customer_data as any
    logger.debug('getTourists - customer_data:', customerData)
    
    if (customerData && Array.isArray(customerData.tourists)) {
      logger.debug('getTourists - found in customer_data:', customerData.tourists)
      return customerData.tourists
    }
    
    const tourists = booking.tour_details?.tourists
    logger.debug('getTourists - tour_details.tourists:', tourists)
    
    if (Array.isArray(tourists)) {
      logger.debug('getTourists - found in tour_details:', tourists)
      return tourists
    }
    
    logger.debug('getTourists - no tourists found')
    return []
  }

  const getTouristName = (tourist: any) => {
    logger.debug('getTouristName - tourist data:', tourist)
    
    if (tourist.firstName && tourist.lastName) {
      const name = `${tourist.firstName} ${tourist.lastName}`
      logger.debug('getTouristName - using firstName/lastName:', name)
      return name
    }
    if (tourist.first_name && tourist.last_name) {
      const name = `${tourist.first_name} ${tourist.last_name}`
      logger.debug('getTouristName - using first_name/last_name:', name)
      return name
    }
    if (tourist.name) {
      logger.debug('getTouristName - using name:', tourist.name)
      return tourist.name
    }
    
    if (tourist.title && (tourist.firstName || tourist.first_name)) {
      const firstName = tourist.firstName || tourist.first_name || ''
      const lastName = tourist.lastName || tourist.last_name || ''
      const name = `${firstName} ${lastName}`.trim()
      if (name) {
        logger.debug('getTouristName - using title + name:', name)
        return name
      }
    }
    
    logger.debug('getTouristName - no name found, returning N/A')
    return 'N/A'
  }

  const getTouristPassport = (tourist: any) => {
    logger.debug('getTouristPassport - tourist data:', tourist)
    
    if (tourist.passportNumber) {
      const expiry = tourist.passportExpiry || 'N/A'
      const passport = `${tourist.passportNumber} (${expiry})`
      logger.debug('getTouristPassport - using passportNumber:', passport)
      return passport
    }
    if (tourist.passport_number) {
      const expiry = tourist.passport_expiry || 'N/A'
      const passport = `${tourist.passport_number} (${expiry})`
      logger.debug('getTouristPassport - using passport_number:', passport)
      return passport
    }
    
    logger.debug('getTouristPassport - no passport found, returning N/A')
    return 'N/A'
  }

  return {
    getHotelName,
    getHotelCategory,
    getHotelCity,
    getRoomType,
    getMealPlan,
    getCheckInDate,
    getCheckOutDate,
    getNights,
    getTourists,
    getTouristName,
    getTouristPassport
  }
}

// Helper function for date formatting
function formatDateWithYear(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
