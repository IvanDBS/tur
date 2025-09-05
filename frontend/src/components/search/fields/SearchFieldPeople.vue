<template>
  <div class="people-container">
    <!-- Взрослые -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'adults'" class="field-arrow"></span>
        Взрослых:
      </label>
      <Multiselect
        :model-value="adults"
        @update:model-value="$emit('update:adults', $event)"
        :options="adultsOptions"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        placeholder="2"
        label="label"
        valueProp="value"
        :disabled="disabled"
      />
    </div>

    <!-- Дети -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'children'" class="field-arrow"></span>
        Детей:
      </label>
      <Multiselect
        :model-value="children"
        @update:model-value="$emit('update:children', $event)"
        :options="childrenOptions"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        label="label"
        valueProp="value"
        :disabled="disabled"
      />
    </div>

    <!-- Возраст детей - добавляются в строку после поля "Детей" -->
    <div
      v-for="(age, index) in childrenAges"
      :key="index"
      class="field-group children-age-field"
      :class="{ 'disabled-field': disabled }"
    >
      <label class="field-label">
        {{ index === 0 ? 'Возраст ребенка:' : `Возраст ребенка ${index + 1}:` }}
      </label>
      <Multiselect
        :model-value="childrenAges[index]"
        @update:model-value="$emit('update:childrenAge', { index, value: $event })"
        :options="childrenAgeOptions"
        :searchable="false"
        :canClear="false"
        :canDeselect="false"
        placeholder="Возраст"
        label="label"
        valueProp="value"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

// Props
interface Props {
  adults: number | null
  children: number | null
  childrenAges: number[]
  adultsOptions: Array<{ value: number; label: string }>
  childrenOptions: Array<{ value: number; label: string }>
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Computed
const childrenAgeOptions = computed(() => {
  const options = []
  for (let age = 0; age <= 17; age++) {
    options.push({
      value: age,
      label: `${age}`
    })
  }
  return options
})

// Emits
const emit = defineEmits<{
  'update:adults': [value: number | null]
  'update:children': [value: number | null]
  'update:childrenAge': [data: { index: number; value: number }]
}>()
</script>

<style scoped>
.people-container {
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

.children-age-field {
  flex: 1;
  min-width: 100px;
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
  .field-group {
    min-width: 80px;
  }
}
</style>
