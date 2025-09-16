<template>
  <div class="additional-services-block">
    <div class="block-header">
      <h2 class="block-title">{{ $t('searchResults.additionalServices') }}</h2>
    </div>

    <div class="services-content">
      <!-- Insurance -->
      <div class="service-section">
        <h3 class="service-title">{{ $t('searchResults.insurance') }}</h3>
        <div class="service-options">
          <div 
            v-for="option in insuranceOptions" 
            :key="option.type"
            class="service-option"
            :class="{ 'selected': services.insurance.type === option.type }"
            @click="selectInsurance(option)"
          >
            <div class="option-selector">
              <div class="radio-button" :class="{ 'selected': services.insurance.type === option.type }">
                <div class="radio-dot"></div>
              </div>
            </div>
            <div class="option-name">{{ option.name }}</div>
            <div class="option-description">{{ option.coverage }}</div>
            <div class="option-price">
              <span v-if="option.included" class="included">{{ $t('searchResults.included') }}</span>
              <span v-else class="price">+ {{ option.price }} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COVID-19 Insurance -->
      <div class="service-section">
        <h3 class='service-title'>{{ $t('additionalServices.covidInsurance') }}</h3>
        <div class="service-options">
          <div 
            v-for="option in covidInsuranceOptions" 
            :key="option.type"
            class="service-option"
            :class="{ 'selected': services.covidInsurance.type === option.type }"
            @click="selectCovidInsurance(option)"
          >
            <div class="option-selector">
              <div class="radio-button" :class="{ 'selected': services.covidInsurance.type === option.type }">
                <div class="radio-dot"></div>
              </div>
            </div>
            <div class="option-name">{{ option.name }}</div>
            <div class="option-description">{{ option.description }}</div>
            <div class="option-price">
              <span v-if="option.type === 'INCLUDED'" class="included">{{ $t('searchResults.included') }}</span>
              <span v-else-if="option.type === 'OPT_OUT'" class="opt-out">{{ $t('additionalServices.decline') }}</span>
              <span v-else class="price">+ {{ option.price }} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transfer -->
      <div class="service-section">
        <h3 class='service-title'>{{ $t('additionalServices.transfer') }}</h3>
        <div class="service-options">
          <div 
            v-for="option in transferOptions" 
            :key="option.type"
            class="service-option"
            :class="{ 'selected': services.transfer.type === option.type }"
            @click="selectTransfer(option)"
          >
            <div class="option-selector">
              <div class="radio-button" :class="{ 'selected': services.transfer.type === option.type }">
                <div class="radio-dot"></div>
              </div>
            </div>
            <div class="option-name">{{ option.name }}</div>
            <div class="option-description">{{ option.description }}</div>
            <div class="option-price">
              <span v-if="option.included" class="included">{{ $t('searchResults.included') }}</span>
              <span v-else class="price">+ {{ option.price }} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Notes -->
      <div class="service-section">
        <h3 class='service-title'>{{ $t('additionalServices.bookingNotes') }}</h3>
        <div class="notes-grid">
          <label 
            v-for="note in bookingNotes" 
            :key="note.key"
            class="note-option"
          >
            <input 
              type="checkbox" 
              :checked="getNoteValue(note.key)"
              @change="handleCheckboxChange(note.key, $event)"
              class="note-checkbox"
            />
            <div class="radio-button" :class="{ selected: getNoteValue(note.key) }">
              <div class="radio-dot"></div>
            </div>
            <span class="note-label">{{ note.label }}</span>
          </label>
        </div>
        
        <div class="comment-section">
          <label class="comment-label">{{ $t('additionalServices.comment') }}</label>
          <textarea
            :value="props.notes.comment"
            @input="handleTextareaChange($event)"
            :placeholder="$t('additionalServices.enterComment')"
            class="comment-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdditionalServices, BookingNotes } from '../../types/booking'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

interface Props {
  services: AdditionalServices
  notes: BookingNotes
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:services': [services: Partial<AdditionalServices>]
  'update:notes': [notes: Partial<BookingNotes>]
}>()

const { t: $t } = useI18n()

// Helper functions for type safety
const getNoteValue = (key: string): boolean => {
  return !!(props.notes as Record<string, unknown>)[key]
}

const handleCheckboxChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  updateNote(key, target?.checked || false)
}

const handleTextareaChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  updateNote('comment', target?.value || '')
}

// Insurance options
const insuranceOptions = computed(() => [
  {
    type: 'STANDARD' as const,
    name: 'STANDARD 10000 EUR',
    coverage: $t('additionalServices.standardInsurance'),
    price: 0,
    included: true
  },
  {
    type: 'STANDARD_PLUS' as const,
    name: 'STANDARD PLUS TR 30 000 EUR',
    coverage: $t('additionalServices.extendedInsurance'),
    price: 25,
    included: false
  },
  {
    type: 'NONE' as const,
    name: $t('additionalServices.noInsurance'),
    coverage: $t('additionalServices.insuranceDecline'),
    price: 0,
    included: false
  }
])

