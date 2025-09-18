import { logger } from '../utils/logger'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFlightData(booking: any) {
  // Helper functions to get flight data (exact same logic as AdminBookingsView)
  const getDepartureFlight = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tourDetails = booking.tour_details as any
    logger.debug('getDepartureFlight - tourDetails:', tourDetails)
    logger.debug('getDepartureFlight - flights:', tourDetails?.flights)
    logger.debug('getDepartureFlight - there:', tourDetails?.flights?.there)
    
    // Try OBS flights structure first
    if (tourDetails?.flights?.there) {
      return tourDetails.flights.there
    }
    return null
  }

  const getArrivalFlight = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tourDetails = booking.tour_details as any
    // Try OBS flights structure first
    if (tourDetails?.flights?.back) {
      return tourDetails.flights.back
    }
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const normalizeDate = (dateString: string) => {
    logger.debug('normalizeDate - input:', dateString, 'type:', typeof dateString)
    
    if (!dateString || dateString === 'N/A') {
      logger.debug('normalizeDate - returning N/A for empty/null input')
      return 'N/A'
    }
    
    // If already in DD.MM.YYYY format, return as is
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      logger.debug('normalizeDate - already in DD.MM.YYYY format:', dateString)
      return dateString
    }
    
    // If in YYYY-MM-DD format, convert to DD.MM.YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-')
      const result = `${day}.${month}.${year}`
      logger.debug('normalizeDate - converted from YYYY-MM-DD:', dateString, 'to:', result)
      return result
    }
    
    // Try to parse as Date and format
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const result = `${day}.${month}.${year}`
        logger.debug('normalizeDate - parsed as Date:', dateString, 'to:', result)
        return result
      }
    } catch (error) {
      logger.debug('normalizeDate - error parsing date:', dateString, error)
    }
    
    logger.debug('normalizeDate - returning original string:', dateString)
    return dateString
  }

  const getSelectedFlight = () => {
    const departureFlight = getDepartureFlight()
    const arrivalFlight = getArrivalFlight()
    
    logger.debug('getSelectedFlight - searching for flight data:', {
      hasDepartureFlight: !!departureFlight,
      hasArrivalFlight: !!arrivalFlight,
      departureFlight,
      arrivalFlight,
      tourDetails: booking.tour_details
    })
    
    // Return true if we have any flight data (same logic as table)
    return !!(departureFlight || arrivalFlight)
  }

  const getOutboundFrom = () => {
    const departureFlight = getDepartureFlight()
    logger.debug('getOutboundFrom - departure flight data:', departureFlight)
    
    if (departureFlight?.departure?.airport) {
      const airport = departureFlight.departure.airport
      const from = `${airport.name} (${airport.prefix})`
      logger.debug('getOutboundFrom - using departure.airport:', from)
      return from
    }
    
    logger.debug('getOutboundFrom - no data found, returning N/A')
    return 'N/A'
  }

  const getInboundFrom = () => {
    const arrivalFlight = getArrivalFlight()
    logger.debug('getInboundFrom - arrival flight data:', arrivalFlight)
    
    if (arrivalFlight?.departure?.airport) {
      const airport = arrivalFlight.departure.airport
      const from = `${airport.name} (${airport.prefix})`
      logger.debug('getInboundFrom - using departure.airport:', from)
      return from
    }
    
    logger.debug('getInboundFrom - no data found, returning N/A')
    return 'N/A'
  }

  const getOutboundDeparture = () => {
    const departureFlight = getDepartureFlight()
    logger.debug('getOutboundDeparture - departure flight data:', departureFlight)
    logger.debug('getOutboundDeparture - departure time:', departureFlight?.departure?.time)
    logger.debug('getOutboundDeparture - departure date:', departureFlight?.departure?.date)
    logger.debug('getOutboundDeparture - flight date:', departureFlight?.date)
    
    if (departureFlight?.departure?.time) {
      // Use departure.date if available, otherwise use flight date
      const dateToUse = departureFlight.departure.date || departureFlight.date
      const formattedDate = normalizeDate(dateToUse)
      const result = `${departureFlight.departure.time} ${formattedDate}`
      logger.debug('getOutboundDeparture - using departure flight:', result)
      return result
    }
    
    logger.debug('getOutboundDeparture - no data found, returning N/A')
    return 'N/A'
  }

  const getInboundDeparture = () => {
    const arrivalFlight = getArrivalFlight()
    logger.debug('getInboundDeparture - arrival flight data:', arrivalFlight)
    logger.debug('getInboundDeparture - departure time:', arrivalFlight?.departure?.time)
    logger.debug('getInboundDeparture - departure date:', arrivalFlight?.departure?.date)
    logger.debug('getInboundDeparture - flight date:', arrivalFlight?.date)
    
    if (arrivalFlight?.departure?.time) {
      // Use departure.date if available, otherwise use flight date
      const dateToUse = arrivalFlight.departure.date || arrivalFlight.date
      const formattedDate = normalizeDate(dateToUse)
      const result = `${arrivalFlight.departure.time} ${formattedDate}`
      logger.debug('getInboundDeparture - using arrival flight:', result)
      return result
    }
    
    logger.debug('getInboundDeparture - no data found, returning N/A')
    return 'N/A'
  }

  const getOutboundFlightInfo = () => {
    const departureFlight = getDepartureFlight()
    logger.debug('getOutboundFlightInfo - departure flight data:', departureFlight)
    
    if (departureFlight) {
      const flightNumber = getFlightNumber(departureFlight)
      const airline = departureFlight.airline?.name || 'MGA AIRLINES'
      const info = `${flightNumber} (${airline})`
      logger.debug('getOutboundFlightInfo - using departure flight:', info)
      return info
    }
    
    logger.debug('getOutboundFlightInfo - no data found, returning N/A')
    return 'N/A'
  }

  const getInboundFlightInfo = () => {
    const arrivalFlight = getArrivalFlight()
    logger.debug('getInboundFlightInfo - arrival flight data:', arrivalFlight)
    
    if (arrivalFlight) {
      const flightNumber = getFlightNumber(arrivalFlight)
      const airline = arrivalFlight.airline?.name || 'MGA AIRLINES'
      const info = `${flightNumber} (${airline})`
      logger.debug('getInboundFlightInfo - using arrival flight:', info)
      return info
    }
    
    logger.debug('getInboundFlightInfo - no data found, returning N/A')
    return 'N/A'
  }

  const getOutboundTo = () => {
    const departureFlight = getDepartureFlight()
    logger.debug('getOutboundTo - departure flight data:', departureFlight)
    
    if (departureFlight?.arrival?.airport) {
      const airport = departureFlight.arrival.airport
      const to = `${airport.name} (${airport.prefix})`
      logger.debug('getOutboundTo - using arrival.airport:', to)
      return to
    }
    
    logger.debug('getOutboundTo - no data found, returning N/A')
    return 'N/A'
  }

  const getInboundTo = () => {
    const arrivalFlight = getArrivalFlight()
    logger.debug('getInboundTo - arrival flight data:', arrivalFlight)
    
    if (arrivalFlight?.arrival?.airport) {
      const airport = arrivalFlight.arrival.airport
      const to = `${airport.name} (${airport.prefix})`
      logger.debug('getInboundTo - using arrival.airport:', to)
      return to
    }
    
    logger.debug('getInboundTo - no data found, returning N/A')
    return 'N/A'
  }

  const getOutboundArrival = () => {
    const departureFlight = getDepartureFlight()
    logger.debug('getOutboundArrival - departure flight data:', departureFlight)
    logger.debug('getOutboundArrival - arrival time:', departureFlight?.arrival?.time)
    logger.debug('getOutboundArrival - arrival date:', departureFlight?.arrival?.date)
    logger.debug('getOutboundArrival - flight date:', departureFlight?.date)
    
    if (departureFlight?.arrival?.time) {
      // Use arrival.date if available, otherwise use flight date
      const dateToUse = departureFlight.arrival.date || departureFlight.date
      const formattedDate = normalizeDate(dateToUse)
      const result = `${departureFlight.arrival.time} ${formattedDate}`
      logger.debug('getOutboundArrival - using departure flight arrival:', result)
      return result
    }
    
    logger.debug('getOutboundArrival - no data found, returning N/A')
    return 'N/A'
  }

  const getInboundArrival = () => {
    const arrivalFlight = getArrivalFlight()
    logger.debug('getInboundArrival - arrival flight data:', arrivalFlight)
    logger.debug('getInboundArrival - arrival time:', arrivalFlight?.arrival?.time)
    logger.debug('getInboundArrival - arrival date:', arrivalFlight?.arrival?.date)
    logger.debug('getInboundArrival - flight date:', arrivalFlight?.date)
    
    if (arrivalFlight?.arrival?.time) {
      // Use arrival.date if available, otherwise use flight date
      const dateToUse = arrivalFlight.arrival.date || arrivalFlight.date
      const formattedDate = normalizeDate(dateToUse)
      const result = `${arrivalFlight.arrival.time} ${formattedDate}`
      logger.debug('getInboundArrival - using arrival flight:', result)
      return result
    }
    
    logger.debug('getInboundArrival - no data found, returning N/A')
    return 'N/A'
  }

  const getOutboundTravelTime = () => {
    const departureFlight = getDepartureFlight()
    logger.debug('getOutboundTravelTime - departure flight data:', departureFlight)
    
    if (departureFlight?.flight_time) {
      try {
        const flightTime = departureFlight.flight_time
        const result = flightTime.replace(':', 'ч ') + 'м'
        logger.debug('getOutboundTravelTime - using flight_time:', result)
        return result
      } catch {
        logger.debug('getOutboundTravelTime - error parsing flight_time')
        return 'N/A'
      }
    }
    
    logger.debug('getOutboundTravelTime - no data found, returning N/A')
    return 'N/A'
  }

  const getInboundTravelTime = () => {
    const arrivalFlight = getArrivalFlight()
    logger.debug('getInboundTravelTime - arrival flight data:', arrivalFlight)
    
    if (arrivalFlight?.flight_time) {
      try {
        const flightTime = arrivalFlight.flight_time
        const result = flightTime.replace(':', 'ч ') + 'м'
        logger.debug('getInboundTravelTime - using flight_time:', result)
        return result
      } catch {
        logger.debug('getInboundTravelTime - error parsing flight_time')
        return 'N/A'
      }
    }
    
    logger.debug('getInboundTravelTime - no data found, returning N/A')
    return 'N/A'
  }

  return {
    getSelectedFlight,
    getOutboundFrom,
    getInboundFrom,
    getOutboundDeparture,
    getInboundDeparture,
    getOutboundFlightInfo,
    getInboundFlightInfo,
    getOutboundTo,
    getInboundTo,
    getOutboundArrival,
    getInboundArrival,
    getOutboundTravelTime,
    getInboundTravelTime
  }
}

