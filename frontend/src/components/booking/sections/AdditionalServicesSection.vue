<template>
  <div class="section" v-if="hasAdditionalServices">
    <div class="section-header">
      <div class="section-icon">🚌</div>
      <h3 class="section-title">Дополнительные услуги</h3>
    </div>
    <div class="section-content">
      <div class="service-item">
        <div class="service-header">
          <div class="service-icon">🛡️</div>
          <div class="service-title">Страхование</div>
        </div>
        <div class="service-details">
          <div class="service-name">{{ insuranceName }}</div>
          <div class="service-description">{{ insuranceDescription }}</div>
          <div class="service-price" v-if="!insuranceIncluded">
            + {{ insurancePrice }} EUR
          </div>
          <div class="service-price included" v-else>
            Включено
          </div>
        </div>
      </div>
      
      <div class="service-item">
        <div class="service-header">
          <div class="service-icon">🚐</div>
          <div class="service-title">Трансфер</div>
        </div>
        <div class="service-details">
          <div class="service-name">{{ transferName }}</div>
          <div class="service-description">{{ transferDescription }}</div>
          <div class="service-price" v-if="!transferIncluded">
            + {{ transferPrice }} EUR
          </div>
          <div class="service-price included" v-else>
            Включено
          </div>
        </div>
      </div>

      <div class="service-item" v-if="covidInsuranceType === 'COVID_19'">
        <div class="service-header">
          <div class="service-icon">🦠</div>
          <div class="service-title">COVID-19 страхование</div>
        </div>
        <div class="service-details">
          <div class="service-name">COVID-19</div>
          <div class="service-description">Дополнительная страховка от COVID-19</div>
          <div class="service-price">+ {{ covidInsurancePrice }} EUR</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdditionalServices } from '../../composables/useAdditionalServices'

interface Props {
  booking: any
  isAdminMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdminMode: false
})

const {
  hasAdditionalServices,
  getInsuranceName,
  getInsuranceDescription,
  getInsuranceIncluded,
  getInsurancePrice,
  getTransferName,
  getTransferDescription,
  getTransferIncluded,
  getTransferPrice,
  getCovidInsuranceType,
  getCovidInsurancePrice
} = useAdditionalServices(props.booking)

const insuranceName = computed(() => getInsuranceName())
const insuranceDescription = computed(() => getInsuranceDescription())
const insuranceIncluded = computed(() => getInsuranceIncluded())
const insurancePrice = computed(() => getInsurancePrice())
const transferName = computed(() => getTransferName())
const transferDescription = computed(() => getTransferDescription())
const transferIncluded = computed(() => getTransferIncluded())
const transferPrice = computed(() => getTransferPrice())
const covidInsuranceType = computed(() => getCovidInsuranceType())
const covidInsurancePrice = computed(() => getCovidInsurancePrice())
</script>

<script lang="ts">
export default {
  name: 'AdditionalServicesSection'
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

.service-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.service-item:last-child {
  margin-bottom: 0;
}

.service-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.service-icon {
  font-size: var(--font-size-lg);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.service-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
}

.service-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.4;
}

.service-price {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  text-align: right;
}

.service-price.included {
  color: var(--color-success);
}

@media (max-width: 768px) {
  .service-item {
    padding: var(--spacing-sm);
  }

  .service-header {
    gap: var(--spacing-xs);
  }

  .service-title {
    font-size: var(--font-size-sm);
  }

  .service-name,
  .service-description {
    font-size: var(--font-size-xs);
  }

  .service-price {
    font-size: var(--font-size-xs);
  }
}
</style>
