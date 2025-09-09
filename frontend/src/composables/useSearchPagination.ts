import { ref, computed } from 'vue'
import { logger } from '../utils/logger'
import type { GroupedSearchResult, ObsSearchResult } from '../types/search'

export const useSearchPagination = () => {
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
      
      const groupedResults = groupResultsByHotel(allResults)
      
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
      const groupedResults = groupResultsByHotel(allResults)
      logger.debug(`paginatedResults: groupedResults.length = ${groupedResults.length}`)
      
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

  // Функция для группировки результатов по отелям с поддержкой вариантов комнат
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
      
      const hotelKey = `${result.accommodation.hotel.id}`
      
      if (groupedMap.has(hotelKey)) {
        const existing = groupedMap.get(hotelKey)!
        
        // Ищем существующий вариант комнаты
        const roomKey = `${result.accommodation.room.id}-${result.accommodation.meal.id}-${result.accommodation.placement.id}`
        const existingRoomOption = existing.roomOptions.find(option => 
          `${option.room.id}-${option.meal.id}-${option.placement.id}` === roomKey
        )
        
        if (existingRoomOption) {
          // Добавляем вариант перелета к существующему варианту комнаты
          const flightOptionWithPrice = {
            ...result.tickets,
            price: result.price
          }
          existingRoomOption.flightOptions.push(flightOptionWithPrice)
        } else {
          // Создаем новый вариант комнаты
          const newRoomOption = {
            id: roomKey,
            room: result.accommodation.room,
            meal: result.accommodation.meal,
            placement: result.accommodation.placement,
            price: result.price,
            flightOptions: [{
              ...result.tickets,
              price: result.price
            }]
          }
          existing.roomOptions.push(newRoomOption)
        }
        
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
        const roomKey = `${result.accommodation.room.id}-${result.accommodation.meal.id}-${result.accommodation.placement.id}`
        const grouped: GroupedSearchResult = {
          hotel: result.accommodation.hotel,
          dates: result.dates,
          nights: result.nights,
          transfers: result.transfers,
          never_land_entrance: result.never_land_entrance,
          gala_dinner: result.gala_dinner,
          aquapark_services: result.aquapark_services,
          tourists: result.tourists,
          roomOptions: [{
            id: roomKey,
            room: result.accommodation.room,
            meal: result.accommodation.meal,
            placement: result.accommodation.placement,
            price: result.price,
            flightOptions: [{
              ...result.tickets,
              price: result.price
            }]
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

  // Метод для загрузки дополнительных данных (упрощенная версия)
  const loadMoreData = async () => {
    // Поскольку мы загружаем все результаты сразу (per_page > 500), 
    // этот метод больше не нужен, но оставляем для совместимости
    logger.debug('loadMoreData called - no additional loading needed (all results loaded at once)')
    return Promise.resolve()
  }

  // Сброс пагинации
  const resetPagination = () => {
    currentPage.value = 1
    lastSearchParams.value = null
    allLoadedResults.value = null
    loadedPages.value.clear()
    isLoadingMore.value = false
  }

  return {
    // State
    currentPage,
    itemsPerPage,
    serverPageSize,
    lastSearchParams,
    allLoadedResults,
    loadedPages,
    isLoadingMore,
    
    // Computed
    totalPages,
    paginatedResults,
    needsMoreData,
    
    // Methods
    handlePageChange,
    loadMoreData,
    groupResultsByHotel,
    resetPagination
  }
}
