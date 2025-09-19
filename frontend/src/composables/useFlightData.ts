import { formatDate } from '../utils/dateUtils'

export function useFlightData(booking: any, obsOrderDetails?: any) {
  // Get selected flight data
  const getSelectedFlight = () => {
    // PRIORITY 1: OBS API (external operator service)
    if (obsOrderDetails?.value?.charter?.[0]) {
      return obsOrderDetails.value.charter[0]
    }
    
    // PRIORITY 2: API data from customer_data.selected_flight
    if (booking?.customer_data?.selected_flight) {
      return booking.customer_data.selected_flight
    }
    
    // PRIORITY 3: API data from tour_details.flights
    if (booking?.tour_details?.flights) {
      return booking.tour_details.flights
    }
    
    return null
  }

  // Flight status
  const getFlightStatus = () => {
    const flight = getSelectedFlight() as any
    if (flight?.fly_segments_there?.[0]?.status) {
      const status = flight.fly_segments_there[0].status
      return status === 'confirmed' ? 'Подтвержден' : status
    }
    if (flight?.fly_segments_back?.[0]?.status) {
      const status = flight.fly_segments_back[0].status
      return status === 'confirmed' ? 'Подтвержден' : status
    }
    return 'Не указано'
  }

  const getFlightStatusClass = () => {
    const flight = getSelectedFlight() as any
    if (flight?.fly_segments_there?.[0]?.status) {
      const status = flight.fly_segments_there[0].status
      return status === 'confirmed' ? 'status-confirmed' : 'status-pending'
    }
    if (flight?.fly_segments_back?.[0]?.status) {
      const status = flight.fly_segments_back[0].status
      return status === 'confirmed' ? 'status-confirmed' : 'status-pending'
    }
    return 'status-unknown'
  }

  // Outbound flight number
  const getOutboundFlightNumber = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_there?.[0]?.prefix && flight?.fly_segments_there?.[0]?.flight) {
      const prefix = flight.fly_segments_there[0].prefix
      const flightNum = flight.fly_segments_there[0].flight
      const airline = flight.fly_segments_there[0].airline
      const result = `${prefix}${flightNum}${airline ? ` (${airline})` : ''}`
      return result
    }
    
    // PRIORITY 2: Standard format
    if (flight?.fly_segments_there?.[0]?.flight_number) {
      return flight.fly_segments_there[0].flight_number
    }
    
    // Check for flight_number in other formats
    if (flight?.flight_number) {
      return flight.flight_number
    }
    
    return ''
  }

  // Inbound flight number
  const getInboundFlightNumber = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_back?.[0]?.prefix && flight?.fly_segments_back?.[0]?.flight) {
      const prefix = flight.fly_segments_back[0].prefix
      const flightNum = flight.fly_segments_back[0].flight
      const airline = flight.fly_segments_back[0].airline
      const result = `${prefix}${flightNum}${airline ? ` (${airline})` : ''}`
      return result
    }
    
    // PRIORITY 2: Standard format
    if (flight?.fly_segments_back?.[0]?.flight_number) {
      return flight.fly_segments_back[0].flight_number
    }
    
    return ''
  }

  // Legacy function for backward compatibility
  const getFlightNumber = () => {
    return getOutboundFlightNumber()
  }

  // Outbound flight data
  const getOutboundFrom = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_there?.[0]?.destination?.airport_from) {
      const airportCode = flight.fly_segments_there[0].destination.airport_from
      const cityFrom = flight.fly_segments_there[0].destination.city_from
      const result = `${cityFrom} AIRPORT (${airportCode})`
      return result
    }
    
    // Use API data from selected_flight.outbound.airports.from
    if (flight?.outbound?.airports?.from) {
      const airport = flight.outbound.airports.from
      const result = `${airport.name} (${airport.prefix})`
      return result
    }
    
    // Use API data from flights.there.departure.airport
    if (flight?.there?.departure?.airport) {
      const airport = flight.there.departure.airport
      const result = `${airport.name} (${airport.prefix})`
      return result
    }
    
    return 'N/A'
  }

  const getOutboundTo = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_there?.[0]?.destination?.airport_to) {
      const airportCode = flight.fly_segments_there[0].destination.airport_to
      const cityTo = flight.fly_segments_there[0].destination.city_to
      const result = `${cityTo} AIRPORT (${airportCode})`
      return result
    }
    
    // Use API data from selected_flight.outbound.airports.to
    if (flight?.outbound?.airports?.to) {
      const airport = flight.outbound.airports.to
      const result = `${airport.name} (${airport.prefix})`
      return result
    }
    
    // Use API data from flights.there.arrival.airport
    if (flight?.there?.arrival?.airport) {
      const airport = flight.there.arrival.airport
      const result = `${airport.name} (${airport.prefix})`
      return result
    }
    
    return 'N/A'
  }

  const getOutboundDeparture = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_there?.[0]?.departure_date) {
      try {
        const departureDate = flight.fly_segments_there[0].departure_date
        const flyTime = flight.fly_segments_there[0].fly_time
        const timeFrom = flyTime?.split(' - ')[0] || '00:00'
        const result = `${departureDate} ${timeFrom}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 2: OBS API (external operator service)
    if (flight?.fly_segments_there?.[0]?.departure) {
      try {
        const departure = flight.fly_segments_there[0].departure
        const result = `${departure.date} ${departure.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 3: API data from selected_flight.outbound.departure
    if (flight?.outbound?.departure) {
      try {
        const departure = flight.outbound.departure
        const formattedDate = formatDate(departure.date)
        const result = `${formattedDate} ${departure.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 4: DB format
    if (flight?.there?.date && flight?.there?.departure?.time) {
      try {
        const formattedDate = formatDate(flight.there.date)
        const result = `${formattedDate} ${flight.there.departure.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    return 'N/A'
  }

  const getOutboundArrival = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_there?.[0]?.departure_date) {
      try {
        const departureDate = flight.fly_segments_there[0].departure_date
        const flyTime = flight.fly_segments_there[0].fly_time
        const timeTo = flyTime?.split(' - ')[1] || '00:00'
        const result = `${departureDate} ${timeTo}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 2: OBS API (external operator service)
    if (flight?.fly_segments_there?.[0]?.arrival) {
      try {
        const arrival = flight.fly_segments_there[0].arrival
        const result = `${arrival.date} ${arrival.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 3: API data from selected_flight.outbound.arrival
    if (flight?.outbound?.arrival) {
      try {
        const arrival = flight.outbound.arrival
        const formattedDate = formatDate(arrival.date)
        const result = `${formattedDate} ${arrival.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 4: DB format
    if (flight?.there?.date && flight?.there?.arrival?.time) {
      try {
        const formattedDate = formatDate(flight.there.date)
        const result = `${formattedDate} ${flight.there.arrival.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    return 'N/A'
  }

  const getOutboundFlightInfo = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_there?.[0]) {
      const flightNumber = getOutboundFlightNumber()
      const result = `${flightNumber}`
      return result
    }
    
    // Use API data from flights.there
    if (flight?.there) {
      const flightNumber = getOutboundFlightNumber()
      const result = `${flightNumber}`
      return result
    }
    
    return 'N/A'
  }

  const getOutboundTravelTime = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format - calculate from fly_time string
    if (flight?.fly_segments_there?.[0]?.fly_time) {
      try {
        const flyTime = flight.fly_segments_there[0].fly_time
        
        // Parse "00:30 - 02:30" format
        const timeParts = flyTime.split(' - ')
        if (timeParts.length === 2) {
          const [departureTime, arrivalTime] = timeParts
          const depTime = departureTime.split(':').map(Number)
          const arrTime = arrivalTime.split(':').map(Number)
          
          const depMinutes = depTime[0] * 60 + depTime[1]
          let arrMinutes = arrTime[0] * 60 + arrTime[1]
          
          // Handle next day arrival
          if (arrMinutes < depMinutes) {
            arrMinutes += 24 * 60
          }
          
          const totalMinutes = arrMinutes - depMinutes
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          
          const result = `${hours}ч ${minutes}м`
          return result
        }
      } catch {
      }
    }
    
    // PRIORITY 2: API data from selected_flight.outbound.duration
    if (flight?.outbound?.duration) {
      const result = flight.outbound.duration
      return result
    }
    
    // PRIORITY 3: API data from flights.there.duration
    if (flight?.there?.duration) {
      const result = flight.there.duration
      return result
    }
    
    // PRIORITY 4: Calculate from OBS API fly_time (numeric format)
    if (flight?.fly_segments_there?.[0]?.fly_time && typeof flight.fly_segments_there[0].fly_time === 'number') {
      try {
        const flyTime = flight.fly_segments_there[0].fly_time
        const hours = Math.floor(flyTime / 60)
        const minutes = flyTime % 60
        const result = `${hours}ч ${minutes}м`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    return 'N/A'
  }

  // Inbound flight data
  const getInboundFrom = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_back?.[0]?.destination?.airport_from) {
      const airportCode = flight.fly_segments_back[0].destination.airport_from
      const cityFrom = flight.fly_segments_back[0].destination.city_from
      const result = `${cityFrom} AIRPORT (${airportCode})`
      return result
    }
    
    // Use API data from flights.back.departure.airport
    if (flight?.back?.departure?.airport) {
      const airport = flight.back.departure.airport
      const result = `${airport.name} (${airport.prefix})`
      return result
    }
    
    return 'N/A'
  }

  const getInboundTo = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_back?.[0]?.destination?.airport_to) {
      const airportCode = flight.fly_segments_back[0].destination.airport_to
      const cityTo = flight.fly_segments_back[0].destination.city_to
      const result = `${cityTo} AIRPORT (${airportCode})`
      return result
    }
    
    // Use API data from flights.back.arrival.airport
    if (flight?.back?.arrival?.airport) {
      const airport = flight.back.arrival.airport
      const result = `${airport.name} (${airport.prefix})`
      return result
    }
    
    return 'N/A'
  }

  const getInboundDeparture = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_back?.[0]?.departure_date) {
      try {
        const departureDate = flight.fly_segments_back[0].departure_date
        const flyTime = flight.fly_segments_back[0].fly_time
        const timeFrom = flyTime?.split(' - ')[0] || '00:00'
        const result = `${departureDate} ${timeFrom}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 2: OBS API (external operator service)
    if (flight?.fly_segments_back?.[0]?.departure) {
      try {
        const departure = flight.fly_segments_back[0].departure
        const result = `${departure.date} ${departure.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 3: DB format
    if (flight?.back?.date && flight?.back?.departure?.time) {
      try {
        const formattedDate = formatDate(flight.back.date)
        const result = `${formattedDate} ${flight.back.departure.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    return 'N/A'
  }

  const getInboundArrival = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_back?.[0]?.departure_date) {
      try {
        const departureDate = flight.fly_segments_back[0].departure_date
        const flyTime = flight.fly_segments_back[0].fly_time
        const timeTo = flyTime?.split(' - ')[1] || '00:00'
        const result = `${departureDate} ${timeTo}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 2: OBS API (external operator service)
    if (flight?.fly_segments_back?.[0]?.arrival) {
      try {
        const arrival = flight.fly_segments_back[0].arrival
        const result = `${arrival.date} ${arrival.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    // PRIORITY 3: DB format
    if (flight?.back?.date && flight?.back?.arrival?.time) {
      try {
        const formattedDate = formatDate(flight.back.date)
        const result = `${formattedDate} ${flight.back.arrival.time}`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    return 'N/A'
  }

  const getInboundFlightInfo = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format
    if (flight?.fly_segments_back?.[0]) {
      const flightNumber = getInboundFlightNumber()
      const result = `${flightNumber}`
      return result
    }
    
    // Use API data from flights.back
    if (flight?.back) {
      const flightNumber = getInboundFlightNumber()
      const result = `${flightNumber}`
      return result
    }
    
    return 'N/A'
  }

  const getInboundTravelTime = () => {
    const flight = getSelectedFlight() as any
    
    // PRIORITY 1: OBS API charter format - calculate from fly_time string
    if (flight?.fly_segments_back?.[0]?.fly_time) {
      try {
        const flyTime = flight.fly_segments_back[0].fly_time
        
        // Parse "03:30 - 05:30" format
        const timeParts = flyTime.split(' - ')
        if (timeParts.length === 2) {
          const [departureTime, arrivalTime] = timeParts
          const depTime = departureTime.split(':').map(Number)
          const arrTime = arrivalTime.split(':').map(Number)
          
          const depMinutes = depTime[0] * 60 + depTime[1]
          let arrMinutes = arrTime[0] * 60 + arrTime[1]
          
          // Handle next day arrival
          if (arrMinutes < depMinutes) {
            arrMinutes += 24 * 60
          }
          
          const totalMinutes = arrMinutes - depMinutes
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          
          const result = `${hours}ч ${minutes}м`
          return result
        }
      } catch {
      }
    }
    
    // PRIORITY 2: API data from flights.back.duration
    if (flight?.back?.duration) {
      const result = flight.back.duration
      return result
    }
    
    // PRIORITY 3: Calculate from OBS API fly_time (numeric format)
    if (flight?.fly_segments_back?.[0]?.fly_time && typeof flight.fly_segments_back[0].fly_time === 'number') {
      try {
        const flyTime = flight.fly_segments_back[0].fly_time
        const hours = Math.floor(flyTime / 60)
        const minutes = flyTime % 60
        const result = `${hours}ч ${minutes}м`
        return result
      } catch {
        // Handle error silently
      }
    }
    
    return 'N/A'
  }

  return {
    getSelectedFlight,
    getFlightStatus,
    getFlightStatusClass,
    getFlightNumber,
    getOutboundFlightNumber,
    getInboundFlightNumber,
    getOutboundFrom,
    getOutboundTo,
    getOutboundDeparture,
    getOutboundArrival,
    getOutboundFlightInfo,
    getOutboundTravelTime,
    getInboundFrom,
    getInboundTo,
    getInboundDeparture,
    getInboundArrival,
    getInboundFlightInfo,
    getInboundTravelTime
  }
}