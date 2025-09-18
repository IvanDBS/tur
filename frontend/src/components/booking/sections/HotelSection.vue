<template>
  <div class="section">
    <div class="section-header">
      <div class="section-icon">🏨</div>
      <h3 class="section-title">Отель</h3>
    </div>
    <div class="section-content">
      <div class="hotel-main">
        <div class="hotel-info-line">
          <span class="hotel-name">{{ hotelName }}</span>
          <span class="hotel-category">{{ hotelCategory }}</span>
          <span class="hotel-location">{{ hotelCity }}</span>
        </div>
      </div>
      <div class="hotel-details">
        <div class="detail-row">
          <label>Тип комнаты</label>
          <span :class="{ 'missing-info': roomType.includes('не указан') }">{{ roomType }}</span>
        </div>
        <div class="detail-row">
          <label>Питание</label>
          <span :class="{ 'missing-info': mealPlan.includes('не указан') }">{{ mealPlan }}</span>
        </div>
        <div class="detail-row">
          <label>Даты проживания</label>
          <span :class="{ 'missing-info': checkInDate.includes('не указан') || checkOutDate.includes('не указан') }">
            {{ checkInDate }} - {{ checkOutDate }}
          </span>
        </div>
        <div class="detail-row">
          <label>Ночей</label>
          <span :class="{ 'missing-info': nights.includes('не указан') }">{{ nights }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const hotelName = computed(() => getHotelName())
const hotelCategory = computed(() => getHotelCategory())
const hotelCity = computed(() => getHotelCity())
const roomType = computed(() => getRoomType())
const mealPlan = computed(() => getMealPlan())
const checkInDate = computed(() => getCheckInDate())
const checkOutDate = computed(() => getCheckOutDate())
const nights = computed(() => getNights())
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
