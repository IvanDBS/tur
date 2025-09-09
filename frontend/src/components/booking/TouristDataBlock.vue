<template>
  <div class="tourist-data-block">
    <div class="block-header">
      <h2 class="block-title">Информация о туристах</h2>
      <div class="warning-notice">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Внимание!</strong> Туристы со сроком действия паспорта менее 6 месяцев будут сняты с рейсов!
        </div>
      </div>
      <div class="required-notice">
        Поля, отмеченные звездочкой (*), обязательны для заполнения.
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
              Обращение *
            </label>
            <select
              :value="tourist.title"
              @change="updateTourist(tourist.id, 'title', $event.target.value)"
              class="form-select"
            >
              <option value="">Выберите обращение</option>
              <option v-for="option in titleOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Last Name -->
          <div class="form-field">
            <label class="field-label">
              Фамилия *
            </label>
          <input
            :value="tourist.lastName"
            @input="updateTourist(tourist.id, 'lastName', $event.target.value)"
            placeholder="Введите фамилию"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'lastName') }"
          />
          </div>

          <!-- First Name -->
          <div class="form-field">
            <label class="field-label">
              Имя *
            </label>
          <input
            :value="tourist.firstName"
            @input="updateTourist(tourist.id, 'firstName', $event.target.value)"
            placeholder="Введите имя"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'firstName') }"
          />
          </div>

          <!-- Birth Date -->
          <div class="form-field">
            <label class="field-label">
              Дата рождения *
            </label>
          <input
            :value="tourist.birthDate"
            @input="updateTourist(tourist.id, 'birthDate', $event.target.value)"
            type="date"
            placeholder="дд.мм.гггг"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'birthDate') }"
          />
          </div>

          <!-- Passport Number -->
          <div class="form-field">
            <label class="field-label">
              Номер паспорта *
            </label>
          <input
            :value="tourist.passportNumber"
            @input="updateTourist(tourist.id, 'passportNumber', $event.target.value)"
            placeholder="Введите номер паспорта"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'passportNumber') }"
          />
          </div>

          <!-- Passport Expiry -->
          <div class="form-field">
            <label class="field-label">
              Действителен до *
            </label>
          <input
            :value="tourist.passportExpiry"
            @input="updateTourist(tourist.id, 'passportExpiry', $event.target.value)"
            type="date"
            placeholder="дд.мм.гггг"
            class="form-input"
            :class="{ 'error': getFieldError(tourist.id, 'passportExpiry') }"
          />
          </div>

          <!-- Nationality -->
          <div class="form-field">
            <label class="field-label">
              Гражданство *
            </label>
          <select
            :value="tourist.nationality"
            @change="updateTourist(tourist.id, 'nationality', $event.target.value)"
            class="form-select"
          >
            <option value="">Выберите гражданство</option>
            <option v-for="option in nationalityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          </div>

          <!-- Fiscal Code -->
          <div class="form-field">
            <label class="field-label">
              Фискальный код
            </label>
          <input
            :value="tourist.fiscalCode"
            @input="updateTourist(tourist.id, 'fiscalCode', $event.target.value)"
            placeholder="Введите фискальный код"
            class="form-input"
          />
          </div>
        </div>

        <!-- Passport Validity Warning -->
        <div v-if="getPassportValidityWarning(tourist)" class="passport-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            Срок действия паспорта менее 6 месяцев!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TouristData } from '../../types/booking'

interface Props {
  tourists: TouristData[]
  errors?: Record<string, Record<string, string>>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:tourist': [touristId: string, field: keyof TouristData, value: string | number | boolean]
}>()

// Options
const titleOptions = [
  { value: 'MR', label: 'MR' },
  { value: 'MRS', label: 'MRS' },
  { value: 'MS', label: 'MS' }
]

const nationalityOptions = [
  { value: 'MOLDOVA', label: 'MOLDOVA' },
  { value: 'ROMANIA', label: 'ROMANIA' },
  { value: 'UKRAINE', label: 'UKRAINE' },
  { value: 'RUSSIA', label: 'RUSSIA' },
  { value: 'BELARUS', label: 'BELARUS' },
  { value: 'OTHER', label: 'Другое' }
]

// Methods
const getTouristTitle = (index: number) => {
  return `Турист ${index + 1}`
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

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 60, 97, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: #ef4444;
}

.form-input.error:focus,
.form-select.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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
