<template>
  <BaseDatesField
    :check-in-date="checkInDate"
    :check-out-date="checkOutDate"
    :active-selector="activeSelector"
    :disabled="disabled"
    @update:check-in-date="$emit('update:checkInDate', $event)"
    @update:check-out-date="$emit('update:checkOutDate', $event)"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BaseDatesField = defineAsyncComponent(() => import('./BaseDatesField.vue'))

// Props
interface Props {
  checkInDate: Date | null
  checkOutDate: Date | null
  activeSelector?: string | null
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
defineEmits<{
  'update:checkInDate': [value: Date | null]
  'update:checkOutDate': [value: Date | null]
}>()
</script>
