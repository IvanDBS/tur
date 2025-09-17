<template>
  <div class="admin-users">

    <!-- Users Table -->
    <div class="users-table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка пользователей...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <h3>Пользователи не найдены</h3>
        <p>Попробуйте изменить фильтры поиска</p>
      </div>

      <div v-else class="users-table">
        <table class="table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('id')">
                ID#
                <span v-if="sortField === 'id'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('email')">
                Email
                <span v-if="sortField === 'email'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('first_name')">
                Имя
                <span v-if="sortField === 'first_name'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('created_at')">
                Регистрация
                <span v-if="sortField === 'created_at'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('last_sign_in_at')">
                Последний вход
                <span v-if="sortField === 'last_sign_in_at'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('bookings_count')">
                Бронирований
                <span v-if="sortField === 'bookings_count'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('admin')">
                Роль
                <span v-if="sortField === 'admin'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="sortBy('banned')">
                Статус
                <span v-if="sortField === 'banned'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Действия</th>
            </tr>
            <!-- Search row -->
            <tr class="search-row">
              <td>
                <BaseInput
                  v-model="searchFilters.id"
                  placeholder="ID..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.email"
                  placeholder="Email..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.name"
                  placeholder="Имя..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.created_at"
                  placeholder="Дата..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.last_sign_in_at"
                  placeholder="Вход..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseInput
                  v-model="searchFilters.bookings_count"
                  placeholder="Кол-во..."
                  size="xs"
                  @input="debouncedSearch"
                />
              </td>
              <td>
                <BaseSelect
                  v-model="searchFilters.role"
                  :options="roleFilterOptions"
                  placeholder="Все"
                  size="xs"
                  @update:model-value="debouncedSearch"
                />
              </td>
              <td>
                <BaseSelect
                  v-model="searchFilters.status"
                  :options="statusFilterOptions"
                  placeholder="Все"
                  size="xs"
                  @update:model-value="debouncedSearch"
                />
              </td>
              <td>
                <BaseButton 
                  variant="ghost" 
                  size="xs" 
                  @click="clearAllFilters"
                >
                  Очистить
                </BaseButton>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in users" 
              :key="user.id"
              class="table-row"
              :class="{ 
                'table-row--banned': user.banned,
                'table-row--admin': user.admin 
              }"
            >
              <td class="table-cell table-cell--id">
                <span class="user-id">#{{ user.id }}</span>
              </td>
              
              <td class="table-cell table-cell--email">
                <div class="user-info">
                  <div class="user-avatar-small">
                    {{ getUserInitials(user) }}
                  </div>
                  <div class="user-details">
                    <div class="user-email">{{ user.email }}</div>
                    <div v-if="user.phone" class="user-phone">{{ user.phone }}</div>
                  </div>
                </div>
              </td>
              
              <td class="table-cell table-cell--name">
                <div class="user-name">{{ getUserDisplayName(user) }}</div>
              </td>
              
              <td class="table-cell table-cell--date">
                <div class="date-info">
                  <div class="date-primary">{{ formatDate(user.created_at) }}</div>
                </div>
              </td>
              
              <td class="table-cell table-cell--date">
                <div class="date-info">
                  <div class="date-primary">{{ user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Никогда' }}</div>
                  <div v-if="user.sign_in_count" class="date-secondary">{{ user.sign_in_count }} входов</div>
                </div>
              </td>
              
              <td class="table-cell table-cell--number">
                <span class="number-badge">{{ user.bookings_count || 0 }}</span>
              </td>
              
              <td class="table-cell table-cell--role">
                <span 
                  class="role-badge"
                  :class="user.admin ? 'role-badge--admin' : 'role-badge--user'"
                >
                  {{ user.admin ? 'Админ' : 'Пользователь' }}
                </span>
              </td>
              
              <td class="table-cell table-cell--status">
                <span 
                  class="status-badge"
                  :class="user.banned ? 'status-badge--banned' : 'status-badge--active'"
                >
                  {{ user.banned ? 'Заблокирован' : 'Активен' }}
                </span>
              </td>
              
              <td class="table-cell table-cell--actions">
                <div class="action-buttons">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="viewUserDetails(user)"
                  >
                    Подробнее
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-section">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        @page-change="handlePageChange"
      />
    </div>

    <!-- User Details Modal -->
    <UserDetailsModal
      v-if="selectedUser"
      :user="selectedUser"
      @close="selectedUser = null"
      @user-updated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { debounce } from '../../utils/debounce'
import { useAdminApi } from '../../composables/useAdminApi'
import type { AdminUser } from '../../types/admin'
import { BaseInput, BaseButton, BaseSelect } from '../../components/ui'
// @ts-expect-error - Pagination component needs proper typing
import Pagination from '../../components/Pagination.vue'
// @ts-expect-error - UserDetailsModal component needs proper typing
import UserDetailsModal from './components/admin/UserDetailsModal.vue'

// Admin API
const { getAdminUsers } = useAdminApi()
const loading = ref(false)

// State
const users = ref<AdminUser[]>([])
const selectedUser = ref<AdminUser | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)

const filters = ref({
  role: '',
  status: '',
  search: ''
})

// Search filters for each column
const searchFilters = ref({
  id: '',
  email: '',
  name: '',
  created_at: '',
  last_sign_in_at: '',
  bookings_count: '',
  role: '',
  status: ''
})

// Sorting state
const sortField = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Options
// const roleOptions = [
//   { value: '', label: 'Все роли' },
//   { value: 'admin', label: 'Администраторы' },
//   { value: 'user', label: 'Пользователи' }
// ]

// const statusOptions = [
//   { value: '', label: 'Все статусы' },
//   { value: 'active', label: 'Активные' },
//   { value: 'banned', label: 'Заблокированные' }
// ]

const roleFilterOptions = [
  { value: '', label: 'Все' },
  { value: 'admin', label: 'Админы' },
  { value: 'user', label: 'Пользователи' }
]

const statusFilterOptions = [
  { value: '', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'banned', label: 'Заблокированные' }
]

// Debounced search
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadUsers()
}, 500)

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    // Combine all search filters into a single search string
    const searchTerms = []
    Object.entries(searchFilters.value).forEach(([key, value]) => {
      if (value && value.trim()) {
        searchTerms.push(`${key}:${value.trim()}`)
      }
    })
    
    // Also include the main search filter
    if (filters.value.search && filters.value.search.trim()) {
      searchTerms.push(filters.value.search.trim())
    }
    
    const combinedSearch = searchTerms.length > 0 ? searchTerms.join(' ') : undefined
    
    const response = await getAdminUsers({
      page: currentPage.value,
      role: filters.value.role || searchFilters.value.role || undefined,
      status: filters.value.status || searchFilters.value.status || undefined,
      search: combinedSearch,
      sort_field: sortField.value,
      sort_direction: sortDirection.value
    })
    
    // Backend returns data in { success: true, data: { users: [...], pagination: {...} } } format
    const data = response.data || response
    users.value = data.users || []
    totalPages.value = data.pagination?.total_pages || 1
    totalCount.value = data.pagination?.total_count || 0
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
  loadUsers()
}

