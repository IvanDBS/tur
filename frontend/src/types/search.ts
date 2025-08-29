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
