<template>
  <div class="form-field" :class="{ 'form-field--disabled': disabled }">
    <label v-if="label" :for="inputId" class="form-field__label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <input
      :id="inputId"
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
import type { BaseFieldProps, BaseFieldEmits } from '@/types/ui'

interface Props extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<BaseFieldEmits>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => [
  'form-field__input',
  `form-field__input--${props.size}`,
  {
    'form-field__input--error': props.error,
    'form-field__input--disabled': props.disabled
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
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
.form-field__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
  margin-top: var(--spacing-xs);
}

.text-danger {
  color: var(--color-danger);
}

.form-field__input--sm {
  min-height: var(--input-height-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.form-field__input--lg {
  min-height: var(--input-height-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}
</style>
