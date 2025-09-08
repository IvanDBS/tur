<template>
  <div class="additional-services-block">
    <div class="block-header">
      <h2 class="block-title">Дополнительные услуги</h2>
    </div>

    <div class="services-content">
      <!-- Insurance -->
      <div class="service-section">
        <h3 class="service-title">Страховка</h3>
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
              <span v-if="option.included" class="included">включен</span>
              <span v-else class="price">+ {{ option.price }} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COVID-19 Insurance -->
      <div class="service-section">
        <h3 class="service-title">Страховка COVID-19</h3>
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
              <span v-if="option.type === 'INCLUDED'" class="included">включен</span>
              <span v-else-if="option.type === 'OPT_OUT'" class="opt-out">Отказываюсь</span>
              <span v-else class="price">+ {{ option.price }} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transfer -->
      <div class="service-section">
        <h3 class="service-title">Трансфер</h3>
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
              <span v-if="option.included" class="included">включен</span>
              <span v-else class="price">+ {{ option.price }} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Notes -->
      <div class="service-section">
        <h3 class="service-title">Примечания к бронированию</h3>
        <div class="notes-grid">
          <label 
            v-for="note in bookingNotes" 
            :key="note.key"
            class="note-option"
          >
            <input 
              type="checkbox" 
              :checked="notes[note.key]"
              @change="updateNote(note.key, $event.target.checked)"
              class="note-checkbox"
            />
            <span class="note-label">{{ note.label }}</span>
          </label>
        </div>
        
        <div class="comment-section">
          <label class="comment-label">Комментарий</label>
          <textarea
            :value="notes.comment"
            @input="updateNote('comment', $event.target.value)"
            placeholder="Введите комментарий"
            class="comment-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdditionalServices, BookingNotes } from '../../types/booking'

interface Props {
  services: AdditionalServices
  notes: BookingNotes
}

interface Emits {
  (e: 'update:services', services: Partial<AdditionalServices>): void
  (e: 'update:notes', notes: Partial<BookingNotes>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Insurance options
const insuranceOptions = [
  {
    type: 'STANDARD' as const,
    name: 'STANDARD 10000 EUR',
    coverage: 'Стандартная страховка',
    price: 0,
    included: true
  },
  {
    type: 'STANDARD_PLUS' as const,
    name: 'STANDARD PLUS TR 30 000 EUR',
    coverage: 'Расширенная страховка',
    price: 25,
    included: false
  },
  {
    type: 'NONE' as const,
    name: 'Без страховки',
    coverage: 'Отказ от страховки',
    price: 0,
    included: false
  }
]

// COVID-19 Insurance options
const covidInsuranceOptions = [
  {
    type: 'INCLUDED' as const,
    name: 'COVID-19 включен',
    description: 'Страховка COVID-19 включена в базовую страховку',
    price: 0
  },
  {
    type: 'OPT_OUT' as const,
    name: 'Отказываюсь от страховки COVID-19',
    description: 'Отказ от страховки COVID-19',
    price: 0
  },
  {
    type: 'COVID_19' as const,
    name: 'COVID-19',
    description: 'Дополнительная страховка COVID-19',
    price: 15
  }
]

// Transfer options
const transferOptions = [
  {
    type: 'GROUP' as const,
    name: 'GROUP (BUS)',
    description: 'Групповой трансфер на автобусе',
    price: 0,
    included: true
  },
  {
    type: 'INDIVIDUAL' as const,
    name: 'INDIVIDUAL TRANSFER',
    description: 'Индивидуальный трансфер',
    price: 95,
    included: false
  },
  {
    type: 'VIP' as const,
    name: 'VIP IND TRANSFER',
    description: 'VIP индивидуальный трансфер',
    price: 150,
    included: false
  }
]

// Booking notes
const bookingNotes = [
  { key: 'honeymooners', label: 'Honeymooners' },
  { key: 'regularGuest', label: "Hotel's regular guest(s)" },
  { key: 'twinBeds', label: 'Twin beds (according possibility)' },
  { key: 'groundFloor', label: 'Ground floor' },
  { key: 'notGroundFloor', label: 'NOT ground floor' },
  { key: 'babyCot', label: 'Baby cot' },
  { key: 'handicapAccessible', label: 'Handicap accessible room (according possibility)' },
  { key: 'doubleBed', label: 'Double bed/King size (according possibility)' }
]

// Methods
const selectInsurance = (option: typeof insuranceOptions[0]) => {
  emit('update:services', {
    insurance: {
      type: option.type,
      coverage: option.coverage,
      price: option.price,
      included: option.included
    }
  })
}

const selectCovidInsurance = (option: typeof covidInsuranceOptions[0]) => {
  emit('update:services', {
    covidInsurance: {
      type: option.type,
      price: option.price
    }
  })
}

const selectTransfer = (option: typeof transferOptions[0]) => {
  emit('update:services', {
    transfer: {
      type: option.type,
      price: option.price,
      included: option.included
    }
  })
}

const updateNote = (key: string, value: any) => {
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


.radio-button {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.radio-button.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.radio-button.selected .radio-dot {
  opacity: 1;
}

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
}

.note-option:hover {
  background: var(--color-background);
}

.note-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
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
