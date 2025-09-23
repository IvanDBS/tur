<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Массовая рассылка уведомлений</h2>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
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
          <label>Выбор пользователей *</label>
          <div class="user-selection">
            <div class="selection-options">
              <label class="selection-option">
                <input 
                  type="radio" 
                  value="all" 
                  v-model="selectionType"
                  class="selection-radio"
                />
                <span>Все пользователи</span>
              </label>
              
              <label class="selection-option">
                <input 
                  type="radio" 
                  value="filtered" 
                  v-model="selectionType"
                  class="selection-radio"
                />
                <span>По фильтрам</span>
              </label>
              
              <label class="selection-option">
                <input 
                  type="radio" 
                  value="custom" 
                  v-model="selectionType"
                  class="selection-radio"
                />
                <span>Выбрать вручную</span>
              </label>
            </div>
            
            <!-- Filtered selection -->
            <div v-if="selectionType === 'filtered'" class="filter-section">
              <div class="filter-row">
                <select v-model="filters.registration_date" class="filter-select">
                  <option value="">Дата регистрации</option>
                  <option value="last_week">За последнюю неделю</option>
                  <option value="last_month">За последний месяц</option>
                  <option value="last_3_months">За последние 3 месяца</option>
                </select>
                
                <select v-model="filters.has_bookings" class="filter-select">
                  <option value="">Есть бронирования</option>
                  <option value="true">Да</option>
                  <option value="false">Нет</option>
                </select>
                
                <select v-model="filters.is_active" class="filter-select">
                  <option value="">Активность</option>
                  <option value="true">Активные</option>
                  <option value="false">Неактивные</option>
                </select>
              </div>
              
              <button @click="loadFilteredUsers" type="button" class="btn btn-outline">
                Применить фильтры
              </button>
            </div>
            
            <!-- Custom selection -->
            <div v-if="selectionType === 'custom'" class="custom-selection">
              <div class="user-search">
                <input 
                  v-model="userSearchQuery"
                  type="text"
                  placeholder="Поиск пользователей..."
                  class="form-input"
                />
                <button @click="searchUsersHandler" type="button" class="btn btn-outline">
                  Найти
                </button>
              </div>
              
              <!-- Show pre-selected users info -->
              <div v-if="props.preSelectedUsers && props.preSelectedUsers.length > 0" class="pre-selected-users-list">
                <h4>Пользователи из отфильтрованных заявок:</h4>
                <div class="user-list">
                  <div v-for="user in availableUsers" :key="user.id" class="user-item selected">
                    <span class="user-info">
                      <span class="user-name">{{ getUserDisplayName(user) }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </span>
                    <span class="selected-badge">✓</span>
                  </div>
                </div>
              </div>
              
              <!-- Regular user selection -->
              <div v-else class="user-list">
                <div v-for="user in availableUsers" :key="user.id" class="user-item">
                  <label class="user-checkbox">
                    <input 
                      type="checkbox" 
                      :value="user.id"
                      v-model="selectedUserIds"
                      class="user-checkbox-input"
                    />
                    <span class="user-info">
                      <span class="user-name">{{ getUserDisplayName(user) }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="selection-summary">
            <div v-if="preSelectedUsersInfo" class="pre-selected-info">
              <strong>{{ preSelectedUsersInfo }}</strong>
            </div>
            <strong>Выбрано пользователей: {{ selectedUsersCount }}</strong>
            <div v-if="selectedUsersCount > 1000" class="warning-message">
              ⚠️ Максимум 1000 пользователей за одну рассылку
            </div>
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
          <span v-else>Отправить ({{ selectedUsersCount }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useAdminNotificationsApi } from '../../composables/useNotificationsApi'
import { useUsersApi, type User } from '../../composables/useUsersApi'
import type { BulkNotificationData, DeliveryChannel } from '../../types/notifications'

const props = defineProps<{
  preSelectedUsers?: number[]
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const authStore = useAuthStore()
const { loading, error, bulkCreateNotifications } = useAdminNotificationsApi()
const { loading: usersLoading, getUsers, searchUsers, getFilteredUsers } = useUsersApi()

// Form data
const form = ref({
  title: '',
  message: '',
  notification_type: 'info' as 'info' | 'success' | 'warning' | 'error' | 'booking_update' | 'system' | 'admin_message',
  delivery_channels: ['in_app'] as DeliveryChannel[],
  metadata: {}
})

// Set default values for flight time change notification if pre-selected users are provided
if (props.preSelectedUsers && props.preSelectedUsers.length > 0) {
  form.value.title = 'Изменение времени вылета'
  form.value.message = 'Уважаемый клиент! Время вылета вашего рейса было изменено. Пожалуйста, проверьте актуальную информацию в вашем бронировании.'
  form.value.notification_type = 'warning'
  form.value.delivery_channels = ['in_app', 'email']
}

const metadataJson = ref('')
const metadataError = ref('')

// User selection
const selectionType = ref<'all' | 'filtered' | 'custom'>('all')
const selectedUserIds = ref<number[]>([])
const availableUsers = ref<User[]>([])
const allUsers = ref<User[]>([])

// Initialize with pre-selected users if provided
if (props.preSelectedUsers && props.preSelectedUsers.length > 0) {
  selectionType.value = 'custom'
  selectedUserIds.value = [...props.preSelectedUsers]
}

const userSearchQuery = ref('')
const filters = ref({
  registration_date: '',
  has_bookings: '',
  is_active: ''
})

// Delivery channels
const deliveryChannels = ref([
  { value: 'in_app', label: 'В приложении', icon: '📱' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'push', label: 'Push-уведомления', icon: '🔔' },
  { value: 'webhook', label: 'Webhook', icon: '🔗' }
])

// Computed
const selectedUsersCount = computed(() => {
  switch (selectionType.value) {
    case 'all':
      return availableUsers.value.length
    case 'filtered':
      return availableUsers.value.length // Would be filtered users count
    case 'custom':
      return selectedUserIds.value.length
    default:
      return 0
  }
})

// Show pre-selected users info
const preSelectedUsersInfo = computed(() => {
  if (props.preSelectedUsers && props.preSelectedUsers.length > 0) {
    return `Предварительно выбрано пользователей из заявок: ${props.preSelectedUsers.length}`
  }
  return ''
})

const isFormValid = computed(() => {
  return form.value.title.trim() && 
         form.value.message.trim() && 
         form.value.delivery_channels.length > 0 &&
         selectedUsersCount.value > 0 &&
         selectedUsersCount.value <= 1000 &&
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
    
    // Get user IDs based on selection type
    let userIds: number[]
    switch (selectionType.value) {
      case 'all':
        userIds = availableUsers.value.map(u => u.id)
        break
      case 'filtered':
        userIds = availableUsers.value.map(u => u.id) // Would be filtered users
        break
      case 'custom':
        userIds = selectedUserIds.value
        break
      default:
        userIds = []
    }
    
    const bulkData: BulkNotificationData = {
      notification: {
        title: form.value.title,
        message: form.value.message,
        notification_type: form.value.notification_type,
        delivery_channels: form.value.delivery_channels,
        metadata
      },
      user_ids: userIds,
      delivery_channels: form.value.delivery_channels
    }
    
    await bulkCreateNotifications(bulkData)
    emit('created')
  } catch (err) {
    console.error('Failed to create bulk notifications:', err)
  }
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const getUserDisplayName = (user: User): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  } else if (user.first_name) {
    return user.first_name
  } else {
    return user.email.split('@')[0]
  }
}

const loadAllUsers = async () => {
  try {
    console.log('Loading all users...')
    const response = await getUsers({ per_page: 1000 }) // Get all users
    console.log('Users loaded:', response.data.users.length)
    allUsers.value = response.data.users
    
    // If we have pre-selected users, filter to show only those users
    if (props.preSelectedUsers && props.preSelectedUsers.length > 0) {
      availableUsers.value = response.data.users.filter(user => 
        props.preSelectedUsers!.includes(user.id)
      )
      console.log('Filtered to pre-selected users:', availableUsers.value.length)
    } else {
      availableUsers.value = response.data.users
    }
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

const loadFilteredUsers = async () => {
  try {
    const filterParams: any = {}
    
    if (filters.value.registration_date) {
      filterParams.registration_date = filters.value.registration_date
    }
    if (filters.value.has_bookings !== '') {
      filterParams.has_bookings = filters.value.has_bookings === 'true'
    }
    if (filters.value.is_active !== '') {
      filterParams.is_active = filters.value.is_active === 'true'
    }
    
    const filteredUsers = await getFilteredUsers(filterParams)
    availableUsers.value = filteredUsers
  } catch (err) {
    console.error('Failed to load filtered users:', err)
  }
}

const searchUsersHandler = async () => {
  if (!userSearchQuery.value.trim()) {
    availableUsers.value = allUsers.value
    return
  }
  
  try {
    const searchResults = await searchUsers(userSearchQuery.value, 100)
    availableUsers.value = searchResults
  } catch (err) {
    console.error('Failed to search users:', err)
  }
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

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      console.log('User authenticated, loading users...')
      await loadAllUsers()
    } else {
      console.log('User not authenticated, clearing users...')
      allUsers.value = []
      availableUsers.value = []
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(async () => {
  console.log('NotificationBulkModal mounted')
  
  // Watch for metadata changes
  const originalMetadataJson = ref(metadataJson.value)
  setInterval(() => {
    if (metadataJson.value !== originalMetadataJson.value) {
      originalMetadataJson.value = metadataJson.value
      validateMetadata()
    }
  }, 500)
})
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

.user-selection {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  background: var(--color-background-soft);
}

.selection-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.selection-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.selection-radio {
  margin: 0;
}

.filter-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.filter-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 150px;
}

.custom-selection {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.user-search {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.user-search .form-input {
  flex: 1;
}

.user-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
}

.user-item {
  border-bottom: 1px solid var(--color-border);
}

.user-item:last-child {
  border-bottom: none;
}

.user-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-checkbox:hover {
  background: var(--color-background-soft);
}

.user-checkbox-input {
  margin: 0;
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
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.pre-selected-users-list {
  margin-bottom: 1rem;
}

.pre-selected-users-list h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
}

.user-item.selected {
  background: #e8f5e8;
  border-left: 3px solid #4caf50;
}

.selected-badge {
  color: #4caf50;
  font-weight: bold;
  font-size: 1rem;
}

.selection-summary {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--color-primary-muted);
  border-radius: 6px;
  color: var(--color-primary);
  text-align: center;
}

.pre-selected-info {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  color: #2e7d32;
  font-size: 0.875rem;
}

.warning-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 0.875rem;
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
  
  .selection-options {
    flex-direction: column;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .user-search {
    flex-direction: column;
  }
}
</style>
