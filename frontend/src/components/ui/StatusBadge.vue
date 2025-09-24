<template>
  <span class="status-badge" :class="`status-${status}`">
    {{ getStatusLabel(status) }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: 'pending' | 'processing' | 'confirmed' | 'changed' | 'cancelled' | 'failed' | 'expired' | 'unknown' | 'N/A'
}

defineProps<Props>()

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'В ожидании',
    processing: 'Обрабатывается',
    confirmed: 'Подтверждено',
    changed: 'Изменено',
    cancelled: 'Отменено',
    failed: 'Ошибка',
    expired: 'Истекло',
    unknown: 'Неизвестно',
    'N/A': 'Не указано',
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-failed {
  background: #fecaca;
  color: #7f1d1d;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-changed {
  background: #fef3c7;
  color: #92400e;
}

.status-expired {
  background: #f3f4f6;
  color: #6b7280;
}

.status-unknown {
  background: #e5e7eb;
  color: #374151;
}

.status-N\/A {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
