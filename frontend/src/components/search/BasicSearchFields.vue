<template>
  <div class="form-row">
    <!-- Откуда -->
    <div class="field-group">
      <BaseSelect
        v-model="localForm.departureCity"
        :options="departureCitiesOptions"
        label="Откуда:"
        placeholder="Выберите город"
        :disabled="isLoading"
        :can-clear="false"
        :can-deselect="false"
        :searchable="true"
      />
      <span v-if="activeSelector === 'departureCity'" class="field-arrow"></span>
    </div>

    <!-- Куда -->
    <div class="field-group" :class="{ 'disabled-field': !localForm.departureCity }">
      <BaseSelect
        v-model="localForm.destination"
        :options="countriesOptions"
        label="Куда:"
        placeholder="Выберите страну"
        :disabled="isLoading || !localForm.departureCity"
        :can-clear="false"
        :can-deselect="false"
        :searchable="true"
      />
      <span v-if="activeSelector === 'destination'" class="field-arrow"></span>
    </div>

    <!-- Пакет -->
    <div class="field-group" :class="{ 'disabled-field': !localForm.destination }">
      <BaseSelect
        v-model="localForm.package"
        :options="packagesOptions"
        label="Пакет:"
        placeholder="Выберите пакет"
        :disabled="isLoading || !localForm.destination"
        :can-clear="false"
        :can-deselect="false"
        :searchable="true"
      />
      <span v-if="activeSelector === 'package'" class="field-arrow"></span>
    </div>

    <!-- Город прилета -->
    <div class="field-group" :class="{ 'disabled-field': !localForm.package }">
      <BaseInput
        :model-value="localForm.arrivalCity ? localForm.arrivalCity.name : 'Город будет выбран автоматически'"
        label="Город прилета:"
        :disabled="true"
      />
      <span v-if="activeSelector === 'arrivalCity'" class="field-arrow"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseSelect, BaseInput } from '../ui'
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

/* Переопределяем стили BaseInput для соответствия дизайну формы */
.field-group :deep(.form-field) {
  margin-bottom: 0;
}

.field-group :deep(.form-field__label) {
  font-size: 11px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 2px;
}

.field-group :deep(.form-field__input) {
  min-height: 38px;
  height: 38px;
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  background: #ffffff;
  color: #222222;
}

.field-group :deep(.form-field__input:hover) {
  border-color: #1d3557;
  box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2);
}

.field-group :deep(.form-field__input:focus) {
  border-color: #1d3557;
  box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2);
  outline: none;
}

/* Стили для неактивных полей */
.field-group.disabled-field :deep(.form-field__label) {
  color: #999999 !important;
}

.field-group.disabled-field :deep(.form-field__input) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #999999;
}

.field-group.disabled-field :deep(.form-field__select) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.field-group.disabled-field :deep(.form-field__select .multiselect) {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.field-group.disabled-field :deep(.form-field__select .multiselect .multiselect__placeholder) {
  color: #999999;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
