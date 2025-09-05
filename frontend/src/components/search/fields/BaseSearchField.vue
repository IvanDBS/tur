<template>
  <div class="field-group" :class="{ 'disabled-field': disabled }">
    <label class="field-label">
      <span v-if="activeSelector === fieldKey" class="field-arrow"></span>
      {{ label }}:
    </label>
    <slot 
      :field-props="fieldProps" 
      :update-value="updateValue"
      :disabled="disabled"
      :model-value="modelValue"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  modelValue: any
  fieldKey: string
  label: string
  activeSelector?: string | null
  disabled?: boolean
  placeholder?: string
  options?: Array<{ value: any; label: string }>
  searchable?: boolean
  canClear?: boolean
  canDeselect?: boolean
  valueProp?: string
  labelProp?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false,
  searchable: true,
  canClear: false,
  canDeselect: false,
  valueProp: 'value',
  labelProp: 'label'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// Computed
const fieldProps = computed(() => ({
  modelValue: props.modelValue,
  options: props.options,
  placeholder: props.placeholder,
  searchable: props.searchable,
  canClear: props.canClear,
  canDeselect: props.canDeselect,
  disabled: props.disabled,
  valueProp: props.valueProp,
  label: props.labelProp
}))

// Methods
const updateValue = (value: any) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
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

.disabled-field input {
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
