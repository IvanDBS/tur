export interface SearchForm {
  departureCity: any
  destination: any
  package?: any
  arrivalCity?: any
  date?: any
  checkInDate?: any
  checkOutDate?: any
  nights: number
  nights2?: number
  adults: number
  children: number
  childrenAges: number[]
  priceFrom?: any
  priceTo?: any
  selectedHotels?: number[]
}

// Упрощенный интерфейс для компактной формы
export interface CompactSearchForm {
  departureCity: any
  destination: any
  date: any
  nights: number
  adults: number
  children: number
  childrenAges: number[]
}

// Расширенный интерфейс для расширенной формы
export interface ExpandedSearchForm {
  departureCity: any
  destination: any
  package: any
  arrivalCity: any
  checkInDate: any
  checkOutDate: any
  nights: number
  nights2: number
  adults: number
  children: number
  childrenAges: number[]
  priceFrom: any
  priceTo: any
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
