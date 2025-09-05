<template>
  <div class="search-form-fields">
    <!-- Row 1 - Основные поля -->
    <div class="form-row">
      <!-- Откуда -->
      <div class="field-group">
        <label class="field-label">
          <span v-if="activeSelector === 'departureCity'" class="field-arrow"></span>
          Откуда:
        </label>
        <Multiselect
          :model-value="searchForm.departureCity"
          @update:model-value="updateField('departureCity', $event)"
          :options="searchData.departureCitiesOptions.value"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите город"
          label="label"
          valueProp="value"
          :disabled="isLoading"
          @open="() => console.log('🏙️ Departure cities options:', searchData.departureCitiesOptions.value)"
        />
      </div>

      <!-- Куда -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.departureCity }">
        <label class="field-label">
          <span v-if="activeSelector === 'destination'" class="field-arrow"></span>
          Куда:
        </label>
        <Multiselect
          :model-value="searchForm.destination"
          @update:model-value="updateField('destination', $event)"
          :options="searchData.countriesOptions.value"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите страну"
          label="label"
          valueProp="value"
          :disabled="isLoading || !searchForm.departureCity"
        />
      </div>

      <!-- Пакет -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.destination }">
        <label class="field-label">
          <span v-if="activeSelector === 'package'" class="field-arrow"></span>
          Пакет:
        </label>
        <Multiselect
          :model-value="searchForm.package"
          @update:model-value="updateField('package', $event)"
          :options="searchData.packagesOptions.value"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите пакет"
          label="label"
          valueProp="value"
          :disabled="isLoading || !searchForm.destination"
        />
      </div>

      <!-- Город прилета -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.package }">
        <label class="field-label">
          <span v-if="activeSelector === 'arrivalCity'" class="field-arrow"></span>
          Город прилета:
        </label>
        <input 
          type="text" 
          :value="searchForm.arrivalCity ? searchForm.arrivalCity.name : 'Город будет выбран автоматически'"
          :disabled="true"
          style="min-height: 38px; height: 38px; border: 1px solid #dddddd; border-radius: 4px; padding: 4px 8px; font-size: 14px; color: #222222; background: #f5f5f5; font-family: inherit; box-sizing: border-box;"
          title="Автоматически устанавливается на основе выбранного пакета"
        />
      </div>
    </div>

    <!-- Row 2 - Даты и ночи -->
    <div class="form-row">
      <div class="field-group" :class="{ 'disabled-field': !searchForm.arrivalCity }">
        <label class="field-label">
          <span v-if="activeSelector === 'checkInDate'" class="field-arrow"></span>
          Период заезда от:
        </label>
        <VueDatePicker
          :model-value="searchForm.checkInDate"
          @update:model-value="updateField('checkInDate', $event)"
          :min-date="new Date()"
          format="dd.MM.yyyy"
          placeholder="Выберите дату"
          :month-change-on-scroll="false"
          :auto-apply="true"
          :enable-time-picker="false"
          :week-start="1"
          weekday-format="long"
          month-format="long"
          locale="ru"
          :title-format="{ month: 'long', year: 'numeric' }"
          month-name-format="long"
          :disabled="!searchForm.arrivalCity"
        />
      </div>

      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'checkOutDate'" class="field-arrow"></span>
          Период заезда до:
        </label>
        <VueDatePicker
          :model-value="searchForm.checkOutDate"
          @update:model-value="updateField('checkOutDate', $event)"
          :min-date="searchForm.checkInDate || new Date()"
          format="dd.MM.yyyy"
          placeholder="Выберите дату"
          :month-change-on-scroll="false"
          :auto-apply="true"
          :enable-time-picker="false"
          :week-start="1"
          weekday-format="long"
          month-format="long"
          locale="ru"
          :title-format="{ month: 'long', year: 'numeric' }"
          month-name-format="long"
          :disabled="!searchForm.checkInDate"
        />
      </div>

      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'nights'" class="field-arrow"></span>
          Ночей в отеле от:
        </label>
        <Multiselect
          :model-value="searchForm.nights"
          @update:model-value="updateField('nights', $event)"
          :options="searchData.nightsOptions.value"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="6"
          label="label"
          valueProp="value"
          :disabled="!searchForm.checkInDate"
          @change="$emit('update-nights2-min')"
        />
      </div>

      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'nights2'" class="field-arrow"></span>
          Ночей в отеле до:
        </label>
        <Multiselect
          :model-value="searchForm.nights2"
          @update:model-value="updateField('nights2', $event)"
          :options="filteredNights2Options"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="6"
          label="label"
          valueProp="value"
          :disabled="!searchForm.checkInDate"
        />
      </div>
    </div>

    <!-- Row 3 - Люди и цены -->
    <div class="form-row">
      <!-- Взрослые -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'adults'" class="field-arrow"></span>
          Взрослых:
        </label>
        <Multiselect
          :model-value="searchForm.adults"
          @update:model-value="updateField('adults', $event)"
          :options="searchData.adultsOptions.value"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="2"
          label="label"
          valueProp="value"
          :disabled="!searchForm.checkInDate"
        />
      </div>

      <!-- Дети -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'children'" class="field-arrow"></span>
          Детей:
        </label>
        <Multiselect
          :model-value="searchForm.children"
          @update:model-value="updateField('children', $event)"
          :options="searchData.childrenOptions.value"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          label="label"
          valueProp="value"
          :disabled="!searchForm.checkInDate"
        />
      </div>

      <!-- Возраст детей -->
      <div v-if="searchForm.children !== null && searchForm.children > 0" class="field-group">
        <label>Возраст детей:</label>
        <div class="children-ages">
          <Multiselect
            v-for="(age, index) in searchForm.childrenAges"
            :key="index"
            :model-value="searchForm.childrenAges[index]"
            @update:model-value="updateChildrenAge(index, $event)"
            :options="[
              { label: '0-2 года', value: 0 },
              { label: '3-12 лет', value: 3 },
              { label: '13-17 лет', value: 13 }
            ]"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="Возраст"
            label="label"
            valueProp="value"
          />
        </div>
      </div>

      <!-- Цена -->
      <div class="field-group" :class="{ 'disabled-field': searchForm.children === null }">
        <label class="field-label">
          <span v-if="activeSelector === 'priceFrom'" class="field-arrow"></span>
          Цена € от:
        </label>
        <input 
          type="number" 
          :value="searchForm.priceFrom"
          @input="handlePriceFromInput"
          placeholder="От" 
          :disabled="searchForm.children === null" 
        />
      </div>

      <div class="field-group" :class="{ 'disabled-field': searchForm.children === null }">
        <label class="field-label">
          <span v-if="activeSelector === 'priceTo'" class="field-arrow"></span>
          Цена € до:
        </label>
        <input 
          type="number" 
          :value="searchForm.priceTo"
          @input="handlePriceToInput"
          placeholder="До" 
          :disabled="searchForm.children === null" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import type { SearchFormFieldsProps, SearchFormFieldsEmits } from '../../types/searchForm'

