import { ref, computed } from 'vue'
import { useObsApi } from './useObsApi'
import type { 
  DepartureCity, 
  Country, 
  Package, 
  ArrivalCity, 
  Region, 
  Category, 
  Hotel, 
  Meal 
} from '../types/search'

// Опции для Multiselect
export const useSearchData = () => {
  const obsApi = useObsApi()
  
  const nightsOptions = ref([
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
    { value: 12, label: '12' },
    { value: 13, label: '13' },
    { value: 14, label: '14' },
    { value: 15, label: '15' },
    { value: 16, label: '16' },
    { value: 17, label: '17' },
    { value: 18, label: '18' },
    { value: 19, label: '19' },
    { value: 20, label: '20' },
    { value: 21, label: '21' },
    { value: 22, label: '22' },
    { value: 23, label: '23' },
    { value: 24, label: '24' },
    { value: 25, label: '25' },
    { value: 26, label: '26' },
    { value: 27, label: '27' },
    { value: 28, label: '28' },
    { value: 29, label: '29' },
    { value: 30, label: '30' },
  ])

  const adultsOptions = ref([
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
  ])

  const childrenOptions = ref([
    { value: 0, label: 'Без детей' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ])

  // Опции для выбора возраста детей (от 0 до 17 лет)
  const childrenAgeOptions = ref(
    Array.from({ length: 18 }, (_, i) => ({ value: i, label: i.toString() }))
  )

  // Используем реальные данные из OBS API
  const departureCities = ref<DepartureCity[]>([])
  const countries = ref<Country[]>([])
  const packages = ref<Package[]>([])
  const arrivalCities = ref<ArrivalCity[]>([])
  const regions = ref<Region[]>([])
  const categories = ref<Category[]>([])
  const hotels = ref<Hotel[]>([])
  const meals = ref<Meal[]>([])

  // Fallback данные (если API недоступен) - только для тестирования
  const fallbackCountries = ref([
    { id: 1, name: 'TÜRKIYE' },
    { id: 2, name: 'EGYPT' },
    { id: 3, name: 'GREECE' },
    { id: 4, name: 'BULGARIA' },
    { id: 5, name: 'SPAIN' },
  ])

  const fallbackPackages = ref([
    { id: 1, name: 'ANTALYA FULL' },
    { id: 2, name: 'ANTALYA HOTEL ONLY' },
    { id: 3, name: 'KEMER FULL' },
  ])

  const fallbackArrivalCities = ref([
    { id: 1, name: 'ANTALYA' },
    { id: 2, name: 'ISTANBUL' },
    { id: 3, name: 'BODRUM' },
  ])

  // Добавляем fallback для аэропортов
  const fallbackAirports = ref([
    { id: 50004, name: 'ANTALYA' },
    { id: 50005, name: 'ISTANBUL' },
    { id: 50006, name: 'BODRUM' },
  ])

  const fallbackRegions = ref<Region[]>([])

  const fallbackCategories = ref<Category[]>([])

  const fallbackHotels = ref<Hotel[]>([])

  const fallbackMeals = ref<Meal[]>([])

  const options = ref([
    { id: 1, name: 'Выбрать все' },
    { id: 2, name: 'Есть места на рейсе' },
    { id: 3, name: 'Бизнесс класс $' },
    { id: 4, name: 'Доступные туры' },
    { id: 5, name: 'Ночной рейс' },
    { id: 6, name: 'Дневной рейс' },
  ])

  // Методы для загрузки данных
  const loadDepartureCities = async () => {
    try {
      const result = await obsApi.fetchDepartureCities()
      // Обновляем локальную переменную departureCities
      departureCities.value = result || []
      console.log(`Loaded ${departureCities.value.length} departure cities`)
      // Обновляем options
      updateDepartureCitiesOptions()
    } catch (err) {
      console.warn('Using fallback departure cities data')
      departureCities.value = []
      updateDepartureCitiesOptions()
    }
  }

  const loadCountries = async (departureCityId: number) => {
    try {
      console.log(`Loading countries for city ${departureCityId}...`)
      const result = await obsApi.fetchCountries(departureCityId)
      console.log('API result:', result)
      // Обновляем локальную переменную countries
      countries.value = result || []
      console.log(`Loaded ${countries.value.length} countries for city ${departureCityId}`)
      console.log('Countries data:', countries.value)
      // Обновляем options
      updateCountriesOptions()
    } catch (err) {
      console.warn('Using fallback countries data:', err)
      countries.value = fallbackCountries.value
      updateCountriesOptions()
    }
  }

  // Альтернативный метод - загружает через obsApi и синхронизирует
  const syncCountriesFromApi = async (departureCityId: number) => {
    try {
      console.log(`syncCountriesFromApi called for city ${departureCityId}`)
      console.log('Before loadCountries - local countries:', countries.value.length)
      console.log('Before loadCountries - obsApi countries:', obsApi.countries.value.length)
      
      // Используем loadCountries напрямую
      await loadCountries(departureCityId)
      
      console.log('After loadCountries - local countries:', countries.value.length)
      console.log('After loadCountries - obsApi countries:', obsApi.countries.value.length)
      console.log(`Synced ${countries.value.length} countries from API for city ${departureCityId}`)
    } catch (err) {
      console.error('Failed to sync countries from API:', err)
      countries.value = fallbackCountries.value
    }
  }

  const loadPackageTemplates = async (countryId: number, departureCityId: number) => {
    try {
      const result = await obsApi.fetchPackageTemplates(countryId, departureCityId)
      // Обновляем локальную переменную packages
      packages.value = result || []
      console.log(`Loaded ${packages.value.length} packages for country ${countryId}`)
      // Обновляем options
      updatePackagesOptions()
    } catch (err) {
      console.warn('Using fallback package templates data')
      packages.value = fallbackPackages.value
      updatePackagesOptions()
    }
  }

  const loadHotelCategories = async (packageTemplateId: number) => {
    try {
      await obsApi.fetchHotelCategories(packageTemplateId)
    } catch (err) {
      console.warn('Using fallback hotel categories data')
    }
  }

  const loadLocations = async (packageTemplateId: number) => {
    try {
      await obsApi.fetchLocations(packageTemplateId)
    } catch (err) {
      console.warn('Using fallback locations data')
    }
  }

  const loadHotels = async (packageTemplateId: number, filters?: {
    cities?: number[]
    regions?: number[]
    categories?: number[]
    is_exclusive?: boolean
  }) => {
    try {
      console.log(`Loading hotels for package ${packageTemplateId} with filters:`, filters)
      await obsApi.fetchHotels(packageTemplateId, filters)
      console.log(`Hotels loaded successfully. Total hotels: ${hotels.value.length}`)
      console.log('Hotels data:', hotels.value)
    } catch (err) {
      console.warn('Using fallback hotels data')
      console.error('Error loading hotels:', err)
    }
  }

  const loadMeals = async (packageTemplateId: number) => {
    try {
      await obsApi.fetchMeals(packageTemplateId)
    } catch (err) {
      console.warn('Using fallback meals data')
    }
  }

  // Load calendar hints for available departure dates
  const loadCalendarHints = async (params: {
    date_from?: string
    date_to?: string
    city_from: number
    city_to: string
  }) => {
    try {
      await obsApi.fetchCalendarHints(params)
    } catch (err) {
      console.warn('Failed to load calendar hints:', err)
    }
  }

  // Load available nights for a destination
  const loadAvailableNights = async (params: {
    date_from?: string
    date_to?: string
    city_from: number
    city_to: string
  }) => {
    try {
      await obsApi.fetchAvailableNights(params)
    } catch (err) {
      console.warn('Failed to load available nights:', err)
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
  }) => {
    try {
      return await obsApi.performSearch(searchParams)
    } catch (err) {
      console.error('Search failed:', err)
      throw err
    }
  }

  // Инициализация данных
  const initializeData = async () => {
    try {
      await loadDepartureCities()
      console.log('Search data initialized with departure cities')
    } catch (err) {
      console.error('Failed to initialize search data:', err)
    }
  }

  // Получение данных с fallback
  const getDepartureCities = computed(() => 
    departureCities.value.length > 0 ? departureCities.value : obsApi.departureCities.value
  )

  const getCountries = computed(() => {
    const localCountries = countries.value
    const apiCountries = obsApi.countries.value
    console.log('getCountries computed - local:', localCountries.length, 'api:', apiCountries.length)
    
    if (localCountries.length > 0) {
      console.log('Using local countries:', localCountries)
      return localCountries
    } else {
      console.log('Using API countries:', apiCountries)
      return apiCountries
    }
  })

  const getPackages = computed(() => 
    packages.value.length > 0 ? packages.value : obsApi.packages.value
  )

  const getArrivalCities = computed(() => 
    arrivalCities.value.length > 0 ? arrivalCities.value : fallbackArrivalCities.value
  )

  const getCategories = computed(() => {
    const localCategories = categories.value
    const apiCategories = obsApi.categories.value
    console.log('getCategories computed - local:', localCategories.length, 'api:', apiCategories.length)
    
    if (localCategories.length > 0) {
      console.log('Using local categories:', localCategories)
      return localCategories
    } else {
      console.log('Using API categories:', apiCategories)
      return apiCategories
    }
  })

  const getRegions = computed(() => {
    const localRegions = regions.value
    const apiRegions = obsApi.regions.value
    console.log('getRegions computed - local:', localRegions.length, 'api:', apiRegions.length)
    
    if (localRegions.length > 0) {
      console.log('Using local regions:', localRegions)
      return localRegions
    } else {
      console.log('Using API regions:', apiRegions)
      return apiRegions
    }
  })

  const getHotels = computed(() => {
    const localHotels = hotels.value
    const apiHotels = obsApi.hotels.value
    console.log('getHotels computed - local:', localHotels.length, 'api:', apiHotels.length)
    
    if (localHotels.length > 0) {
      console.log('Using local hotels:', localHotels)
      return localHotels
    } else {
      console.log('Using API hotels:', apiHotels)
      return apiHotels
    }
  })

  const getMeals = computed(() => {
    const localMeals = meals.value
    const apiMeals = obsApi.meals.value
    console.log('getMeals computed - local:', localMeals.length, 'api:', apiMeals.length)
    
    if (localMeals.length > 0) {
      console.log('Using local meals:', localMeals)
      return localMeals
    } else {
      console.log('Using API meals:', apiMeals)
      return apiMeals
    }
  })

  // Опции для Multiselect
  const departureCitiesOptions = ref<Array<{ value: any, label: string }>>([])
  const countriesOptions = ref<Array<{ value: any, label: string }>>([])
  const packagesOptions = ref<Array<{ value: any, label: string }>>([])

  // Обновляем options при изменении данных
  const updateDepartureCitiesOptions = () => {
    departureCitiesOptions.value = getDepartureCities.value.map(city => ({
      value: city,
      label: city.label || city.name || `City ${city.id}`
    }))
  }

  const updateCountriesOptions = () => {
    countriesOptions.value = getCountries.value.map(country => ({
      value: country,
      label: country.label || country.name || `Country ${country.id}`
    }))
  }

  const updatePackagesOptions = () => {
    const packages = getPackages.value
    console.log('updatePackagesOptions - packages:', packages)
    
    packagesOptions.value = packages.map(pkg => ({
      value: pkg,
      label: pkg.label || pkg.name || `Package ${pkg.id}`
    }))
    
    console.log('updatePackagesOptions - options:', packagesOptions.value)
  }

  return {
    // Данные
    departureCities: getDepartureCities,
    countries: getCountries,
    packages: getPackages,
    arrivalCities: getArrivalCities,
    regions: getRegions,
    categories: getCategories,
    hotels: getHotels,
    meals: getMeals,

    // Опции для Multiselect
    nightsOptions,
    adultsOptions,
    childrenOptions,
    childrenAgeOptions,
    options,
    departureCitiesOptions,
    countriesOptions,
    packagesOptions,
    
    // Состояние OBS API
    loading: obsApi.loading,
    error: obsApi.error,
    hasData: obsApi.hasData,
    
    // Методы загрузки
    loadDepartureCities,
    loadCountries,
    syncCountriesFromApi,
    loadPackageTemplates,
    loadHotelCategories,
    loadLocations,
    loadHotels,
    loadMeals,
    loadCalendarHints,
    loadAvailableNights,
    performSearch,
    initializeData,
    
    // Методы обновления options
    updateDepartureCitiesOptions,
    updateCountriesOptions,
    updatePackagesOptions,
    
    // Методы OBS API
    clearData: obsApi.clearData,
    clearError: obsApi.clearError,
    
    // Прямые вызовы API для совместимости
    fetchDepartureCities: obsApi.fetchDepartureCities,
    fetchCountries: obsApi.fetchCountries,
    fetchPackageTemplates: obsApi.fetchPackageTemplates,
  }
}
