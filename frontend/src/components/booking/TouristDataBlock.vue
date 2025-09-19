<template>
  <div class="tourist-data-block">
    <div class="block-header">
      <h2 class="block-title">{{ $t('searchResults.touristInfoTitle') }}</h2>
      <div class="warning-notice">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>{{ $t('searchResults.passportWarning') }}</strong>
        </div>
      </div>
      <div class="required-notice">
        {{ $t('searchResults.requiredFields') }}
      </div>
    </div>

    <div class="tourist-content">
      <div 
        v-for="(tourist, index) in tourists" 
        :key="tourist.id"
        class="tourist-form"
      >
        <h3 class="tourist-title">
          {{ getTouristTitle(index) }}
        </h3>

        <div class="form-grid">
          <!-- Title -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.title') }} *
            </label>
            <Multiselect
              :model-value="tourist.title"
              :options="titleOptions"
              :placeholder="$t('searchResults.selectTitle')"
              :searchable="false"
              :can-clear="false"
              :can-deselect="false"
              @update:model-value="updateTourist(tourist.id, 'title', $event)"
              class="form-select"
            />
          </div>

          <!-- Last Name -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.lastName') }} *
            </label>
          <input
            :value="tourist.lastName"
            @input="updateTourist(tourist.id, 'lastName', $event.target.value)"
            :placeholder="$t('searchResults.enterLastName')"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'lastName') }"
          />
          </div>

          <!-- First Name -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.firstName') }} *
            </label>
          <input
            :value="tourist.firstName"
            @input="updateTourist(tourist.id, 'firstName', $event.target.value)"
            :placeholder="$t('searchResults.enterFirstName')"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'firstName') }"
          />
          </div>

          <!-- Birth Date -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.birthDate') }} *
            </label>
          <input
            :value="tourist.birthDate"
            @input="updateTourist(tourist.id, 'birthDate', $event.target.value)"
            type="date"
            :max="getMaxBirthDate()"
            placeholder="dd.mm.yyyy"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'birthDate') }"
          />
          </div>

          <!-- Passport Number -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.passportNumber') }} *
            </label>
          <input
            :value="tourist.passportNumber"
            @input="updateTourist(tourist.id, 'passportNumber', $event.target.value)"
            :placeholder="$t('searchResults.enterPassportNumber')"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'passportNumber') }"
          />
          </div>

          <!-- Passport Expiry -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.validUntil') }} *
            </label>
          <input
            :value="tourist.passportExpiry"
            @input="updateTourist(tourist.id, 'passportExpiry', $event.target.value)"
            type="date"
            :min="getMinPassportDate()"
            placeholder="dd.mm.yyyy"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'passportExpiry') }"
          />
          </div>

          <!-- Nationality -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.citizenship') }} *
            </label>
            <Multiselect
              :model-value="tourist.nationality"
              :options="nationalityOptions"
              :placeholder="$t('touristInfo.selectCitizenship')"
              :searchable="true"
              :can-clear="false"
              :can-deselect="false"
              @update:model-value="updateTourist(tourist.id, 'nationality', $event)"
              class="form-select"
            />
          </div>

          <!-- Fiscal Code -->
          <div class="form-field">
            <label class="field-label">
              {{ $t('searchResults.fiscalCode') }}
            </label>
          <input
            :value="tourist.fiscalCode"
            @input="updateTourist(tourist.id, 'fiscalCode', $event.target.value)"
            :placeholder="$t('searchResults.enterFiscalCode')"
            class="form-input"
          />
          </div>
        </div>

        <!-- Passport Validity Warning -->
        <div v-if="getPassportValidityWarning(tourist)" class="passport-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            {{ $t('touristInfo.passportValidityWarning') }}
          </div>
        </div>

        <!-- Birth Date Warning -->
        <div v-if="getBirthDateWarning(tourist)" class="birthdate-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            {{ $t('touristInfo.birthDateWarning') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import type { TouristData } from '../../types/booking'
import { useI18n } from '../../composables/useI18n'

interface Props {
  tourists: TouristData[]
  errors?: Record<string, Record<string, string>>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:tourist': [touristId: string, field: keyof TouristData, value: string | number | boolean]
}>()

const { t: $t } = useI18n()

// Options
const titleOptions = [
  { value: 'MR', label: 'MR' },
  { value: 'MRS', label: 'MRS' },
  { value: 'CHD', label: 'CHD' }
]

const nationalityOptions = [
  { value: 'MOLDOVA', label: 'MOLDOVA' },
  { value: 'ROMANIA', label: 'ROMANIA' },
  { value: 'UKRAINE', label: 'UKRAINE' },
  { value: 'RUSSIA', label: 'RUSSIA' },
  { value: 'BELARUS', label: 'BELARUS' },
  { value: 'OTHER', label: $t('touristInfo.other') }
]

// Methods
const getTouristTitle = (index: number) => {
  return `${$t('searchResults.tourist')} ${index + 1}`
}

const updateTourist = (touristId: string, field: keyof TouristData, value: string | number | boolean) => {
  emit('update:tourist', touristId, field, value)
}

const getFieldError = (touristId: string, field: string) => {
  return props.errors?.[touristId]?.[field] || ''
}

const getPassportValidityWarning = (tourist: TouristData) => {
  if (!tourist.passportExpiry) return false
  
  try {
    const expiryDate = new Date(tourist.passportExpiry)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
    
    return expiryDate < sixMonthsFromNow
  } catch {
    return false
  }
}

const getBirthDateWarning = (tourist: TouristData) => {
  if (!tourist.birthDate) return false
  
  try {
    const birthDate = new Date(tourist.birthDate)
    const today = new Date()
    
    return birthDate > today
  } catch {
    return false
  }
}

const getMaxBirthDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const getMinPassportDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
</script>

<style scoped>
.tourist-data-block {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin-bottom: 2rem;
}

.block-header {
  padding: 1.5rem 1.5rem 0;
}

.block-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 1rem;
}

.warning-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-text {
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.5;
}

.required-notice {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.tourist-content {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tourist-form {
  padding: 1.5rem;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  background: #fafafa;
}

.tourist-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
}

.passport-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.passport-warning .warning-icon {
  font-size: 1rem;
  color: #dc2626;
}

.passport-warning .warning-text {
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 500;
}

.birthdate-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.birthdate-warning .warning-icon {
  font-size: 1rem;
  color: #dc2626;
}

.birthdate-warning .warning-text {
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: var(--font-family);
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-height: var(--input-height);
}

.form-input:hover {
  border-color: var(--color-secondary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 60, 97, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Стили для Multiselect компонентов */
.form-select {
  min-height: var(--input-height);
}

.form-select :deep(.multiselect) {
  min-height: var(--input-height) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 6px !important;
  font-family: var(--font-family) !important;
  background: var(--color-background) !important;
  color: var(--color-text) !important;
}

.form-select :deep(.multiselect:hover) {
  border-color: var(--color-secondary) !important;
}

.form-select :deep(.multiselect.is-active) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px rgba(26, 60, 97, 0.1) !important;
}

.form-select :deep(.multiselect__content-wrapper) {
  max-height: 280px !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 6px !important;
  box-shadow: var(--shadow-md) !important;
}

.form-select :deep(.multiselect__option--highlight) {
  background: var(--color-secondary) !important;
  color: #fff !important;
}

.form-select :deep(.multiselect__option--selected) {
  background: var(--color-secondary) !important;
  color: #fff !important;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .tourist-form {
    padding: 1rem;
  }
  
  .warning-notice {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
