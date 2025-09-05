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
import { computed, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import '../../styles/spinner.css'
import { useSearchFormState } from '../../composables/useSearchFormState'
import type { SearchForm, NightsOption } from '../../types/search'

interface Props {
  modelValue: SearchForm
  isCheckInDateEnabled: boolean
  isCheckOutDateEnabled: boolean
  areNightsFieldsEnabled: boolean
  showDateIndicator: boolean
  nightsOptions: NightsOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchForm]
}>()

// Используем composable для управления состоянием
const { localForm, syncWithParent } = useSearchFormState(props.modelValue)

// Фильтрованные опции для второго селектора ночей
const filteredNights2Options = computed(() => {
  if (!localForm.value.nights) {
    return props.nightsOptions
  }

  return props.nightsOptions.filter(
    (option: NightsOption) => option.value >= localForm.value.nights
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
  syncWithParent(newValue)
}, { deep: true })
</script>

<style scoped>
@import '../../styles/mixins.css';

.form-row {
  @include form-row;
}

.field-group {
  @include field-group;
}

.field-group label {
  @include field-label;
}

/* Стили для неактивных полей */
.field-group.disabled-field label {
  @include disabled-label;
}

.field-group.disabled-field :deep(.multiselect) {
  @include disabled-field;
}

.field-group.disabled-field :deep(.multiselect .multiselect__placeholder) {
  color: #999999;
}

.field-group.disabled-field :deep(.dp__input) {
  @include disabled-field;
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
  @include form-field-base;
  border: 1px solid var(--color-border) !important;
}

/* Наведение курсора на VueDatePicker - как у Multiselect */
:deep(.dp__input:hover) {
  @include form-field-hover;
}

/* Фокус на VueDatePicker - как у Multiselect */
:deep(.dp__input:focus) {
  @include form-field-focus;
}

/* Серый hover эффект для неактивных полей календаря */
.field-group.disabled-field :deep(.dp__input:hover) {
  border-color: #e0e0e0 !important;
  box-shadow: 0 0 0 2px rgba(153, 153, 153, 0.2) !important;
}

.field-group.disabled-field :deep(.dp__input:focus) {
  border-color: #e0e0e0 !important;
  box-shadow: 0 0 0 2px rgba(153, 153, 153, 0.2) !important;
  outline: none !important;
}

/* Mobile Responsive */
@include mobile-responsive;
</style>
