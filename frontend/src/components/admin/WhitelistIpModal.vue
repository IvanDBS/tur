<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Whitelist IP Address</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="whitelistIp">
          <div class="space-y-4">
            <div>
              <label for="ip" class="block text-sm font-medium text-gray-700 mb-1">
                IP Address
              </label>
              <input
                id="ip"
                v-model="form.ip"
                type="text"
                placeholder="192.168.1.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                id="reason"
                v-model="form.reason"
                type="text"
                placeholder="Trusted office IP"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
              <div class="flex">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-gray-800">
                    Whitelisted IPs will bypass all rate limiting and security checks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            >
              {{ loading ? 'Whitelisting...' : 'Whitelist IP' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminApi } from '@/composables/useAdminApi'

const emit = defineEmits<{
  close: []
  whitelisted: []
}>()

const { whitelistIp: whitelistIpApi } = useAdminApi()

const loading = ref(false)
const form = ref({
  ip: '',
  reason: ''
})

const whitelistIp = async () => {
  loading.value = true
  
  try {
    await whitelistIpApi({
      ip: form.value.ip,
      reason: form.value.reason
    })
    
    emit('whitelisted')
  } catch (error) {
    console.error('Failed to whitelist IP:', error)
    alert('Failed to whitelist IP address')
  } finally {
    loading.value = false
  }
}
</script>
