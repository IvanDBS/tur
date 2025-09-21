import { computed, watch, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchData } from './useSearchData'
import { useCalendarHints } from './useCalendarHints'
import { useNotifications } from './useNotifications'
import { useSearchValidation } from './useSearchValidation'
import { useSearchPagination } from './useSearchPagination'
import { useSearchFilters } from './useSearchFilters'
import { useSearchState } from './useSearchState'
import { logger } from '../utils/logger'
import { getAirportIdByPackageName } from '../constants/airports'
import { debounce } from '../utils/debounce'
import type { GroupedSearchResult, Package } from '../types/search'

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
  // Получаем данные из composables
  const router = useRouter()
  const searchData = useSearchData()
  const calendarHints = useCalendarHints()
  const { showError } = useNotifications()
  
  // Используем новые composables
  const { validateSearchForm, validateDates } = useSearchValidation()
  const {
    currentPage,
    serverPageSize,
    lastSearchParams,
    allLoadedResults,
    loadedPages,
    isLoadingMore,
    totalPages,
    paginatedResults,
    needsMoreData,
    handlePageChange,
    loadMoreData,
    groupResultsByHotel,
    resetPagination
  } = useSearchPagination()
  const { 
    selectedFilters, 
    getSelectedHotelsForSearch, 
    resetFilters, 
    toggleAllHotels, 
    toggleAllCategories, 
    toggleAllRegions,
    toggleRegion,
    toggleCategory,
    toggleHotel,
    toggleMeal,
    toggleOption,
    toggleAllMeals,
    toggleAllOptions,
    allRegionsSelected,
    allCategoriesSelected,
    allHotelsSelected,
    allMealsSelected,
    allOptionsSelected
  } = useSearchFilters()
  const {
    searchForm,
    isLoading,
    searchResults,
    totalResults,
    saveSearchState,
    restoreSearchState,
    clearSearchState,
    resetSearchForm
  } = useSearchState()

  // Состояние для debounce
  const isSearchPending = ref(false)
  const searchRequestId = ref(0)
  const hasSearched = ref(false)

  // Функция для определения пакетов без перелета
  const isPackageWithoutFlight = (pkg: Package | null): boolean => {
    if (!pkg) return false
    return !pkg.airports || pkg.airports.length === 0
  }

  // Определяем активный селектор для показа стрелки
  const activeSelector = computed((): string | null => {
    if (!searchForm.value.departureCity) return 'departureCity'
    if (!searchForm.value.destination) return 'destination'
    if (!searchForm.value.package) return 'package'
    
    // Если пакет без перелета, пропускаем поле города прилета
    if (!isPackageWithoutFlight(searchForm.value.package) && !searchForm.value.arrivalCity) {
      return 'arrivalCity'
    }
    
    // Для пакетов без перелета сразу переходим к дате заезда
    if (isPackageWithoutFlight(searchForm.value.package) && !searchForm.value.checkInDate) {
      return 'checkInDate'
    }
    
    if (!searchForm.value.checkInDate) return 'checkInDate'
    if (!searchForm.value.checkOutDate) return 'checkOutDate'
    // После выбора даты заезда активируется поле "ночей от"
    if (searchForm.value.checkInDate && searchForm.value.nights === null) return 'nights'
    // После выбора ночей от активируется поле "взрослых"
    if (searchForm.value.nights !== null && searchForm.value.adults === null) return 'adults'
    // После выбора взрослых активируется поле "детей"
    if (searchForm.value.adults !== null && searchForm.value.children === null) return 'children'
    // После выбора детей (включая 0 - "Без детей") все поля активируются, стрелочка исчезает
    return null // Все селекторы заполнены
  })

  // Автоматическое заполнение полей значениями по умолчанию после выбора даты заезда
  watch(() => searchForm.value.checkInDate, async (newDate) => {
    if (newDate) {
      // Сбрасываем выбранные поля при смене даты для пошагового заполнения
      searchForm.value.nights = null
      searchForm.value.nights2 = null
      searchForm.value.adults = null
      searchForm.value.children = null
      searchForm.value.childrenAges = []
      
      // Устанавливаем "Период заезда до" равным "Период заезда от" по умолчанию
      // Пользователь может изменить это вручную, если нужно
      searchForm.value.checkOutDate = new Date(newDate)
      logger.info('🔄 Set checkOutDate (max check-in period) equal to checkInDate:', newDate)
      
      // Загружаем доступные ночи для выбранной даты и направления
      if (searchForm.value.departureCity && searchForm.value.arrivalCity && searchForm.value.package && !isPackageWithoutFlight(searchForm.value.package)) {
        try {
          const formatDate = (date: Date) => {
            const year = date.getFullYear()
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const day = date.getDate().toString().padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          
          await calendarHints.loadAvailableNights({
            date_from: formatDate(newDate),
            date_to: formatDate(newDate),
            city_from: searchForm.value.departureCity.id,
            city_to: searchForm.value.arrivalCity.id.toString()
          })
          
          logger.info('✅ Available nights loaded for date:', newDate)
        } catch (err) {
          logger.warn('Failed to load available nights for date:', err)
        }
      }
    }
  })

  // Убрали автоматический расчет checkOutDate, так как это не дата выезда,
  // а максимальная дата заселения в отеле
  // checkOutDate теперь устанавливается равным checkInDate по умолчанию
  // и пользователь может изменить его на более позднюю дату

  // Фильтрованные опции для второго селектора ночей
  const filteredNights2Options = computed(() => {
    if (!searchForm.value.nights) {
      return []
    }

    return searchData.nightsOptions.value.filter(
      (option: { value: number; label: string }) => option.value >= (searchForm.value.nights || 0)
    )
  })
  
  // Динамические опции ночей на основе доступных ночей из API
  const dynamicNightsOptions = computed(() => {
    // Для пакетов без перелета используем стандартные опции
    if (isPackageWithoutFlight(searchForm.value.package)) {
      return searchData.nightsOptions.value
    }
    
    // Если есть доступные ночи из API, создаем опции на их основе
    if (calendarHints.availableNights.value.length > 0) {
      const availableNightsOptions = calendarHints.availableNights.value.map(nights => ({
        value: nights,
        label: `${nights}`
      }))
      
      logger.info('Using available nights from API:', availableNightsOptions)
      return availableNightsOptions
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
      unique_key: `${result.hotel.id}-${result.roomOptions[0]?.room.id || 0}-${result.roomOptions[0]?.meal.id || 0}`,
      rid: `${result.hotel.id}-${result.roomOptions[0]?.room.id || 0}-${result.roomOptions[0]?.meal.id || 0}`,
      accommodation: {
        hotel: {
          name: result.hotel?.name || 'Название отеля',
          category: result.hotel?.category || '',
          city: result.hotel?.city || ''
        },
        room: {
          name: result.roomOptions[0]?.room?.name || ''
        },
        meal: {
          full_name: result.roomOptions[0]?.meal?.full_name || result.roomOptions[0]?.meal?.name || ''
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
        type: result.roomOptions[0]?.price?.type || ''
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
    logger.info('📦 Package watcher triggered:', {
      hasPackage: !!newPackage,
      packageId: newPackage?.id,
      packageName: newPackage?.name || newPackage?.label
    })
    try {
      if (newPackage && newPackage.id) {
        // Если у пакета есть аэропорты, устанавливаем город прилета
        if (newPackage.airports && newPackage.airports.length > 0) {
          const airport = newPackage.airports[0]
          logger.info('🛫 Setting arrival city from package airports:', airport)
          
          // Создаем объект города прилета
          const arrivalCity = {
            id: airport.id,
            name: airport.label || airport.name || `Airport ${airport.id}`
          }
          
          // Принудительно обновляем реактивность
          searchForm.value.arrivalCity = { ...arrivalCity }
          logger.info('🛫 Arrival city set:', searchForm.value.arrivalCity)
          
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
        logger.info('🔄 Starting to load search data for package:', newPackage.id)
        await Promise.all([
          searchData.loadHotelCategories(newPackage.id),
          searchData.loadLocations(newPackage.id),
          searchData.loadHotels(newPackage.id),
          searchData.loadMeals(newPackage.id)
        ])
        logger.info('✅ All search data loaded for package:', newPackage.id)
        
        // Загружаем calendar hints только для пакетов с перелетом
        if (!isPackageWithoutFlight(newPackage) && searchForm.value.departureCity?.id && searchForm.value.arrivalCity?.id) {
          try {
            await calendarHints.loadCalendarHints({
              city_from: searchForm.value.departureCity.id,
              city_to: searchForm.value.arrivalCity.id.toString()
            })
            logger.info('Calendar hints loaded successfully for flight package')
            
            // Загружаем доступные ночи для выбранной даты (если есть)
            if (searchForm.value.checkInDate) {
              const formatDate = (date: Date) => {
                const year = date.getFullYear()
                const month = (date.getMonth() + 1).toString().padStart(2, '0')
                const day = date.getDate().toString().padStart(2, '0')
                return `${year}-${month}-${day}`
              }
              
              await calendarHints.loadAvailableNights({
                date_from: formatDate(searchForm.value.checkInDate),
                date_to: formatDate(searchForm.value.checkInDate),
                city_from: searchForm.value.departureCity.id,
                city_to: searchForm.value.arrivalCity.id.toString()
              })
              logger.info('Available nights loaded for package change')
            }
          } catch (err) {
            logger.warn('Failed to load calendar hints:', err)
          }
        } else if (isPackageWithoutFlight(newPackage)) {
          logger.info('Skipping calendar hints for no-flight package')
        }
        
        // Автоматически выбираем все регионы, категории и отели
        logger.info('🏨 Auto-selecting filters for package:', {
          regionsCount: searchData.regions.value.length,
          categoriesCount: searchData.categories.value.length,
          hotelsCount: searchData.hotels.value.length,
          mealsCount: searchData.meals.value.length
        })
        
        if (searchData.regions.value.length > 0) {
          selectedFilters.value.regions = [1, ...searchData.regions.value.map(r => r.id)]
          logger.info('✅ Selected regions:', selectedFilters.value.regions.length)
        }
        
        if (searchData.categories.value.length > 0) {
          selectedFilters.value.categories = [1, ...searchData.categories.value.map(c => c.id)]
          logger.info('✅ Selected categories:', selectedFilters.value.categories.length)
        }
        
        if (searchData.hotels.value.length > 0) {
          selectedFilters.value.hotels = [1, ...searchData.hotels.value.map(h => h.id)]
          logger.info('✅ Selected hotels:', selectedFilters.value.hotels.length)
          logger.info('✅ Selected hotels IDs:', selectedFilters.value.hotels)
        } else {
          logger.warn('⚠️ No hotels available for auto-selection')
        }
        
        if (searchData.meals.value.length > 0) {
          selectedFilters.value.meals = [1, ...searchData.meals.value.map(m => m.id)]
          logger.info('✅ Selected meals:', selectedFilters.value.meals.length)
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





  // Внутренняя функция поиска (без debounce)
  const performSearchInternal = () => {
    logger.info('🔍 performSearchInternal called')
    const currentRequestId = ++searchRequestId.value
    
    // Отмечаем, что поиск был выполнен
    hasSearched.value = true
    
    logger.info('🔍 Current selectedFilters before validation:', {
      regions: selectedFilters.value.regions.length,
      categories: selectedFilters.value.categories.length,
      hotels: selectedFilters.value.hotels.length,
      meals: selectedFilters.value.meals.length,
      hotelsContent: selectedFilters.value.hotels
    })
    
    logger.info('🔍 Starting search with form data:', {
      departureCity: searchForm.value.departureCity?.id,
      destination: searchForm.value.destination?.id,
      package: searchForm.value.package?.id,
      checkInDate: searchForm.value.checkInDate,
      checkOutDate: searchForm.value.checkOutDate,
      nights: searchForm.value.nights,
      adults: searchForm.value.adults,
      children: searchForm.value.children
    })
    
    // Добавляем выбранные отели в форму поиска (используем правильную логику)
    const selectedHotels = getSelectedHotelsForSearch({
      hotels: searchData.hotels,
      regions: searchData.regions
    })
    logger.info('🏨 getSelectedHotelsForSearch result:', selectedHotels.length, 'hotels')
    searchForm.value.selectedHotels = selectedHotels

    // Проверяем обязательные поля
    logger.info('🔍 Validating search form...')
    if (!validateSearchForm(searchForm.value, selectedFilters.value)) {
      logger.warn('❌ Search form validation failed')
      return
    }
    logger.info('✅ Search form validation passed')

    // Проверяем доступность выбранных дат
    logger.info('🔍 Validating dates...')
    if (!validateDates(searchForm.value)) {
      logger.warn('❌ Dates validation failed')
      return
    }
    logger.info('✅ Dates validation passed')
    
    logger.info('✅ Validation passed, proceeding with search...')

    // Форматируем даты в формат YYYY-MM-DD для API (как требует документация)
    const formatDate = (date: Date | null) => {
      if (!date) return ''
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    logger.info('📅 Formatted dates for API:', {
      checkIn: formatDate(searchForm.value.checkInDate),
      maxCheckIn: formatDate(searchForm.value.checkOutDate)
    })

    // Подготавливаем параметры для API
    const airportCityTo = searchForm.value.arrivalCity?.id ? [Number(searchForm.value.arrivalCity.id)] : []
    
    // Определяем диапазон дат заезда
    const dateFrom = searchForm.value.checkInDate ? formatDate(searchForm.value.checkInDate) : ''
    const dateTo = searchForm.value.checkOutDate ? formatDate(searchForm.value.checkOutDate) : dateFrom
    
    // Получаем ISO код страны
    const searchParams = {
      country: Number(searchForm.value.destination?.id), // Используем числовой ID как в оригинале
      package_template: Number(searchForm.value.package?.id),
      airport_city_from: Number(searchForm.value.departureCity?.id),
      airport_city_to: airportCityTo,
      date_from: dateFrom,
      date_to: dateTo, // Диапазон дат заезда для поиска
      nights_from: Number(searchForm.value.nights),
      nights_to: Number(searchForm.value.nights2 || searchForm.value.nights),
      adults: Number(searchForm.value.adults),
      children: searchForm.value.children && searchForm.value.children > 0 ? Number(searchForm.value.children) : undefined,
      children_age: searchForm.value.children && searchForm.value.children > 0 && searchForm.value.childrenAges.length > 0 ? searchForm.value.childrenAges : undefined,
      price_from: searchForm.value.priceFrom || undefined,
      price_to: searchForm.value.priceTo || undefined,
      selected_hotels: (() => {
        const hotels = getSelectedHotelsForSearch(searchData)
        logger.info(`🏨 Selected hotels for search: ${hotels.length} hotels`, hotels.slice(0, 5))
        return hotels
      })(),
      meals: selectedFilters.value.meals.length > 0 ? [...new Set(selectedFilters.value.meals)].map(mealId => {
        const meal = searchData.meals.value.find(m => m.id === mealId)
        const originalMealName = meal?.name || meal?.label || mealId.toString()
        return originalMealName
      }) : searchData.meals.value.map(meal => {
        const originalMealName = meal.name || meal.label || meal.id.toString()
        return originalMealName
      }).filter(Boolean).filter((meal, index, arr) => arr.indexOf(meal) === index)
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
      children_age: searchParams.children_age,
      price_from: searchParams.price_from,
      price_to: searchParams.price_to,
      meals: searchParams.meals,
      selected_hotels_count: searchParams.selected_hotels?.length || 0,
      selected_hotels_first_5: searchParams.selected_hotels?.slice(0, 5) || []
    })
    
    // Детальное логирование для отладки
    logger.info('🔍 Full search parameters for debugging:', searchParams)

    isLoading.value = true
    isSearchPending.value = false // Сбрасываем флаг ожидания
    
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
    
    
    // Сохраняем параметры поиска для пагинации
    lastSearchParams.value = searchParams
    
    // Сбрасываем загруженные результаты
    allLoadedResults.value = null
    
    // Вызываем API поиска
    searchData.performSearch(searchParamsWithPagination)
      .then((result) => {
        // Проверяем, что это актуальный запрос
        if (currentRequestId !== searchRequestId.value) {
          logger.info('🚫 Search request outdated, ignoring result')
          return
        }
        
        // Используем nextTick для безопасного обновления реактивности
        nextTick(() => {
          isLoading.value = false
        })
        
        logger.info('Result keys:', result ? Object.keys(result) : 'null')
        
        // Обработка результатов поиска
        if (result) {
          logger.info('Result keys:', Object.keys(result))
          
          // Проверяем разные возможные структуры ответа
          let resultsData: Record<string, ObsSearchResult> | null = null
          let totalCount = 0
          
          if (result.results && typeof result.results === 'object') {
            // Стандартная структура: { results: {...}, total_results: N }
            resultsData = result.results as Record<string, ObsSearchResult>
            totalCount = (result.total_results as number) || 0
          } else if (typeof result === 'object' && !result.results) {
            // Прямая структура: результаты в корне объекта
            // Исключаем служебные поля
            const excludeKeys = ['search_id', 'total_results', 'page', 'per_page', 'total_pages', 'prev_page', 'next_page', 'message']
            const resultKeys = Object.keys(result).filter(key => !excludeKeys.includes(key))
            
            if (resultKeys.length > 0) {
              resultsData = {} as Record<string, ObsSearchResult>
              resultKeys.forEach(key => {
                if (resultsData && result[key]) {
                  resultsData[key] = result[key] as ObsSearchResult
                }
              })
              totalCount = resultKeys.length
            }
          }
          
          if (resultsData && Object.keys(resultsData).length > 0) {
            nextTick(() => {
              searchResults.value = resultsData
              totalResults.value = totalCount
              allLoadedResults.value = resultsData
              loadedPages.value.add(1)
            })
            
            logger.info(`✅ Search completed successfully: total_results = ${totalCount}`)
            logger.info(`✅ Results stored: allLoadedResults keys = ${resultsData ? Object.keys(resultsData).length : 0}`)
            logger.info(`✅ First few result keys = ${resultsData ? Object.keys(resultsData).slice(0, 5) : []}`)
            logger.info(`✅ searchResults.value = ${resultsData ? 'SET' : 'NULL'}`)
            logger.info(`✅ totalResults.value = ${totalCount}`)
          } else {
            logger.warn('❌ No valid results found in search response:', result)
            logger.warn('❌ resultsData =', resultsData)
            logger.warn('❌ resultKeys length =', result ? Object.keys(result).length : 'no result')
            nextTick(() => {
              searchResults.value = null
              allLoadedResults.value = null
              totalResults.value = 0
            })
          }
        } else {
          logger.warn('Empty search response')
          nextTick(() => {
            searchResults.value = null
            allLoadedResults.value = null
            totalResults.value = 0
          })
        }
      })
      .catch((error) => {
        // Проверяем, что это актуальный запрос
        if (currentRequestId !== searchRequestId.value) {
          logger.info('🚫 Search request outdated, ignoring error')
          return
        }
        
        logger.error('Search failed:', error)
        nextTick(() => {
          isLoading.value = false
        })
        
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

  // Создаем debounced версию поиска
  const debouncedSearch = debounce(performSearchInternal, 800)

  // Основная функция поиска с debounce
  const handleSearch = () => {
    logger.info('🔍 handleSearch called')
    // Показываем индикатор ожидания
    isSearchPending.value = true
    
    // Вызываем debounced поиск
    debouncedSearch()
  }

  const handleReset = async () => {
    try {
      // Используем новые composables для сброса
      await resetSearchForm()
      resetFilters()
      resetPagination()
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
    const { availableDates } = calendarHints
    
    if (availableDates.value.length > 0) {
      // Выбираем первую доступную дату
      const firstAvailableDate = availableDates.value[0]
      searchForm.value.checkInDate = firstAvailableDate
      
      // Устанавливаем максимальную дату заселения равной минимальной дате заселения
      searchForm.value.checkOutDate = new Date(firstAvailableDate)
      
      logger.info(`Auto-selected available dates: ${firstAvailableDate.toLocaleDateString()} - ${searchForm.value.checkOutDate?.toLocaleDateString()}`)
    } else {
      // Если нет доступных дат, устанавливаем дату через неделю
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      searchForm.value.checkInDate = nextWeek
      
      // Устанавливаем максимальную дату заселения равной минимальной дате заселения
      searchForm.value.checkOutDate = new Date(nextWeek)
      
      logger.info(`No available dates found, using default: ${nextWeek.toLocaleDateString()} - ${searchForm.value.checkOutDate?.toLocaleDateString()}`)
    }
  }


  // Обработчик бронирования тура
  const handleBook = (result: GroupedSearchResult) => {
    // Добавляем данные о туристах из формы поиска к результату
    const resultWithTourists = {
      ...result,
      tourists: {
        adults: searchForm.value.adults || 1,
        children_ages: searchForm.value.children && searchForm.value.children > 0 ? searchForm.value.childrenAges : []
      }
    }
    
    // Сохраняем результат с данными о туристах в sessionStorage для бронирования
    sessionStorage.setItem('bookingSearchResult', JSON.stringify(resultWithTourists))
    
    // Сохраняем состояние поиска перед переходом на бронирование
    saveSearchState({
      searchForm: searchForm.value,
      selectedFilters: selectedFilters.value,
      searchResults: searchResults.value,
      allLoadedResults: allLoadedResults.value,
      totalResults: totalResults.value,
      currentPage: currentPage.value,
      lastSearchParams: lastSearchParams.value,
      loadedPages: Array.from(loadedPages.value)
    })
    
    // Переходим к бронированию
    router.push(`/booking/${result.unique_key}`)
  }


  // Метод инициализации данных
  const initializeData = async () => {
    try {
      logger.info('🔄 Initializing search data...')
      await searchData.initializeData()
      logger.info('✅ Search data initialized')
      logger.info(`🏙️ Departure cities loaded: ${searchData.departureCitiesOptions.value.length}`)
      
      // Пытаемся восстановить состояние поиска
      const restoredState = restoreSearchState()
      if (restoredState) {
        // Восстанавливаем состояние из сохраненных данных
        searchForm.value = restoredState.searchForm || searchForm.value
        selectedFilters.value = restoredState.selectedFilters || selectedFilters.value
        searchResults.value = restoredState.searchResults || null
        allLoadedResults.value = restoredState.allLoadedResults || null
        totalResults.value = restoredState.totalResults || 0
        currentPage.value = restoredState.currentPage || 1
        lastSearchParams.value = restoredState.lastSearchParams || null
        loadedPages.value = new Set(restoredState.loadedPages || [])
      }
    } catch (err) {
      logger.error('❌ Failed to initialize search data:', err)
    }
  }

  return {
    // State
    searchForm,
    selectedFilters,
    isLoading,
    isSearchPending,
    hasSearched,
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
    
    // Filter functions
    toggleAllHotels,
    toggleAllCategories,
    toggleAllRegions,
    toggleRegion,
    toggleCategory,
    toggleHotel,
    toggleMeal,
    toggleOption,
    toggleAllMeals,
    toggleAllOptions,
    
    // Filter computed properties
    allRegionsSelected,
    allCategoriesSelected,
    allHotelsSelected,
    allMealsSelected,
    allOptionsSelected,
  }
}
