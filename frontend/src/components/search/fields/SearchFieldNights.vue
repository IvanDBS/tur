<template>
  <div class="nights-container">
    <!-- Ночей в отеле от -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'nights'" class="field-arrow"></span>
        Ночей в отеле от:
      </label>
      <Multiselect
        :model-value="nightsFrom"
        @update:model-value="$emit('update:nightsFrom', $event)"
        :options="nightsOptions"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        placeholder="6"
        label="label"
        valueProp="value"
        :disabled="disabled"
        @change="$emit('update-nights2-min')"
      />
    </div>

    <!-- Ночей в отеле до -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'nights2'" class="field-arrow"></span>
        Ночей в отеле до:
      </label>
      <Multiselect
        :model-value="nightsTo"
        @update:model-value="$emit('update:nightsTo', $event)"
        :options="filteredNights2Options"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        placeholder="6"
        label="label"
        valueProp="value"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

// Props
interface Props {
  nightsFrom: number | null
  nightsTo: number | null
  nightsOptions: Array<{ value: number; label: string }>
  filteredNights2Options: Array<{ value: number; label: string }>
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:nightsFrom': [value: number | null]
  'update:nightsTo': [value: number | null]
  'update-nights2-min': []
}>()
</script>

<style scoped>
.nights-container {
  display: contents; /* Позволяет элементам участвовать в grid родителя */
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

.disabled-field .multiselect {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
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
  .nights-container {
    flex-direction: column;
    gap: 8px;
  }

  .field-group {
    min-width: 80px;
  }
}
</style>
