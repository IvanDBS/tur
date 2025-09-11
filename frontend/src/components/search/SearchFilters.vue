<template>
  <div class="filters-section">
    <div class="filters-row">
      <!-- Регион - 12.5% -->
      <div class="filters-column extra-small">
        <!-- Region -->
        <div class="filter-group" :class="{ 'disabled': props.disabled }">
          <label>{{ $t('search.region') }}:</label>
          <div class="filter-options vertical">
            <label class="checkbox-v9 all-checkbox" :class="{ disabled: props.disabled }">
              <input 
                type="checkbox" 
                :checked="allRegionsSelected"
                :disabled="props.disabled"
                @change="handleToggleAllRegions"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ $t('search.any') }}</span>
            </label>
            <label 
              class="checkbox-v9"
              v-for="region in regions"
              :key="region.id"
              :class="{ disabled: props.disabled }"
            >
              <input 
                type="checkbox" 
                :checked="selectedFilters.regions.includes(region.id) || selectedFilters.regions.includes(1)"
                :disabled="props.disabled"
                @change="handleToggleRegion(region.id)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ region.label || region.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Категория - 12.5% -->
      <div class="filters-column extra-small">
        <!-- Category -->
        <div class="filter-group" :class="{ 'disabled': props.disabled }">
          <label>{{ $t('search.category') }}:</label>
          <div class="filter-options vertical">
            <label class="checkbox-v9 all-checkbox" :class="{ disabled: props.disabled }">
              <input 
                type="checkbox" 
                :checked="allCategoriesSelected"
                :disabled="props.disabled"
                @change="handleToggleAllCategories"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ $t('search.any') }}</span>
            </label>
            <label 
              class="checkbox-v9"
              v-for="category in categories"
              :key="category.id"
              :class="{ disabled: props.disabled }"
            >
              <input 
                type="checkbox" 
                :checked="selectedFilters.categories.includes(category.id) || selectedFilters.categories.includes(1)"
                :disabled="props.disabled"
                @change="handleToggleCategory(category.id)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ category.label || category.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Отели - 50% -->
      <div class="filters-column medium">
        <!-- Hotels -->
        <div class="filter-group" :class="{ 'disabled': props.disabled }">
          <label>{{ $t('search.hotels') }}:</label>
          <div class="hotel-container">
            <!-- Закрепленная верхняя часть -->
            <div class="hotel-header">
              <label class="checkbox-v9 all-checkbox" :class="{ disabled: props.disabled }">
                <input 
                  type="checkbox" 
                  :checked="allHotelsSelected"
                  :disabled="props.disabled"
                  @change="handleToggleAllHotels"
                />
                <span class="checkmark"></span>
                <span class="label-text">{{ $t('search.any') }}</span>
              </label>
              <div class="hotel-item hotel-search-item">
                <div class="search-input-container">
                  <div class="search-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <input
                    type="text"
                    :placeholder="$t('search.searchHotel')"
                    class="hotel-search-input"
                    v-model="hotelSearchQuery"
                    :disabled="props.disabled"
                    @input="filterHotels"
                  />
                </div>
              </div>
            </div>
            <!-- Скроллируемый список отелей -->
            <div class="filter-options vertical hotel-list">
              <label 
                class="checkbox-v9"
                v-for="hotel in filteredHotels"
                :key="hotel.id"
                :class="{ disabled: props.disabled }"
              >
                <input 
                  type="checkbox" 
                  :checked="selectedFilters.hotels.includes(hotel.id) || selectedFilters.hotels.includes(1)"
                  :disabled="props.disabled"
                  @change="handleToggleHotel(hotel.id)"
                />
                <span class="checkmark"></span>
                <span class="label-text">{{ hotel.label || hotel.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Питание - 10% -->
      <div class="filters-column meals">
        <!-- Meals -->
        <div class="filter-group" :class="{ 'disabled': props.disabled }">
          <label>{{ $t('search.meals') }}:</label>
          <div class="filter-options vertical">
            <label class="checkbox-v9 all-checkbox" :class="{ disabled: props.disabled }">
              <input 
                type="checkbox" 
                :checked="allMealsSelected"
                :disabled="props.disabled"
                @change="handleToggleAllMeals"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ $t('search.any') }}</span>
            </label>
            <label 
              class="checkbox-v9"
              v-for="meal in meals"
              :key="meal.id"
              :class="{ disabled: props.disabled }"
            >
              <input 
                type="checkbox" 
                :checked="selectedFilters.meals.includes(meal.id) || selectedFilters.meals.includes(1)"
                :disabled="props.disabled"
                @change="handleToggleMeal(meal.id)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ meal.label || meal.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Опции - скрыт CSS -->
      <div class="filters-column options">
        <!-- Options -->
        <div class="filter-group" :class="{ 'disabled': props.disabled }">
          <label>Опции:</label>
          <div class="filter-options vertical">
            <label class="checkbox-v9 all-checkbox" :class="{ disabled: props.disabled }">
              <input 
                type="checkbox" 
                :checked="allOptionsSelected"
                :disabled="props.disabled"
                @change="handleToggleAllOptions"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ $t('search.any') }}</span>
            </label>
            <label 
              class="checkbox-v9"
              v-for="option in options"
              :key="option.id"
              :class="{ disabled: props.disabled }"
            >
              <input 
                type="checkbox" 
                :checked="selectedFilters.options.includes(option.id)"
                :disabled="props.disabled"
                @change="handleToggleOption(option.id)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ option.label || option.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, toRef } from 'vue'
  import { useSearchFilters } from '../../composables/useSearchFilters'
  import { arraysEqual } from '../../utils/objectUtils'
  import type {
    Region,
    Category,
    Hotel,
    Meal,
    Option,
  } from '../../types/search'

  interface Props {
    regions: Region[]
    categories: Category[]
    hotels: Hotel[]
    meals: Meal[]
    options: Option[]
    selectedRegions: number[]
    selectedCategories: number[]
    selectedHotels: number[]
    selectedMeals: number[]
    selectedOptions: number[]
    disabled?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:regions': [value: number[]]
    'update:categories': [value: number[]]
    'update:hotels': [value: number[]]
    'update:meals': [value: number[]]
    'update:options': [value: number[]]
  }>()

  // Создаем реактивные ссылки на props
  const selectedRegions = toRef(props, 'selectedRegions')
  const selectedCategories = toRef(props, 'selectedCategories')
  const selectedHotels = toRef(props, 'selectedHotels')
  const selectedMeals = toRef(props, 'selectedMeals')
  const selectedOptions = toRef(props, 'selectedOptions')

  // Создаем динамический маппинг регионов к городам на основе props.regions
  const regionCitiesMap = computed(() => {
    const map = new Map<number, number[]>()
    
    // Используем реальные данные из props.regions
    props.regions.forEach(region => {
      // Если у региона есть cities массив, используем его
      if (region.cities && Array.isArray(region.cities)) {
        const cityIds = region.cities.map(city => city.id)
        map.set(region.id, cityIds)
      }
    })
    
    const mapObj: Record<number, number[]> = {}
    map.forEach((value, key) => {
      mapObj[key] = value
    })
    return map
  })

  // Поиск отелей
  const hotelSearchQuery = ref('')

  // Фильтрация отелей по поисковому запросу, выбранным регионам и категориям
  const filteredHotels = computed(() => {
    
    let hotels = props.hotels

    // Фильтрация по выбранным регионам
    if (selectedFilters.value.regions.length > 0) {
      // Если выбран "Все" (id: 1), показываем все отели
      if (selectedFilters.value.regions.includes(1)) {
        // Показываем все отели
      } else {
        // Фильтруем отели по выбранным регионам
        
        // Получаем все города для выбранных регионов
        const selectedCities = new Set<number>()
        selectedFilters.value.regions.forEach(regionId => {
          const cities = regionCitiesMap.value.get(regionId)
          if (cities) {
            cities.forEach(cityId => selectedCities.add(cityId))
          }
        })
        
        
        hotels = hotels.filter(hotel => {
          // Проверяем, есть ли у отеля city_id и соответствует ли он выбранным городам
          if (hotel.city_id) {
            const matches = selectedCities.has(hotel.city_id)
            if (matches) {
            }
            return matches
          }
          // Если у отеля нет city_id, НЕ показываем его (только отели с city_id)
          return false
        })
      }
    }
    // Если не выбрано ни одного региона, показываем все отели (не фильтруем по регионам)

    // Фильтрация по выбранным категориям
    if (selectedFilters.value.categories.length > 0) {
      // Если выбран "Все" (id: 1), показываем все отели
      if (selectedFilters.value.categories.includes(1)) {
        // Показываем все отели
      } else {
        // Фильтруем отели по выбранным категориям
        
        hotels = hotels.filter(hotel => {
          // Проверяем, есть ли у отеля category_id и соответствует ли он выбранным категориям
          if (hotel.category_id) {
            const matches = selectedFilters.value.categories.includes(hotel.category_id)
            return matches
          }
          // Если у отеля нет category_id, НЕ показываем его (только отели с category_id)
          return false
        })
      }
    }
    // Если не выбрано ни одной категории, показываем все отели (не фильтруем по категориям)

    // Фильтрация по поисковому запросу
    if (hotelSearchQuery.value) {
      const query = hotelSearchQuery.value.toLowerCase()
      hotels = hotels.filter(hotel =>
        hotel.name?.toLowerCase().includes(query) || hotel.label?.toLowerCase().includes(query)
      )
    }

    return hotels
  })

  // Используем composable для управления фильтрами
  const {
    selectedFilters,
    allRegionsSelected,
    allCategoriesSelected,
    allHotelsSelected,
    allMealsSelected,
    allOptionsSelected,
    toggleRegion,
    toggleAllRegions,
    toggleCategory,
    toggleAllCategories,
    toggleHotel,
    toggleAllHotels,
    toggleMeal,
    toggleAllMeals,
    toggleOption,
    toggleAllOptions
  } = useSearchFilters()

  // Инициализируем selectedFilters с переданными значениями
  selectedFilters.value.regions = [...selectedRegions.value]
  selectedFilters.value.categories = [...selectedCategories.value]
  selectedFilters.value.hotels = [...selectedHotels.value]
  selectedFilters.value.meals = [...selectedMeals.value]
  selectedFilters.value.options = [...selectedOptions.value]

  // Логирование при получении данных
  onMounted(() => {
  })

  // Удалены неиспользуемые watchers для логирования - они не влияют на функциональность

  // Watcher для очистки выбранных отелей при изменении регионов или категорий
  watch(
    () => [selectedFilters.value.regions, selectedFilters.value.categories],
    (newValues, oldValues) => {
      const [newRegions, newCategories] = newValues
      const [oldRegions, oldCategories] = oldValues || [[], []]
      
      // Проверяем, изменились ли регионы или категории
      const regionsChanged = !arraysEqual(newRegions, oldRegions)
      const categoriesChanged = !arraysEqual(newCategories, oldCategories)
      
      if (regionsChanged || categoriesChanged) {
        // Очищаем выбранные отели при изменении регионов или категорий
        selectedFilters.value.hotels = []
        emit('update:hotels', [])
      }
    },
    { deep: true }
  )

  // Единый watcher для всех props (оптимизация: 1 вместо 5)
  watch(
    () => ({
      regions: props.selectedRegions,
      categories: props.selectedCategories,
      hotels: props.selectedHotels,
      meals: props.selectedMeals,
      options: props.selectedOptions
    }),
    (newProps) => {
      // Синхронизируем только изменившиеся фильтры
      if (!arraysEqual(selectedFilters.value.regions, newProps.regions)) {
        selectedFilters.value.regions = [...newProps.regions]
      }
      if (!arraysEqual(selectedFilters.value.categories, newProps.categories)) {
        selectedFilters.value.categories = [...newProps.categories]
      }
      if (!arraysEqual(selectedFilters.value.hotels, newProps.hotels)) {
        selectedFilters.value.hotels = [...newProps.hotels]
      }
      if (!arraysEqual(selectedFilters.value.meals, newProps.meals)) {
        selectedFilters.value.meals = [...newProps.meals]
      }
      if (!arraysEqual(selectedFilters.value.options, newProps.options)) {
        selectedFilters.value.options = [...newProps.options]
      }
    },
    { immediate: true, deep: true }
  )

  // Обертки для методов composable с emit
  const handleToggleAllHotels = () => {
    toggleAllHotels()
    emit('update:hotels', selectedFilters.value.hotels)
  }

  const handleToggleAllCategories = () => {
    toggleAllCategories()
    emit('update:categories', selectedFilters.value.categories)
  }

  const handleToggleAllRegions = () => {
    toggleAllRegions()
    emit('update:regions', selectedFilters.value.regions)
  }

  const handleToggleAllMeals = () => {
    toggleAllMeals(props.meals)
    emit('update:meals', selectedFilters.value.meals)
  }

  const handleToggleAllOptions = () => {
    toggleAllOptions(props.options)
    emit('update:options', selectedFilters.value.options)
  }


  const handleToggleHotel = (hotelId: number) => {
    toggleHotel(hotelId)
    emit('update:hotels', selectedFilters.value.hotels)
  }

  // Фильтрация отелей
  const filterHotels = () => {
    // Функция вызывается при вводе в поле поиска
    // Фильтрация происходит автоматически через computed свойство filteredHotels
  }

  // Обертки для остальных методов
  const handleToggleRegion = (regionId: number) => {
    toggleRegion(regionId)
    emit('update:regions', selectedFilters.value.regions)
  }

  const handleToggleCategory = (categoryId: number) => {
    toggleCategory(categoryId)
    emit('update:categories', selectedFilters.value.categories)
  }

  const handleToggleMeal = (mealId: number) => {
    toggleMeal(mealId)
    emit('update:meals', selectedFilters.value.meals)
  }

  const handleToggleOption = (optionId: number) => {
    toggleOption(optionId)
    emit('update:options', selectedFilters.value.options)
  }


  // Явный экспорт для TypeScript
  defineExpose({})
