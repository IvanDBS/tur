import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookingView from '../views/BookingView.vue'
import SearchView from '../views/SearchView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new route
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: () => import('../views/BookingsView.vue'),
    },
    {
      path: '/obs-test',
      name: 'obs-test',
      component: () => import('../views/ObsTestView.vue'),
    },
    {
      path: '/auth-test',
      name: 'auth-test',
      component: () => import('../views/AuthTestView.vue'),
    },
    {
      path: '/form-field-test',
      name: 'form-field-test',
      component: () => import('../views/FormFieldTest.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/booking/:searchResultId',
      name: 'booking',
      component: BookingView,
      props: true,
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin',
          redirect: '/admin/bookings'
        },
        {
          path: 'bookings',
          name: 'admin-bookings',
          component: () => import('../views/admin/AdminBookingsView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsersView.vue'),
          meta: { requiresAdmin: true },
        },
      ]
    },
  ],
})

// Route guard для проверки админских прав
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Проверяем, требует ли маршрут админских прав
  if (to.meta.requiresAdmin) {
    // Сначала пытаемся восстановить состояние аутентификации из localStorage
    await authStore.initializeAuth()
    
    // Проверяем, авторизован ли пользователь
    if (!authStore.isAuthenticated) {
      next('/auth-test') // Перенаправляем на страницу входа
      return
    }
    
    // Получаем актуальные данные пользователя
    await authStore.getCurrentUser()
    
    // Проверяем, является ли пользователь админом
    if (!authStore.currentUser?.admin) {
      next('/') // Перенаправляем на главную страницу
      return
    }
  }
  
  next()
})

export default router
