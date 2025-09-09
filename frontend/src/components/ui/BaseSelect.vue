<template>
  <div class="form-field" :class="{ 'form-field--disabled': disabled }">
    <label v-if="label" :for="selectId" class="form-field__label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <Multiselect
      :id="selectId"
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
      @update:model-value="handleUpdate"
    />
    
    <div v-if="error" class="form-field__error">
      {{ error }}
    </div>
    
    <div v-if="hint" class="form-field__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import type { BaseSelectProps, BaseFieldEmits } from '@/types/ui'

interface Props extends BaseSelectProps {}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  searchable: true,
  canClear: true,
  canDeselect: true,
  labelProp: 'label',
  valueProp: 'value',
  size: 'md'
})

const emit = defineEmits<BaseFieldEmits>()

const selectId = ref(`select-${Math.random().toString(36).substr(2, 9)}`)

const selectClasses = computed(() => [
  'form-field__select',
  `form-field__select--${props.size}`,
  {
    'form-field__select--error': props.error,
    'form-field__select--disabled': props.disabled
  }
])

const handleUpdate = (value: unknown) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.form-field__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
  margin-top: var(--spacing-xs);
}

.text-danger {
  color: var(--color-danger);
}

.form-field__select {
  min-height: var(--input-height);
}

.form-field__select--sm {
  min-height: var(--input-height-sm);
}

.form-field__select--lg {
  min-height: var(--input-height-lg);
}

/* Переопределяем стили Multiselect для соответствия дизайн-системе */
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
  box-shadow: 0 0 0 2px var(--color-secondary-muted);
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

.form-field__select--error :deep(.multiselect) {
  border-color: var(--color-danger);
}

.form-field__select--error :deep(.multiselect:focus) {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-field__select--disabled :deep(.multiselect) {
  background: var(--color-background-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
