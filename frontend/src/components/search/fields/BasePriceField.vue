<template>
  <div class="price-container">
    <!-- Цена от -->
    <BaseSearchField
      :model-value="priceFrom"
      field-key="priceFrom"
      :label="$t('search.priceFrom')"
      :active-selector="activeSelector"
      :disabled="disabled"
      @update:model-value="$emit('update:priceFrom', $event)"
    >
      <template #default="{ modelValue }">
        <input
          type="number"
          :value="modelValue"
          @input="handlePriceFromInput"
          :placeholder="$t('search.from')"
          :disabled="disabled"
          class="price-input"
        />
      </template>
    </BaseSearchField>

    <!-- Цена до -->
    <BaseSearchField
      :model-value="priceTo"
      field-key="priceTo"
      :label="$t('search.priceTo')"
      :active-selector="activeSelector"
      :disabled="disabled"
      @update:model-value="$emit('update:priceTo', $event)"
    >
      <template #default="{ modelValue }">
        <input
          type="number"
          :value="modelValue"
          @input="handlePriceToInput"
          :placeholder="$t('search.to')"
          :disabled="disabled"
          class="price-input"
        />
      </template>
    </BaseSearchField>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BaseSearchField = defineAsyncComponent(() => import('./BaseSearchField.vue'))

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
const emit = defineEmits<{
  'update:priceFrom': [value: number | null]
  'update:priceTo': [value: number | null]
}>()

// Methods
const handlePriceFromInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value ? parseInt(target.value) : null
  emit('update:priceFrom', value)
}

const handlePriceToInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value ? parseInt(target.value) : null
  emit('update:priceTo', value)
}
</script>

<style scoped>
.price-container {
  display: contents; /* Позволяет элементам участвовать в grid родителя */
}

.price-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s ease;
}

.price-input:focus {
  outline: none;
  border-color: #2ECC71;
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.1);
}

.price-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
  opacity: 0.6;
}

.disabled-field .price-input {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}
</style>
