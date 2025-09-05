<template>
  <BaseNightsField
    :nights-from="nightsFrom"
    :nights-to="nightsTo"
    :nights-options="nightsOptions"
    :filtered-nights2-options="filteredNights2Options"
    :active-selector="activeSelector"
    :disabled="disabled"
    @update:nights-from="$emit('update:nightsFrom', $event)"
    @update:nights-to="$emit('update:nightsTo', $event)"
    @update-nights2-min="$emit('update-nights2-min')"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BaseNightsField = defineAsyncComponent(() => import('./BaseNightsField.vue'))

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
