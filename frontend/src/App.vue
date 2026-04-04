<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'

const auth = useAuthStore()
const routeLoading = ref(false)
const router = useRouter()

router.beforeEach(() => { routeLoading.value = true })
router.afterEach(() => { routeLoading.value = false })

onMounted(() => auth.fetchUser())
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
    <Navbar />

    <!-- Global route loading bar -->
    <div v-if="routeLoading" class="fixed top-16 left-0 right-0 z-50 h-1 bg-gray-100 overflow-hidden">
      <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading-bar"></div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">VueMart</h3>
            <p class="mt-2 text-sm">Your one-stop shop for amazing products at great prices.</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-3">Quick Links</h4>
            <div class="space-y-2 text-sm">
              <router-link to="/" class="block hover:text-indigo-400 transition-colors">Products</router-link>
              <router-link to="/cart" class="block hover:text-indigo-400 transition-colors">Cart</router-link>
              <router-link to="/orders" class="block hover:text-indigo-400 transition-colors">My Orders</router-link>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-3">Contact</h4>
            <div class="space-y-2 text-sm">
              <p>support@vuemart.com</p>
              <p>1-800-VUEMART</p>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 VueMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@keyframes loadingBar {
  0% { width: 0%; margin-left: 0; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
.animate-loading-bar {
  animation: loadingBar 1.2s ease-in-out infinite;
}
</style>
