export interface SearchForm {
  departureCity: DepartureCity | null
  destination: Country | null
  package: Package | null
  arrivalCity: ArrivalCity | null
  date: string | null
  checkInDate: Date | null
  checkOutDate: Date | null
  nights: number | null
  nights2: number | null
  adults: number | null
  children: number | null
  childrenAges: number[]
  priceFrom: number | null
  priceTo: number | null
  selectedHotels: number[]
}


export interface SelectedFilters {
  regions: number[]
  categories: number[]
  hotels: number[]
  meals: number[]
  options: number[]
}

export interface SearchOption {
  value: number
  label: string
  disabled?: boolean
}

// Строгие типы для опций селекторов
export interface DepartureCityOption extends SearchOption {
  id: number
  name: string
  label: string
  code?: string
}

export interface CountryOption extends SearchOption {
  id: number
  name: string
  label: string
  code?: string
}

export interface PackageOption extends SearchOption {
  id: number
  name: string
  label: string
  code?: string
  airports?: AirportOption[]
}

export interface AirportOption {
  id: number
  name: string
  label: string
}

export interface NightsOption extends SearchOption {
  value: number
  label: string
}

export interface AdultsOption extends SearchOption {
  value: number
  label: string
}

export interface ChildrenOption extends SearchOption {
  value: number
  label: string
}

export interface SearchItem {
  id: number
  name: string
}

// Типы для данных поиска
export interface DepartureCity {
  id: number
  name?: string
  label?: string
  code?: string
}

export interface Country {
  id: number
  name?: string
  label?: string
  code?: string
}

export interface Package {
  id: number
  name?: string
  label?: string
  code?: string
  airports?: Array<{
    id: number
    name?: string
    label?: string
  }>
}

export interface ArrivalCity {
  id: number
  name?: string
  label?: string
  code?: string
}

export interface Region {
  id: number
  name: string
  label?: string
  city_id?: number
  cities?: Array<{
    id: number
    label: string
    region_id: number
  }>
}

export interface Category {
  id: number
  name?: string
  label?: string
}

export interface Hotel {
  id: number
  name?: string
  label?: string
  category?: string
  city_id?: number
  category_id?: number
  is_exclusive?: boolean
}

export interface Meal {
  id: number
  name?: string
  label?: string
  full_name?: string
}

export interface Option {
  id: number
  name?: string
  label?: string
}

// Детальные типы для результатов поиска
export interface SearchResult {
  unique_key: string
  rid: string
  hotel_results_counter: number
  package_template: number
  operator: number
  additional_services: any[]
  dates: SearchResultDates
  nights: SearchResultNights
  accommodation: SearchResultAccommodation
  tickets: SearchResultTickets
  price: SearchResultPrice
  transfers: SearchResultTransfers
  never_land_entrance: any[]
  gala_dinner: any[]
  aquapark_services: any[]
  tourists: SearchResultTourists
}

export interface SearchResultDates {
  check_in: string
  check_out: string
}

export interface SearchResultNights {
  total: number
  on_the_way: number
}

export interface SearchResultAccommodation {
  hotel: SearchResultHotel
  room: SearchResultRoom
  placement: SearchResultPlacement
  meal: SearchResultMeal
}

export interface SearchResultHotel {
  id: number
  name: string
  is_exclusive: boolean
  category: string
  city: string
  in_stop: boolean
}

export interface SearchResultRoom {
  id: number
  name: string
}

export interface SearchResultPlacement {
  id: number
  name: string
}

export interface SearchResultMeal {
  id: number
  name: string
  full_name: string
}

export interface SearchResultTickets {
  from: SearchResultFlight
  to: SearchResultFlight
  on_request: 'y' | 'n'
  has_tickets: boolean
}

export interface SearchResultFlight {
  id: number
  name: string
  airline: SearchResultAirline
  departure: SearchResultDateTime
  arrival: SearchResultDateTime
  airports: SearchResultAirports
  tickets: number | null
}

export interface SearchResultAirline {
  iata_code: string
  color: string
  airline: string
}

export interface SearchResultDateTime {
  date: string
  time: string
}

export interface SearchResultAirports {
  from: SearchResultAirport
  to: SearchResultAirport
}

export interface SearchResultAirport {
  name: string
  prefix: string
}

export interface SearchResultPrice {
  amount: number
  netto: number
  commission: number
  type: string
  currency: string
  currency_id: number
}

export interface SearchResultTransfers {
  to: number
  from: number
}

export interface SearchResultTourists {
  adults: number
  children_ages: number[]
}

// Группированный результат поиска (один отель с несколькими вариантами перелетов)
export interface GroupedSearchResult {
  hotel: SearchResultHotel
  room: SearchResultRoom
  meal: SearchResultMeal
  dates: SearchResultDates
  nights: SearchResultNights
  price: SearchResultPrice
  transfers: SearchResultTransfers
  never_land_entrance: any[]
  gala_dinner: any[]
  aquapark_services: any[]
  tourists: SearchResultTourists
  // Массив вариантов перелетов для этого отеля
  flightOptions: SearchResultTickets[]
  // Минимальная цена среди всех вариантов
  minPrice: number
  // Максимальная цена среди всех вариантов
  maxPrice: number
  // Валюта
  currency: string
}
