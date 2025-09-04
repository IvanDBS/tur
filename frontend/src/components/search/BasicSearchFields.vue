<template>
  <div class="form-row">
    <!-- Откуда -->
    <div class="field-group">
      <label>
        <span v-if="activeSelector === 'departureCity'" class="field-arrow"></span>
        Откуда:
      </label>
      <Multiselect
        v-model="localForm.departureCity"
        :options="departureCitiesOptions"
        :searchable="true"
        :canClear="false"
        :canDeselect="false"
        placeholder="Выберите город"
        label="label"
        valueProp="value"
        :disabled="isLoading"
      />
    </div>

    <!-- Куда -->
    <div class="field-group" :class="{ 'disabled-field': !localForm.departureCity }">
      <label>
        <span v-if="activeSelector === 'destination'" class="field-arrow"></span>
        Куда:
      </label>
      <Multiselect
        v-model="localForm.destination"
        :options="countriesOptions"
        :searchable="true"
        :canClear="false"
        :canDeselect="false"
        placeholder="Выберите страну"
        label="label"
        valueProp="value"
        :disabled="isLoading || !localForm.departureCity"
      />
    </div>

    <!-- Пакет -->
    <div class="field-group" :class="{ 'disabled-field': !localForm.destination }">
      <label>
        <span v-if="activeSelector === 'package'" class="field-arrow"></span>
        Пакет:
      </label>
      <Multiselect
        v-model="localForm.package"
        :options="packagesOptions"
        :searchable="true"
        :canClear="false"
        :canDeselect="false"
        placeholder="Выберите пакет"
        label="label"
        valueProp="value"
        :disabled="isLoading || !localForm.destination"
      />
    </div>

    <!-- Город прилета -->
    <div class="field-group" :class="{ 'disabled-field': !localForm.package }">
      <label>
        <span v-if="activeSelector === 'arrivalCity'" class="field-arrow"></span>
        Город прилета:
      </label>
      <input 
        type="text" 
        :value="localForm.arrivalCity ? localForm.arrivalCity.name : 'Город будет выбран автоматически'"
        :disabled="true"
        :style="{
          minHeight: '38px', 
          height: '38px', 
          border: '1px solid #dddddd', 
          borderRadius: '4px', 
          padding: '4px 8px', 
          fontSize: '14px', 
          color: localForm.arrivalCity ? '#222222' : '#999999',
          background: '#f5f5f5', 
          fontFamily: 'inherit', 
          boxSizing: 'border-box'
        }"
        title="Автоматически устанавливается на основе выбранного пакета"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import type { SearchForm, DepartureCity, Country, Package, ArrivalCity } from '../../types/search'

interface Props {
  modelValue: SearchForm
  activeSelector: string | null
  isLoading: boolean
  departureCitiesOptions: any[]
  countriesOptions: any[]
  packagesOptions: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchForm]
}>()

// Локальная копия формы
const localForm = ref<SearchForm>({ ...props.modelValue })

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

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
