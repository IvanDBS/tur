<template>
  <div class="section">
    <div class="section-header">
      <div class="section-icon">🏨</div>
      <h3 class="section-title">Отель</h3>
    </div>
    <div class="section-content">
      <div class="hotel-main">
        <div class="hotel-info-line">
          <span class="hotel-name">{{ getHotelName() }}</span>
          <span class="hotel-category">{{ getHotelCategory() }}</span>
          <span class="hotel-location">{{ getHotelCity() }}</span>
        </div>
      </div>
      <div class="hotel-details">
        <div class="detail-row">
          <label>Тип комнаты</label>
          <span :class="{ 'missing-info': getRoomType().includes('не указан') }">{{ getRoomType() }}</span>
        </div>
        <div class="detail-row">
          <label>Питание</label>
          <span :class="{ 'missing-info': getMealPlan().includes('не указан') }">{{ getMealPlan() }}</span>
        </div>
        <div class="detail-row">
          <label>Даты проживания</label>
          <span :class="{ 'missing-info': getCheckInDate().includes('не указан') || getCheckOutDate().includes('не указан') }">
            {{ getCheckInDate() }} - {{ getCheckOutDate() }}
          </span>
        </div>
        <div class="detail-row">
          <label>Ночей</label>
          <span :class="{ 'missing-info': getNights().toString().includes('не указан') }">{{ getNights() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingData } from '../../composables/useBookingData'

interface Props {
  booking: any
  isAdminMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdminMode: false
})

const { 
  getHotelName, 
  getHotelCategory, 
  getHotelCity, 
  getRoomType, 
  getMealPlan, 
  getCheckInDate, 
  getCheckOutDate, 
  getNights 
} = useBookingData(props.booking, props.isAdminMode)

</script>

<script lang="ts">
export default {
  name: 'HotelSection'
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

.hotel-main {
  margin-bottom: var(--spacing-lg);
}

.hotel-info-line {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.hotel-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.hotel-category {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.hotel-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.hotel-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-row label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-row span {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.detail-row span.missing-info {
  color: var(--color-text-soft);
  font-style: italic;
}

@media (max-width: 768px) {
  .hotel-details {
    grid-template-columns: 1fr;
  }
}
</style>
