<template>
  <div class="form-row">
    <div class="field-group" :class="{ 'disabled-field': !isCheckInDateEnabled }">
      <label>
        <span v-if="showDateIndicator" class="field-arrow"></span>
        Период поиска от:
      </label>
      <VueDatePicker
        v-model="localForm.checkInDate"
        :min-date="new Date()"
        format="dd.MM.yyyy"
        placeholder="Начало периода"
        :month-change-on-scroll="false"
        :auto-apply="true"
        :enable-time-picker="false"
        :week-start="1"
        weekday-format="long"
        month-format="long"
        locale="ru"
        :title-format="{ month: 'long', year: 'numeric' }"
        month-name-format="long"
        :disabled="!isCheckInDateEnabled"
      />
    </div>

    <div class="field-group" :class="{ 'disabled-field': !isCheckOutDateEnabled }">
      <label>Период поиска до:</label>
      <VueDatePicker
        v-model="localForm.checkOutDate"
        :min-date="localForm.checkInDate || new Date()"
        format="dd.MM.yyyy"
        placeholder="Конец периода"
        :month-change-on-scroll="false"
        :auto-apply="true"
        :enable-time-picker="false"
        :week-start="1"
        weekday-format="long"
        month-format="long"
        locale="ru"
        :title-format="{ month: 'long', year: 'numeric' }"
        month-name-format="long"
        :disabled="!isCheckOutDateEnabled"
      />
    </div>

    <div class="field-group" :class="{ 'disabled-field': !areNightsFieldsEnabled }">
      <label>Ночей от:</label>
      <Multiselect
        v-model="localForm.nights"
        :options="nightsOptions"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        placeholder="6"
        label="label"
        valueProp="value"
        :disabled="!areNightsFieldsEnabled"
        @change="updateNights2Min"
      />
    </div>

    <div class="field-group" :class="{ 'disabled-field': !areNightsFieldsEnabled }">
      <label>Ночей до:</label>
      <Multiselect
        v-model="localForm.nights2"
        :options="filteredNights2Options"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        placeholder="6"
        label="label"
        valueProp="value"
        :disabled="!areNightsFieldsEnabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import '../../styles/spinner.css'
import type { SearchForm, SearchOption } from '../../types/search'

interface Props {
  modelValue: SearchForm
  isCheckInDateEnabled: boolean
  isCheckOutDateEnabled: boolean
  areNightsFieldsEnabled: boolean
  showDateIndicator: boolean
  nightsOptions: SearchOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchForm]
}>()

// Локальная копия формы
const localForm = ref<SearchForm>({ ...props.modelValue })

// Фильтрованные опции для второго селектора ночей
const filteredNights2Options = computed(() => {
  if (!localForm.value.nights) {
    return props.nightsOptions
  }

  return props.nightsOptions.filter(
    (option: SearchOption) => option.value >= localForm.value.nights
  )
})

// Метод для обновления минимального значения для nights2
const updateNights2Min = () => {
  if (!localForm.value.nights2 || localForm.value.nights2 < localForm.value.nights) {
    localForm.value.nights2 = localForm.value.nights
  }
}

// Следим за изменениями локальной формы и эмитим обновления
watch(localForm, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Следим за изменениями props и обновляем локальную форму
watch(() => props.modelValue, (newValue) => {
  localForm.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
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

/* Стили для неактивных полей */
.field-group.disabled-field label {
  color: #999999 !important;
}

.field-group.disabled-field :deep(.multiselect) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.field-group.disabled-field :deep(.multiselect .multiselect__placeholder) {
  color: #999999;
}

.field-group.disabled-field :deep(.dp__input) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #999999;
}

.field-group.disabled-field :deep(.dp__input::placeholder) {
  color: #999999;
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
  border: 1px solid var(--color-border) !important;
  transition: all 0.2s ease !important;
}

/* Наведение курсора на VueDatePicker - как у Multiselect */
:deep(.dp__input:hover) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

/* Фокус на VueDatePicker - как у Multiselect */
:deep(.dp__input:focus) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
  outline: none !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
