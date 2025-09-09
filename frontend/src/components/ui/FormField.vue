<template>
  <div class="form-group" :class="{ 'form-group--disabled': disabled }">
    <label v-if="label" :for="fieldId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <!-- Input field -->
    <input
      v-if="!isSelect"
      :id="fieldId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    
    <!-- Select field -->
    <Multiselect
      v-else
      :id="fieldId"
      :model-value="modelValue"
      :options="options"
      :searchable="searchable"
      :can-clear="canClear"
      :can-deselect="canDeselect"
      :placeholder="placeholder"
      :label="labelProp"
      :value-prop="valueProp"
      :disabled="disabled"
      :class="selectClasses"
      @update:model-value="handleSelectUpdate"
    />
    
    <span v-if="error" class="form-error">{{ error }}</span>
    <div v-if="hint" class="form-hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import type { FormFieldProps, BaseFieldEmits } from '@/types/ui'

interface Props extends FormFieldProps {}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  size: 'md',
  searchable: true,
  canClear: true,
  canDeselect: true,
  labelProp: 'label',
  valueProp: 'value'
})

const emit = defineEmits<BaseFieldEmits>()

const fieldId = ref(`field-${Math.random().toString(36).substr(2, 9)}`)

const isSelect = computed(() => props.type === 'select')

const inputClasses = computed(() => [
  'form-input',
  `form-input--${props.size}`,
  {
    'form-input--error': props.error,
    'form-input--disabled': props.disabled
  }
])

const selectClasses = computed(() => [
  'form-select',
  `form-select--${props.size}`,
  {
    'form-select--error': props.error,
    'form-select--disabled': props.disabled
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleSelectUpdate = (value: unknown) => {
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<style scoped>
/* Используем существующие классы для совместимости с auth формами */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  background: var(--color-background);
  color: var(--color-text);
  transition: var(--transition);
  min-height: var(--input-height);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 2px var(--color-secondary-muted);
}

.form-input:hover:not(:focus) {
  border-color: var(--color-secondary);
}

.form-input:disabled {
  background: var(--color-background-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-input--error {
  border-color: var(--color-danger);
}

.form-input--error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-select {
  width: 100%;
  min-height: var(--input-height);
}

.form-select--sm {
  min-height: var(--input-height-sm);
}

.form-select--lg {
  min-height: var(--input-height-lg);
}

.form-error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  font-weight: var(--font-weight-medium);
  margin-top: 0.25rem;
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
  margin-top: 0.25rem;
}

.text-danger {
  color: var(--color-danger);
}

/* Стили для Multiselect */
:deep(.multiselect) {
  min-height: var(--input-height);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  transition: var(--transition);
}

:deep(.multiselect:hover) {
  border-color: var(--color-secondary);
}

:deep(.multiselect.is-active) {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 2px var(--color-secondary-muted);
  outline: none;
}

:deep(.multiselect__option--highlight) {
  background: var(--color-secondary);
  color: white;
}

:deep(.multiselect__option--selected) {
  background: var(--color-secondary);
  color: white;
}

.form-select--error :deep(.multiselect) {
  border-color: var(--color-danger);
}

.form-select--error :deep(.multiselect:focus) {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-select--disabled :deep(.multiselect) {
  background: var(--color-background-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Размеры */
.form-input--sm {
  min-height: var(--input-height-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.form-input--lg {
  min-height: var(--input-height-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}
</style>
