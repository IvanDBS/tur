<template>
  <div v-if="isOpen" class="confirm-dialog-overlay" @click="handleBackdropClick">
    <div class="confirm-dialog" @click.stop>
      <div class="confirm-dialog-header">
        <div class="confirm-dialog-icon" :class="type">
          <svg v-if="type === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else-if="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <h3 class="confirm-dialog-title">{{ title }}</h3>
      </div>
      
      <div class="confirm-dialog-body">
        <p class="confirm-dialog-message">{{ message }}</p>
        <div v-if="details" class="confirm-dialog-details">
          <ul>
            <li v-for="detail in details" :key="detail">{{ detail }}</li>
          </ul>
        </div>
      </div>
      
      <div class="confirm-dialog-footer">
        <BaseButton
          variant="secondary"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton
          :variant="confirmVariant"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from './index'

interface Props {
  isOpen: boolean
  title: string
  message: string
  details?: string[]
  type?: 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirmVariant = computed(() => {
  switch (props.type) {
    case 'danger': return 'danger'
    case 'warning': return 'warning'
    default: return 'primary'
  }
})

const handleBackdropClick = (event: Event) => {
  if (event.target === event.currentTarget && !props.loading) {
    handleCancel()
  }
}

const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel')
  }
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-lg);
}

.confirm-dialog {
  background: white;
  border-radius: var(--border-radius-lg);
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.confirm-dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.confirm-dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-dialog-icon.danger {
  background: #fef2f2;
  color: #dc2626;
}

.confirm-dialog-icon.warning {
  background: #fffbeb;
  color: #d97706;
}

.confirm-dialog-icon.info {
  background: #eff6ff;
  color: var(--color-primary);
}

.confirm-dialog-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  line-height: 1.25;
}

.confirm-dialog-body {
  padding: var(--spacing-lg);
}

.confirm-dialog-message {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-base);
  color: var(--color-text-soft);
  line-height: 1.6;
}

.confirm-dialog-details {
  background: var(--color-background-soft);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  border-left: 4px solid var(--color-primary);
}

.confirm-dialog-details ul {
  margin: 0;
  padding-left: var(--spacing-md);
  color: var(--color-text-soft);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.confirm-dialog-details li {
  margin-bottom: var(--spacing-xs);
}

.confirm-dialog-details li:last-child {
  margin-bottom: 0;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .confirm-dialog-overlay {
    padding: var(--spacing-sm);
  }
  
  .confirm-dialog-header {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .confirm-dialog-footer {
    flex-direction: column-reverse;
  }
  
  .confirm-dialog-footer .btn {
    width: 100%;
  }
}
</style>
