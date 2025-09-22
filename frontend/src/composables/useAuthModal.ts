import { ref } from 'vue'

const isAuthModalOpen = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

export const useAuthModal = () => {
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    authModalMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  return {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
  }
}
