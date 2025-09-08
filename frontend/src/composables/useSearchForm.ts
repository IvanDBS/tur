import { ref, computed, watch, nextTick } from 'vue'
import { useSearchData } from './useSearchData'
import { useCalendarHints } from './useCalendarHints'
import { useNotifications } from './useNotifications'
import { logger } from '../utils/logger'
import { getAirportIdByPackageName } from '../constants/airports'
import type { SearchForm, SelectedFilters, GroupedSearchResult } from '../types/search'

// Интерфейс для результатов поиска от OBS API
interface ObsSearchResult {
  unique_key: string
  rid: string
  hotel_results_counter: number
  package_template: number
  operator: number
  additional_services: unknown[]
  dates: {
    check_in: string
    check_out: string
  }
  nights: {
    total: number
    on_the_way: number
  }
  accommodation: {
    hotel: {
      id: number
      name: string
      is_exclusive: boolean
      category: string
      city: string
      in_stop: boolean
    }
    room: {
      id: number
      name: string
    }
    placement: {
      id: number
      name: string
    }
    meal: {
      id: number
      name: string
      full_name: string
    }
  }
  tickets: {
    from: {
      id: number
      name: string
      airline: {
        iata_code: string
        color: string
        name: string
        airline: string
      }
      departure: {
        date: string
        time: string
      }
      arrival: {
        date: string
        time: string
      }
      airports: {
        from: {
          name: string
          prefix: string
        }
        to: {
          name: string
          prefix: string
        }
      }
      tickets: number | null
    }
    to: {
      id: number
      name: string
      airline: {
        iata_code: string
        color: string
        name: string
        airline: string
      }
      departure: {
        date: string
        time: string
      }
      arrival: {
        date: string
        time: string
      }
      airports: {
        from: {
          name: string
          prefix: string
        }
        to: {
          name: string
          prefix: string
        }
      }
      tickets: number | null
    }
    on_request: 'y' | 'n'
    has_tickets: boolean
  }
  price: {
    amount: number
    netto: number
    commission: number
    type: string
    currency: string
    currency_id: number
  }
  transfers: {
    to: number
    from: number
  }
  never_land_entrance: unknown[]
  gala_dinner: unknown[]
  aquapark_services: unknown[]
  tourists: {
    adults: number
    children_ages: number[]
  }
}

