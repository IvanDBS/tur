<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage <= 1"
      class="pagination-btn"
      :class="{ disabled: currentPage <= 1 }"
    >
      ← Предыдущая
    </button>
    
    <div class="pagination-pages">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        class="pagination-btn"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage >= totalPages"
      class="pagination-btn"
      :class="{ disabled: currentPage >= totalPages }"
    >
      Следующая →
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props
  
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const half = Math.floor(maxVisiblePages / 2)
  let start = Math.max(1, currentPage - half)
  const end = Math.min(totalPages, start + maxVisiblePages - 1)
  
  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const goToPage = (page: number) => {
  
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  } else {
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 24px 0;
  padding: 16px;
}

.pagination-btn {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  min-width: 44px;
  text-align: center;
}

.pagination-btn:hover:not(.disabled) {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-btn.active {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  font-weight: 600;
}

.pagination-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .pagination-btn {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 32px;
  }
}
</style>
