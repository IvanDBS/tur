<template>
  <div class="admin-security min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Security Management</h2>
        <p class="text-gray-600">Monitor and manage system security, IP blocks, and threat protection</p>
      </div>

      <!-- Security Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Blocked IPs</p>
            <p class="text-2xl font-semibold text-gray-900">{{ statistics.blocked_count || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Whitelisted IPs</p>
            <p class="text-2xl font-semibold text-gray-900">{{ statistics.whitelisted_count || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Recent Blocks</p>
            <p class="text-2xl font-semibold text-gray-900">{{ statistics.recent_blocks || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Failed Attempts</p>
            <p class="text-2xl font-semibold text-gray-900">{{ securityStats.failed_attempts_stats?.total_failed_attempts || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-4 mb-8">
      <button
        @click="showBlockIpModal = true"
        class="bg-black text-white px-4 py-2 rounded border hover:bg-gray-800 transition-colors"
      >
        Block IP Address
      </button>
      <button
        @click="showWhitelistModal = true"
        class="bg-white text-black px-4 py-2 rounded border border-black hover:bg-gray-50 transition-colors"
      >
        Whitelist IP Address
      </button>
      <button
        @click="cleanupExpired"
        class="bg-white text-black px-4 py-2 rounded border border-black hover:bg-gray-50 transition-colors"
      >
        Cleanup Expired Blocks
      </button>
      <button
        @click="refreshData"
        class="bg-white text-black px-4 py-2 rounded border border-black hover:bg-gray-50 transition-colors"
      >
        Refresh Data
      </button>
    </div>

      <!-- Tabs -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

        <div class="p-8 min-h-[500px]">
        <!-- Blocked IPs Tab -->
        <div v-if="activeTab === 'blocked'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Blocked IP Addresses</h3>
            <span class="text-sm text-gray-500">{{ blockedIps.length }} total</span>
          </div>
          
          <div v-if="blockedIps.length === 0" class="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div class="text-4xl mb-2">🔒</div>
            <p class="text-lg font-medium">No blocked IP addresses</p>
            <p class="text-sm">All IPs are currently allowed</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked At</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="block in blockedIps" :key="block.ip">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ block.ip }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ block.info?.reason || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(block.info?.blocked_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ block.info?.expires_at ? formatDate(block.info.expires_at) : 'Permanent' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="unblockIp(block.ip)"
                      class="bg-white text-black px-3 py-1 rounded border border-black hover:bg-gray-50 transition-colors"
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Whitelisted IPs Tab -->
        <div v-if="activeTab === 'whitelisted'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Whitelisted IP Addresses</h3>
            <span class="text-sm text-gray-500">{{ whitelistedIps.length }} total</span>
          </div>
          
          <div v-if="whitelistedIps.length === 0" class="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div class="text-4xl mb-2">✅</div>
            <p class="text-lg font-medium">No whitelisted IP addresses</p>
            <p class="text-sm">No special IP exceptions configured</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whitelisted At</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="ip in whitelistedIps" :key="ip.ip">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ ip.ip }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ ip.info?.reason || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(ip.info?.whitelisted_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="removeWhitelist(ip.ip)"
                      class="bg-black text-white px-3 py-1 rounded border hover:bg-gray-800 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Security Statistics Tab -->
        <div v-if="activeTab === 'statistics'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Security Statistics</h3>
            <div class="text-sm text-gray-500">Real-time monitoring</div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h4 class="text-md font-medium text-gray-900">Rate Limiting</h4>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Active Throttles:</span>
                  <span class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{{ securityStats.rate_limiting_stats?.active_throttles || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Blocked Today:</span>
                  <span class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{{ securityStats.rate_limiting_stats?.blocked_requests_today || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="p-2 bg-red-100 rounded-lg mr-3">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h4 class="text-md font-medium text-gray-900">Failed Attempts</h4>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Brute Force IPs:</span>
                  <span class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{{ securityStats.failed_attempts_stats?.active_brute_force_ips || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Total Failed:</span>
                  <span class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{{ securityStats.failed_attempts_stats?.total_failed_attempts || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="p-2 bg-yellow-100 rounded-lg mr-3">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h4 class="text-md font-medium text-gray-900">DDOS Protection</h4>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">DDOS Throttles:</span>
                  <span class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{{ securityStats.ddos_protection_stats?.ddos_throttles || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Large Requests:</span>
                  <span class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{{ securityStats.ddos_protection_stats?.large_requests_blocked || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Block IP Modal -->
    <BlockIpModal
      v-if="showBlockIpModal"
      @close="showBlockIpModal = false"
      @blocked="onIpBlocked"
    />

    <!-- Whitelist IP Modal -->
    <WhitelistIpModal
      v-if="showWhitelistModal"
      @close="showWhitelistModal = false"
      @whitelisted="onIpWhitelisted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminApi } from '@/composables/useAdminApi'
import BlockIpModal from '@/components/admin/BlockIpModal.vue'
import WhitelistIpModal from '@/components/admin/WhitelistIpModal.vue'

const { getBlockedIps, getWhitelistedIps, getSecurityStatistics, unblockIp: unblockIpApi, removeWhitelist: removeWhitelistApi, cleanupExpired: cleanupExpiredApi } = useAdminApi()

// State
const activeTab = ref('blocked')
const showBlockIpModal = ref(false)
const showWhitelistModal = ref(false)
const blockedIps = ref([])
const whitelistedIps = ref([])
const statistics = ref({})
const securityStats = ref({})

const tabs = [
  { id: 'blocked', name: 'Blocked IPs' },
  { id: 'whitelisted', name: 'Whitelisted IPs' },
  { id: 'statistics', name: 'Statistics' }
]

// Methods
const loadData = async () => {
  try {
    const [blockedData, whitelistedData, statsData] = await Promise.all([
      getBlockedIps(),
      getWhitelistedIps(),
      getSecurityStatistics()
    ])
    
    // Backend returns data in { success: true, data: {...} } format
    blockedIps.value = blockedData.data?.blocked_ips || blockedData.blocked_ips || []
    whitelistedIps.value = whitelistedData.data?.whitelisted_ips || whitelistedData.whitelisted_ips || []
    statistics.value = statsData.data?.ip_management || statsData.ip_management || {}
    securityStats.value = statsData.data?.security || statsData.security || {}
  } catch (error) {
    console.error('Failed to load security data:', error)
  }
}

const refreshData = () => {
  loadData()
}

const unblockIp = async (ip: string) => {
  if (confirm(`Are you sure you want to unblock IP ${ip}?`)) {
    try {
      await unblockIpApi(ip)
      await loadData()
    } catch (error) {
      console.error('Failed to unblock IP:', error)
    }
  }
}

const removeWhitelist = async (ip: string) => {
  if (confirm(`Are you sure you want to remove IP ${ip} from whitelist?`)) {
    try {
      await removeWhitelistApi(ip)
      await loadData()
    } catch (error) {
      console.error('Failed to remove from whitelist:', error)
    }
  }
}

const cleanupExpired = async () => {
  try {
    await cleanupExpiredApi()
    await loadData()
  } catch (error) {
    console.error('Failed to cleanup expired blocks:', error)
  }
}

const onIpBlocked = () => {
  showBlockIpModal.value = false
  loadData()
}

const onIpWhitelisted = () => {
  showWhitelistModal.value = false
  loadData()
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-security {
  font-family: 'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Use CSS variables for consistency with admin theme */
:root {
  --color-primary: #000000;
  --color-secondary: #ffffff;
  --color-primary-muted: #f3f4f6;
  --color-secondary-muted: #e5e7eb;
}

/* Ensure modals are properly positioned */
.fixed {
  position: fixed;
}

.z-50 {
  z-index: 50;
}
</style>
