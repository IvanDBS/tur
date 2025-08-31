<template>
  <div class="filters-section">
    <div class="filters-row">
      <!-- Регион - 12.5% -->
      <div class="filters-column extra-small">
        <!-- Region -->
        <div class="filter-group">
          <label>Регион:</label>
          <div class="filter-options vertical">
            <button
              v-for="region in regions"
              :key="region.id"
              :class="{
                active: selectedRegions.includes(region.id),
                'all-button': region.id === 1,
              }"
              @click="toggleRegion(region.id)"
            >
              {{ region.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Категория - 12.5% -->
      <div class="filters-column extra-small">
        <!-- Category -->
        <div class="filter-group">
          <label>Категория:</label>
          <div class="filter-options vertical">
            <button
              v-for="category in categories"
              :key="category.id"
              :class="{
                active: selectedCategories.includes(category.id),
                'all-button': category.id === 1,
              }"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Отели - 50% -->
      <div class="filters-column medium">
        <!-- Hotels -->
        <div class="filter-group">
          <label>Отели:</label>
          <div class="filter-options vertical hotel-list">
            <div
              class="hotel-item all-item"
              @click="toggleAllHotels"
              :class="{ active: allHotelsSelected }"
            >
              <span>Любой</span>
            </div>
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
                  placeholder="Поиск отеля"
                  class="hotel-search-input"
                  v-model="hotelSearchQuery"
                  @input="filterHotels"
                />
              </div>
            </div>
            <div
              class="hotel-item"
              v-for="hotel in filteredHotels"
              :key="hotel.id"
              @click="toggleHotel(hotel.id)"
              :class="{ active: selectedHotels.includes(hotel.id) }"
            >
              <span>{{ hotel.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Питание - 10% -->
      <div class="filters-column meals">
        <!-- Meals -->
        <div class="filter-group">
          <label>Питание:</label>
          <div class="filter-options vertical">
            <button
              v-for="meal in meals"
              :key="meal.id"
              :class="{
                active: selectedMeals.includes(meal.id),
                'all-button': meal.id === 1,
              }"
              @click="toggleMeal(meal.id)"
            >
              {{ meal.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Опции - 15% -->
      <div class="filters-column options">
        <!-- Options -->
        <div class="filter-group">
          <label>Опции:</label>
          <div class="filter-options vertical">
            <button
              v-for="option in options"
              :key="option.id"
              :class="{
                active: selectedOptions.includes(option.id),
                'all-button': option.id === 1,
              }"
              @click="toggleOption(option.id)"
            >
              {{ option.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
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
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:regions': [value: number[]]
    'update:categories': [value: number[]]
    'update:hotels': [value: number[]]
    'update:meals': [value: number[]]
    'update:options': [value: number[]]
  }>()

  // Поиск отелей
  const hotelSearchQuery = ref('')
  const allHotelsSelected = computed(() => {
    return props.selectedHotels.length === props.hotels.length
  })

  // Фильтрация отелей по поисковому запросу
  const filteredHotels = computed(() => {
    if (!hotelSearchQuery.value) {
      return props.hotels
    }

    const query = hotelSearchQuery.value.toLowerCase()
    return props.hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(query)
    )
  })

  // Выбор/отмена выбора всех отелей
  const toggleAllHotels = () => {
    if (allHotelsSelected.value) {
      emit('update:hotels', [])
    } else {
      emit(
        'update:hotels',
        props.hotels.map(hotel => hotel.id)
      )
    }
  }

  // Выбор/отмена выбора отдельного отеля
  const toggleHotel = (hotelId: number) => {
    const currentHotels = [...props.selectedHotels]
    const index = currentHotels.indexOf(hotelId)
    if (index > -1) {
      currentHotels.splice(index, 1)
    } else {
      currentHotels.push(hotelId)
    }
    emit('update:hotels', currentHotels)
  }

  // Фильтрация отелей
  const filterHotels = () => {
    // Функция вызывается при вводе в поле поиска
    // Фильтрация происходит автоматически через computed свойство filteredHotels
  }

  // Filter toggle methods
  const toggleRegion = (regionId: number) => {
    const currentRegions = [...props.selectedRegions]

    // Если нажата кнопка "Все" (id: 1)
    if (regionId === 1) {
      // Если "Все" уже выбрано, снимаем все выделения
      if (currentRegions.includes(1)) {
        emit('update:regions', [])
      } else {
        // Иначе выбираем все регионы
        emit(
          'update:regions',
          props.regions.map(region => region.id)
        )
      }
      return
    }

    // Обычная логика переключения для других кнопок
    const index = currentRegions.indexOf(regionId)
    if (index > -1) {
      currentRegions.splice(index, 1)
      // Если убрали какой-то регион, то убираем и "Все"
      if (currentRegions.includes(1)) {
        const allIndex = currentRegions.indexOf(1)
        currentRegions.splice(allIndex, 1)
      }
    } else {
      currentRegions.push(regionId)
      // Если выбраны все регионы кроме "Все", добавляем и "Все"
      const allRegionsSelected = props.regions
        .filter(region => region.id !== 1)
        .every(region => currentRegions.includes(region.id))

      if (allRegionsSelected && !currentRegions.includes(1)) {
        currentRegions.push(1)
      }
    }

    emit('update:regions', currentRegions)
  }

  const toggleCategory = (categoryId: number) => {
    const currentCategories = [...props.selectedCategories]

    // Если нажата кнопка "Все" (id: 1)
    if (categoryId === 1) {
      // Если "Все" уже выбрано, снимаем все выделения
      if (currentCategories.includes(1)) {
        emit('update:categories', [])
      } else {
        // Иначе выбираем все категории
        emit(
          'update:categories',
          props.categories.map(category => category.id)
        )
      }
      return
    }

    // Обычная логика переключения для других кнопок
    const index = currentCategories.indexOf(categoryId)
    if (index > -1) {
      currentCategories.splice(index, 1)
      // Если убрали какую-то категорию, то убираем и "Все"
      if (currentCategories.includes(1)) {
        const allIndex = currentCategories.indexOf(1)
        currentCategories.splice(allIndex, 1)
      }
    } else {
      currentCategories.push(categoryId)
      // Если выбраны все категории кроме "Все", добавляем и "Все"
      const allCategoriesSelected = props.categories
        .filter(category => category.id !== 1)
        .every(category => currentCategories.includes(category.id))

      if (allCategoriesSelected && !currentCategories.includes(1)) {
        currentCategories.push(1)
      }
    }

    emit('update:categories', currentCategories)
  }

  const toggleMeal = (mealId: number) => {
    const currentMeals = [...props.selectedMeals]

    // Если нажата кнопка "Все" (id: 1)
    if (mealId === 1) {
      // Если "Все" уже выбрано, снимаем все выделения
      if (currentMeals.includes(1)) {
        emit('update:meals', [])
      } else {
        // Иначе выбираем все типы питания
        emit(
          'update:meals',
          props.meals.map(meal => meal.id)
        )
      }
      return
    }

    // Обычная логика переключения для других кнопок
    const index = currentMeals.indexOf(mealId)
    if (index > -1) {
      currentMeals.splice(index, 1)
      // Если убрали какой-то тип питания, то убираем и "Все"
      if (currentMeals.includes(1)) {
        const allIndex = currentMeals.indexOf(1)
        currentMeals.splice(allIndex, 1)
      }
    } else {
      currentMeals.push(mealId)
      // Если выбраны все типы питания кроме "Все", добавляем и "Все"
      const allMealsSelected = props.meals
        .filter(meal => meal.id !== 1)
        .every(meal => currentMeals.includes(meal.id))

      if (allMealsSelected && !currentMeals.includes(1)) {
        currentMeals.push(1)
      }
    }

    emit('update:meals', currentMeals)
  }

  const toggleOption = (optionId: number) => {
    const currentOptions = [...props.selectedOptions]

    // Если нажата кнопка "Все" (id: 1)
    if (optionId === 1) {
      // Если "Все" уже выбрано, снимаем все выделения
      if (currentOptions.includes(1)) {
        emit('update:options', [])
      } else {
        // Иначе выбираем все опции
        emit(
          'update:options',
          props.options.map(option => option.id)
        )
      }
      return
    }

    // Обычная логика переключения для других кнопок
    const index = currentOptions.indexOf(optionId)
    if (index > -1) {
      currentOptions.splice(index, 1)
      // Если убрали какую-то опцию, то убираем и "Все"
      if (currentOptions.includes(1)) {
        const allIndex = currentOptions.indexOf(1)
        currentOptions.splice(allIndex, 1)
      }
    } else {
      currentOptions.push(optionId)
      // Если выбраны все опции кроме "Все", добавляем и "Все"
      const allOptionsSelected = props.options
        .filter(option => option.id !== 1)
        .every(option => currentOptions.includes(option.id))

      if (allOptionsSelected && !currentOptions.includes(1)) {
        currentOptions.push(1)
      }
    }

    emit('update:options', currentOptions)
  }
</script>

<style scoped>
  .filters-section {
    border-top: 1px solid #ebebeb;
    padding-top: 16px;
    margin-top: 16px;
    max-width: 100%;
  }

  .filters-row {
    display: flex;
    gap: 12px;
    width: 100%;
    flex-wrap: nowrap;
  }

  .filters-column {
    display: flex;
    flex-direction: column;
  }

  .filters-column.extra-small {
    flex: 1;
    width: 12.5%; /* Ширина для блоков "Регион" и "Категория" */
  }

  .filters-column.medium {
    flex: 4;
    width: 50%; /* Ширина для блока "Отели" */
  }

  .filters-column.meals {
    flex: 0.8;
    width: 10%; /* Ширина для блока "Питание" */
  }

  .filters-column.options {
    flex: 1.2;
    width: 15%; /* Ширина для блока "Опции" */
  }

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

  .hotel-list {
    margin-top: 0;
  }

  .hotel-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    height: 32px;
    box-sizing: border-box;
  }

  .all-button {
    border-bottom: 1px solid #dddddd;
  }

  .all-item {
    border-bottom: 1px solid #dddddd;
  }

  .hotel-item:hover {
    background-color: var(--color-secondary-muted);
  }

  .hotel-item.active {
    background-color: var(--color-secondary-muted);
    color: var(--color-secondary);
  }

  .hotel-item span {
    flex: 1;
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #222222;
    text-align: left;
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

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .filters-row {
      flex-direction: column;
      gap: 16px;
    }

    .filters-column.extra-small,
    .filters-column.medium {
      width: 100%;
    }

    .filter-group {
      margin-bottom: 12px;
    }
  }
</style>
