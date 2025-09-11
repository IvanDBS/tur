<template>
  <BaseSearchField
    :model-value="modelValue"
    field-key="destination"
    :label="$t('search.to')"
    :active-selector="activeSelector"
    :disabled="disabled"
    :options="options"
    :placeholder="$t('search.selectCountry')"
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
  modelValue: string | number | null | Record<string, unknown>
  options: Array<{ value: string | number; label: string }>
  activeSelector?: string | null
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
defineEmits<{
  'update:modelValue': [value: string | number | null | Record<string, unknown>]
}>()
</script>
