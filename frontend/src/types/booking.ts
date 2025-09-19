// Типы для данных бронирования
export interface BookingData {
  searchResult: SearchResult | GroupedSearchResult
  selectedFlight?: SelectedFlight
  selectedRoom?: SelectedRoom
  tourists: TouristData[]
  additionalServices: AdditionalServices
  notes?: string
}

export interface SelectedFlight {
  outbound: FlightSegment
  inbound: FlightSegment
}

export interface SelectedRoom {
  room: SearchResultRoom
  meal: SearchResultMeal
  placement: SearchResultPlacement
  price: SearchResultPrice
}

export interface FlightSegment {
  id: number
  airline: string
  flightNumber: string
  departure: FlightDateTime
  arrival: FlightDateTime
  airports: FlightAirports
  duration: string
  price?: number
}

export interface FlightDateTime {
  date: string
  time: string
  dayOfWeek?: string
}

export interface FlightAirports {
  from: Airport
  to: Airport
}

export interface Airport {
  name: string
  code: string
  city: string
}

export interface TouristData {
  id: string
  title: 'MR' | 'MRS' | 'MS' | 'CHD'
  firstName: string
  lastName: string
  birthDate: string
  passportNumber: string
  passportExpiry: string
  nationality: string
  fiscalCode?: string
}

export interface AdditionalServices {
  insurance: InsuranceOption
  covidInsurance: CovidInsuranceOption
  transfer: TransferOption
}

export interface InsuranceOption {
  type: 'STANDARD' | 'STANDARD_PLUS' | 'NONE'
  coverage: string
  price: number
  included: boolean
}

export interface CovidInsuranceOption {
  type: 'INCLUDED' | 'OPT_OUT' | 'COVID_19'
  price: number
}

export interface TransferOption {
  type: 'GROUP' | 'INDIVIDUAL' | 'VIP'
  price: number
  included: boolean
}

export interface BookingNotes {
  honeymooners?: boolean
  regularGuest?: boolean
  twinBeds?: boolean
  groundFloor?: boolean
  notGroundFloor?: boolean
  babyCot?: boolean
  handicapAccessible?: boolean
  doubleBed?: boolean
  comment?: string
}

// Импортируем SearchResult из существующих типов
import type { 
  SearchResult, 
  GroupedSearchResult, 
  SearchResultRoom, 
  SearchResultMeal, 
  SearchResultPlacement, 
  SearchResultPrice 
} from './search'

// Типы для API ответов
export interface BookingCreateRequest {
  search_result_id: string
  selected_flight?: SelectedFlight
  tourists: TouristData[]
  additional_services: AdditionalServices
  notes?: BookingNotes
}

export interface BookingCreateResponse {
  booking_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
  total_amount: number
  currency: string
  expires_at: string
}

export interface BookingCalculationResponse {
  base_price: number
  additional_services_price: number
  total_amount: number
  currency: string
  breakdown: {
    hotel: number
    flight: number
    insurance: number
    transfer: number
  }
}
