<template>
  <BaseSearchField
    :model-value="modelValue"
    field-key="departureCity"
    label="Откуда"
    :active-selector="activeSelector"
    :disabled="disabled"
    :options="options"
    placeholder="Выберите город"
    :searchable="true"
    :can-clear="false"
    :can-deselect="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #default="{ fieldProps, updateValue }">
      <Multiselect
        v-bind="fieldProps"
        @update:model-value="updateValue"
      />
    </template>
  </BaseSearchField>
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { defineAsyncComponent } from 'vue'
const BaseSearchField = defineAsyncComponent(() => import('./BaseSearchField.vue'))

// Props
interface Props {
  modelValue: any
  options: Array<{ value: any; label: string }>
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>
