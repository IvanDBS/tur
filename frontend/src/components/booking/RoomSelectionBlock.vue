<template>
  <div class="room-selection-block">
    <div class="block-header">
      <h2 class="block-title">Выбор варианта проживания</h2>
    </div>

    <div class="room-content">
      <div class="room-options">
        <div 
          v-for="roomOption in roomOptions" 
          :key="roomOption.id"
          class="room-option"
          :class="{ 'selected': selectedRoomOption?.id === roomOption.id }"
          @click="selectRoomOption(roomOption)"
        >
          <div class="room-option-content">
            <!-- Selection Indicator -->
            <div class="selection-indicator">
              <div class="radio-button" :class="{ 'selected': selectedRoomOption?.id === roomOption.id }">
                <div class="radio-dot"></div>
              </div>
            </div>
            
            <!-- Room Details -->
            <div class="room-details">
              <div class="room-header">
                <div class="room-name">{{ roomOption.room.name }}</div>
                <div class="room-price">
                  <span class="price-amount">{{ formatPrice(roomOption.price.amount) }}</span>
                  <span class="price-currency">{{ roomOption.price.currency }}</span>
                </div>
              </div>
              
              <div class="room-info">
                <div class="info-row">
                  <span class="info-label">Размещение:</span>
                  <span class="info-value">{{ roomOption.placement.name }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Питание:</span>
                  <span class="info-value meal-type" :class="getMealClass(roomOption.meal.name)">
                    {{ roomOption.meal.full_name }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Тип цены:</span>
                  <span class="info-value price-type">{{ roomOption.price.type }}</span>
                </div>
              </div>
            </div>
            
            <!-- Price Details -->
            <div class="price-details">
              <div class="price-breakdown">
                <div class="breakdown-row">
                  <span class="breakdown-label">Базовая цена:</span>
                  <span class="breakdown-value">{{ formatPrice(roomOption.price.netto) }} {{ roomOption.price.currency }}</span>
                </div>
                <div class="breakdown-row">
                  <span class="breakdown-label">Комиссия:</span>
                  <span class="breakdown-value">{{ formatPrice(roomOption.price.commission) }} {{ roomOption.price.currency }}</span>
                </div>
                <div class="breakdown-row total">
                  <span class="breakdown-label">Итого:</span>
                  <span class="breakdown-value">{{ formatPrice(roomOption.price.amount) }} {{ roomOption.price.currency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SearchResult, GroupedSearchResult, RoomOption } from '../../types/search'
import type { SelectedRoom } from '../../types/booking'
import { formatPrice } from '../../utils/stringUtils'

interface Props {
  searchResult: SearchResult | GroupedSearchResult
  selectedRoom?: SelectedRoom
}

interface Emits {
  (e: 'update:selectedRoom', room: SelectedRoom): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const isGroupedResult = computed(() => 'roomOptions' in props.searchResult)

const roomOptions = computed(() => {
  if (isGroupedResult.value) {
    const groupedResult = props.searchResult as GroupedSearchResult
    return groupedResult.roomOptions || []
  } else {
    // For regular SearchResult, create a single room option
    const result = props.searchResult as SearchResult
    return [{
      id: `${result.accommodation.room.id}-${result.accommodation.meal.id}`,
      room: result.accommodation.room,
      meal: result.accommodation.meal,
      placement: result.accommodation.placement,
      price: result.price,
      flightOptions: []
    }]
  }
})

const selectedRoomOption = computed(() => {
  if (!props.selectedRoom || !roomOptions.value) return null
  
  const options = roomOptions.value as RoomOption[]
  return options.find(option => 
    option.room.id === props.selectedRoom?.room.id &&
    option.meal.id === props.selectedRoom?.meal.id
  ) || null
})

// Methods
const selectRoomOption = (roomOption: RoomOption) => {
  const selectedRoom: SelectedRoom = {
    room: roomOption.room,
    meal: roomOption.meal,
    placement: roomOption.placement,
    price: roomOption.price
  }
  
  emit('update:selectedRoom', selectedRoom)
}

const getMealClass = (mealName: string): string => {
  const meal = mealName.toLowerCase()
  if (meal.includes('all inclusive') || meal.includes('ultra all inclusive')) {
    return 'all-inclusive'
  } else if (meal.includes('half board') || meal.includes('hb')) {
    return 'half-board'
  } else if (meal.includes('bed and breakfast') || meal.includes('bb')) {
    return 'bed-breakfast'
  } else if (meal.includes('full board') || meal.includes('fb')) {
    return 'full-board'
  }
  return 'other'
}
</script>

<style scoped>
.room-selection-block {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.block-header {
  background: var(--color-background-secondary);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.block-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.room-content {
  padding: 1.5rem;
}

.room-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.room-option {
  border: 2px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-background);
}

.room-option:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.room-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.room-option-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
}

.selection-indicator {
  flex-shrink: 0;
  margin-top: 0.25rem;
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
  background: var(--color-background);
}

.radio-button.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-background);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.radio-button.selected .radio-dot {
  opacity: 1;
}

.room-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.room-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.room-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-currency {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.info-label {
  color: var(--color-text-muted);
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: var(--color-text);
  font-weight: 500;
}

.meal-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.meal-type.all-inclusive {
  background: var(--color-success-light);
  color: var(--color-success);
}

.meal-type.half-board {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.meal-type.bed-breakfast {
  background: var(--color-info-light);
  color: var(--color-info);
}

.meal-type.full-board {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.meal-type.other {
  background: var(--color-background-secondary);
  color: var(--color-text-muted);
}

.price-type {
  font-style: italic;
  color: var(--color-text-muted);
}

.price-details {
  flex-shrink: 0;
  min-width: 200px;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.breakdown-row.total {
  border-top: 1px solid var(--color-border);
  padding-top: 0.5rem;
  margin-top: 0.25rem;
  font-weight: 600;
}

.breakdown-label {
  color: var(--color-text-muted);
}

.breakdown-value {
  color: var(--color-text);
  font-weight: 500;
}

.breakdown-row.total .breakdown-value {
  color: var(--color-primary);
  font-weight: 700;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .room-option-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .room-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .room-price {
    align-items: flex-start;
  }
  
  .price-details {
    min-width: auto;
    width: 100%;
  }
  
  .room-info {
    gap: 0.375rem;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>
