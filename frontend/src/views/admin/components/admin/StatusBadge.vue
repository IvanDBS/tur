<template>
  <span :class="badgeClasses">
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
}

const props = defineProps<Props>()

const statusLabel = computed(() => {
  const labels = {
    pending: 'В ожидании',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    failed: 'Ошибка'
  }
  return labels[props.status] || props.status
})

const badgeClasses = computed(() => [
  'status-badge',
  `status-badge--${props.status}`
])
</script>

<script lang="ts">
export default {
  name: 'StatusBadge'
}
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge--pending {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-badge--confirmed {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-badge--cancelled {
  background: rgba(107, 114, 128, 0.1);
  color: #6B7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.status-badge--failed {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>
