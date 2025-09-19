<template>
  <div class="section" v-if="getTourists().length > 0">
    <div class="section-header">
      <div class="section-icon">👥</div>
      <h3 class="section-title">Туристы</h3>
    </div>
    <div class="section-content">
      <div v-for="(tourist, index) in getTourists()" :key="index" class="tourist-row">
        <div class="tourist-number">№ {{ index + 1 }}</div>
        <div class="tourist-details-grid">
          <div class="detail-item">
            <label>ФИО</label>
            <span class="tourist-name">{{ getTouristName(tourist) }}</span>
          </div>
          <div class="detail-item">
            <label>ДАТА РОЖДЕНИЯ</label>
            <span>{{ formatBirthday(tourist.birthDate || tourist.birth_date || tourist.birthday) }}</span>
          </div>
          <div class="detail-item">
            <label>ПАСПОРТ</label>
            <span>{{ getTouristPassport(tourist) }}</span>
          </div>
          <div class="detail-item">
            <label>ГРАЖДАНСТВО</label>
            <span>{{ tourist.nationality || 'MOLDOVA' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingData } from '../../composables/useBookingData'
import { formatBirthday } from '../../utils/dateUtils'

interface Props {
  booking: any
  isAdminMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdminMode: false
})

const { getTourists, getTouristName, getTouristPassport } = useBookingData(props.booking, props.isAdminMode)

</script>

<script lang="ts">
export default {
  name: 'TouristsSection'
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

.tourist-row {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.tourist-row:last-child {
  margin-bottom: 0;
}

.tourist-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  min-width: 40px;
  display: flex;
  align-items: center;
}

.tourist-details-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-start;
}

.detail-item label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.tourist-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .tourist-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .tourist-number {
    min-width: auto;
    margin-bottom: var(--spacing-sm);
  }

  .tourist-details-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>
