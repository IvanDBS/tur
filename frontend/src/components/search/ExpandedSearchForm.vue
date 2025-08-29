<template>
  <div class="search-expanded">
    <!-- Row 1 -->
    <div class="form-row">
      <div class="field-group">
        <label>Откуда:</label>
        <Multiselect
          v-model="form.departureCity"
          :options="departureCities"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="CHISINAU"
          label="name"
          valueProp="id"
        />
      </div>

      <div class="field-group">
        <label>Куда:</label>
        <Multiselect
          v-model="form.destination"
          :options="countries"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="TÜRKIYE"
          label="name"
          valueProp="id"
        />
      </div>

      <div class="field-group">
        <label>Пакет:</label>
        <Multiselect
          v-model="form.package"
          :options="packages"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="ANTALYA FULL"
          label="name"
          valueProp="id"
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
          label="name"
          valueProp="id"
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
        <input type="number" v-model="form.priceFrom" placeholder="От">
      </div>

      <div class="field-group">
        <label>Цена € до:</label>
        <input type="number" v-model="form.priceTo" placeholder="До">
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
      <button type="button" @click="handleReset" class="reset-btn">Сбросить параметры</button>
      <button type="button" @click="handleSearch" class="search-btn">Поиск тура</button>
    </div>

    <!-- Collapse Button -->
    <div class="collapse-link-row">
      <button type="button" @click="$emit('collapse')" class="collapse-link">
        Скрыть расширенные параметры
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="collapse-icon">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import SearchFilters from './SearchFilters.vue'



interface SearchForm {
  departureCity: any
  destination: any
  package: any
  arrivalCity: any
  checkInDate: any
  checkOutDate: any
  nights: number
  nights2: number
  adults: number
  children: number
  childrenAges: number[]
  priceFrom: any
  priceTo: any
}

interface SelectedFilters {
  regions: number[]
  categories: number[]
  hotels: number[]
  meals: number[]
  options: number[]
}

interface Props {
  modelValue: SearchForm
  selectedFilters: SelectedFilters
  departureCities: any[]
  countries: any[]
  packages: any[]
  arrivalCities: any[]
  nightsOptions: any[]
  adultsOptions: any[]
  childrenOptions: any[]
  childrenAgeOptions: any[]
  regions: any[]
  categories: any[]
  hotels: any[]
  meals: any[]
  options: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: SearchForm]
  'update:selectedFilters': [value: SelectedFilters]
  search: [form: SearchForm, filters: SelectedFilters]
  reset: []
  collapse: []
}>()

const form = ref<SearchForm>({ ...props.modelValue })
const selectedFilters = ref<SelectedFilters>({ ...props.selectedFilters })

// Фильтрованные опции для второго селектора ночей
const filteredNights2Options = computed(() => {
  if (!form.value.nights) {
    return props.nightsOptions
  }
  
  return props.nightsOptions.filter(option => option.value >= form.value.nights)
})

// Следим за изменениями nights и обновляем nights2
watch(() => form.value.nights, (newValue) => {
  if (newValue && (!form.value.nights2 || form.value.nights2 < newValue)) {
    form.value.nights2 = newValue
  }
}, { immediate: true })

// Следим за изменениями даты заезда и устанавливаем дату выезда
watch(() => form.value.checkInDate, (newValue) => {
  if (newValue && (!form.value.checkOutDate || form.value.checkOutDate < newValue)) {
    form.value.checkOutDate = newValue
  }
}, { immediate: true })

// Следим за изменениями количества детей и обновляем массив возрастов
watch(() => form.value.children, (newValue) => {
  if (newValue === 0) {
    form.value.childrenAges = []
  } else {
    const currentAges = [...form.value.childrenAges]
    form.value.childrenAges = Array(newValue).fill(0).map((_, index) => {
      return index < currentAges.length ? currentAges[index] : 0
    })
  }
}, { immediate: true })

