<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Block IP Address</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="blockIp">
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
                placeholder="Suspicious activity"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <select
                id="duration"
                v-model="form.duration"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="">Permanent</option>
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                <option value="720">30 days</option>
              </select>
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
              {{ loading ? 'Blocking...' : 'Block IP' }}
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
  blocked: []
}>()

const { blockIp: blockIpApi } = useAdminApi()

const loading = ref(false)
const form = ref({
  ip: '',
  reason: '',
  duration: ''
})

const blockIp = async () => {
  loading.value = true
  
  try {
    await blockIpApi({
      ip: form.value.ip,
      reason: form.value.reason,
      duration: form.value.duration ? parseInt(form.value.duration) : undefined
    })
    
    emit('blocked')
  } catch (error) {
    console.error('Failed to block IP:', error)
    alert('Failed to block IP address')
  } finally {
    loading.value = false
  }
}
</script>
