import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('../views/ProductDetail.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../views/Cart.vue') },
  { path: '/checkout', name: 'Checkout', component: () => import('../views/Checkout.vue'), meta: { auth: true } },
  { path: '/orders', name: 'MyOrders', component: () => import('../views/MyOrders.vue'), meta: { auth: true } },
  { path: '/admin', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { admin: true } },
  { path: '/admin/products', name: 'AdminProducts', component: () => import('../views/admin/Products.vue'), meta: { admin: true } },
  { path: '/admin/orders', name: 'AdminOrders', component: () => import('../views/admin/Orders.vue'), meta: { admin: true } },
  { path: '/admin/coupons', name: 'AdminCoupons', component: () => import('../views/admin/Coupons.vue'), meta: { admin: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.loading) await auth.fetchUser()

  if (to.meta.auth && !auth.isLoggedIn) return '/login'
  if (to.meta.admin && !auth.isAdmin) return '/'
})

export default router
