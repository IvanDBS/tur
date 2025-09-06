import { ref, computed, watch, nextTick } from 'vue'
import { useSearchData } from './useSearchData'
import { logger } from '../utils/logger'
import { getAirportIdByPackageName } from '../constants/airports'
import type { SearchForm, SelectedFilters } from '../types/search'

// Интерфейс для результатов поиска от OBS API
interface ObsSearchResult {
  unique_key: string
  rid: string
  accommodation: {
    hotel: {
      name: string
      category: string
      city: string
    }
    room: {
      name: string
    }
    meal: {
      full_name: string
    }
  }
  dates: {
    check_in: string
    check_out: string
  }
  nights: {
    total: number
  }
  price: {
    amount: number
    currency: string
    type: string
  }
}

export const useSearchForm = () => {
  // Получаем данные из composable
  const searchData = useSearchData()

  // Reactive data
  const searchForm = ref<SearchForm>({
    departureCity: null,
    destination: null,
    package: null,
    arrivalCity: null,
    date: null,
    checkInDate: null,
    checkOutDate: null,
    nights: null,
    nights2: null,
    adults: null,
    children: null,
    childrenAges: [],
    priceFrom: null,
    priceTo: null,
    selectedHotels: [],
  })

  const selectedFilters = ref<SelectedFilters>({
    regions: [],
    categories: [],
    hotels: [],
    meals: [],
    options: [],
  })

  const isLoading = ref(false)
  const searchResults = ref<Record<string, ObsSearchResult> | null>(null)
  const totalResults = ref(0)
  
  // Пагинация
  const currentPage = ref(1)
  const itemsPerPage = 20 // Показываем по 20 на странице
  const serverPageSize = 501 // Загружаем все результаты сразу (бэкенд возвращает все если per_page > 500)
  const lastSearchParams = ref<Record<string, unknown> | null>(null)
  const allLoadedResults = ref<Record<string, ObsSearchResult> | null>(null) // Все загруженные результаты
  
  // Server-side pagination - no client-side pagination needed
  const totalPages = computed(() => Math.ceil(totalResults.value / itemsPerPage))
  
  // Hybrid pagination: server loads 100, frontend shows 20
  const paginatedResults = computed(() => {
    if (!allLoadedResults.value || typeof allLoadedResults.value !== 'object') {
      return []
    }
    
    // Get all loaded results as array
    const allResults = Object.values(allLoadedResults.value)
    
    // Calculate pagination for current page (20 items per page)
    const startIndex = (currentPage.value - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    
    const paginated = allResults.slice(startIndex, endIndex)
    
    return paginated
  })

  // Определяем активный селектор для показа стрелки
  const activeSelector = computed((): string | null => {
    if (!searchForm.value.departureCity) return 'departureCity'
    if (!searchForm.value.destination) return 'destination'
    if (!searchForm.value.package) return 'package'
    if (!searchForm.value.arrivalCity) return 'arrivalCity'
    if (!searchForm.value.checkInDate) return 'checkInDate'
    if (!searchForm.value.checkOutDate) return 'checkOutDate'
    // После выбора даты заезда активируются все поля одновременно
    // Показываем стрелочку на поле "Детей" после выбора даты заезда
    if (searchForm.value.checkInDate && searchForm.value.children === null) return 'children'
    // После выбора детей (включая 0 - "Без детей") все поля активируются, стрелочка исчезает
    return null // Все селекторы заполнены
  })

  // Автоматическое заполнение полей значениями по умолчанию после выбора даты заезда
  watch(() => searchForm.value.checkInDate, (newDate) => {
    if (newDate) {
      // Заполняем поля значениями по умолчанию
      if (!searchForm.value.nights) {
        searchForm.value.nights = 6
      }
      if (!searchForm.value.nights2) {
        searchForm.value.nights2 = 6
      }
      if (!searchForm.value.adults) {
        searchForm.value.adults = 2
      }
      // Поле children остается null для выбора пользователем
      
      // Устанавливаем дату выезда если она не установлена или меньше даты заезда
      if (!searchForm.value.checkOutDate || searchForm.value.checkOutDate < newDate) {
        searchForm.value.checkOutDate = newDate
      }
    }
  })

  // Фильтрованные опции для второго селектора ночей
  const filteredNights2Options = computed(() => {
    if (!searchForm.value.nights) {
      return []
    }

    return searchData.nightsOptions.value.filter(
      (option: { value: number; label: string }) => option.value >= (searchForm.value.nights || 0)
    )
  })

  // Форматированные результаты для отображения
  const formattedResults = computed(() => {
    if (!searchResults.value || typeof searchResults.value !== 'object') {
      return []
    }
    
    // Используем пагинированные результаты
    const formatted = paginatedResults.value.map((result: ObsSearchResult) => ({
      unique_key: result.unique_key || '',
      rid: result.rid || '',
      accommodation: {
        hotel: {
          name: result.accommodation?.hotel?.name || 'Название отеля',
          category: result.accommodation?.hotel?.category || '',
          city: result.accommodation?.hotel?.city || ''
        },
        room: {
          name: result.accommodation?.room?.name || ''
        },
        meal: {
          full_name: result.accommodation?.meal?.full_name || ''
        }
      },
      dates: {
        check_in: result.dates?.check_in || '',
        check_out: result.dates?.check_out || ''
      },
      nights: {
        total: result.nights?.total || 0
      },
      price: {
        amount: result.price?.amount || 0,
        currency: result.price?.currency || 'EUR',
        type: result.price?.type || ''
      }
    }))
    
    return formatted
  })

  // Объединенный watcher для города отправления и страны
  watch(
    () => [searchForm.value.departureCity, searchForm.value.destination],
    async ([newCity, newCountry], [oldCity, oldCountry]) => {
      try {
        // Обработка изменения города отправления
        if (newCity && newCity.id && newCity.id !== oldCity?.id) {
          searchForm.value.destination = null
          searchForm.value.package = null
          await searchData.loadCountries(newCity.id)
        }
        
        // Обработка изменения страны
        if (newCountry && newCountry.id && newCountry.id !== oldCountry?.id && searchForm.value.departureCity?.id) {
          searchForm.value.package = null
          searchForm.value.arrivalCity = null
          await searchData.loadPackageTemplates(newCountry.id, searchForm.value.departureCity.id)
        }
      } catch (err) {
        logger.error('Search form cascade watch error:', err)
      }
    },
    { deep: true }
  )

  // Следим за изменениями пакета и загружаем связанные данные
  watch(() => searchForm.value.package, async (newPackage) => {
    try {
      if (newPackage && newPackage.id) {
        // Если у пакета есть аэропорты, устанавливаем город прилета
        if (newPackage.airports && newPackage.airports.length > 0) {
          const airport = newPackage.airports[0]
          
          // Создаем объект города прилета
          const arrivalCity = {
            id: airport.id,
            name: airport.label || airport.name || `Airport ${airport.id}`
          }
          
          // Принудительно обновляем реактивность
          searchForm.value.arrivalCity = { ...arrivalCity }
          
          // Ждем обновления DOM и принудительно обновляем Multiselect
          await nextTick()
        } else {
          // Если это пакет для конкретного направления, 
          // попробуем определить город по названию пакета
          const packageName = newPackage.label || newPackage.name || ''
          const airportId = getAirportIdByPackageName(packageName)
          
          if (airportId) {
            const arrivalCity = {
              id: airportId,
              name: packageName.toUpperCase()
            }
            
            // Принудительно обновляем реактивность
            searchForm.value.arrivalCity = { ...arrivalCity }
            
            // Ждем обновления DOM
            await nextTick()
          }
        }
        
        // Загружаем связанные данные для поиска отелей
        await Promise.all([
          searchData.loadHotelCategories(newPackage.id),
          searchData.loadLocations(newPackage.id),
          searchData.loadHotels(newPackage.id),
          searchData.loadMeals(newPackage.id)
        ])
        
        // Автоматически выбираем все регионы, категории и отели
        if (searchData.regions.value.length > 0) {
          selectedFilters.value.regions = [1, ...searchData.regions.value.map(r => r.id)]
        }
        
        if (searchData.categories.value.length > 0) {
          selectedFilters.value.categories = [1, ...searchData.categories.value.map(c => c.id)]
        }
        
        if (searchData.hotels.value.length > 0) {
          selectedFilters.value.hotels = [1, ...searchData.hotels.value.map(h => h.id)]
        }
        
        if (searchData.meals.value.length > 0) {
          selectedFilters.value.meals = [1, ...searchData.meals.value.map(m => m.id)]
        }
      } else {
        // Очищаем город прилета при сбросе пакета
        searchForm.value.arrivalCity = null
      }
    } catch (err) {
      logger.error('Package watch error:', err)
    }
  })

  // Watcher для количества детей
  watch(() => searchForm.value.children, (newChildren, oldChildren) => {
    if (newChildren !== oldChildren) {
      if (newChildren === null || newChildren === 0) {
        searchForm.value.childrenAges = []
      } else {
        const currentAges = [...searchForm.value.childrenAges]
        searchForm.value.childrenAges = Array(newChildren)
          .fill(0)
          .map((_, index) => {
            return index < currentAges.length ? currentAges[index] : 0
          })
      }
    }
  }, { immediate: true })

  // Watcher для nights
  watch(() => searchForm.value.nights, (newNights, oldNights) => {
    if (newNights !== oldNights && newNights && (!searchForm.value.nights2 || searchForm.value.nights2 < newNights)) {
      searchForm.value.nights2 = newNights
    }
  }, { immediate: true })


  // Methods
  const handleSearch = () => {
    // Добавляем выбранные отели в форму поиска
    searchForm.value.selectedHotels = [...selectedFilters.value.hotels]

    // Проверяем обязательные поля
    if (!searchForm.value.departureCity?.id) {
      return
    }
    if (!searchForm.value.destination?.id) {
      return
    }
    if (!searchForm.value.package?.id) {
      return
    }
    if (!searchForm.value.arrivalCity?.id) {
      return
    }
    if (!searchForm.value.checkInDate) {
      return
    }
    if (!searchForm.value.checkOutDate) {
      return
    }

    // Форматируем даты в формат DD.MM.YYYY для API
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }

    // Подготавливаем параметры для API
    const airportCityTo = searchForm.value.arrivalCity?.id ? [Number(searchForm.value.arrivalCity.id)] : []
    
    const searchParams = {
      country: Number(searchForm.value.destination.id),
      package_template: Number(searchForm.value.package.id),
      airport_city_from: Number(searchForm.value.departureCity.id),
      airport_city_to: airportCityTo,
      date_from: formatDate(searchForm.value.checkInDate),
      date_to: formatDate(searchForm.value.checkOutDate),
      nights_from: Number(searchForm.value.nights),
      nights_to: Number(searchForm.value.nights2),
      adults: Number(searchForm.value.adults),
      children: searchForm.value.children !== null ? Number(searchForm.value.children) : undefined,
      children_age: searchForm.value.children !== null && searchForm.value.children > 0 ? searchForm.value.childrenAges : undefined,
      selected_hotels: selectedFilters.value.hotels.length > 0 ? selectedFilters.value.hotels.map(id => Number(id)) : [1],
      meals: selectedFilters.value.meals.length > 0 ? selectedFilters.value.meals.map(mealId => {
        const meal = searchData.meals.value.find(m => m.id === mealId)
        return meal?.name || meal?.label || mealId.toString()
      }) : searchData.meals.value.map(meal => meal.name || meal.label || meal.id.toString()).filter(Boolean),
      options: selectedFilters.value.options.length > 0 ? selectedFilters.value.options.map(optionId => {
        return optionId.toString()
      }) : undefined
    }

    isLoading.value = true
    
    // Сбрасываем предыдущие результаты и пагинацию
    searchResults.value = null
    totalResults.value = 0
    currentPage.value = 1
    
    // Добавляем параметры пагинации (загружаем по 100 туров)
    const searchParamsWithPagination = {
      ...searchParams,
      page: 1, // Всегда начинаем с первой страницы
      per_page: serverPageSize // Загружаем по 100 туров
    }
    
    // Сохраняем параметры поиска для пагинации
    lastSearchParams.value = searchParams
    
    // Сбрасываем загруженные результаты
    allLoadedResults.value = null
    
    // Вызываем API поиска
    searchData.performSearch(searchParamsWithPagination)
      .then((result) => {
        isLoading.value = false
        
        // Сохраняем результаты поиска
        if (result && result.results) {
          searchResults.value = result.results
          totalResults.value = result.total_results || 0
          allLoadedResults.value = result.results // Сохраняем все загруженные результаты
        }
      })
      .catch((error) => {
        logger.error('Search failed:', error)
        isLoading.value = false
        // Здесь можно показать ошибку пользователю
      })
  }

  const handleReset = () => {
    searchForm.value = {
      departureCity: null,
      destination: null,
      package: null,
      arrivalCity: null,
      date: null,
      checkInDate: null,
      checkOutDate: null,
      nights: null,
      nights2: null,
      adults: null,
      children: null,
      childrenAges: [],
      priceFrom: null,
      priceTo: null,
      selectedHotels: [],
    }
    selectedFilters.value = {
      regions: [],
      categories: [],
      hotels: [],
      meals: [],
      options: [],
    }
    
    // Очищаем результаты поиска
    searchResults.value = null
    allLoadedResults.value = null
    totalResults.value = 0
    currentPage.value = 1
    lastSearchParams.value = null
  }

  // Метод для обновления минимального значения для nights2
  const updateNights2Min = () => {
    if (searchForm.value.nights && (!searchForm.value.nights2 || searchForm.value.nights2 < searchForm.value.nights)) {
      searchForm.value.nights2 = searchForm.value.nights
    }
  }

  // Метод для обработки смены страницы
  const handlePageChange = (page: number) => {
    // Don't change page if it's the same
    if (page === currentPage.value) {
      return
    }
    
    currentPage.value = page
    
    // Since we load all results at once (per_page > 500), no need to make additional API calls
    
    // Прокручиваем к началу результатов с отступом сверху
    const resultsSection = document.querySelector('.search-results-section')
    if (resultsSection) {
      const elementTop = resultsSection.getBoundingClientRect().top + window.pageYOffset
      // Адаптивный отступ: больше на мобильных, меньше на десктопе
      const isMobile = window.innerWidth <= 768
      const offset = isMobile ? 80 : 100
      const offsetPosition = elementTop - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Обработчик бронирования тура
  const handleBook = (result: ObsSearchResult) => {
    // Здесь можно добавить логику бронирования
    alert(`Бронирование тура: ${result.accommodation.hotel.name} за ${result.price.amount} ${result.price.currency}`)
  }

  // Метод инициализации данных
  const initializeData = async () => {
    try {
      logger.info('🔄 Initializing search data...')
      await searchData.initializeData()
      logger.info('✅ Search data initialized')
      logger.info(`🏙️ Departure cities loaded: ${searchData.departureCitiesOptions.value.length}`)
    } catch (err) {
      logger.error('❌ Failed to initialize search data:', err)
    }
  }

  return {
    // State
    searchForm,
    selectedFilters,
    isLoading,
    searchResults,
    totalResults,
    currentPage,
    totalPages,
    formattedResults,
    activeSelector,
    filteredNights2Options,
    
    // Search data
    searchData,
    
    // Methods
    handleSearch,
    handleReset,
    updateNights2Min,
    handlePageChange,
    handleBook,
    initializeData,
  }
}
