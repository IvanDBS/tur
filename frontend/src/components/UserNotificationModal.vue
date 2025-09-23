<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Уведомление</h2>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <div class="notification-details">
          <!-- Message -->
          <div class="message-section">
            <div class="message-header">
              <label>Тема</label>
              <div class="message-title">{{ notification.title }}</div>
            </div>
            <div class="message-content">
              {{ notification.message }}
            </div>
          </div>
          
          <!-- Basic Info -->
          <div class="detail-section">
            <h3>Информация</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Тип</label>
                <span :class="['type-badge', `type-${notification.type}`]">
                  {{ getTypeLabel(notification.type) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Создано</label>
                <span>{{ formatDate(notification.created_at) }}</span>
              </div>
              <div class="detail-item">
                <label>Статус</label>
                <span :class="['read-badge', notification.read ? 'read' : 'unread']">
                  {{ notification.read ? 'Прочитано' : 'Новое' }}
                </span>
              </div>
              <div v-if="notification.read_at" class="detail-item">
                <label>Прочитано</label>
                <span>{{ formatDate(notification.read_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Metadata -->
          <div v-if="notification.metadata && Object.keys(notification.metadata).length > 0" class="detail-section">
            <h3>Дополнительные данные</h3>
            <div class="metadata-block">
              <pre class="metadata-json">{{ formatMetadata(notification.metadata) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-outline">
          Закрыть
        </button>
        <button @click="deleteNotification" class="btn btn-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
          </svg>
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '@/types/notifications'

interface Props {
  notification: Notification
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  deleted: []
}>()

// Methods
const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const deleteNotification = () => {
  if (confirm('Вы уверены, что хотите удалить это уведомление?')) {
    emit('deleted')
    emit('close')
  }
}

// Utility functions
const getTypeLabel = (type: string) => {
  const labels = {
    info: 'Информация',
    success: 'Успех',
    warning: 'Предупреждение',
    error: 'Ошибка',
    booking_update: 'Обновление бронирования',
    system: 'Система',
    admin_message: 'Сообщение админа'
  }
  return labels[type as keyof typeof labels] || type
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMetadata = (metadata: Record<string, any>) => {
  return JSON.stringify(metadata, null, 2)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000000;
  padding: 1rem;
  box-sizing: border-box;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-soft);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.notification-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.message-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.message-header {
  margin-bottom: 1rem;
}

.message-header label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 0.5rem;
}

.message-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.message-content {
  font-size: 1rem;
  color: var(--color-text);
  line-height: 1.6;
  white-space: pre-wrap;
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.detail-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--color-background-soft);
}

.detail-section h3 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 0.875rem;
  color: var(--color-text);
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.type-info { background: #e3f2fd; color: #1976d2; }
.type-success { background: #e8f5e8; color: #2e7d32; }
.type-warning { background: #fff3e0; color: #f57c00; }
.type-error { background: #ffebee; color: #d32f2f; }
.type-booking_update { background: #f3e5f5; color: #7b1fa2; }
.type-system { background: #f5f5f5; color: #616161; }
.type-admin_message { background: #e8f5e8; color: #2e7d32; }

.read-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.read-badge.read {
  background: #e8f5e8;
  color: #2e7d32;
}

.read-badge.unread {
  background: #ffebee;
  color: #d32f2f;
}


.metadata-block {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.metadata-json {
  margin: 0;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--color-text);
  background: var(--color-background-soft);
  overflow-x: auto;
  white-space: pre;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-outline:hover {
  background: var(--color-background-soft);
}

.btn-danger {
  background: #d32f2f;
  color: white;
}

.btn-danger:hover {
  background: #b71c1c;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: calc(100vh - 1rem);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-section {
    padding: 1rem;
  }
}
</style>
