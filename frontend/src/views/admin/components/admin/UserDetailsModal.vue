<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Детали пользователя</h2>
        <button class="modal-close" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- User Profile Section -->
        <div class="user-profile-section">
          <div class="user-avatar-large">
            <div class="avatar-circle-large">
              {{ getUserInitials(user) }}
            </div>
            <div class="user-badges">
              <span v-if="user.admin" class="badge badge--admin">Администратор</span>
              <span v-if="user.banned" class="badge badge--banned">Заблокирован</span>
              <span v-else class="badge badge--active">Активен</span>
            </div>
          </div>

          <div class="user-basic-info">
            <h3 class="user-name">{{ getUserDisplayName(user) }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <p v-if="user.phone" class="user-phone">{{ user.phone }}</p>
          </div>
        </div>

        <!-- User Details Grid -->
        <div class="user-details-grid">
          <div class="detail-card">
            <h4 class="detail-title">Основная информация</h4>
            <div class="detail-list">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ user.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ user.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Телефон:</span>
                <span class="detail-value">{{ user.phone || 'Не указан' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Дата регистрации:</span>
                <span class="detail-value">{{ formatDate(user.created_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Последний вход:</span>
                <span class="detail-value">{{ user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Никогда' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h4 class="detail-title">Статистика</h4>
            <div class="detail-list">
              <div class="detail-item">
                <span class="detail-label">Бронирований:</span>
                <span class="detail-value">{{ user.bookings_count || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Поисковых запросов:</span>
                <span class="detail-value">{{ user.search_queries_count || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Всего входов:</span>
                <span class="detail-value">{{ user.sign_in_count || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h4 class="detail-title">Права доступа</h4>
            <div class="detail-list">
              <div class="detail-item">
                <span class="detail-label">Роль:</span>
                <span class="detail-value">
                  <span :class="user.admin ? 'role-admin' : 'role-user'">
                    {{ user.admin ? 'Администратор' : 'Пользователь' }}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Статус:</span>
                <span class="detail-value">
                  <span :class="user.banned ? 'status-banned' : 'status-active'">
                    {{ user.banned ? 'Заблокирован' : 'Активен' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- User Actions -->
        <div class="user-actions-section">
          <h4 class="actions-title">Действия</h4>
          <div class="actions-grid">
            <BaseButton
              v-if="!user.admin"
              :variant="user.banned ? 'success' : 'danger'"
              :loading="loading"
              @click="toggleBan"
            >
              {{ user.banned ? 'Разблокировать пользователя' : 'Заблокировать пользователя' }}
            </BaseButton>
            
            <BaseButton
              v-if="!user.banned"
              :variant="user.admin ? 'secondary' : 'primary'"
              :loading="loading"
              @click="toggleAdmin"
            >
              {{ user.admin ? 'Убрать права администратора' : 'Назначить администратором' }}
            </BaseButton>

            <BaseButton
              variant="outline"
              @click="viewUserBookings"
            >
              Просмотреть бронирования
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <BaseButton variant="secondary" @click="close">
          Закрыть
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BaseButton } from '../../../../components/ui'
import { useAdminApi } from '../../../../composables/useAdminApi'
import { useNotifications } from '../../../../composables/useNotifications'
import type { AdminUser } from '../../../../types/admin'

// Props
const props = defineProps<{
  user: AdminUser
}>()

// Emits
const emit = defineEmits<{
  close: []
  userUpdated: [user: AdminUser]
}>()

// Admin API
const { updateUserStatus, loading } = useAdminApi()
const { showSuccess, showError } = useNotifications()

// Methods
const close = () => {
  emit('close')
}

const getUserInitials = (user: AdminUser): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  } else if (user.first_name) {
    return user.first_name[0].toUpperCase()
  } else {
    return user.email[0].toUpperCase()
  }
}

const getUserDisplayName = (user: AdminUser): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  } else if (user.first_name) {
    return user.first_name
  } else {
    return user.email.split('@')[0]
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleBan = async () => {
  try {
    const updatedUser = await updateUserStatus(props.user.id, { banned: !props.user.banned })
    emit('userUpdated', updatedUser)
    
    if (updatedUser.banned) {
      showSuccess('Пользователь успешно заблокирован')
    } else {
      showSuccess('Пользователь успешно разблокирован')
    }
  } catch (error) {
    console.error('Error updating user ban status:', error)
    showError('Ошибка при изменении статуса пользователя')
  }
}

const toggleAdmin = async () => {
  try {
    const updatedUser = await updateUserStatus(props.user.id, { admin: !props.user.admin })
    emit('userUpdated', updatedUser)
    
    if (updatedUser.admin) {
      showSuccess('Пользователь назначен администратором')
    } else {
      showSuccess('Права администратора отозваны')
    }
  } catch (error) {
    console.error('Error updating user admin status:', error)
    showError('Ошибка при изменении прав пользователя')
  }
}

const viewUserBookings = () => {
  // Close modal first
  close()
  
  // Show notification
  showSuccess(`Переход к бронированиям пользователя ${props.user.email}`)
  
  // Navigate to bookings page with user filter
  const router = useRouter()
  router.push({
    name: 'admin-bookings',
    query: {
      user_id: props.user.id.toString(),
      user_email: props.user.email
    }
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  color: var(--color-text-soft);
  transition: var(--transition);
}

.modal-close:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.modal-body {
  padding: var(--spacing-lg);
}

.user-profile-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.user-avatar-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.avatar-circle-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-2xl);
}

.user-badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  justify-content: center;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge--admin {
  background: var(--color-primary);
  color: white;
}

.badge--banned {
  background: var(--color-danger);
  color: white;
}

.badge--active {
  background: var(--color-success);
  color: white;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.user-email {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-lg);
}

.user-phone {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-base);
}

.user-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.detail-card {
  background: var(--color-background-soft);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
}

.detail-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-soft);
}

.detail-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.role-admin {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.role-user {
  color: var(--color-text-soft);
}

.status-active {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

.status-banned {
  color: var(--color-danger);
  font-weight: var(--font-weight-semibold);
}

.user-actions-section {
  margin-bottom: var(--spacing-lg);
}

.actions-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.actions-grid {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .user-profile-section {
    flex-direction: column;
    text-align: center;
  }
  
  .user-details-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    flex-direction: column;
  }
}
</style>
