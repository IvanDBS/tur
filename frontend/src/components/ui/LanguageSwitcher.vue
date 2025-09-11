<template>
  <div class="language-switcher">
    <button @click="openModal" class="globe-button" title="Select Language">
      <img src="@/assets/icons/globe.svg" alt="Language" class="globe-icon" />
    </button>

    <!-- Language Selection Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('common.selectLanguage') }}</h3>
          <button @click="closeModal" class="close-button">×</button>
        </div>
        
        <div class="language-list">
          <button
            v-for="locale in availableLocales"
            :key="locale.code"
            @click="selectLanguage(locale.code)"
            :class="['language-option', { active: currentLocale === locale.code }]"
          >
            <span class="language-name">{{ locale.name }}</span>
            <span v-if="currentLocale === locale.code" class="checkmark">✓</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { SupportedLocale } from '../../locales'

const { 
  locale,
  getAvailableLocales, 
  changeLocale, 
  initializeLocale 
} = useI18n()

const currentLocale = computed(() => locale.value)
const availableLocales = getAvailableLocales()
const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
  // Блокируем прокрутку страницы
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  // Восстанавливаем прокрутку страницы
  document.body.style.overflow = ''
}

const handleOverlayClick = (event: MouseEvent) => {
  // Проверяем, что клик был именно по overlay, а не по его дочерним элементам
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const selectLanguage = (localeCode: string) => {
  changeLocale(localeCode as SupportedLocale)
  closeModal()
}

// Закрытие модального окна по Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  initializeLocale()
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  // Восстанавливаем прокрутку страницы при размонтировании
  document.body.style.overflow = ''
})
</script>

<style scoped>
.language-switcher {
  display: inline-block;
  position: relative;
  z-index: 1000;
}

.globe-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.globe-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.globe-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.globe-button:hover .globe-icon {
  opacity: 1;
}

/* Modal Styles */
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
  border-radius: 0.75rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  margin: auto;
}


.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
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
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.language-list {
  padding: 1rem;
}

.language-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  margin-bottom: 0.5rem;
}

.language-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.language-option.active {
  background-color: var(--color-primary-muted, rgba(59, 130, 246, 0.1));
  color: var(--color-primary);
}

.language-name {
  font-size: 1rem;
  font-weight: 500;
}

.checkmark {
  color: var(--color-primary);
  font-weight: bold;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.75rem;
  }
  
  .modal-content {
    max-width: none;
    width: 100%;
    max-height: calc(100vh - 1.5rem);
  }
  
  .modal-header {
    padding: 1.25rem;
  }
  
  .language-list {
    padding: 0.75rem;
  }
  
  .language-option {
    padding: 0.875rem 1rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: calc(100vh - 1rem);
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.125rem;
  }
  
  .language-list {
    padding: 0.5rem;
  }
  
  .language-option {
    padding: 0.75rem 0.875rem;
  }
  
  .language-name {
    font-size: 0.9rem;
  }
}
</style>