// const resetFilters = () => {
//   filters.value = {
//     role: '',
//     status: '',
//     search: ''
//   }
//   currentPage.value = 1
//   loadUsers()
// }

const clearAllFilters = () => {
  // Clear main filters
  filters.value = {
    role: '',
    status: '',
    search: ''
  }
  
  // Clear search filters
  searchFilters.value = {
    id: '',
    email: '',
    name: '',
    created_at: '',
    last_sign_in_at: '',
    bookings_count: '',
    role: '',
    status: ''
  }
  
  // Clear sorting
  sortField.value = ''
  sortDirection.value = 'asc'
  
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
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
  return new Date(dateString).toLocaleDateString('ru-RU')
}


const viewUserDetails = (user: AdminUser) => {
  selectedUser.value = user
}

const handleUserUpdated = (updatedUser: AdminUser) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
  selectedUser.value = null
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 0 var(--spacing-lg);
  width: 100%;
}

.search-row {
  background: var(--color-background-soft);
}

.search-row td {
  padding: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.search-row .form-field {
  margin: 0;
}

.search-row .form-field input,
.search-row .form-field select {
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.users-table-container {
  background: white;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  overflow-x: auto;
  width: 100%;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-soft);
}

.loading-state {
  gap: var(--spacing-md);
}

.empty-state {
  gap: var(--spacing-lg);
}

.empty-state svg {
  color: var(--color-text-muted);
}

.empty-state h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.empty-state p {
  margin: 0;
  color: var(--color-text-soft);
}

.users-table {
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.table th {
  background: var(--color-background-soft);
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: var(--transition);
}

.table th.sortable:hover {
  background: var(--color-background);
}

.sort-icon {
  margin-left: var(--spacing-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.table-row {
  border-bottom: 1px solid var(--color-border);
  transition: var(--transition);
}

.table-row:hover {
  background: var(--color-background-soft);
}

.table-row--banned {
  opacity: 0.7;
  background: var(--color-background-soft);
}

.table-row--admin {
  background: linear-gradient(135deg, var(--color-primary-muted) 0%, white 100%);
}

.table-cell {
  padding: var(--spacing-md);
  vertical-align: middle;
}

.table-cell--id {
  width: 80px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-soft);
}

.table-cell--email {
  min-width: 250px;
}

.table-cell--name {
  min-width: 150px;
}

.table-cell--date {
  min-width: 120px;
}

.table-cell--number {
  text-align: center;
  width: 100px;
}

.table-cell--role,
.table-cell--status {
  text-align: center;
  width: 120px;
}

.table-cell--actions {
  width: 200px;
}

.user-id {
  font-family: monospace;
  font-size: var(--font-size-xs);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
}

.user-email {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-phone {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.date-primary {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.date-secondary {
  font-size: var(--font-size-xs);
  color: var(--color-text-soft);
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--spacing-xs);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge--admin {
  background: var(--color-primary);
  color: white;
}

.role-badge--user {
  background: var(--color-background);
  color: var(--color-text-soft);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge--active {
  background: var(--color-success);
  color: white;
}

.status-badge--banned {
  background: var(--color-danger);
  color: white;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.pagination-section {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .table {
    min-width: 800px;
  }
  
  .table th,
  .table td {
    padding: var(--spacing-sm);
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .user-avatar-small {
    width: 24px;
    height: 24px;
    font-size: var(--font-size-xs);
  }
}
</style>