// Синхронизируем с родительским компонентом
watch(form, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

watch(selectedFilters, (newValue) => {
  emit('update:selectedFilters', newValue)
}, { deep: true })

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
</script>

<style scoped>
/* Expanded Form */
.search-expanded {
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
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
.field-group input[type="text"],
.field-group input[type="number"],
.field-group input:not(.multiselect):not([class*="multiselect"]) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 14px !important;
  color: #222222 !important;
  background: #FFFFFF !important;
  font-family: var(--font-family) !important;
  min-height: 38px !important;
  height: 38px !important;
  box-sizing: border-box !important;
}

/* Убираем стрелочки у number input */
.field-group input[type="number"]::-webkit-outer-spin-button,
.field-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

.field-group input[type="number"] {
  appearance: textfield !important; 
  -moz-appearance: textfield !important;
}

.field-group input[type="text"]:focus,
.field-group input[type="number"]:focus,
.field-group input:not(.multiselect):not([class*="multiselect"]):focus {
  outline: none !important;
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
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
  border-top: 1px solid #EBEBEB;
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
}

.search-btn:hover {
  background: var(--color-primary-muted);
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

/* DatePicker custom styles */
:deep(.dp__main) {
  width: 100% !important;
  font-family: var(--font-family) !important;
  position: relative;
  z-index: 50;
}

:deep(.dp__input_wrap) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  background: #FFFFFF !important;
  position: relative !important;
  min-height: 38px !important;
  height: 38px !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
}

:deep(.dp__input_wrap:focus-within) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 4px 10px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  background: transparent !important;
  color: #222222 !important;
  font-family: var(--font-family) !important;
  height: 20px !important;
  line-height: 20px !important;
  box-sizing: border-box !important;
  width: 100% !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  white-space: nowrap !important;
}

:deep(.dp__input::placeholder) {
  color: #B0B0B0 !important;
}

:deep(.dp__menu) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 2px !important;
  z-index: 500 !important;
  position: absolute !important;
  background: white !important;
  left: 0 !important;
  right: auto !important;
  transform: none !important;
  transition: none !important;
  animation: none !important;
  contain: layout !important;
}

:deep(.dp__outer_menu_wrap) {
  left: 0 !important;
  transform: none !important;
}

:deep(.dp__outer_menu_wrap:hover) {
  left: 0 !important;
  transform: none !important;
}

:deep(.dp__menu:hover) {
  left: 0 !important;
  right: auto !important;
  transform: none !important;
}

:deep(.dp__menu:focus-within) {
  left: 0 !important;
  right: auto !important;
  transform: none !important;
}

/* Убираем селекторы года и месяца */
:deep(.dp__month_year_row) {
  display: none !important;
}

:deep(.dp__month_year_select) {
  pointer-events: none !important;
  cursor: default !important;
  background: transparent !important;
  border: none !important;
  color: var(--color-text) !important;
}

/* Делаем стрелки видимыми */
:deep(.dp__inner_nav) {
  background: transparent !important;
  color: var(--color-secondary) !important;
  border: none !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: opacity 0.2s ease !important;
}

:deep(.dp__inner_nav:hover) {
  opacity: 0.7 !important;
}

:deep(.dp__inner_nav .dp__icon) {
  width: 16px !important;
  height: 16px !important;
  fill: var(--color-secondary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Русские дни недели */
:deep(.dp__calendar_header_item:nth-child(1))::after {
  content: 'Пн' !important;
}

:deep(.dp__calendar_header_item:nth-child(2))::after {
  content: 'Вт' !important;
}

:deep(.dp__calendar_header_item:nth-child(3))::after {
  content: 'Ср' !important;
}

:deep(.dp__calendar_header_item:nth-child(4))::after {
  content: 'Чт' !important;
}

:deep(.dp__calendar_header_item:nth-child(5))::after {
  content: 'Пт' !important;
}

:deep(.dp__calendar_header_item:nth-child(6))::after {
  content: 'Сб' !important;
}

:deep(.dp__calendar_header_item:nth-child(7))::after {
  content: 'Вс' !important;
}

/* Скрываем оригинальный текст */
:deep(.dp__calendar_header_item) {
  font-size: 0 !important;
}

:deep(.dp__calendar_header_item)::after {
  font-size: 12px !important;
  color: #666 !important;
  font-weight: 500 !important;
}

/* Скрываем ненужные элементы */
:deep(.dp__time_picker) {
  display: none !important;
}

/* Стили для выбранной даты */
:deep(.dp__active_date) {
  background: rgba(26, 60, 97, 0.1) !important; /* Светлая заливка */
  border: 2px solid var(--color-secondary) !important; /* Темно-синий контур */
  color: var(--color-secondary) !important; /* Темно-синий текст */
}

:deep(.dp__active_date:hover) {
  background: rgba(26, 60, 97, 0.2) !important; /* Чуть темнее при hover */
  border: 2px solid var(--color-secondary) !important;
  color: var(--color-secondary) !important;
}

:deep(.dp__action_buttons) {
  display: none !important;
}

:deep(.dp__select) {
  display: none !important;
}

:deep(.dp__today) {
  display: none !important;
}

:deep(.dp__clear_icon) {
  display: none !important;
}

:deep(.dp__input_icon) {
  display: none !important;
}

:deep(.dp__icon) {
  display: none !important;
}

:deep(.dp__calendar_icon) {
  display: none !important;
}

:deep(.dp__action_icon) {
  display: none !important;
}
</style>
