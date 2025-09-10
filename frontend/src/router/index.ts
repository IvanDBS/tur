import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
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
      component: () => import('../views/BookingView.vue'),
      props: true,
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminDashboard.vue'),
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
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsersView.vue'),
        },
      ]
    },
  ],
})

export default router
