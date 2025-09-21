<template>
  <BaseSearchField
    :model-value="modelValue"
    field-key="arrivalCity"
    :label="$t('search.arrival')"
    :active-selector="activeSelector"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #default="{ modelValue }">
      <input 
        type="text" 
        :value="modelValue ? modelValue.name : $t('search.arrivalCityAuto')"
        :disabled="true"
        class="arrival-input"
        :title="$t('search.autoSetByPackage')"
      />
    </template>
  </BaseSearchField>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BaseSearchField = defineAsyncComponent(() => import('./BaseSearchField.vue'))

// Props
interface Props {
  modelValue: string | number | null | Record<string, unknown>
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

<style scoped>
.arrival-input {
  min-height: 38px;
  height: 38px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  color: #222222;
  background: #f5f5f5;
  font-family: inherit;
  box-sizing: border-box;
  width: 100%;
}

.disabled-field .arrival-input {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}
</style>
