<template>
  <div class="section" v-if="getSelectedFlight()">
    <div class="section-header">
      <div class="section-icon">✈️</div>
      <h3 class="section-title">Перелет</h3>
    </div>
    <div class="section-content">
      <div v-for="(tourist, index) in getTourists()" :key="index" class="flight-ticket">
        <!-- Tourist Info -->
        <div class="tourist-info">
          <div class="tourist-number">№ {{ index + 1 }}</div>
          <div class="tourist-details">
            <div class="tourist-name">{{ getTouristName(tourist) }}</div>
            <div class="tourist-age">{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</div>
          </div>
        </div>
        
        <!-- Outbound Flight -->
        <div class="flight-segment outbound">
          <div class="flight-direction">
            <div class="direction-label">Туда</div>
          </div>
          <div class="flight-info">
            <div class="flight-columns">
              <div class="flight-column">
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.fromLabel') }}</span>
                  <span class="value">{{ getOutboundFrom() }}</span>
                </div>
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.travelTimeLabel') }}</span>
                  <span class="value">{{ getOutboundTravelTime() }}</span>
                </div>
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.flightLabel') }}</span>
                  <span class="value">{{ getOutboundFlightInfo() }}</span>
                </div>
              </div>
              <div class="flight-column">
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.toLabel') }}</span>
                  <span class="value">{{ getOutboundTo() }}</span>
                </div>
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.travelTimeLabel') }}</span>
                  <span class="value">{{ getInboundTravelTime() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Inbound Flight -->
        <div class="flight-segment inbound">
          <div class="flight-direction">
            <div class="direction-label">Обратно</div>
          </div>
          <div class="flight-info">
            <div class="flight-columns">
              <div class="flight-column">
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.fromLabel') }}</span>
                  <span class="value">{{ getInboundFrom() }}</span>
                </div>
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.travelTimeLabel') }}</span>
                  <span class="value">{{ getInboundTravelTime() }}</span>
                </div>
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.flightLabel') }}</span>
                  <span class="value">{{ getInboundFlightInfo() }}</span>
                </div>
              </div>
              <div class="flight-column">
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.toLabel') }}</span>
                  <span class="value">{{ getInboundTo() }}</span>
                </div>
                <div class="flight-info-line">
                  <span class="label">{{ $t('searchResults.travelTimeLabel') }}</span>
                  <span class="value">{{ getInboundTravelTime() }}</span>
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
import { useBookingData } from '../../composables/useBookingData'
import { useFlightData } from '../../composables/useFlightData'
import { formatBirthday } from '../../utils/dateUtils'
import { useI18n } from '../../composables/useI18n'

interface Props {
  booking: any
  isAdminMode?: boolean
  obsOrderDetails?: any
}

const props = withDefaults(defineProps<Props>(), {
  isAdminMode: false
})

const { t: $t } = useI18n()
const { getTourists, getTouristName } = useBookingData(props.booking, props.isAdminMode)
const { 
  getSelectedFlight,
  getOutboundFrom,
  getInboundFrom,
  getOutboundFlightInfo,
  getInboundFlightInfo,
  getOutboundTo,
  getInboundTo,
  getOutboundTravelTime,
  getInboundTravelTime
} = useFlightData(props.booking, props.obsOrderDetails)


</script>

<script lang="ts">
export default {
  name: 'FlightSection'
}
</script>

<style scoped>
.section {
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: white;
}

.section:last-child {
  margin-bottom: 0;
}

.section-content {
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.section-icon {
  font-size: var(--font-size-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.flight-ticket {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.flight-ticket:last-child {
  margin-bottom: 0;
}

.tourist-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 150px;
  flex-shrink: 0;
}

.tourist-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  text-align: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.tourist-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tourist-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  text-align: center;
}

.tourist-age {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
  text-align: center;
}

.flight-segment {
  display: flex;
  gap: var(--spacing-xs);
  flex: 1;
  padding: 14px;
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  margin-right: var(--spacing-xs);
}

.flight-segment:last-child {
  margin-right: 0;
}

.flight-direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 80px;
  flex-shrink: 0;
}

.direction-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  text-align: center;
}

.flight-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.flight-columns {
  display: flex;
  gap: var(--spacing-xs);
}

.flight-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.flight-info-line {
  display: flex;
  gap: var(--spacing-xs);
  align-items: flex-start;
}

.flight-info-line .label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-soft);
  min-width: 35px;
  flex-shrink: 0;
}

.flight-info-line .value {
  font-size: var(--font-size-xs);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  flex: 1;
}

@media (max-width: 768px) {
  .flight-ticket {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .tourist-info {
    min-width: auto;
  }

  .flight-columns {
    flex-direction: column;
  }
}
</style>