</script>

<style scoped>
  .filters-section {
    padding-top: 16px;
    margin-top: 16px;
    width: 100%;
  }

  .filters-row {
    display: grid;
    grid-template-columns: 0.8fr 0.8fr 2.5fr 0.8fr 0fr;
    gap: 12px;
    width: 100%;
  }

  .filters-column {
    display: flex;
    flex-direction: column;
  }

  /* Скрываем блок Опции */
  .filters-column.options {
    display: none;
  }

  /* Принудительно устанавливаем ширину для блока Отели */
  .filters-column.medium {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }

  /* Ширина колонок теперь задается в grid-template-columns */

  .filter-group {
    margin-bottom: 0;
  }

  .filter-group label {
    font-size: 12px;
    font-weight: 600;
    color: #222222;
    display: block;
    margin-bottom: 6px;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .filter-options.vertical {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex-wrap: nowrap;
    height: 210px; /* Увеличено на 1 строку */
    max-height: 210px;
    overflow-y: auto;
    border: 1px solid #dddddd;
    border-radius: 4px;
    padding: 0;
    overflow-x: hidden;
  }

  /* Специальные стили для hotel-list */
  .hotel-list.filter-options.vertical {
    height: auto;
    max-height: none;
    border: none;
    border-radius: 0;
  }

  .filter-options button {
    background: transparent;
    border: none;
    padding: 6px 10px;
    font-size: 14px;
    color: #222222;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-family);
    white-space: nowrap;
  }

  .hotel-search-item {
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .search-input-container {
    display: flex;
    align-items: center;
    width: 100%;
    padding-left: 10px;
  }

  .search-icon {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 5px 0 0;
    color: #888888;
    width: 10%;
    flex: 0 0 10%;
    max-width: 25px;
  }

  .hotel-search-input {
    flex: 1 1 90%;
    width: 90%;
    padding: 6px 0 6px 0;
    margin: 0;
    border: none;
    font-size: 14px;
    font-family: var(--font-family);
    background: transparent;
    height: 32px;
    outline: none;
    text-align: left;
    text-indent: 0;
  }

  .hotel-container {
    display: flex;
    flex-direction: column;
    height: 210px;
    border: 1px solid #dddddd;
    border-radius: 4px;
  }

  .hotel-header {
    flex-shrink: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .hotel-header .checkbox-v9 {
    padding: 6px 10px;
    border-bottom: 1px solid #f0f0f0;
    height: 32px;
    box-sizing: border-box;
  }

  .hotel-header .checkbox-v9 .checkmark {
    width: 14px !important;
    height: 14px !important;
    margin-right: 6px !important;
  }

  .hotel-header .checkbox-v9 input:checked + .checkmark::after {
    left: 4px !important;
    top: 2px !important;
    width: 3px !important;
    height: 6px !important;
  }

  .hotel-header .hotel-search-item {
    border-bottom: none;
  }

  .hotel-list {
    margin-top: 0;
    flex: 1;
    overflow-y: auto;
    border: none;
    border-radius: 0;
  }

  .all-button {
    border-bottom: 1px solid #dddddd;
  }

  .hotel-search-item {
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-bottom: 1px solid #f0f0f0;
    height: 28px;
    box-sizing: border-box;
  }

  .filter-options.vertical button {
    text-align: left;
    width: 100%;
    border-radius: 0;
    height: 32px;
    box-sizing: border-box;
  }

  .filter-options.vertical button:first-child {
    border-bottom: 1px solid #dddddd;
  }

  .filter-options button:hover {
    background: var(--color-secondary-muted);
    color: var(--color-secondary);
  }

  .filter-options button.active {
    background: var(--color-secondary-muted);
    color: var(--color-secondary);
  }

  /* Variant 9: Rounded No Fill Thin Border - Dark Blue (Exact Copy) */
  .filters-section .checkbox-v9 {
    display: flex !important;
    align-items: center !important;
    cursor: pointer !important;
    user-select: none !important;
  }

  .filters-section .checkbox-v9 input {
    display: none !important;
  }

  .filters-section .checkbox-v9 .checkmark {
    width: 18px !important;
    height: 18px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 4px !important;
    margin-right: 8px !important;
    position: relative !important;
    transition: all 0.2s ease !important;
    background: transparent !important;
  }

  .filters-section .checkbox-v9 input:checked + .checkmark {
    border-color: #1e3a8a !important;
    background: transparent !important;
  }

  .filters-section .checkbox-v9 input:checked + .checkmark::after {
    content: '' !important;
    position: absolute !important;
    left: 6px !important;
    top: 3px !important;
    width: 4px !important;
    height: 8px !important;
    border: solid #1e3a8a !important;
    border-width: 0 2px 2px 0 !important;
    transform: rotate(45deg) !important;
  }

  .filters-section .checkbox-v9 .label-text {
    font-size: 14px !important;
    color: #374151 !important;
    font-weight: normal !important;
  }

  /* Additional styles for checkbox-v9 in hotel context */
  .hotel-list .checkbox-v9 {
    padding: 6px 10px;
    border-bottom: 1px solid #f0f0f0;
    height: 32px;
    box-sizing: border-box;
  }

  .hotel-list .checkbox-v9:hover {
    background-color: var(--color-secondary-muted);
  }

  /* Disabled states */
  .filter-group.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .filter-group.disabled label {
    color: #999999 !important;
  }

  .checkbox-v9.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .checkbox-v9.disabled .label-text {
    color: #999999 !important;
  }

  .hotel-search-input:disabled {
    opacity: 0.5;
    background-color: #f5f5f5;
    color: #999999;
  }

  .hotel-list .checkbox-v9 .label-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: normal !important;
    text-align: left;
  }

  .all-checkbox {
    border-bottom: 1px solid #dddddd;
    padding: 6px 10px;
    height: 32px;
    box-sizing: border-box;
  }

  .all-checkbox .checkmark {
    width: 14px !important;
    height: 14px !important;
    margin-right: 6px !important;
  }

  .all-checkbox input:checked + .checkmark::after {
    left: 4px !important;
    top: 2px !important;
    width: 3px !important;
    height: 6px !important;
  }

  /* Стили для всех чекбоксов в категориях */
  .filter-options.vertical .checkbox-v9 {
    padding: 6px 10px;
    border-bottom: 1px solid #f0f0f0;
    height: 32px;
    box-sizing: border-box;
  }

  .filter-options.vertical .checkbox-v9:last-child {
    border-bottom: none;
  }

  /* Уменьшаем отступы для чекбоксов в списке категорий */
  .filter-options.vertical .checkbox-v9:not(.all-checkbox) {
    padding: 4px 10px;
    height: 28px;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .filters-row {
      flex-direction: column;
      gap: 16px;
    }


    .filter-group {
      margin-bottom: 12px;
    }
  }

</style>
