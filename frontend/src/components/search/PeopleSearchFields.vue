<template>
  <div>
    <div class="form-row">
      <!-- Взрослые -->
      <div class="field-group" :class="{ 'disabled-field': !arePeopleFieldsEnabled }">
        <label>Взрослых:</label>
        <Multiselect
          v-model="localForm.adults"
          :options="adultsOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="2"
          label="label"
          valueProp="value"
          :disabled="!arePeopleFieldsEnabled"
        />
      </div>

      <!-- Дети -->
      <div class="field-group" :class="{ 'disabled-field': !areChildrenFieldsEnabled }">
        <label>
          <span v-if="showChildrenIndicator && areChildrenFieldsEnabled" class="field-arrow"></span>
          Детей:
        </label>
        <Multiselect
          v-model="localForm.children"
          :options="childrenOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder=""
          label="label"
          valueProp="value"
        />
      </div>

      <!-- Цена от -->
      <div class="field-group" :class="{ 'disabled-field': !arePriceAndFiltersEnabled }">
        <label>Цена € от:</label>
        <BaseInput
          type="number"
          v-model="localForm.priceFrom"
          placeholder="От"
          :disabled="!arePriceAndFiltersEnabled"
        />
      </div>

      <!-- Цена до -->
      <div class="field-group" :class="{ 'disabled-field': !arePriceAndFiltersEnabled }">
        <label>Цена € до:</label>
        <BaseInput
          type="number"
          v-model="localForm.priceTo"
          placeholder="До"
          :disabled="!arePriceAndFiltersEnabled"
        />
      </div>
    </div>

    <!-- Возраст детей - отдельная строка -->
    <div v-if="localForm.children && localForm.children > 0" class="form-row">
      <div class="field-group" v-for="(age, index) in localForm.childrenAges" :key="index">
        <label>Возраст ребенка {{ index + 1 }}:</label>
        <Multiselect
          v-model="localForm.childrenAges[index]"
          :options="Array.from({ length: 18 }, (_, i) => ({ 
            label: `${i}`, 
            value: i 
          }))"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="Возраст"
          label="label"
          valueProp="value"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import '../../styles/spinner.css'
import type { SearchForm, SearchOption } from '../../types/search'
import BaseInput from '../ui/BaseInput.vue'

interface Props {
  modelValue: SearchForm
  arePeopleFieldsEnabled: boolean
  areChildrenFieldsEnabled: boolean
  arePriceAndFiltersEnabled: boolean
  showChildrenIndicator: boolean
  adultsOptions: SearchOption[]
  childrenOptions: SearchOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchForm]
}>()

// Локальная копия формы
const localForm = ref<SearchForm>({ ...props.modelValue })

// Следим за изменениями количества детей и обновляем массив возрастов
watch(() => localForm.value.children, (newValue) => {
  if (!newValue || newValue === 0) {
    localForm.value.childrenAges = []
  } else {
    const currentAges = [...localForm.value.childrenAges]
    localForm.value.childrenAges = Array(newValue)
      .fill(0)
      .map((_, index) => {
        return index < currentAges.length ? currentAges[index] : 0
      })
  }
}, { immediate: true })

// Следим за изменениями локальной формы и эмитим обновления
watch(localForm, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Следим за изменениями props и обновляем локальную форму
watch(() => props.modelValue, (newValue) => {
  localForm.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  align-items: end;
}

.field-group {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-group label {
  font-size: 11px;
  font-weight: 600;
  color: #222222;
}

/* Скрываем label в BaseInput, так как используем собственные */
.field-group :deep(.form-field__label) {
  display: none;
}

/* Переопределяем стили BaseInput для соответствия дизайну формы */
.field-group :deep(.form-field) {
  margin-bottom: 0;
}

.field-group :deep(.form-field__input) {
  min-height: 40px;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: #ffffff;
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  /* Убираем стрелочки у number input */
  appearance: textfield;
  -moz-appearance: textfield;
}

/* Выравниваем BaseInput по высоте с Multiselect */
.field-group :deep(.multiselect) {
  min-height: 40px;
  height: 40px;
}

.field-group :deep(.form-field__input::-webkit-outer-spin-button),
.field-group :deep(.form-field__input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.field-group :deep(.form-field__input:hover) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

.field-group :deep(.form-field__input:focus) {
  outline: none;
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

.field-group :deep(.form-field__input:disabled) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
}

.field-group :deep(.form-field__input::placeholder) {
  color: var(--color-text-muted);
}

/* Стили для неактивных полей */
.field-group.disabled-field label {
  color: #999999 !important;
}

.field-group.disabled-field :deep(.multiselect) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.field-group.disabled-field :deep(.multiselect .multiselect__placeholder) {
  color: #999999;
}

.field-group.disabled-field :deep(.form-field__input) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #999999;
}

/* Стили для селекторов возраста детей - в ряд */
.form-row:has(.field-group label:contains("Возраст ребенка")) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
  align-items: end;
}



/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
