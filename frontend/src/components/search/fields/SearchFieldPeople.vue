<template>
  <BasePeopleField
    :adults="adults"
    :children="children"
    :children-ages="childrenAges"
    :adults-options="adultsOptions"
    :children-options="childrenOptions"
    :active-selector="activeSelector"
    :disabled="disabled"
    @update:adults="$emit('update:adults', $event)"
    @update:children="$emit('update:children', $event)"
    @update:children-age="$emit('update:childrenAge', $event)"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BasePeopleField = defineAsyncComponent(() => import('./BasePeopleField.vue'))

// Props
interface Props {
  adults: number | null
  children: number | null
  childrenAges: number[]
  adultsOptions: Array<{ value: number; label: string }>
  childrenOptions: Array<{ value: number; label: string }>
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:adults': [value: number | null]
  'update:children': [value: number | null]
  'update:childrenAge': [data: { index: number; value: number }]
}>()
</script>
