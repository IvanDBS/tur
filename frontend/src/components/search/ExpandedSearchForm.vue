<template>
  <div class="search-expanded">
    <!-- Row 1 -->
    <div class="form-row">
      <!-- Откуда -->
      <div class="field-group">
        <label>Откуда:</label>
        <Multiselect
          v-model="form.departureCity"
          :options="departureCities"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="CHISINAU"
          label="label"
          valueProp="value"
          :disabled="!form.departureCity"
        />
      </div>

      <!-- Куда -->
      <div class="field-group">
        <label>Куда:</label>
        <Multiselect
          v-model="form.destination"
          :options="countries"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите страну"
          label="label"
          valueProp="value"
          :disabled="!form.destination"
        />
      </div>

      <!-- Пакет -->
      <div class="field-group">
        <label>Пакет:</label>
        <Multiselect
          v-model="form.package"
          :options="packages"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите пакет"
          label="label"
          valueProp="value"
          :disabled="!form.destination"
        />
      </div>

      <div class="field-group">
        <label>Город прилета:</label>
        <Multiselect
          v-model="form.arrivalCity"
          :options="arrivalCities"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="ANTALYA"
          label="label"
          valueProp="value"
        />
      </div>
    </div>

    <!-- Row 2 -->
    <div class="form-row">
      <div class="field-group">
        <label>Период заезда от:</label>
        <VueDatePicker
          v-model="form.checkInDate"
          :min-date="new Date()"
          format="dd.MM.yyyy"
          placeholder="29.08.2025"
          :month-change-on-scroll="false"
          :auto-apply="true"
          :enable-time-picker="false"
          :week-start="1"
          weekday-format="long"
          month-format="long"
          locale="ru"
          :title-format="{ month: 'long', year: 'numeric' }"
          month-name-format="long"
        />
      </div>

      <div class="field-group">
        <label>Период заезда до:</label>
        <VueDatePicker
          v-model="form.checkOutDate"
          :min-date="form.checkInDate || new Date()"
          format="dd.MM.yyyy"
          placeholder="29.08.2025"
          :month-change-on-scroll="false"
          :auto-apply="true"
          :enable-time-picker="false"
          :week-start="1"
          weekday-format="long"
          month-format="long"
          locale="ru"
          :title-format="{ month: 'long', year: 'numeric' }"
          month-name-format="long"
        />
      </div>

      <div class="field-group">
        <label>Ночей в отеле от:</label>
        <Multiselect
          v-model="form.nights"
          :options="nightsOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="6"
          label="label"
          valueProp="value"
          @change="updateNights2Min"
        />
      </div>

      <div class="field-group">
        <label>Ночей в отеле до:</label>
        <Multiselect
          v-model="form.nights2"
          :options="filteredNights2Options"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="6"
          label="label"
          valueProp="value"
        />
      </div>
    </div>

    <!-- Row 3 -->
    <div class="form-row">
      <div class="field-group">
        <label>Взрослых:</label>
        <Multiselect
          v-model="form.adults"
          :options="adultsOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="2"
          label="label"
          valueProp="value"
        />
      </div>

      <div class="field-group">
        <label>Детей (0-17.99):</label>
        <Multiselect
          v-model="form.children"
          :options="childrenOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="0"
          label="label"
          valueProp="value"
        />
      </div>

      <!-- Селекторы возраста детей -->
      <template v-if="form.children > 0">
        <div
          v-for="(age, index) in form.childrenAges"
          :key="index"
          class="field-group children-age"
        >
          <label>Возраст ребенка {{ index + 1 }}:</label>
          <Multiselect
            v-model="form.childrenAges[index]"
            :options="childrenAgeOptions"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="0"
            label="label"
            valueProp="value"
          />
        </div>
      </template>

      <div class="field-group">
        <label>Цена € от:</label>
        <input type="number" v-model="form.priceFrom" placeholder="От" />
      </div>

      <div class="field-group">
        <label>Цена € до:</label>
        <input type="number" v-model="form.priceTo" placeholder="До" />
      </div>
    </div>

    <!-- Filters Section -->
    <SearchFilters
      :regions="regions"
      :categories="categories"
      :hotels="hotels"
      :meals="meals"
      :options="options"
      :selected-regions="selectedFilters.regions"
      :selected-categories="selectedFilters.categories"
      :selected-hotels="selectedFilters.hotels"
      :selected-meals="selectedFilters.meals"
      :selected-options="selectedFilters.options"
      @update:regions="selectedFilters.regions = $event"
      @update:categories="selectedFilters.categories = $event"
      @update:hotels="selectedFilters.hotels = $event"
      @update:meals="selectedFilters.meals = $event"
      @update:options="selectedFilters.options = $event"
    />

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" @click="handleReset" class="reset-btn">
        Сбросить параметры
      </button>
      <button type="button" @click="handleSearch" class="search-btn">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Поиск тура
      </button>
    </div>

    <!-- Collapse Button -->
    <div class="collapse-link-row">
      <button type="button" @click="$emit('collapse')" class="collapse-link">
        Скрыть расширенные параметры
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="collapse-icon"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineAsyncComponent } from 'vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import Multiselect from '@vueform/multiselect'
  import { useObsApi } from '../../composables/useObsApi'

  // Динамический импорт для обхода проблемы с TypeScript
  const SearchFilters = defineAsyncComponent(() => import('./SearchFilters.vue'))
  import type {
    ExpandedSearchForm,
    SelectedFilters,
    ArrivalCity,
    SearchOption,
    Region,
    Category,
    Hotel,
    Meal,
    Option,
  } from '../../types/search'

  // Тип для форматированных опций
  interface FormattedOption {
    value: number
    label: string
  }

  interface Props {
    modelValue: ExpandedSearchForm
    selectedFilters: SelectedFilters
    departureCities: FormattedOption[]
    countries: FormattedOption[]
    packages: FormattedOption[]
    arrivalCities: ArrivalCity[]
    nightsOptions: SearchOption[]
    adultsOptions: SearchOption[]
    childrenOptions: SearchOption[]
    childrenAgeOptions: SearchOption[]
    regions: Region[]
    categories: Category[]
    hotels: Hotel[]
    meals: Meal[]
    options: Option[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: ExpandedSearchForm]
    'update:selectedFilters': [value: SelectedFilters]
    search: [form: ExpandedSearchForm, filters: SelectedFilters]
    reset: []
    collapse: []
  }>()

  // Получаем методы API
  const { 
    fetchPackageTemplates, 
    fetchHotelCategories, 
    fetchLocations, 
    fetchHotels, 
    fetchMeals,
    fetchCalendarHints
  } = useObsApi()

  const form = ref<ExpandedSearchForm>({ ...props.modelValue })
  const selectedFilters = ref<SelectedFilters>({ ...props.selectedFilters })

  // Фильтрованные опции для второго селектора ночей
  const filteredNights2Options = computed(() => {
    if (!form.value.nights) {
      return props.nightsOptions
    }

    return props.nightsOptions.filter(
      option => option.value >= form.value.nights
    )
  })

  // Следим за изменениями nights и обновляем nights2
  watch(
    () => form.value.nights,
    newValue => {
      if (newValue && (!form.value.nights2 || form.value.nights2 < newValue)) {
        form.value.nights2 = newValue
      }
    },
    { immediate: true }
  )

  // Следим за изменениями даты заезда и устанавливаем дату выезда
  watch(
    () => form.value.checkInDate,
    newValue => {
      if (
        newValue &&
        (!form.value.checkOutDate || form.value.checkOutDate < newValue)
      ) {
        form.value.checkOutDate = newValue
      }
    },
    { immediate: true }
  )

  // Следим за изменениями количества детей и обновляем массив возрастов
  watch(
    () => form.value.children,
    newValue => {
      if (newValue === 0) {
        form.value.childrenAges = []
      } else {
        const currentAges = [...form.value.childrenAges]
        form.value.childrenAges = Array(newValue)
          .fill(0)
          .map((_, index) => {
            return index < currentAges.length ? currentAges[index] : 0
          })
      }
    },
    { immediate: true }
  )

  // Следим за изменениями страны и загружаем package templates
  watch(
    () => form.value.destination,
    async (newCountry) => {
      if (newCountry && newCountry.id && form.value.departureCity?.id) {
        try {
          const countryId = parseInt(newCountry.id.toString(), 10)
          const cityId = parseInt(form.value.departureCity.id.toString(), 10)
          
          if (isNaN(countryId) || isNaN(cityId)) {
            console.error('Invalid country or city ID')
            return
          }
          
          // Загружаем package templates для выбранной страны
          await fetchPackageTemplates(countryId, cityId)
          
          // Очищаем предыдущий выбор package
          form.value.package = null
          
          console.log(`Loaded package templates for country: ${newCountry.name} (ID: ${countryId})`)
        } catch (err) {
          console.error('Failed to load package templates:', err)
        }
      }
    }
  )

  // Следим за изменениями package template и загружаем связанные данные
  watch(
    () => form.value.package,
    async (newPackage) => {
      if (newPackage && newPackage.id) {
        try {
          const packageId = parseInt(newPackage.id.toString(), 10)
          
          if (isNaN(packageId)) {
            console.error('Invalid package ID')
            return
          }
          
          // Загружаем все связанные данные параллельно
          await Promise.all([
            fetchHotelCategories(packageId),
            fetchLocations(packageId),
            fetchHotels(packageId),
            fetchMeals(packageId)
          ])
          
          console.log(`Loaded related data for package: ${newPackage.name} (ID: ${packageId})`)
        } catch (err) {
          console.error('Failed to load package related data:', err)
        }
      }
    }
  )

  // Следим за изменениями дат и загружаем calendar hints
  watch(
    [() => form.value.checkInDate, () => form.value.checkOutDate],
    async ([checkInDate, checkOutDate]) => {
      if (checkInDate && form.value.destination && form.value.departureCity) {
        try {
          const cityId = parseInt(form.value.departureCity.id.toString(), 10)
          const countryId = parseInt(form.value.destination.id.toString(), 10)
          
          // Загружаем calendar hints для умного выбора дат
          const calendarHints = await fetchCalendarHints({
            date_from: checkInDate || undefined,
            date_to: checkOutDate || undefined,
            city_from: cityId,
            city_to: countryId.toString() // Пока используем country ID как city_to
          })
          
          console.log('Calendar hints loaded:', calendarHints)
        } catch (err) {
          console.error('Failed to load calendar hints:', err)
        }
      }
    }
  )

  // Синхронизируем с родительским компонентом
  watch(
    form,
    newValue => {
      emit('update:modelValue', newValue)
    },
    { deep: true }
  )

  watch(
    selectedFilters,
    newValue => {
      emit('update:selectedFilters', newValue)
    },
    { deep: true }
  )

  // Метод для обновления минимального значения для nights2
  const updateNights2Min = () => {
    if (!form.value.nights2 || form.value.nights2 < form.value.nights) {
      form.value.nights2 = form.value.nights
    }
  }

  const handleSearch = () => {
    emit('search', { ...form.value }, { ...selectedFilters.value })
  }

  const handleReset = () => {
    emit('reset')
  }

  // Явный экспорт для TypeScript
  defineExpose({})
