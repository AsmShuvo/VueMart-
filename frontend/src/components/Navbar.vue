<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { toastSuccess } from '../utils/toast'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const mobileOpen = ref(false)
const scrolled = ref(false)
const cartBounce = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { scrolled.value = window.scrollY > 20 })
}

watch(() => cart.totalItems, () => {
  cartBounce.value = true
  setTimeout(() => cartBounce.value = false, 300)
})

async function handleLogout() {
  await auth.logout()
  toastSuccess('Logged out successfully')
  router.push('/')
}
</script>

<template>
  <nav class="sticky top-0 z-50 transition-all duration-300" :class="scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-500/5' : 'bg-white/60 backdrop-blur-md'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-110">
            <span class="text-white font-bold text-lg">V</span>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VueMart</span>
        </router-link>

        <!-- Desktop -->
        <div class="hidden md:flex items-center gap-1">
          <router-link to="/" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">Products</router-link>
          <template v-if="auth.isAdmin">
            <router-link to="/admin" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">Dashboard</router-link>
            <router-link to="/admin/products" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">Manage Products</router-link>
            <router-link to="/admin/orders" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">Orders</router-link>
            <router-link to="/admin/coupons" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">Coupons</router-link>
          </template>
          <template v-if="auth.isLoggedIn && !auth.isAdmin">
            <router-link to="/orders" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">My Orders</router-link>
          </template>

          <!-- Cart -->
          <router-link to="/cart" class="relative ml-2 p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span v-if="cart.totalItems" class="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg" :class="cartBounce ? 'badge-bounce' : ''">{{ cart.totalItems }}</span>
          </router-link>

          <div class="w-px h-6 bg-gray-200 mx-2"></div>

          <template v-if="auth.isLoggedIn">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50">
              <div class="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">{{ auth.user.name[0] }}</span>
              </div>
              <span class="text-sm font-medium text-gray-700">{{ auth.user.name }}</span>
            </div>
            <button @click="handleLogout" class="ml-1 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium">Login</router-link>
            <router-link to="/register" class="btn-primary text-sm"><span>Get Started</span></router-link>
          </template>
        </div>

        <!-- Mobile toggle -->
        <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <transition enter-active-class="transition-all duration-300 ease-out" leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 -translate-y-2" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="mobileOpen" class="md:hidden pb-4 space-y-1">
          <router-link to="/" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all" @click="mobileOpen = false">Products</router-link>
          <router-link to="/cart" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all" @click="mobileOpen = false">Cart ({{ cart.totalItems }})</router-link>
          <template v-if="auth.isAdmin">
            <router-link to="/admin" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 transition-all" @click="mobileOpen = false">Dashboard</router-link>
            <router-link to="/admin/products" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 transition-all" @click="mobileOpen = false">Manage Products</router-link>
            <router-link to="/admin/orders" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 transition-all" @click="mobileOpen = false">Manage Orders</router-link>
            <router-link to="/admin/coupons" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 transition-all" @click="mobileOpen = false">Coupons</router-link>
          </template>
          <template v-if="auth.isLoggedIn && !auth.isAdmin">
            <router-link to="/orders" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 transition-all" @click="mobileOpen = false">My Orders</router-link>
          </template>
          <template v-if="auth.isLoggedIn">
            <button @click="handleLogout(); mobileOpen = false" class="block w-full text-left px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 transition-all" @click="mobileOpen = false">Login</router-link>
            <router-link to="/register" class="block px-4 py-2.5 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-all" @click="mobileOpen = false">Get Started</router-link>
          </template>
        </div>
      </transition>
    </div>
  </nav>
</template>
