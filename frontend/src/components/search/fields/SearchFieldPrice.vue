<template>
  <div class="price-container">
    <!-- Цена от -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'priceFrom'" class="field-arrow"></span>
        Цена € от:
      </label>
      <input
        type="number"
        :value="priceFrom"
        @input="handlePriceFromInput"
        placeholder="От"
        :disabled="disabled"
        class="price-input"
      />
    </div>

    <!-- Цена до -->
    <div class="field-group" :class="{ 'disabled-field': disabled }">
      <label class="field-label">
        <span v-if="activeSelector === 'priceTo'" class="field-arrow"></span>
        Цена € до:
      </label>
      <input
        type="number"
        :value="priceTo"
        @input="handlePriceToInput"
        placeholder="До"
        :disabled="disabled"
        class="price-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  priceFrom: number | null
  priceTo: number | null
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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

.field-group {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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

/* Стили для неактивных полей */
.disabled-field .field-label {
  color: #999999 !important;
}

.disabled-field .price-input {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}

/* Анимированная стрелка для селекторов */
@keyframes downarrow {
  0% { 
    transform: translateY(0); 
    opacity: 0.4; 
  }
  100% { 
    transform: translateY(0.4em); 
    opacity: 1; 
  }
}

.field-arrow {
  display: inline-block;
  margin-right: 0.5rem;
  vertical-align: top;
  margin-top: -0.4em;
}

.field-arrow::before {
  content: '';
  display: inline-block;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #2ECC71; /* Зеленая стрелка */
  animation: downarrow 0.8s infinite alternate ease-in-out;
  margin-right: 0.25rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .field-group {
    min-width: 80px;
  }
}
</style>
