<template>
  <div class="field-group" :class="{ 'disabled-field': disabled }">
    <label class="field-label">
      <span v-if="activeSelector === 'arrivalCity'" class="field-arrow"></span>
      Город прилета:
    </label>
    <input 
      type="text" 
      :value="modelValue ? modelValue.name : 'Город будет выбран автоматически'"
      :disabled="true"
      class="arrival-input"
      title="Автоматически устанавливается на основе выбранного пакета"
    />
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  modelValue: any
  activeSelector?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeSelector: null,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>

<style scoped>
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

/* Стили для неактивных полей */
.disabled-field .field-label {
  color: #999999 !important;
}

.disabled-field .arrival-input {
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