export const useSearchForm = () => {
  // Получаем данные из composable
  const searchData = useSearchData()
  const calendarHints = useCalendarHints()
  const { showError } = useNotifications()

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
  const serverPageSize = 100 // Загружаем все результаты сразу (per_page >= 100)
  const lastSearchParams = ref<Record<string, unknown> | null>(null)
  const allLoadedResults = ref<Record<string, ObsSearchResult> | null>(null) // Все загруженные результаты
  const loadedPages = ref<Set<number>>(new Set()) // Отслеживаем загруженные страницы сервера
  const isLoadingMore = ref(false) // Загрузка дополнительных данных
  
  // Client-side pagination based on loaded results
  const totalPages = computed(() => {
    if (!allLoadedResults.value) return 0
    const allResults = Object.values(allLoadedResults.value)
    const groupedResults = groupResultsByHotel(allResults)
    const pages = Math.ceil(groupedResults.length / itemsPerPage)
    logger.debug(`totalPages computed: groupedResults.length=${groupedResults.length}, itemsPerPage=${itemsPerPage}, pages=${pages}`)
    return pages
  })
  
  // Hybrid pagination: server loads 100, frontend shows 20
  const paginatedResults = computed(() => {
    if (!allLoadedResults.value || typeof allLoadedResults.value !== 'object') {
      logger.debug('paginatedResults: no allLoadedResults')
      return []
    }
    
    // Get all loaded results as array
    const allResults = Object.values(allLoadedResults.value)
    logger.debug(`paginatedResults: allResults.length = ${allResults.length}, currentPage = ${currentPage.value}`)
    
    // Группируем результаты по отелям
    const groupedResults = groupResultsByHotel(allResults)
    logger.debug(`paginatedResults: groupedResults.length = ${groupedResults.length}`)
    
    // Calculate pagination for current page (20 items per page)
    const startIndex = (currentPage.value - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    
    const paginated = groupedResults.slice(startIndex, endIndex)
    logger.debug(`paginatedResults: startIndex = ${startIndex}, endIndex = ${endIndex}, paginated.length = ${paginated.length}`)
    
    return paginated
  })

  // Простая клиентская пагинация - загружаем все результаты сразу
  const needsMoreData = computed(() => {
    // Всегда false - загружаем все результаты сразу
    return false
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
      // Сбрасываем выбранные ночи при смене даты, чтобы пользователь выбрал из доступных
      searchForm.value.nights = null
      searchForm.value.nights2 = null
      
      // Заполняем только количество взрослых
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
  
  // Динамические опции ночей на основе calendar hints
  const dynamicNightsOptions = computed(() => {
    // Если есть доступные ночи из calendar hints, используем их
    if (calendarHints.availableNights.value.length > 0) {
      return calendarHints.availableNightsOptions.value
    }
    
    // Иначе используем стандартные опции
    return searchData.nightsOptions.value
  })

  // Форматированные результаты для отображения
  const formattedResults = computed(() => {
    if (!searchResults.value || typeof searchResults.value !== 'object') {
      return []
    }
    
    // Используем пагинированные результаты
    const formatted = paginatedResults.value.map((result: GroupedSearchResult) => ({
      unique_key: `${result.hotel.id}-${result.room.id}-${result.meal.id}`,
      rid: `${result.hotel.id}-${result.room.id}-${result.meal.id}`,
      accommodation: {
        hotel: {
          name: result.hotel?.name || 'Название отеля',
          category: result.hotel?.category || '',
          city: result.hotel?.city || ''
        },
        room: {
          name: result.room?.name || ''
        },
        meal: {
          full_name: result.meal?.full_name || result.meal?.name || ''
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
        amount: result.minPrice || 0,
        currency: result.currency || 'EUR',
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
        
        // Загружаем calendar hints для доступных дат и ночей
        if (searchForm.value.departureCity?.id && searchForm.value.arrivalCity?.id) {
          try {
            await calendarHints.loadCalendarHints({
              city_from: searchForm.value.departureCity.id,
              city_to: searchForm.value.arrivalCity.id.toString()
            })
            logger.info('Calendar hints loaded successfully')
          } catch (err) {
            logger.warn('Failed to load calendar hints:', err)
          }
        }
        
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


  // Helper function to get hotels for search
  const getSelectedHotelsForSearch = () => {
    // Если пользователь выбрал отели вручную, используем их
    if (selectedFilters.value.hotels.length > 0) {
      // Если выбран ID=1 (все отели), возвращаем все доступные отели
      if (selectedFilters.value.hotels.includes(1)) {
        return searchData.hotels.value.map(hotel => Number(hotel.id))
      }
      // Иначе возвращаем выбранные отели (исключая ID=1)
      return selectedFilters.value.hotels
        .filter(id => id !== 1)
        .map(id => Number(id))
    }
    
    // Если выбраны регионы или категории, используем отфильтрованные отели
    if (selectedFilters.value.regions.length > 0 || selectedFilters.value.categories.length > 0) {
      // Получаем отфильтрованные отели из searchData
      const allHotels = searchData.hotels.value
      let filteredHotels = allHotels
      
      // Применяем фильтрацию по регионам
      if (selectedFilters.value.regions.length > 0 && !selectedFilters.value.regions.includes(1)) {
        // Создаем маппинг регионов к городам
        const regionCitiesMap = new Map<number, number[]>()
        searchData.regions.value.forEach(region => {
          if (region.cities && Array.isArray(region.cities)) {
            const cityIds = region.cities.map(city => city.id)
            regionCitiesMap.set(region.id, cityIds)
          }
        })
        
        // Получаем все города для выбранных регионов
        const selectedCities = new Set<number>()
        selectedFilters.value.regions.forEach(regionId => {
          const cities = regionCitiesMap.get(regionId)
          if (cities) {
            cities.forEach(cityId => selectedCities.add(cityId))
          }
        })
        
        // Фильтруем отели по городам
        filteredHotels = filteredHotels.filter(hotel => {
          return hotel.city_id && selectedCities.has(hotel.city_id)
        })
      }
      
      // Применяем фильтрацию по категориям
      if (selectedFilters.value.categories.length > 0 && !selectedFilters.value.categories.includes(1)) {
        filteredHotels = filteredHotels.filter(hotel => {
          return hotel.category_id && selectedFilters.value.categories.includes(hotel.category_id)
        })
      }
      
      // Возвращаем ID отфильтрованных отелей
      return filteredHotels.map(hotel => Number(hotel.id))
    }
    
    // Если ничего не выбрано, возвращаем все доступные отели
    return searchData.hotels.value.map(hotel => Number(hotel.id))
  }

  // Функция для группировки результатов по отелям
  const groupResultsByHotel = (results: ObsSearchResult[]): GroupedSearchResult[] => {
    const groupedMap = new Map<string, GroupedSearchResult>()
    
    results.forEach(result => {
      const hotelKey = `${result.accommodation.hotel.id}-${result.accommodation.room.id}-${result.accommodation.meal.id}`
      
      if (groupedMap.has(hotelKey)) {
        // Добавляем вариант перелета к существующему отелю
        const existing = groupedMap.get(hotelKey)!
        existing.flightOptions.push(result.tickets)
        
        // Обновляем минимальную и максимальную цены
        const currentPrice = result.price.amount
        if (currentPrice < existing.minPrice) {
          existing.minPrice = currentPrice
        }
        if (currentPrice > existing.maxPrice) {
          existing.maxPrice = currentPrice
        }
      } else {
        // Создаем новый группированный результат
        const grouped: GroupedSearchResult = {
          hotel: result.accommodation.hotel,
          room: result.accommodation.room,
          meal: result.accommodation.meal,
          dates: result.dates,
          nights: result.nights,
          price: result.price,
          transfers: result.transfers,
          never_land_entrance: result.never_land_entrance,
          gala_dinner: result.gala_dinner,
          aquapark_services: result.aquapark_services,
          tourists: result.tourists,
          flightOptions: [result.tickets],
          minPrice: result.price.amount,
          maxPrice: result.price.amount,
          currency: result.price.currency
        }
        groupedMap.set(hotelKey, grouped)
      }
    })
    
    // Сортируем по минимальной цене
    return Array.from(groupedMap.values()).sort((a, b) => a.minPrice - b.minPrice)
  }

  // Methods
  const handleSearch = () => {
    // Добавляем выбранные отели в форму поиска (используем правильную логику)
    searchForm.value.selectedHotels = getSelectedHotelsForSearch()

    // Проверяем обязательные поля
    if (!searchForm.value.departureCity?.id) {
      showError('Ошибка поиска', 'Выберите город отправления')
      return
    }
    if (!searchForm.value.destination?.id) {
      showError('Ошибка поиска', 'Выберите страну назначения')
      return
    }
    if (!searchForm.value.package?.id) {
      showError('Ошибка поиска', 'Выберите пакет тура')
      return
    }
    if (!searchForm.value.arrivalCity?.id) {
      showError('Ошибка поиска', 'Выберите город прилета')
      return
    }
    if (!searchForm.value.checkInDate) {
      showError('Ошибка поиска', 'Выберите дату заезда')
      return
    }
    if (!searchForm.value.checkOutDate) {
      showError('Ошибка поиска', 'Выберите дату выезда')
      return
    }
    if (!searchForm.value.nights) {
      showError('Ошибка поиска', 'Выберите количество ночей')
      return
    }
    if (!searchForm.value.nights2) {
      showError('Ошибка поиска', 'Выберите максимальное количество ночей')
      return
    }
    if (searchForm.value.children === null) {
      showError('Ошибка поиска', 'Укажите количество детей (можно выбрать "Без детей")')
      return
    }

    // Проверяем, что выбраны отели или опция "Любой"
    if (selectedFilters.value.hotels.length === 0) {
      showError('Ошибка поиска', 'Выберите отели или опцию "Любой" в фильтрах')
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
      selected_hotels: getSelectedHotelsForSearch(),
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
    loadedPages.value.clear() // Очищаем отслеживание загруженных страниц
    
    // Добавляем параметры пагинации (загружаем по 100 туров)
    const searchParamsWithPagination = {
      ...searchParams,
      page: 1, // Всегда начинаем с первой страницы
      per_page: serverPageSize // Загружаем по 100 туров
    }
    
    logger.debug(`Search params with pagination:`, searchParamsWithPagination)
    logger.debug(`Search params with pagination - page: ${searchParamsWithPagination.page}, per_page: ${searchParamsWithPagination.per_page}`)
    
    // Сохраняем параметры поиска для пагинации
    lastSearchParams.value = searchParams
    
    // Сбрасываем загруженные результаты
    allLoadedResults.value = null
    
    // Вызываем API поиска
    searchData.performSearch(searchParamsWithPagination)
      .then((result) => {
        isLoading.value = false
        
        logger.debug('Raw search result:', result)
        logger.debug('Result type:', typeof result)
        logger.debug('Result keys:', result ? Object.keys(result) : 'null')
        
        // Сохраняем результаты поиска
        if (result && result.results) {
          searchResults.value = result.results
          totalResults.value = result.total_results || 0
          allLoadedResults.value = result.results // Сохраняем все загруженные результаты
          loadedPages.value.add(1) // Отмечаем первую страницу как загруженную
          
          logger.debug(`Search completed: total_results = ${totalResults.value}, results keys = ${Object.keys(result.results).length}`)
          logger.debug(`Search completed: allLoadedResults keys = ${allLoadedResults.value ? Object.keys(allLoadedResults.value).length : 0}`)
          logger.debug(`Search completed: first few keys = ${allLoadedResults.value ? Object.keys(allLoadedResults.value).slice(0, 5) : []}`)
        } else {
          logger.warn('No results in search response:', result)
        }
      })
      .catch((error) => {
        logger.error('Search failed:', error)
        isLoading.value = false
        
        // Показываем ошибку пользователю
        let errorMessage = 'Произошла ошибка при поиске туров'
        
        if (error.message && error.message.includes('Validation failed')) {
          errorMessage = 'Проверьте правильность заполнения формы'
        } else if (error.message && error.message.includes('NO_TICKETS')) {
          errorMessage = 'По выбранным параметрам туры не найдены. Попробуйте изменить даты или количество ночей'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        showError('Ошибка поиска', errorMessage)
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
    loadedPages.value.clear()
    isLoadingMore.value = false
  }

  // Метод для обновления минимального значения для nights2
  const updateNights2Min = () => {
    if (searchForm.value.nights && (!searchForm.value.nights2 || searchForm.value.nights2 < searchForm.value.nights)) {
      searchForm.value.nights2 = searchForm.value.nights
    }
  }

  // Метод для загрузки дополнительных данных
  const loadMoreData = async () => {
    if (!lastSearchParams.value || isLoadingMore.value) return

    isLoadingMore.value = true
    
    try {
      // Определяем следующую страницу сервера для загрузки
      const currentServerPage = Math.ceil((currentPage.value * itemsPerPage) / serverPageSize)
      
      // Загружаем следующую порцию данных
      const result = await searchData.performSearch({
        ...lastSearchParams.value,
        page: currentServerPage,
        per_page: serverPageSize
      } as Parameters<typeof searchData.performSearch>[0])
      
      if (result && result.results) {
        // Объединяем новые результаты с существующими
        const newResults = { ...allLoadedResults.value, ...result.results }
        allLoadedResults.value = newResults
        loadedPages.value.add(currentServerPage)
        
        logger.info(`Loaded page ${currentServerPage}, total results: ${Object.keys(newResults).length}`)
      }
    } catch (error) {
      logger.error('Failed to load more data:', error)
    } finally {
      isLoadingMore.value = false
    }
  }

  // Метод для обработки смены страницы
  const handlePageChange = (page: number) => {
    // Don't change page if it's the same
    if (page === currentPage.value) {
      return
    }
    
    logger.debug(`handlePageChange: changing from page ${currentPage.value} to page ${page}`)
    currentPage.value = page
    
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
  const handleBook = (result: GroupedSearchResult) => {
    // Здесь можно добавить логику бронирования
    alert(`Бронирование тура: ${result.hotel.name} от ${result.minPrice} ${result.currency}`)
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
    dynamicNightsOptions,
    paginatedResults,
    isLoadingMore,
    needsMoreData,
    
    // Search data
    searchData,
    
    // Calendar hints
    calendarHints,
    
    // Methods
    handleSearch,
    handleReset,
    updateNights2Min,
    handlePageChange,
    handleBook,
    initializeData,
    loadMoreData,
    groupResultsByHotel,
  }
}