</script>

<style scoped>
  /* Стили для календаря - коралловая рамка */
  :deep(.dp__active_date) {
    background: transparent !important;
    border: 2px solid var(--color-primary) !important;
    color: var(--color-primary) !important;
  }

  :deep(.dp__active_date:hover) {
    background: transparent !important;
    border: 2px solid var(--color-primary) !important;
    color: var(--color-primary) !important;
  }

  /* Стили для самого input поля календаря */
  :deep(.dp__input:hover) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  :deep(.dp__input:focus) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  :deep(.dp__input:hover:not(.dp__input_focus)) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  :deep(.dp__input_focus) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  /* Выравнивание высоты полей дат с другими селекторами */
  :deep(.dp__input) {
    min-height: 38px !important;
    height: 38px !important;
    box-sizing: border-box !important;
  }

  /* Expanded Form */
  .search-expanded {
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
    position: relative;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
    align-items: end;
  }

  /* Дополнительное выравнивание для полей дат */
  .field-group:has(.dp__input) {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .field-group {
    flex: 1;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .field-group label {
    font-size: 11px;
    font-weight: 600;
    color: #222222;
  }

  /* Стили ТОЛЬКО для обычных input полей (НЕ multiselect) */
  .field-group input[type='text'],
  .field-group input[type='number'],
  .field-group input:not(.multiselect):not([class*='multiselect']) {
    border: 1px solid #dddddd !important;
    border-radius: 4px !important;
    padding: 4px 8px !important;
    font-size: 14px !important;
    color: #222222 !important;
    background: #ffffff !important;
    font-family: var(--font-family) !important;
    min-height: 38px !important;
    height: 38px !important;
    box-sizing: border-box !important;
  }

  /* Убираем стрелочки у number input */
  .field-group input[type='number']::-webkit-outer-spin-button,
  .field-group input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  .field-group input[type='number'] {
    appearance: textfield !important;
    -moz-appearance: textfield !important;
  }

  .field-group input[type='text']:hover,
  .field-group input[type='number']:hover,
  .field-group input:not(.multiselect):not([class*='multiselect']):hover {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
  }

  .field-group input[type='text']:focus,
  .field-group input[type='number']:focus,
  .field-group input:not(.multiselect):not([class*='multiselect']):focus {
    outline: none !important;
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
  }

  /* Стили для селекторов возраста детей */
  .children-age {
    grid-column: span 1;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebebeb;
  }

  .reset-btn {
    background: white;
    border: 1px solid var(--color-dark-gray);
    color: var(--color-dark-gray);
    border-radius: 6px;
    padding: 10px 20px;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 180px;
  }

  .reset-btn:hover {
    background: var(--color-dark-gray-muted);
  }

  .search-btn {
    background: white;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    border-radius: 6px;
    padding: 10px 24px;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: 600;
    transition: all 0.2s ease;
    min-width: 140px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .search-btn:hover {
    background: var(--color-primary);
    color: white;
  }

  .search-btn svg {
    transition: transform 0.2s;
  }

  .search-btn:hover svg {
    transform: scale(1.1);
  }

  .collapse-link-row {
    text-align: center;
    margin-top: 24px;
  }

  .collapse-link {
    background: none;
    border: none;
    color: var(--color-secondary);
    font-size: 12px;
    cursor: pointer;
    text-decoration: none;
    font-family: var(--font-family);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0 auto;
  }

  .collapse-link:hover {
    color: var(--color-secondary-hover);
  }

  .collapse-icon {
    margin-top: -2px;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
