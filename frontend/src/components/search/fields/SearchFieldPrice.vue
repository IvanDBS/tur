<template>
  <BasePriceField
    :price-from="priceFrom"
    :price-to="priceTo"
    :active-selector="activeSelector"
    :disabled="disabled"
    @update:price-from="$emit('update:priceFrom', $event)"
    @update:price-to="$emit('update:priceTo', $event)"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BasePriceField = defineAsyncComponent(() => import('./BasePriceField.vue'))

// Props
interface Props {
  priceFrom: number | null
  priceTo: number | null
  activeSelector?: string | null
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
defineEmits<{
  'update:priceFrom': [value: number | null]
  'update:priceTo': [value: number | null]
}>()
</script>
