export interface SearchForm {
  departureCity: DepartureCity | null
  destination: Country | null
  package?: Package | null
  arrivalCity?: ArrivalCity | null
  date?: string | null
  checkInDate?: string | null
  checkOutDate?: string | null
  nights: number
  nights2?: number
  adults: number
  children: number
  childrenAges: number[]
  priceFrom?: number | null
  priceTo?: number | null
  selectedHotels?: number[]
}

// Упрощенный интерфейс для компактной формы
export interface CompactSearchForm {
  departureCity: DepartureCity | null
  destination: Country | null
  date: string | null
  nights: number
  adults: number
  children: number
  childrenAges: number[]
}

// Расширенный интерфейс для расширенной формы
export interface ExpandedSearchForm {
  departureCity: DepartureCity | null
  destination: Country | null
  package: Package | null
  arrivalCity: ArrivalCity | null
  checkInDate: string | null
  checkOutDate: string | null
  nights: number
  nights2: number
  adults: number
  children: number
  childrenAges: number[]
  priceFrom: number | null
  priceTo: number | null
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
}

export interface SearchItem {
  id: number
  name: string
}

// Типы для данных поиска
export interface DepartureCity {
  id: number
  name: string
  code?: string
}

export interface Country {
  id: number
  name: string
  code?: string
}

export interface Package {
  id: number
  name: string
  code?: string
}

export interface ArrivalCity {
  id: number
  name: string
  code?: string
}

export interface Region {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
}

export interface Hotel {
  id: number
  name: string
  category?: string
}

export interface Meal {
  id: number
  name: string
  full_name?: string
}

export interface Option {
  id: number
  name: string
}
