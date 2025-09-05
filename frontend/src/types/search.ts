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
