<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Отправить уведомление</h2>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="user_id">Пользователь *</label>
          <select 
            id="user_id" 
            v-model="form.user_id" 
            required
            class="form-select"
          >
            <option value="">Выберите пользователя</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ getUserDisplayName(user) }} ({{ user.email }})
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="title">Заголовок *</label>
          <input 
            id="title"
            v-model="form.title" 
            type="text" 
            required
            maxlength="255"
            class="form-input"
            placeholder="Введите заголовок уведомления"
          />
        </div>
        
        <div class="form-group">
          <label for="message">Сообщение *</label>
          <textarea 
            id="message"
            v-model="form.message" 
            required
            maxlength="2000"
            rows="4"
            class="form-textarea"
            placeholder="Введите текст сообщения"
          ></textarea>
          <div class="char-count">{{ form.message.length }}/2000</div>
        </div>
        
        <div class="form-group">
          <label for="notification_type">Тип уведомления *</label>
          <select 
            id="notification_type" 
            v-model="form.notification_type" 
            required
            class="form-select"
          >
            <option value="info">Информация</option>
            <option value="success">Успех</option>
            <option value="warning">Предупреждение</option>
            <option value="error">Ошибка</option>
            <option value="booking_update">Обновление бронирования</option>
            <option value="system">Система</option>
            <option value="admin_message">Сообщение админа</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Каналы доставки *</label>
          <div class="channels-grid">
            <label v-for="channel in deliveryChannels" :key="channel.value" class="channel-option">
              <input 
                type="checkbox" 
                :value="channel.value"
                v-model="form.delivery_channels"
                class="channel-checkbox"
              />
              <span class="channel-label">
                <span :class="['channel-icon', `icon-${channel.value}`]">
                  {{ channel.icon }}
                </span>
                {{ channel.label }}
              </span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="metadata">Дополнительные данные (JSON)</label>
          <textarea 
            id="metadata"
            v-model="metadataJson" 
            rows="3"
            class="form-textarea"
            placeholder='{"key": "value"}'
          ></textarea>
          <div v-if="metadataError" class="error-message">{{ metadataError }}</div>
        </div>
      </form>
      
      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-outline">
          Отмена
        </button>
        <button 
          type="submit" 
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
          class="btn btn-primary"
        >
          <span v-if="loading">Отправка...</span>
          <span v-else>Отправить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminNotificationsApi } from '@/composables/useNotificationsApi'
import { useUsersApi, type User } from '@/composables/useUsersApi'
import type { NotificationFormData, DeliveryChannel } from '@/types/notifications'

const emit = defineEmits<{
  close: []
  created: []
}>()

const authStore = useAuthStore()
const { loading, error, createNotification } = useAdminNotificationsApi()
const { loading: usersLoading, getUsers, searchUsers } = useUsersApi()

// Form data
const form = ref<NotificationFormData & { user_id: number | null }>({
  user_id: null,
  title: '',
  message: '',
  notification_type: 'info',
  delivery_channels: ['in_app'],
  metadata: {}
})

const metadataJson = ref('')
const metadataError = ref('')

// Users list
const users = ref<User[]>([])
const userSearchQuery = ref('')

// Delivery channels
const deliveryChannels = ref([
  { value: 'in_app', label: 'В приложении', icon: '📱' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'push', label: 'Push-уведомления', icon: '🔔' },
  { value: 'webhook', label: 'Webhook', icon: '🔗' }
])

// Computed
const isFormValid = computed(() => {
  return form.value.user_id && 
         form.value.title.trim() && 
         form.value.message.trim() && 
         form.value.delivery_channels.length > 0 &&
         !metadataError.value
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  try {
    // Parse metadata
    let metadata = {}
    if (metadataJson.value.trim()) {
      try {
        metadata = JSON.parse(metadataJson.value)
      } catch (e) {
        metadataError.value = 'Неверный формат JSON'
        return
      }
    }
    
    const notificationData: NotificationFormData = {
      title: form.value.title,
      message: form.value.message,
      notification_type: form.value.notification_type,
      delivery_channels: form.value.delivery_channels,
      metadata
    }
    
    await createNotification(notificationData, form.value.user_id!)
    emit('created')
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const resetForm = () => {
  form.value = {
    user_id: null,
    title: '',
    message: '',
    notification_type: 'info',
    delivery_channels: ['in_app'],
    metadata: {}
  }
  metadataJson.value = ''
  metadataError.value = ''
}

// Watch metadata JSON for validation
const validateMetadata = () => {
  if (!metadataJson.value.trim()) {
    metadataError.value = ''
    return
  }
  
  try {
    JSON.parse(metadataJson.value)
    metadataError.value = ''
  } catch (e) {
    metadataError.value = 'Неверный формат JSON'
  }
}

// Methods
const getUserDisplayName = (user: User): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  } else if (user.first_name) {
    return user.first_name
  } else {
    return user.email.split('@')[0]
  }
}

const loadUsers = async () => {
  try {
    console.log('Loading users for create modal...')
    const response = await getUsers({ per_page: 100 })
    console.log('Users loaded for create modal:', response.data.users.length)
    users.value = response.data.users
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

const searchUsersHandler = async () => {
  if (!userSearchQuery.value.trim()) {
    await loadUsers()
    return
  }
  
  try {
    const searchResults = await searchUsers(userSearchQuery.value, 50)
    users.value = searchResults
  } catch (err) {
    console.error('Failed to search users:', err)
  }
}

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      console.log('User authenticated, loading users for create modal...')
      await loadUsers()
    } else {
      console.log('User not authenticated, clearing users...')
      users.value = []
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  console.log('NotificationCreateModal mounted')
})

// Watch metadataJson for validation
const originalMetadataJson = ref(metadataJson.value)
setInterval(() => {
  if (metadataJson.value !== originalMetadataJson.value) {
    originalMetadataJson.value = metadataJson.value
    validateMetadata()
  }
}, 500)
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-muted);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-top: 0.25rem;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.channel-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.channel-option:hover {
  background: var(--color-background-soft);
}

.channel-checkbox {
  margin: 0;
}

.channel-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.channel-icon {
  font-size: 1rem;
}

.error-message {
  color: #d32f2f;
  font-size: 0.75rem;
  margin-top: 0.25rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-background-soft);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
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
  
  .channels-grid {
    grid-template-columns: 1fr;
  }
}
</style>
