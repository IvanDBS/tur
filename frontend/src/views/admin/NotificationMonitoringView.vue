<template>
  <div class="notification-monitoring">
    <div class="page-header">
      <h1>Мониторинг уведомлений</h1>
      <div class="header-actions">
        <select v-model="selectedTimeframe" @change="loadDashboard" class="timeframe-select">
          <option value="1h">Последний час</option>
          <option value="6h">Последние 6 часов</option>
          <option value="24h">Последние 24 часа</option>
          <option value="7d">Последние 7 дней</option>
          <option value="30d">Последние 30 дней</option>
        </select>
        <button @click="loadDashboard" class="btn btn-primary" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23,4 23,10 17,10"></polyline>
            <polyline points="1,20 1,14 7,14"></polyline>
            <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
          </svg>
          Обновить
        </button>
      </div>
    </div>

    <!-- Health Status -->
    <div class="health-status" :class="healthStatusClass">
      <div class="health-indicator">
        <div class="health-icon">
          <svg v-if="dashboard?.health_status?.status === 'healthy'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="health-info">
          <h3>{{ healthStatusText }}</h3>
          <p>{{ dashboard?.health_status?.timestamp ? formatTime(dashboard.health_status.timestamp) : '' }}</p>
        </div>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ dashboard?.metrics?.total_notifications || 0 }}</div>
          <div class="metric-label">Всего уведомлений</div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ dashboard?.metrics?.delivery_success_rate || 0 }}%</div>
          <div class="metric-label">Успешность доставки</div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ dashboard?.metrics?.pending_notifications || 0 }}</div>
          <div class="metric-label">Ожидают доставки</div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ dashboard?.metrics?.error_rate || 0 }}%</div>
          <div class="metric-label">Ошибки доставки</div>
        </div>
      </div>
    </div>

    <!-- Channel Performance -->
    <div class="section">
      <h2>Производительность каналов</h2>
      <div class="channel-performance">
        <div 
          v-for="(performance, channel) in dashboard?.channel_performance" 
          :key="channel"
          class="channel-card"
        >
          <div class="channel-header">
            <h3>{{ getChannelLabel(channel) }}</h3>
            <span class="success-rate">{{ performance.success_rate }}%</span>
          </div>
          <div class="channel-stats">
            <div class="stat">
              <span class="stat-label">Всего:</span>
              <span class="stat-value">{{ performance.total }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Доставлено:</span>
              <span class="stat-value">{{ performance.delivered }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Ошибки:</span>
              <span class="stat-value">{{ performance.failed }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Среднее время:</span>
              <span class="stat-value">{{ performance.avg_delivery_time }}с</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Notifications -->
    <div class="section">
      <h2>Последние уведомления</h2>
      <div class="recent-notifications">
        <div 
          v-for="notification in dashboard?.recent_notifications" 
          :key="notification.id"
          class="notification-item"
        >
          <div class="notification-info">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-meta">
              <span class="user">{{ notification.user.email }}</span>
              <span class="time">{{ formatTime(notification.created_at) }}</span>
            </div>
          </div>
          <div class="notification-status">
            <span :class="['status-badge', notification.delivered ? 'delivered' : 'pending']">
              {{ notification.delivered ? 'Доставлено' : 'Ожидает' }}
            </span>
            <span :class="['read-badge', notification.read ? 'read' : 'unread']">
              {{ notification.read ? 'Прочитано' : 'Непрочитано' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Trends Chart -->
    <div class="section">
      <h2>Тренды уведомлений</h2>
      <div class="trends-chart">
        <div class="chart-placeholder">
          <p>График трендов (7 дней)</p>
          <div class="trend-data">
            <div 
              v-for="trend in dashboard?.trends" 
              :key="trend.date"
              class="trend-bar"
              :style="{ height: `${(trend.count / maxTrendValue) * 100}%` }"
              :title="`${trend.date}: ${trend.count} уведомлений`"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// State
const loading = ref(false)
const dashboard = ref<any>(null)
const selectedTimeframe = ref('24h')

// Computed
const healthStatusClass = computed(() => {
  const status = dashboard.value?.health_status?.status
  return {
    'health-healthy': status === 'healthy',
    'health-degraded': status === 'degraded',
    'health-unhealthy': status === 'unhealthy'
  }
})

const healthStatusText = computed(() => {
  const status = dashboard.value?.health_status?.status
  switch (status) {
    case 'healthy': return 'Система работает нормально'
    case 'degraded': return 'Система работает с ограничениями'
    case 'unhealthy': return 'Проблемы с системой'
    default: return 'Статус неизвестен'
  }
})

const maxTrendValue = computed(() => {
  if (!dashboard.value?.trends) return 1
  return Math.max(...dashboard.value.trends.map((t: any) => t.count), 1)
})

// Methods
const loadDashboard = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/v1/admin/notification_monitoring/dashboard?timeframe=${selectedTimeframe.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      dashboard.value = data.dashboard
    } else {
      console.error('Failed to load dashboard data')
    }
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
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

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.notification-monitoring {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.timeframe-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

.health-status {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid;
}

.health-healthy {
  background: #f0f9ff;
  border-color: #10b981;
  color: #065f46;
}

.health-degraded {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #92400e;
}

.health-unhealthy {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.health-icon {
  flex-shrink: 0;
}

.health-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.health-info p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin-top: 0.25rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.channel-performance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.channel-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.channel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.success-rate {
  font-weight: 600;
  color: var(--color-primary);
}

.channel-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-label {
  color: var(--color-text-soft);
}

.stat-value {
  font-weight: 500;
  color: var(--color-text);
}

.recent-notifications {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-title {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.notification-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.notification-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-badge {
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
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.read-badge.read {
  background: #e3f2fd;
  color: #1976d2;
}

.read-badge.unread {
  background: #ffebee;
  color: #d32f2f;
}

.trends-chart {
  height: 200px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.trend-data {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 120px;
  margin-top: 1rem;
}

.trend-bar {
  width: 20px;
  background: var(--color-primary);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
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

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .notification-monitoring {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .channel-performance {
    grid-template-columns: 1fr;
  }
  
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
