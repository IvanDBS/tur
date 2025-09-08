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
  const serverPageSize = 1000 // Загружаем все результаты сразу (per_page > 500)
  const lastSearchParams = ref<Record<string, unknown> | null>(null)
  const allLoadedResults = ref<Record<string, ObsSearchResult> | null>(null) // Все загруженные результаты
  const loadedPages = ref<Set<number>>(new Set()) // Отслеживаем загруженные страницы сервера
  const isLoadingMore = ref(false) // Загрузка дополнительных данных
  
  // Client-side pagination based on loaded results
  const totalPages = computed(() => {
    if (!allLoadedResults.value || typeof allLoadedResults.value !== 'object') return 0
    
    try {
      const allResults = Object.values(allLoadedResults.value)
      if (allResults.length === 0) return 0
      
      let groupedResults = groupResultsByHotel(allResults)
      
      // Применяем фильтрацию по регионам и категориям
      if (selectedFilters.value.regions.length > 0 || selectedFilters.value.categories.length > 0) {
        groupedResults = filterResultsByRegionsAndCategories(groupedResults)
      }
      
      const pages = Math.ceil(groupedResults.length / itemsPerPage)
      logger.debug(`totalPages computed: groupedResults.length=${groupedResults.length}, itemsPerPage=${itemsPerPage}, pages=${pages}`)
      return pages
    } catch (error) {
      logger.error('Error in totalPages computed:', error)
      return 0
    }
  })
  
  // Hybrid pagination: server loads 100, frontend shows 20
  const paginatedResults = computed(() => {
    logger.info(`🔄 paginatedResults computed called: allLoadedResults = ${allLoadedResults.value ? 'EXISTS' : 'NULL'}`)
    
    if (!allLoadedResults.value || typeof allLoadedResults.value !== 'object') {
      logger.info('❌ paginatedResults: no allLoadedResults')
      return []
    }
    
    try {
      // Get all loaded results as array
      const allResults = Object.values(allLoadedResults.value)
      logger.info(`📊 paginatedResults: allResults.length = ${allResults.length}, currentPage = ${currentPage.value}`)
      
      // Проверяем, что у нас есть валидные результаты
      if (allResults.length === 0) {
        logger.debug('paginatedResults: no results to process')
        return []
      }
      
      // Группируем результаты по отелям
      let groupedResults = groupResultsByHotel(allResults)
      logger.debug(`paginatedResults: groupedResults.length = ${groupedResults.length}`)
      
      // Применяем фильтрацию по регионам и категориям
      if (selectedFilters.value.regions.length > 0 || selectedFilters.value.categories.length > 0) {
        groupedResults = filterResultsByRegionsAndCategories(groupedResults)
        logger.debug(`paginatedResults: after filtering groupedResults.length = ${groupedResults.length}`)
      }
      
      // Calculate pagination for current page (20 items per page)
      const startIndex = (currentPage.value - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      
      const paginated = groupedResults.slice(startIndex, endIndex)
      logger.info(`📄 paginatedResults: startIndex = ${startIndex}, endIndex = ${endIndex}, paginated.length = ${paginated.length}`)
      logger.info(`📄 Final paginated results:`, paginated.length > 0 ? 'HAS RESULTS' : 'NO RESULTS')
      
      return paginated
    } catch (error) {
      logger.error('Error in paginatedResults computed:', error)
      return []
    }
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
    logger.debug(`🏨 getSelectedHotelsForSearch called. Available hotels: ${searchData.hotels.value.length}`)
    logger.debug(`🏨 Selected hotel filters: ${selectedFilters.value.hotels.length}`)
    
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
    const allHotels = searchData.hotels.value.map(hotel => Number(hotel.id))
    logger.debug(`🏨 Returning all hotels for search: ${allHotels.length} hotels`)
    return allHotels
  }

  // Функция для группировки результатов по отелям
  const groupResultsByHotel = (results: ObsSearchResult[]): GroupedSearchResult[] => {
    if (!results || results.length === 0) {
      return []
    }
    
    const groupedMap = new Map<string, GroupedSearchResult>()
    
    results.forEach(result => {
      // Проверяем, что у нас есть все необходимые данные
      if (!result.accommodation?.hotel?.id || !result.accommodation?.room?.id || !result.accommodation?.meal?.id) {
        logger.warn('Skipping result with missing accommodation data:', result)
        return
      }
      
      const hotelKey = `${result.accommodation.hotel.id}-${result.accommodation.room.id}-${result.accommodation.meal.id}`
      
      if (groupedMap.has(hotelKey)) {
        // Добавляем вариант перелета к существующему отелю
        const existing = groupedMap.get(hotelKey)!
        
        // Добавляем цену к варианту перелета
        const flightOptionWithPrice = {
          ...result.tickets,
          price: result.price
        }
        existing.flightOptions.push(flightOptionWithPrice)
        
        // Обновляем минимальную и максимальную цены
        const currentPrice = result.price?.amount || 0
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
          flightOptions: [{
            ...result.tickets,
            price: result.price
          }],
          minPrice: result.price?.amount || 0,
          maxPrice: result.price?.amount || 0,
          currency: result.price?.currency || 'EUR'
        }
        groupedMap.set(hotelKey, grouped)
      }
    })
    
    // Сортируем по минимальной цене
    return Array.from(groupedMap.values()).sort((a, b) => a.minPrice - b.minPrice)
  }

  // Функция для фильтрации результатов по регионам и категориям
  const filterResultsByRegionsAndCategories = (results: GroupedSearchResult[]): GroupedSearchResult[] => {
    let filteredResults = results
    
    // Фильтрация по регионам
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
      
      // Фильтруем результаты по городам отелей
      filteredResults = filteredResults.filter(result => {
        // Находим отель в данных searchData по ID
        const hotel = searchData.hotels.value.find(h => h.id === result.hotel.id)
        if (hotel && hotel.city_id) {
          return selectedCities.has(hotel.city_id)
        }
        return false
      })
    }
    
    // Фильтрация по категориям
    if (selectedFilters.value.categories.length > 0 && !selectedFilters.value.categories.includes(1)) {
      filteredResults = filteredResults.filter(result => {
        // Находим отель в данных searchData по ID
        const hotel = searchData.hotels.value.find(h => h.id === result.hotel.id)
        if (hotel && hotel.category_id) {
          return selectedFilters.value.categories.includes(hotel.category_id)
        }
        return false
      })
    }
    
    return filteredResults
  }

  // Methods
  const handleSearch = () => {
    // Получаем календарные подсказки для проверки доступности дат
    const { isDateAvailable, availableDates } = useCalendarHints()
    
    logger.info('🔍 Starting search with form data:', {
      departureCity: searchForm.value.departureCity?.id,
      destination: searchForm.value.destination?.id,
      package: searchForm.value.package?.id,
      checkInDate: searchForm.value.checkInDate,
      checkOutDate: searchForm.value.checkOutDate,
      nights: searchForm.value.nights,
      adults: searchForm.value.adults,
      children: searchForm.value.children,
      availableDatesCount: availableDates.value.length
    })
    
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

    // Проверяем доступность выбранных дат (используем уже полученные данные)
    
    logger.info('🔍 Checking date availability:', {
      checkInDate: searchForm.value.checkInDate,
      checkOutDate: searchForm.value.checkOutDate,
      checkInAvailable: searchForm.value.checkInDate ? isDateAvailable(searchForm.value.checkInDate) : 'no date',
      checkOutAvailable: searchForm.value.checkOutDate ? isDateAvailable(searchForm.value.checkOutDate) : 'no date',
      availableDatesCount: availableDates.value.length
    })
    
    if (!searchForm.value.checkInDate) {
      logger.warn('❌ No check-in date selected')
      showError('Ошибка поиска', 'Выберите дату заезда')
      return
    }
    if (!searchForm.value.checkOutDate) {
      logger.warn('❌ No check-out date selected')
      showError('Ошибка поиска', 'Выберите дату выезда')
      return
    }
    
    if (!isDateAvailable(searchForm.value.checkInDate)) {
      logger.warn('❌ Check-in date not available:', searchForm.value.checkInDate)
      
      // Попробуем автоматически выбрать доступную дату
      if (availableDates.value.length > 0) {
        const firstAvailableDate = availableDates.value[0]
        logger.info('🔄 Auto-selecting first available date:', firstAvailableDate)
        
        searchForm.value.checkInDate = firstAvailableDate
        
        // Обновляем дату выезда
        const nights = searchForm.value.nights || 7
        const checkOutDate = new Date(firstAvailableDate)
        checkOutDate.setDate(checkOutDate.getDate() + nights)
        searchForm.value.checkOutDate = checkOutDate
        
        logger.info('✅ Auto-selected dates:', {
          checkIn: firstAvailableDate,
          checkOut: checkOutDate
        })
      } else {
        logger.warn('❌ No available dates found in calendar hints')
        showError('Ошибка поиска', 'Выбранная дата заезда недоступна для бронирования. Нет доступных дат.')
        return
      }
    }
    if (!isDateAvailable(searchForm.value.checkOutDate)) {
      logger.warn('❌ Check-out date not available:', searchForm.value.checkOutDate)
      
      // Автоматически пересчитываем дату выезда на основе даты заезда
      if (searchForm.value.checkInDate) {
        const nights = searchForm.value.nights || 7
        const checkOutDate = new Date(searchForm.value.checkInDate)
        checkOutDate.setDate(checkOutDate.getDate() + nights)
        searchForm.value.checkOutDate = checkOutDate
        
        logger.info('🔄 Auto-calculated check-out date:', checkOutDate)
        
        // Проверяем, доступна ли новая дата выезда
        if (!isDateAvailable(checkOutDate)) {
          logger.warn('❌ Auto-calculated check-out date also not available:', checkOutDate)
          showError('Ошибка поиска', 'Не удалось найти доступные даты для выбранного количества ночей')
          return
        }
      } else {
        showError('Ошибка поиска', 'Выбранная дата выезда недоступна для бронирования')
        return
      }
    }
    
    logger.info('✅ Date validation passed, proceeding with search...')

    // Форматируем даты в формат DD.MM.YYYY для API (как требует документация)
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }
    
    logger.info('📅 Formatted dates for API:', {
      checkIn: formatDate(searchForm.value.checkInDate),
      checkOut: formatDate(searchForm.value.checkOutDate)
    })

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
      selected_hotels: (() => {
        const hotels = getSelectedHotelsForSearch()
        logger.info(`🏨 Selected hotels for search: ${hotels.length} hotels`, hotels.slice(0, 5))
        return hotels
      })(),
      meals: selectedFilters.value.meals.length > 0 ? selectedFilters.value.meals.map(mealId => {
        const meal = searchData.meals.value.find(m => m.id === mealId)
        return meal?.name || meal?.label || mealId.toString()
      }) : searchData.meals.value.map(meal => meal.name || meal.label || meal.id.toString()).filter(Boolean),
      options: selectedFilters.value.options.length > 0 ? selectedFilters.value.options.map(optionId => {
        return optionId.toString()
      }) : undefined
    }
    
    logger.info('🔍 Search parameters prepared:', {
      country: searchParams.country,
      package_template: searchParams.package_template,
      airport_city_from: searchParams.airport_city_from,
      airport_city_to: searchParams.airport_city_to,
      date_from: searchParams.date_from,
      date_to: searchParams.date_to,
      nights_from: searchParams.nights_from,
      nights_to: searchParams.nights_to,
      adults: searchParams.adults,
      children: searchParams.children,
      selected_hotels: searchParams.selected_hotels,
      meals: searchParams.meals,
      options: searchParams.options
    })

    isLoading.value = true
    
    // Сбрасываем предыдущие результаты и пагинацию
    searchResults.value = null
    totalResults.value = 0
    currentPage.value = 1
    loadedPages.value.clear() // Очищаем отслеживание загруженных страниц
    
    // Добавляем параметры пагинации (загружаем все туры, per_page > 500)
    const searchParamsWithPagination = {
      ...searchParams,
      page: 1, // Всегда начинаем с первой страницы
      per_page: serverPageSize // Загружаем все туры (per_page > 500)
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
        
        // Обработка результатов поиска
        if (result) {
          logger.debug('Full search result structure:', result)
          logger.debug('Result keys:', Object.keys(result))
          
          // Проверяем разные возможные структуры ответа
          let resultsData: Record<string, ObsSearchResult> | null = null
          let totalCount = 0
          
          if (result.results && typeof result.results === 'object') {
            // Стандартная структура: { results: {...}, total_results: N }
            resultsData = result.results
            totalCount = result.total_results || 0
            logger.debug('Using standard structure: result.results')
          } else if (typeof result === 'object' && !result.results) {
            // Прямая структура: результаты в корне объекта
            // Исключаем служебные поля
            const excludeKeys = ['search_id', 'total_results', 'page', 'per_page', 'total_pages', 'prev_page', 'next_page', 'message']
            const resultKeys = Object.keys(result).filter(key => !excludeKeys.includes(key))
            
            if (resultKeys.length > 0) {
              resultsData = {}
              resultKeys.forEach(key => {
                if (resultsData) {
                  resultsData[key] = result[key]
                }
              })
              totalCount = resultKeys.length
              logger.debug('Using direct structure: results in root object')
            }
          }
          
          if (resultsData && Object.keys(resultsData).length > 0) {
            searchResults.value = resultsData
            totalResults.value = totalCount
            allLoadedResults.value = resultsData
            loadedPages.value.add(1)
            
            logger.info(`✅ Search completed successfully: total_results = ${totalResults.value}`)
            logger.info(`✅ Results stored: allLoadedResults keys = ${allLoadedResults.value ? Object.keys(allLoadedResults.value).length : 0}`)
            logger.info(`✅ First few result keys = ${allLoadedResults.value ? Object.keys(allLoadedResults.value).slice(0, 5) : []}`)
            logger.info(`✅ searchResults.value = ${searchResults.value ? 'SET' : 'NULL'}`)
            logger.info(`✅ totalResults.value = ${totalResults.value}`)
          } else {
            logger.warn('❌ No valid results found in search response:', result)
            logger.warn('❌ resultsData =', resultsData)
            logger.warn('❌ resultKeys length =', result ? Object.keys(result).length : 'no result')
            searchResults.value = null
            allLoadedResults.value = null
            totalResults.value = 0
          }
        } else {
          logger.warn('Empty search response')
          searchResults.value = null
          allLoadedResults.value = null
          totalResults.value = 0
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

  const handleReset = async () => {
    try {
      // Используем nextTick для безопасного обновления компонентов
      await nextTick()
      
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
      
      // Очищаем сохраненное состояние
      clearSearchState()
    } catch (error) {
      logger.error('Error in handleReset:', error)
    }
  }

  // Метод для обновления минимального значения для nights2
  const updateNights2Min = () => {
    if (searchForm.value.nights && (!searchForm.value.nights2 || searchForm.value.nights2 < searchForm.value.nights)) {
      searchForm.value.nights2 = searchForm.value.nights
    }
  }

  // Метод для автоматического выбора доступной даты
  const selectAvailableDate = () => {
    const { availableDates } = useCalendarHints()
    
    if (availableDates.value.length > 0) {
      // Выбираем первую доступную дату
      const firstAvailableDate = availableDates.value[0]
      searchForm.value.checkInDate = firstAvailableDate
      
      // Устанавливаем дату выезда через 7 дней (или минимальное количество ночей)
      const nights = searchForm.value.nights || 7
      const checkOutDate = new Date(firstAvailableDate)
      checkOutDate.setDate(checkOutDate.getDate() + nights)
      searchForm.value.checkOutDate = checkOutDate
      
      logger.info(`Auto-selected available dates: ${firstAvailableDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`)
    } else {
      // Если нет доступных дат, устанавливаем дату через неделю
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      searchForm.value.checkInDate = nextWeek
      
      const nights = searchForm.value.nights || 7
      const checkOutDate = new Date(nextWeek)
      checkOutDate.setDate(checkOutDate.getDate() + nights)
      searchForm.value.checkOutDate = checkOutDate
      
      logger.info(`No available dates found, using default: ${nextWeek.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`)
    }
  }

  // Метод для загрузки дополнительных данных (упрощенная версия)
  const loadMoreData = async () => {
    // Поскольку мы загружаем все результаты сразу (per_page > 500), 
    // этот метод больше не нужен, но оставляем для совместимости
    logger.debug('loadMoreData called - no additional loading needed (all results loaded at once)')
    return Promise.resolve()
  }

  // Метод для обработки смены страницы
  const handlePageChange = (page: number) => {
    // Don't change page if it's the same
    if (page === currentPage.value) {
      return
    }
    
    // Проверяем, что страница в допустимых пределах
    if (page < 1 || page > totalPages.value) {
      logger.warn(`Invalid page number: ${page}, total pages: ${totalPages.value}`)
      return
    }
    
    logger.debug(`handlePageChange: changing from page ${currentPage.value} to page ${page}`)
    currentPage.value = page
    
    // Прокручиваем к началу результатов с отступом сверху
    setTimeout(() => {
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
    }, 100) // Небольшая задержка для обновления DOM
  }

  // Обработчик бронирования тура
  const handleBook = (result: GroupedSearchResult) => {
    // Сохраняем состояние поиска перед переходом на бронирование
    saveSearchState()
    
    // Здесь можно добавить логику бронирования
    alert(`Бронирование тура: ${result.hotel.name} от ${result.minPrice} ${result.currency}`)
  }

  // Сохранение состояния поиска
  const saveSearchState = () => {
    try {
      const searchState = {
        searchForm: searchForm.value,
        selectedFilters: selectedFilters.value,
        searchResults: searchResults.value,
        allLoadedResults: allLoadedResults.value,
        totalResults: totalResults.value,
        currentPage: currentPage.value,
        lastSearchParams: lastSearchParams.value,
        loadedPages: Array.from(loadedPages.value),
        timestamp: Date.now()
      }
      
      sessionStorage.setItem('searchState', JSON.stringify(searchState))
      logger.info('💾 Search state saved to sessionStorage')
    } catch (error) {
      logger.warn('Failed to save search state:', error)
    }
  }

  // Восстановление состояния поиска
  const restoreSearchState = () => {
    try {
      const savedState = sessionStorage.getItem('searchState')
      if (!savedState) {
        logger.info('No saved search state found')
        return false
      }

      const searchState = JSON.parse(savedState)
      
      // Проверяем, что состояние не слишком старое (например, не старше 1 часа)
      const maxAge = 60 * 60 * 1000 // 1 час
      if (Date.now() - searchState.timestamp > maxAge) {
        logger.info('Saved search state is too old, ignoring')
        sessionStorage.removeItem('searchState')
        return false
      }

      // Восстанавливаем состояние
      searchForm.value = searchState.searchForm || searchForm.value
      selectedFilters.value = searchState.selectedFilters || selectedFilters.value
      searchResults.value = searchState.searchResults || null
      allLoadedResults.value = searchState.allLoadedResults || null
      totalResults.value = searchState.totalResults || 0
      currentPage.value = searchState.currentPage || 1
      lastSearchParams.value = searchState.lastSearchParams || null
      loadedPages.value = new Set(searchState.loadedPages || [])
      
      logger.info('🔄 Search state restored from sessionStorage')
      return true
    } catch (error) {
      logger.warn('Failed to restore search state:', error)
      sessionStorage.removeItem('searchState')
      return false
    }
  }

  // Очистка сохраненного состояния
  const clearSearchState = () => {
    try {
      sessionStorage.removeItem('searchState')
      logger.info('🗑️ Search state cleared from sessionStorage')
    } catch (error) {
      logger.warn('Failed to clear search state:', error)
    }
  }

  // Метод инициализации данных
  const initializeData = async () => {
    try {
      logger.info('🔄 Initializing search data...')
      await searchData.initializeData()
      logger.info('✅ Search data initialized')
      logger.info(`🏙️ Departure cities loaded: ${searchData.departureCitiesOptions.value.length}`)
      
      // Пытаемся восстановить состояние поиска
      restoreSearchState()
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
    selectAvailableDate,
    handlePageChange,
    handleBook,
    initializeData,
    loadMoreData,
    groupResultsByHotel,
    
    // State management
    saveSearchState,
    restoreSearchState,
    clearSearchState,
  }
}