// Props
const props = defineProps<SearchFormFieldsProps>()

// Emits
const emit = defineEmits<SearchFormFieldsEmits>()

// Methods
const updateField = (field: keyof typeof props.searchForm, value: any) => {
  const updatedForm = { ...props.searchForm, [field]: value }
  emit('update:searchForm', updatedForm)
}

const updateChildrenAge = (index: number, value: any) => {
  const updatedAges = [...props.searchForm.childrenAges]
  updatedAges[index] = value
  const updatedForm = { ...props.searchForm, childrenAges: updatedAges }
  emit('update:searchForm', updatedForm)
}

const handlePriceFromInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateField('priceFrom', Number(target.value))
}

const handlePriceToInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateField('priceTo', Number(target.value))
}
</script>

<style scoped>
.search-form-fields {
  width: 100%;
}

/* Базовые стили для строк форм */
.form-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

/* Базовые стили для групп полей */
.field-group {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Стили для лейблов полей */
.field-group label,
.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Стили для input полей */
.field-group input[type='number'] {
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

.field-group input[type='number']:hover,
.field-group input[type='number']:focus {
  border-color: #1d3557 !important;
  box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
  outline: none !important;
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

/* Стили для календаря */
:deep(.dp__active_date) {
  background: transparent !important;
  border: 2px solid var(--color-primary) !important;
  color: var(--color-primary) !important;
}

:deep(.dp__input) {
  min-height: 38px !important;
  height: 38px !important;
  box-sizing: border-box !important;
}

/* Стили для неактивных полей */
.disabled-field .field-label {
  color: #999999 !important;
}

.disabled-field input,
.disabled-field .multiselect,
.disabled-field .dp__input {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}

/* Стили для отключенных VueDatePicker */
.disabled-field :deep(.dp__input) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}

.disabled-field :deep(.dp__input_wrap) {
  opacity: 0.6;
}

/* Анимированная стрелка для селекторов */
@keyframes downarrow {
  0% { 
    transform: translateY(0); 
    opacity: 0.4; 
  }
  100% { 
    transform: translateY(0.4em); 
    opacity: 1; 
  }
}

/* Стрелка рядом с названием поля */
.field-arrow {
  display: inline-block;
  margin-right: 0.5rem;
  vertical-align: top;
  margin-top: -0.4em;
}

.field-arrow::before {
  content: '';
  display: inline-block;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #2ECC71; /* Зеленая стрелка */
  animation: downarrow 0.8s infinite alternate ease-in-out;
  margin-right: 0.25rem;
}

/* Стили для селекторов возраста детей */
.children-ages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .field-group {
    min-width: 80px;
  }
}
</style>
