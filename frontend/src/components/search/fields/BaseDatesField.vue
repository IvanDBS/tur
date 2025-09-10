<template>
  <div class="dates-container">
    <!-- Период заезда от -->
    <BaseSearchField
      :model-value="checkInDate"
      field-key="checkInDate"
      label="Период заезда от"
      :active-selector="activeSelector"
      :disabled="disabled"
      @update:model-value="$emit('update:checkInDate', $event)"
    >
      <template #default="{ modelValue }">
        <VueDatePicker
          :model-value="modelValue"
          @update:model-value="$emit('update:checkInDate', $event)"
          :min-date="new Date()"
          :disabled-dates="isDateDisabled"
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
          :disabled="disabled"
        />
      </template>
    </BaseSearchField>

    <!-- Период заезда до -->
    <BaseSearchField
      :model-value="checkOutDate"
      field-key="checkOutDate"
      label="Период заезда до"
      :active-selector="activeSelector"
      :disabled="!checkInDate"
      @update:model-value="$emit('update:checkOutDate', $event)"
    >
      <template #default="{ modelValue }">
        <VueDatePicker
          :model-value="modelValue"
          @update:model-value="$emit('update:checkOutDate', $event)"
          :min-date="checkInDate || new Date()"
          :disabled-dates="isDateDisabled"
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
          :disabled="!checkInDate"
        />
      </template>
    </BaseSearchField>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { defineAsyncComponent } from 'vue'
import { useCalendarHints } from '../../../composables/useCalendarHints'
const BaseSearchField = defineAsyncComponent(() => import('./BaseSearchField.vue'))

// Props
interface Props {
  checkInDate: Date | null
  checkOutDate: Date | null
  activeSelector?: string | null
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
defineEmits<{
  'update:checkInDate': [value: Date | null]
  'update:checkOutDate': [value: Date | null]
}>()

// Calendar hints для ограничения доступных дат
const { isDateAvailable, availableDates } = useCalendarHints()

// Функция для проверки доступности даты в календаре
const isDateDisabled = (date: Date) => {
  // Если нет календарных подсказок, разрешаем все даты от сегодня
  if (availableDates.value.length === 0) {
    return date < new Date()
  }
  
  // Проверяем доступность даты через календарные подсказки
  return !isDateAvailable(date)
}
</script>

<style scoped>
.dates-container {
  display: flex;
  gap: 12px;
  flex: 2; /* Занимаем 2 колонки из 4 */
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .dates-container {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
