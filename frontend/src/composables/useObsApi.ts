import { ref, computed } from 'vue'
import { apiClient } from '@/utils/api'
import { logger } from '@/utils/logger'
import type { 
  DepartureCity, 
  Country, 
  Package, 
  ArrivalCity, 
  Region, 
  Category, 
  Hotel, 
  Meal 
} from '@/types/search'

// API Response types
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface ObsDepartureCity {
  id: number
  label: string
}

interface ObsCountry {
  id: number
  label: string
}

interface ObsPackageTemplate {
  id: number
  label: string
  services: string[]
  airports?: Array<{
    id: number
    label: string
  }>
}

interface ObsHotelCategory {
  id: number
  label: string
}

interface ObsLocation {
  id: number
  label: string
  cities: Array<{
    id: number
    label: string
    region_id: number
  }>
}

interface ObsHotel {
  id: number
  label: string
  is_exclusive: number
  city_id: number
  category_id: number
}

export const useObsApi = () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Data
  const departureCities = ref<DepartureCity[]>([])
  const countries = ref<Country[]>([])
  const packages = ref<Package[]>([])
  const arrivalCities = ref<ArrivalCity[]>([])
  const regions = ref<Region[]>([])
  const categories = ref<Category[]>([])
  const hotels = ref<Hotel[]>([])
  const meals = ref<Meal[]>([])

  // Computed
  const hasData = computed(() => {
    return departureCities.value.length > 0 || 
           countries.value.length > 0 || 
           packages.value.length > 0
  })

  // Methods
  const clearError = () => {
    error.value = null
  }

  const setError = (message: string) => {
    error.value = message
    logger.error('OBS API Error:', message)
  }

  // Fetch departure cities (оптимизировано с кешированием)
  const fetchDepartureCities = async () => {
    if (departureCities.value.length > 0) return departureCities.value

    try {
      loading.value = true
      clearError()
      
      logger.apiCall('GET', '/search/departure_cities')
      const response = await apiClient.get<ApiResponse<{ departure_cities: ObsDepartureCity[] }>>('/search/departure_cities')
      
      logger.debug('Departure cities response received', response)
      
      if (response.success) {
        departureCities.value = response.data.departure_cities.map(city => {
          logger.debug('Processing city:', city)
          return {
            id: city.id,
            name: city.label,
            code: city.label
          }
        })
        logger.info(`Processed ${departureCities.value.length} departure cities`)
        return departureCities.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch departure cities'
      logger.apiError('GET', '/search/departure_cities', err)
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch countries for a specific departure city
  const fetchCountries = async (departureCityId: number) => {
    try {
      loading.value = true
      clearError()
      
      // Дополнительная проверка типа данных
      if (typeof departureCityId !== 'number' || isNaN(departureCityId)) {
        throw new Error(`Invalid departureCityId: ${departureCityId} (type: ${typeof departureCityId})`)
      }
      
      logger.apiCall('GET', `/search/countries?airport_city_from=${departureCityId}`)
      
      const response = await apiClient.get<ApiResponse<{ countries: ObsCountry[] }>>(`/search/countries?airport_city_from=${departureCityId}`)
      
      if (response.success) {
        const mappedCountries = response.data.countries.map(country => ({
          id: country.id,
          name: country.label,
          code: country.label
        }))
        
        countries.value = mappedCountries
        logger.info(`Successfully loaded ${countries.value.length} countries for city ${departureCityId}`)
        return countries.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch countries'
      logger.apiError('GET', `/search/countries?airport_city_from=${departureCityId}`, err)
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch package templates for a country
  const fetchPackageTemplates = async (countryId: number, departureCityId: number) => {
    try {
      loading.value = true
      clearError()
      
      logger.apiCall('GET', `/search/countries/${countryId}/package_templates?airport_city_from=${departureCityId}`)
      
      const response = await apiClient.get<ApiResponse<{ package_templates: ObsPackageTemplate[] }>>(`/search/countries/${countryId}/package_templates?airport_city_from=${departureCityId}`)
      
      logger.debug('Package templates API response received', response)
      
      if (response.success) {
        const mappedPackages = response.data.package_templates.map(pkg => ({
          id: pkg.id,
          name: pkg.label,
          code: pkg.label,
          airports: pkg.airports?.map(airport => ({
            id: airport.id,
            name: airport.label
          })) || []
        }))
        
        packages.value = mappedPackages
        logger.info(`Successfully loaded ${packages.value.length} package templates for country ${countryId}`)
        
        // Обновляем arrival cities из airports package templates
        const allAirports = response.data.package_templates
          .flatMap(pkg => pkg.airports || [])
          .filter((airport, index, self) => 
            self.findIndex(a => a.id === airport.id) === index
          )
        
        arrivalCities.value = allAirports.map(airport => ({
          id: airport.id,
          name: airport.label,
          code: airport.label
        }))
        
        return packages.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch package templates'
      console.error('fetchPackageTemplates error:', err)
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch hotel categories for a package template
  const fetchHotelCategories = async (packageTemplateId: number) => {
    try {
      loading.value = true
      clearError()
      
      const response = await apiClient.get<ApiResponse<{ hotel_categories: ObsHotelCategory[] }>>(`/search/package_templates/${packageTemplateId}/hotel_categories`)
      
      if (response.success) {
        categories.value = response.data.hotel_categories.map(cat => ({
          id: cat.id,
          name: cat.label
        }))
        return categories.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch hotel categories'
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch locations for a package template
  const fetchLocations = async (packageTemplateId: number) => {
    try {
      loading.value = true
      clearError()
      
      const response = await apiClient.get<ApiResponse<{ locations: ObsLocation[] }>>(`/search/package_templates/${packageTemplateId}/locations`)
      
      if (response.success) {
        regions.value = response.data.locations.map(loc => ({
          id: loc.id,
          name: loc.label,
          label: loc.label,
          cities: loc.cities || []
        }))
        return regions.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch locations'
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch hotels for a package template
  const fetchHotels = async (packageTemplateId: number, filters?: {
    cities?: number[]
    regions?: number[]
    categories?: number[]
    is_exclusive?: boolean
  }) => {
    try {
      loading.value = true
      clearError()
      
      let url = `/search/package_templates/${packageTemplateId}/hotels`
      const params = new URLSearchParams()
      
      if (filters?.cities?.length) {
        params.append('cities', filters.cities.join(','))
      }
      if (filters?.regions?.length) {
        params.append('regions', filters.regions.join(','))
      }
      if (filters?.categories?.length) {
        params.append('categories', filters.categories.join(','))
      }
      if (filters?.is_exclusive !== undefined) {
        params.append('is_exclusive', filters.is_exclusive ? '1' : '0')
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      logger.apiCall('GET', url)
      const response = await apiClient.get<ApiResponse<{ hotels: ObsHotel[] }>>(url)
      
      if (response.success) {
        logger.debug('Hotels API response received', response.data)
        hotels.value = response.data.hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.label,
          label: hotel.label,
          category_id: hotel.category_id,
          city_id: hotel.city_id
        }))
        logger.info(`Mapped ${hotels.value.length} hotels for package ${packageTemplateId}`)
        return hotels.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch hotels'
      logger.apiError('GET', url, err)
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch meals for a package template
  const fetchMeals = async (packageTemplateId: number) => {
    try {
      loading.value = true
      clearError()
      
      const response = await apiClient.get<ApiResponse<{ meals: string[] }>>(`/search/package_templates/${packageTemplateId}/meals`)
      
      if (response.success) {
        meals.value = response.data.meals.map((meal, index) => ({
          id: index + 1,
          name: meal,
          full_name: meal
        }))
        return meals.value
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch meals'
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch calendar hints for available departure dates
  const fetchCalendarHints = async (params: {
    date_from?: string
    date_to?: string
    city_from: number
    city_to: string
  }) => {
    try {
      loading.value = true
      clearError()
      
      const queryParams = new URLSearchParams()
      if (params.date_from) queryParams.append('date_from', params.date_from)
      if (params.date_to) queryParams.append('date_to', params.date_to)
      queryParams.append('city_from', params.city_from.toString())
      queryParams.append('city_to', params.city_to)
      
      const response = await apiClient.get<ApiResponse<Record<string, any[]>>>(`/search/calendar_hints?${queryParams.toString()}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar hints'
      setError(message)
      return {}
    } finally {
      loading.value = false
    }
  }

  // Fetch available nights for a destination
  const fetchAvailableNights = async (params: {
    date_from?: string
    date_to?: string
    city_from: number
    city_to: string
  }) => {
    try {
      loading.value = true
      clearError()
      
      const queryParams = new URLSearchParams()
      if (params.date_from) queryParams.append('date_from', params.date_from)
      if (params.date_to) queryParams.append('date_to', params.date_to)
      queryParams.append('city_from', params.city_from.toString())
      queryParams.append('city_to', params.city_to)
      
      const response = await apiClient.get<ApiResponse<number[]>>(`/search/available_nights?${queryParams.toString()}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch available nights'
      setError(message)
      return []
    } finally {
      loading.value = false
    }
  }

  // Perform main search
  const performSearch = async (searchParams: {
    country: number
    package_template: number
    airport_city_from: number
    airport_city_to?: number[]
    date_from: string
    date_to: string
    nights_from: number
    nights_to?: number
    adults: number
    children?: number
    children_age?: number[]
    selected_hotels?: number[]
    meals?: string[]
    options?: string[]
    price_from?: number
    price_to?: number
    page?: number
    per_page?: number
  }) => {
    try {
      loading.value = true
      clearError()
      
      logger.debug('performSearch called with params:', searchParams)
      
      // Separate search params from pagination params
      const { page, per_page, ...searchParamsOnly } = searchParams
      
      const requestBody = { search: searchParamsOnly }
      logger.debug('Search request body prepared:', requestBody)
      
      // Add pagination parameters as query params
      const queryParams = new URLSearchParams()
      if (page) queryParams.append('page', page.toString())
      if (per_page) queryParams.append('per_page', per_page.toString())
      // Add cache-busting parameter
      queryParams.append('_t', Date.now().toString())
      
        const url = `/search?${queryParams.toString()}`
        logger.debug(`performSearch API call: ${url}`)
        logger.apiCall('POST', url)
        
        const response = await apiClient.post<ApiResponse<Record<string, any>>>(url, requestBody)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      return {}
    } finally {
      loading.value = false
    }
  }

  // Initialize data
  const initializeData = async () => {
    try {
      await fetchDepartureCities()
    } catch (err) {
      logger.error('Failed to initialize OBS API data:', err)
    }
  }

  // Clear all data
  const clearData = () => {
    departureCities.value = []
    countries.value = []
    packages.value = []
    arrivalCities.value = []
    regions.value = []
    categories.value = []
    hotels.value = []
    meals.value = []
    clearError()
  }

  // Очистка кеша API
  const clearApiCache = (pattern?: string) => {
    apiClient.clearCache(pattern)
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    hasData: computed(() => hasData.value),
    
    // Data
    departureCities: computed(() => departureCities.value),
    countries: computed(() => countries.value),
    packages: computed(() => packages.value),
    arrivalCities: computed(() => arrivalCities.value),
    regions: computed(() => regions.value),
    categories: computed(() => categories.value),
    hotels: computed(() => hotels.value),
    meals: computed(() => meals.value),
    
    // Methods
    fetchDepartureCities,
    fetchCountries,
    fetchPackageTemplates,
    fetchHotelCategories,
    fetchLocations,
    fetchHotels,
    fetchMeals,
    fetchCalendarHints,
    fetchAvailableNights,
    performSearch,
    initializeData,
    clearData,
    clearError,
    clearApiCache
  }
}
