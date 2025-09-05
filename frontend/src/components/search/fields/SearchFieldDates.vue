<template>
  <div class="dates-container">
    <!-- Период заезда от -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'checkInDate'" class="field-arrow"></span>
        Период заезда от:
      </label>
      <VueDatePicker
        :model-value="checkInDate"
        @update:model-value="$emit('update:checkInDate', $event)"
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
        :disabled="disabled"
      />
    </div>

    <!-- Период заезда до -->
    <div class="field-group" :class="{ 'disabled-field': !checkInDate }">
      <label class="field-label">
        <span v-if="activeSelector === 'checkOutDate'" class="field-arrow"></span>
        Период заезда до:
      </label>
      <VueDatePicker
        :model-value="checkOutDate"
        @update:model-value="$emit('update:checkOutDate', $event)"
        :min-date="checkInDate || new Date()"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// Props
interface Props {
  checkInDate: Date | null
  checkOutDate: Date | null
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:checkInDate': [value: Date | null]
  'update:checkOutDate': [value: Date | null]
}>()
</script>

<style scoped>
.dates-container {
  display: flex;
  gap: 12px;
  flex: 2; /* Занимаем 2 колонки из 4 */
}

.field-group {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

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

/* Стили для неактивных полей */
.disabled-field .field-label {
  color: #999999 !important;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .dates-container {
    flex-direction: column;
    gap: 8px;
  }

  .field-group {
    min-width: 80px;
  }
}
</style>
