import { ref } from 'vue'

const isAuthModalOpen = ref(false)

export const useAuthModal = () => {
  const openAuthModal = () => {
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  return {
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal
  }
}
