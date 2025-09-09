<template>
  <div class="flight-selection-block">
    <div class="block-header">
      <h2 class="block-title">Выбор авиаперелета</h2>
    </div>

    <div class="flight-content">
      <div class="flight-options">
        <div 
          v-for="(flightPair, index) in flightPairs" 
          :key="`flight-${index}-${flightPair.id}`"
          class="flight-pair-option"
          :class="{ 'selected': selectedFlightPair?.id === flightPair.id }"
          @click="selectFlightPair(flightPair)"
        >
          <div class="flight-pair-content">
            <!-- Selection Indicator -->
            <div class="selection-indicator">
              <div class="radio-button" :class="{ 'selected': selectedFlightPair?.id === flightPair.id }">
                <div class="radio-dot"></div>
              </div>
            </div>
            
            <!-- Outbound Flight -->
            <div class="flight-column outbound">
              <div class="flight-route">
                <div class="direction-header">
                  <div class="direction-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
                    </svg>
                    <span>Туда</span>
                  </div>
                </div>
                
                <div class="flight-sections">
                  <div class="flight-section departure">
                    <div class="flight-info-line">
                      <span class="label">Из:</span>
                      <span class="value">{{ flightPair.outbound.airports.from.name }} ({{ flightPair.outbound.airports.from.prefix }})</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Вылет:</span>
                      <span class="value">{{ flightPair.outbound.departure.time }} {{ formatDateWithDay(flightPair.outbound.departure.date) }}</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Рейс:</span>
                      <span class="value">{{ flightPair.outbound.airline.iata_code }} {{ flightPair.outbound.name }} ({{ flightPair.outbound.airline.airline }})</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Наличие:</span>
                      <span class="value availability-status">
                        <span class="availability-indicator"></span>
                        Под запрос
                      </span>
                    </div>
                  </div>
                  
                  <div class="flight-section arrival">
                    <div class="flight-info-line">
                      <span class="label">В:</span>
                      <span class="value">{{ flightPair.outbound.airports.to.name }} ({{ flightPair.outbound.airports.to.prefix }})</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Прилет:</span>
                      <span class="value">{{ flightPair.outbound.arrival.time }} {{ formatDateWithDay(flightPair.outbound.arrival.date) }}</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Время в пути:</span>
                      <span class="value">{{ calculateDuration(flightPair.outbound.departure, flightPair.outbound.arrival) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <!-- Inbound Flight -->
            <div class="flight-column inbound">
              <div class="flight-route">
                <div class="direction-header">
                  <div class="direction-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
                    </svg>
                    <span>Обратно</span>
                  </div>
                </div>
                
                <div class="flight-sections">
                  <div class="flight-section departure">
                    <div class="flight-info-line">
                      <span class="label">Из:</span>
                      <span class="value">{{ flightPair.inbound.airports.from.name }} ({{ flightPair.inbound.airports.from.prefix }})</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Вылет:</span>
                      <span class="value">{{ flightPair.inbound.departure.time }} {{ formatDateWithDay(flightPair.inbound.departure.date) }}</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Рейс:</span>
                      <span class="value">{{ flightPair.inbound.airline.iata_code }} {{ flightPair.inbound.name }} ({{ flightPair.inbound.airline.airline }})</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Наличие:</span>
                      <span class="value availability-status">
                        <span class="availability-indicator"></span>
                        Под запрос
                      </span>
                    </div>
                  </div>
                  
                  <div class="flight-section arrival">
                    <div class="flight-info-line">
                      <span class="label">В:</span>
                      <span class="value">{{ flightPair.inbound.airports.to.name }} ({{ flightPair.inbound.airports.to.prefix }})</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Прилет:</span>
                      <span class="value">{{ flightPair.inbound.arrival.time }} {{ formatDateWithDay(flightPair.inbound.arrival.date) }}</span>
                    </div>
                    <div class="flight-info-line">
                      <span class="label">Время в пути:</span>
                      <span class="value">{{ calculateDuration(flightPair.inbound.departure, flightPair.inbound.arrival) }}</span>
                    </div>
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
import type { SearchResult, GroupedSearchResult, SearchResultTickets, SearchResultPrice } from '../../types/search'
import type { SelectedFlight, FlightSegment, SelectedRoom } from '../../types/booking'
import { formatDateWithDay, calculateDuration } from '../../utils/dateUtils'

interface Props {
  searchResult: SearchResult | GroupedSearchResult
  selectedFlight?: SelectedFlight
  selectedRoom?: SelectedRoom
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedFlight': [flight: SelectedFlight]
}>()

// Computed
const isGroupedResult = computed(() => 'roomOptions' in props.searchResult)

const flightOptions = computed(() => {
  // Processing search result for flight options
  
  if (isGroupedResult.value) {
    const groupedResult = props.searchResult as GroupedSearchResult
    
    // Если выбрана комната, показываем только перелеты для этой комнаты
    if (props.selectedRoom) {
      const selectedRoomOption = groupedResult.roomOptions?.find(option => 
        option.room.id === props.selectedRoom?.room.id &&
        option.meal.id === props.selectedRoom?.meal.id &&
        option.placement.id === props.selectedRoom?.placement.id
      )
      
      if (selectedRoomOption?.flightOptions) {
        return selectedRoomOption.flightOptions
      }
    }
    
    // Если комната не выбрана, собираем все уникальные flightOptions
    const allFlightOptions: (SearchResultTickets & { price: SearchResultPrice })[] = []
    const seenFlights = new Set<string>()
    
    groupedResult.roomOptions?.forEach(roomOption => {
      if (roomOption.flightOptions) {
        roomOption.flightOptions.forEach(flightOption => {
          const flightKey = `${flightOption.from.id}_${flightOption.to.id}`
          if (!seenFlights.has(flightKey)) {
            seenFlights.add(flightKey)
            allFlightOptions.push(flightOption)
          }
        })
      }
    })
    
    return allFlightOptions
  } else {
    // For regular SearchResult, create a single flight option
    const regularResult = props.searchResult as SearchResult
    return regularResult.tickets ? [regularResult.tickets] : []
  }
})

// Create flight pairs from flight options
const flightPairs = computed(() => {
  return flightOptions.value.map((option) => {
    const outbound = option.from
    const inbound = option.to
    
    // Create unique ID for the flight pair
    const id = `${outbound.id}_${inbound.id}`
    
    // Get airline info (assuming same airline for both flights)
    const airline = outbound.airline.airline
    const flightNumbers = `${outbound.airline.iata_code} ${outbound.name} / ${inbound.airline.iata_code} ${inbound.name}`
    
    // Calculate total duration
    const outboundDuration = calculateDuration(outbound.departure, outbound.arrival)
    const inboundDuration = calculateDuration(inbound.departure, inbound.arrival)
    const totalDuration = `${outboundDuration} + ${inboundDuration}`
    
    // Get tickets info (use outbound tickets as reference)
    const tickets = outbound.tickets || inbound.tickets
    
    return {
      id,
      airline,
      flightNumbers,
      outbound,
      inbound,
      totalDuration,
      tickets
    }
  })
})

const selectedFlightPair = computed(() => {
  if (!props.selectedFlight) return null
  
  const outboundId = props.selectedFlight.outbound.id
  const inboundId = props.selectedFlight.inbound.id
  const pairId = `${outboundId}_${inboundId}`
  
  return flightPairs.value.find(pair => pair.id === pairId) || null
})

// Methods
// Функции formatDateWithDay и calculateDuration теперь импортируются из dateUtils

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectFlightPair = (flightPair: any) => {
  const newSelectedFlight: SelectedFlight = {
    outbound: flightPair.outbound as FlightSegment,
    inbound: flightPair.inbound as FlightSegment
  }
  emit('update:selectedFlight', newSelectedFlight)
}
</script>

<style scoped>
.flight-selection-block {
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

.flight-content {
  padding: 0 1.5rem 1.5rem;
}

.flight-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flight-pair-option {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  position: relative;
}

.flight-pair-option::before {
  content: '';
  position: absolute;
  left: calc(50% + 1rem);
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, var(--color-border), transparent);
  transform: translateX(-50%);
}

.flight-pair-option:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(26, 60, 97, 0.1);
}

.flight-pair-option.selected {
  border-color: var(--color-primary);
  border-width: 1px;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(26, 60, 97, 0.15);
}

.selection-indicator {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 0.25rem;
}

/* Стили radio-button и radio-dot перенесены в buttons-consolidated.css */

.flight-pair-content {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
  align-items: start;
}

.flight-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flight-route {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0;
  margin: 0;
}

.direction-header {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.direction-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.direction-label .flight-duration {
  font-size: 0.7rem;
  color: var(--color-primary);
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
}

.flight-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 0.25rem;
}

.flight-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0;
  margin: 0;
}

.flight-section.departure {
  text-align: left;
}

.flight-section.arrival {
  text-align: left;
}


.city-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: 0;
}

.flight-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0;
  margin: 0;
}

.flight-info-line {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.flight-info-line .label {
  color: var(--color-text-muted);
  font-weight: 500;
  min-width: 45px;
  margin-left: 0;
}

.flight-info-line .value {
  color: var(--color-secondary);
  font-weight: 600;
  flex: 1;
}


.flight-pair-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
}

.tickets-info {
  font-size: 0.875rem;
}

.tickets-count {
  color: var(--color-success);
  font-weight: 500;
}

.tickets-on-request {
  color: var(--color-warning);
  font-weight: 500;
}

.availability-status {
  color: var(--color-warning);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.availability-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff8c00;
  opacity: 0.6;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

.flight-duration {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

@media (max-width: 768px) {
  .flight-pair-content {
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }
  
  
  .flight-pair-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .flight-sections {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .flight-section.departure,
  .flight-section.arrival {
    text-align: left;
  }
  
  .flight-info-line {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .flight-info-line .label {
    margin-left: 0;
    min-width: auto;
  }
  
  .flight-info-line .value {
    text-align: left;
    flex: none;
  }
}
</style>