// COVID-19 Insurance options
const covidInsuranceOptions = computed(() => [
  {
    type: 'INCLUDED' as const,
    name: $t('additionalServices.covidIncluded'),
    description: $t('additionalServices.covidInsuranceIncluded'),
    price: 0
  },
  {
    type: 'OPT_OUT' as const,
    name: $t('additionalServices.declineCovid'),
    description: $t('additionalServices.covidInsuranceDecline'),
    price: 0
  },
  {
    type: 'COVID_19' as const,
    name: 'COVID-19',
    description: $t('additionalServices.additionalCovid'),
    price: 15
  }
])

// Transfer options
const transferOptions = computed(() => [
  {
    type: 'GROUP' as const,
    name: 'GROUP (BUS)',
    description: $t('additionalServices.groupBus'),
    price: 0,
    included: true
  },
  {
    type: 'INDIVIDUAL' as const,
    name: 'INDIVIDUAL TRANSFER',
    description: $t('additionalServices.individualTransfer'),
    price: 95,
    included: false
  },
  {
    type: 'VIP' as const,
    name: 'VIP IND TRANSFER',
    description: $t('additionalServices.vipTransfer'),
    price: 150,
    included: false
  }
])

// Booking notes
const bookingNotes = [
  { key: 'honeymooners', label: $t('additionalServices.honeymooners') },
  { key: 'regularGuest', label: $t('additionalServices.regularGuest') },
  { key: 'twinBeds', label: $t('additionalServices.twinBeds') },
  { key: 'groundFloor', label: $t('additionalServices.groundFloor') },
  { key: 'notGroundFloor', label: $t('additionalServices.notGroundFloor') },
  { key: 'babyCot', label: $t('additionalServices.babyCot') },
  { key: 'handicapAccessible', label: $t('additionalServices.handicapAccessible') },
  { key: 'doubleBed', label: $t('additionalServices.doubleBed') }
]

// Methods
const selectInsurance = (option: { type: 'STANDARD' | 'STANDARD_PLUS' | 'NONE'; coverage: string; price: number; included: boolean }) => {
  emit('update:services', {
    insurance: {
      type: option.type,
      coverage: option.coverage,
      price: option.price,
      included: option.included
    }
  })
}

const selectCovidInsurance = (option: { type: 'INCLUDED' | 'OPT_OUT' | 'COVID_19'; price: number }) => {
  emit('update:services', {
    covidInsurance: {
      type: option.type,
      price: option.price
    }
  })
}

const selectTransfer = (option: { type: 'GROUP' | 'INDIVIDUAL' | 'VIP'; price: number; included: boolean }) => {
  emit('update:services', {
    transfer: {
      type: option.type,
      price: option.price,
      included: option.included
    }
  })
}

const updateNote = (key: string, value: string | number | boolean) => {
  emit('update:notes', { [key]: value })
}
</script>

<style scoped>
.additional-services-block {
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
  margin: 0 0 1.5rem;
}

.services-content {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.service-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.service-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.service-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.service-option {
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
}

.service-option:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(26, 60, 97, 0.1);
}

.service-option.selected {
  border-color: var(--color-primary);
  border-width: 1px;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(26, 60, 97, 0.15);
}

.option-selector {
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-name {
  font-weight: 600;
  color: var(--color-secondary);
  font-size: 0.875rem;
}

.option-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.option-price {
  text-align: right;
}

.included {
  color: var(--color-success);
  font-weight: 600;
  font-size: 0.875rem;
}

.opt-out {
  color: var(--color-warning);
  font-weight: 600;
  font-size: 0.875rem;
}

.price {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
}


/* Стили radio-button и radio-dot перенесены в buttons-consolidated.css */

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.note-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  min-width: 0;
}

.note-option .radio-button {
  flex-shrink: 0;
}

.note-option:hover {
  background: var(--color-background);
}

.note-checkbox {
  display: none;
}

.note-label {
  font-size: 0.875rem;
  color: var(--color-secondary);
  user-select: none;
}

.comment-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 60, 97, 0.1);
}

@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .service-option {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 0.5rem;
  }
  
  .option-selector {
    grid-row: 1 / 3;
  }
  
  .option-name {
    grid-column: 2;
    grid-row: 1;
  }
  
  .option-description {
    grid-column: 2;
    grid-row: 2;
  }
  
  .option-price {
    grid-column: 1 / 3;
    grid-row: 3;
    text-align: left;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-light);
  }
}
</style>
