<template>
  <div class="people-container">
    <!-- Взрослые -->
    <BaseSearchField
      :model-value="adults"
      field-key="adults"
      :label="$t('search.adults')"
      :active-selector="activeSelector"
      :disabled="disabled || (activeSelector !== 'adults' && adults === null)"
      :options="adultsOptions"
      :searchable="false"
      :can-clear="false"
      :can-deselect="false"
      @update:model-value="$emit('update:adults', $event)"
    >
      <template #default="{ fieldProps, updateValue }">
        <Multiselect
          v-bind="fieldProps"
          @update:model-value="updateValue"
        />
      </template>
    </BaseSearchField>

    <!-- Дети -->
    <BaseSearchField
      :model-value="children"
      field-key="children"
      :label="$t('search.children')"
      :active-selector="activeSelector"
      :disabled="disabled || (activeSelector !== 'children' && children === null)"
      :options="childrenOptions"
      :searchable="false"
      :can-clear="false"
      :can-deselect="false"
      @update:model-value="$emit('update:children', $event)"
    >
      <template #default="{ fieldProps, updateValue }">
        <Multiselect
          v-bind="fieldProps"
          @update:model-value="updateValue"
        />
      </template>
    </BaseSearchField>

    <!-- Возраст детей -->
    <BaseSearchField
      v-for="(age, index) in childrenAges"
      :key="index"
      :model-value="childrenAges[index]"
      :field-key="`childrenAge${index}`"
      :label="index === 0 ? $t('search.childAge') : `${$t('search.childAgeNumber')} ${index + 1}`"
      :active-selector="activeSelector"
      :disabled="disabled"
      :options="childrenAgeOptions"
      :placeholder="$t('search.age')"
      :searchable="false"
      :can-clear="false"
      :can-deselect="false"
      @update:model-value="$emit('update:childrenAge', { index, value: $event })"
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
import { computed } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { defineAsyncComponent } from 'vue'
const BaseSearchField = defineAsyncComponent(() => import('./BaseSearchField.vue'))

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

withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Computed
const childrenAgeOptions = computed(() => {
  const options = []
  for (let age = 0; age <= 17; age++) {
    options.push({
      value: age,
      label: `${age}`
    })
  }
  return options
})

// Emits
defineEmits<{
  'update:adults': [value: number | null]
  'update:children': [value: number | null]
  'update:childrenAge': [data: { index: number; value: number }]
}>()
</script>

<style scoped>
.people-container {
  display: contents; /* Позволяет элементам участвовать в grid родителя */
}
</style>
