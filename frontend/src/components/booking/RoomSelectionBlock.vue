<template>
  <div class="room-selection-block">
    <div class="block-header">
      <h2 class="block-title">{{ $t('searchResults.accommodationSelectionTitle') }}</h2>
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
              <div class="room-info-columns">
                <div class="room-column">
                  <div class="column-label">{{ $t('searchResults.roomTypeBooking') }}</div>
                  <div class="room-name">{{ roomOption.room.name }}</div>
                </div>
                <div class="room-column">
                  <div class="column-label">{{ $t('searchResults.mealsBooking') }}</div>
                  <div class="info-item">
                    {{ roomOption.meal.full_name }}
                  </div>
                </div>
                <div class="room-column">
                  <div class="column-label">{{ $t('searchResults.accommodationBooking') }}</div>
                  <div class="info-item">{{ roomOption.placement.name }}</div>
                </div>
                <div class="room-column price-column">
                  <div class="room-price">
                    <span class="price-amount">{{ formatPrice(getRoomPrice(roomOption)) }} €</span>
                  </div>
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
import type { SelectedRoom, SelectedFlight } from '../../types/booking'
import { formatPrice } from '../../utils/stringUtils'

interface Props {
  searchResult: SearchResult | GroupedSearchResult
  selectedRoom?: SelectedRoom
  selectedFlight?: SelectedFlight
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedRoom': [room: SelectedRoom]
  'reset:selectedFlight': []
}>()

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
const getRoomPrice = (roomOption: RoomOption): number => {
  // Если выбран перелет, ищем цену для комбинации комната + перелет
  if (props.selectedFlight && isGroupedResult.value) {
    const flightOption = roomOption.flightOptions?.find(option => 
      option.from.id === props.selectedFlight?.outbound.id &&
      option.to.id === props.selectedFlight?.inbound.id
    )
    
    if (flightOption?.price?.amount) {
      return flightOption.price.amount
    }
  }
  
  // Fallback: используем базовую цену комнаты
  return roomOption.price.amount
}

const selectRoomOption = (roomOption: RoomOption) => {
  const selectedRoom: SelectedRoom = {
    room: roomOption.room,
    meal: roomOption.meal,
    placement: roomOption.placement,
    price: roomOption.price
  }
  
  emit('update:selectedRoom', selectedRoom)
  
  // Сбрасываем выбранный перелет при смене комнаты
  emit('reset:selectedFlight')
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
  padding: 1.5rem 1.5rem 0;
}

.block-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 1.5rem;
}

.room-content {
  padding: 0 1.5rem 1.5rem;
}

.room-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.room-option {
  border: 1px solid var(--color-border);
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
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(26, 60, 97, 0.15);
}

.room-option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.selection-indicator {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

/* Стили radio-button и radio-dot перенесены в buttons-consolidated.css */

.room-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.room-info-columns {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.room-column {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.column-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-column {
  align-items: flex-end;
  text-align: right;
}

.room-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.room-price {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.price-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.room-info-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.info-item {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.info-separator {
  color: var(--color-border);
  font-weight: 300;
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


.price-type {
  font-style: italic;
  color: var(--color-text-muted);
}


/* Mobile Responsive */
@media (max-width: 768px) {
  .room-option-content {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .room-info-columns {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  
  .price-column {
    grid-column: 1 / -1;
    align-items: center;
    text-align: center;
    margin-top: 0.5rem;
  }
  
  .room-price {
    justify-content: center;
  }
  
  .column-label {
    font-size: 0.7rem;
  }
  
  .room-name,
  .info-item {
    font-size: 0.8rem;
  }
}
</style>
