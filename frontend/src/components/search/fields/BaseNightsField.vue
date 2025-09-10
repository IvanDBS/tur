<template>
  <div class="nights-container">
    <!-- Ночей в отеле от -->
    <BaseSearchField
      :model-value="nightsFrom"
      field-key="nights"
      label="Ночей в отеле от"
      :active-selector="activeSelector"
      :disabled="disabled"
      :options="nightsOptions"
      placeholder="6"
      :searchable="false"
      :can-clear="false"
      :can-deselect="false"
      @update:model-value="$emit('update:nightsFrom', $event)"
    >
      <template #default="{ fieldProps, updateValue }">
        <Multiselect
          v-bind="fieldProps"
          @update:model-value="updateValue"
          @change="$emit('update-nights2-min')"
        />
      </template>
    </BaseSearchField>

    <!-- Ночей в отеле до -->
    <BaseSearchField
      :model-value="nightsTo"
      field-key="nights2"
      label="Ночей в отеле до"
      :active-selector="activeSelector"
      :disabled="disabled"
      :options="filteredNights2Options"
      placeholder="6"
      :searchable="false"
      :can-clear="false"
      :can-deselect="false"
      @update:model-value="$emit('update:nightsTo', $event)"
    >
      <template #default="{ fieldProps, updateValue }">
        <Multiselect
          v-bind="fieldProps"
          @update:model-value="updateValue"
        />
      </template>
    </BaseSearchField>
  </div>
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { defineAsyncComponent } from 'vue'
const BaseSearchField = defineAsyncComponent(() => import('./BaseSearchField.vue'))

// Props
interface Props {
  nightsFrom: number | null
  nightsTo: number | null
  nightsOptions: Array<{ value: number; label: string }>
  filteredNights2Options: Array<{ value: number; label: string }>
  activeSelector?: string | null
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
defineEmits<{
  'update:nightsFrom': [value: number | null]
  'update:nightsTo': [value: number | null]
  'update-nights2-min': []
}>()
</script>

<style scoped>
.nights-container {
  display: contents; /* Позволяет элементам участвовать в grid родителя */
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .nights-container {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
