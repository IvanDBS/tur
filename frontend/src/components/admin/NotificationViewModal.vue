<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Просмотр уведомления</h2>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <div class="notification-details">
          <!-- Basic Info -->
          <div class="detail-section">
            <h3>Основная информация</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID</label>
                <span>{{ notification.id }}</span>
              </div>
              <div class="detail-item">
                <label>Пользователь</label>
                <div class="user-info">
                  <div class="user-name">{{ notification.user.name }}</div>
                  <div class="user-email">{{ notification.user.email }}</div>
                </div>
              </div>
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
            </div>
          </div>
          
          <!-- Content -->
          <div class="detail-section">
            <h3>Содержание</h3>
            <div class="content-block">
              <div class="content-item">
                <label>Заголовок</label>
                <div class="content-value">{{ notification.title }}</div>
              </div>
              <div class="content-item">
                <label>Сообщение</label>
                <div class="content-value message-content">{{ notification.message }}</div>
              </div>
            </div>
          </div>
          
          <!-- Delivery Info -->
          <div class="detail-section">
            <h3>Доставка</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Каналы доставки</label>
                <div class="channels-list">
                  <span 
                    v-for="channel in notification.delivery_channels" 
                    :key="channel"
                    :class="['channel-badge', `channel-${channel}`]"
                  >
                    {{ getChannelLabel(channel) }}
                  </span>
                </div>
              </div>
              <div class="detail-item">
                <label>Статус доставки</label>
                <span :class="['status-badge', notification.delivered ? 'delivered' : 'pending']">
                  {{ notification.delivered ? 'Доставлено' : 'Ожидает доставки' }}
                </span>
              </div>
              <div v-if="notification.delivered_at" class="detail-item">
                <label>Доставлено</label>
                <span>{{ formatDate(notification.delivered_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Read Status -->
          <div class="detail-section">
            <h3>Статус прочтения</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Прочитано</label>
                <span :class="['read-badge', notification.read ? 'read' : 'unread']">
                  {{ notification.read ? 'Да' : 'Нет' }}
                </span>
              </div>
              <div v-if="notification.read_at" class="detail-item">
                <label>Прочитано</label>
                <span>{{ formatDate(notification.read_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Event Info -->
          <div v-if="notification.event_type" class="detail-section">
            <h3>Событие</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Тип события</label>
                <span class="event-type">{{ getEventTypeLabel(notification.event_type) }}</span>
              </div>
              <div v-if="notification.event_id" class="detail-item">
                <label>ID события</label>
                <span class="event-id">{{ notification.event_id }}</span>
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
import type { AdminNotification } from '@/types/notifications'

interface Props {
  notification: AdminNotification
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
    // TODO: Implement delete API call
    console.log('Delete notification')
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

const getChannelLabel = (channel: string) => {
  const labels = {
    in_app: 'В приложении',
    email: 'Email',
    sms: 'SMS',
    push: 'Push',
    webhook: 'Webhook'
  }
  return labels[channel as keyof typeof labels] || channel
}

const getEventTypeLabel = (eventType: string) => {
  const labels = {
    user_registered: 'Регистрация пользователя',
    booking_created: 'Создание бронирования',
    booking_confirmed: 'Подтверждение бронирования',
    booking_cancelled: 'Отмена бронирования',
    booking_changed: 'Изменение бронирования',
    booking_expired: 'Истечение бронирования',
    system_maintenance: 'Техническое обслуживание',
    system_error: 'Системная ошибка',
    admin_message: 'Сообщение админа'
  }
  return labels[eventType as keyof typeof labels] || eventType
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
  max-width: 800px;
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

.detail-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--color-background-soft);
}

.detail-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 0.875rem;
  color: var(--color-text);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: var(--color-text);
}

.user-email {
  font-size: 0.75rem;
  color: var(--color-text-soft);
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

.channels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.channel-badge {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 500;
  background: var(--color-primary-muted);
  color: var(--color-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.delivered {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

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

.event-type {
  font-family: monospace;
  background: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.event-id {
  font-family: monospace;
  background: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.content-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.content-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content-value {
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.5;
}

.message-content {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  white-space: pre-wrap;
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
