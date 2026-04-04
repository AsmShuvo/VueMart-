<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toastSuccess, toastError } from '../utils/toast'

const email = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  loading.value = true
  try {
    const user = await auth.login(email.value, password.value)
    toastSuccess(`Welcome back, ${user.name}!`)
    router.push(user.role === 'admin' ? '/admin' : '/')
  } catch (err) {
    toastError(err.response?.data?.error || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-md animate-scale-in">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
        <p class="text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input v-model="email" type="email" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white focus:bg-white" placeholder="your@email.com" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input v-model="password" type="password" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white focus:bg-white" placeholder="••••••••" />
          </div>
          <button type="submit" :disabled="loading" class="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:hover:transform-none">
            <span class="flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </span>
          </button>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
          <div class="relative flex justify-center text-xs"><span class="px-3 bg-white text-gray-400">or</span></div>
        </div>

        <p class="text-center text-sm text-gray-500">
          Don't have an account? <router-link to="/register" class="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">Create one</router-link>
        </p>
      </div>

      <!-- Demo accounts -->
      <div class="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 animate-fade-in delay-300">
        <p class="font-semibold text-indigo-900 text-sm mb-2">Demo Accounts</p>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <button @click="email = 'admin@vuemart.com'; password = 'admin123'" class="text-left p-2.5 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer border border-indigo-100">
            <span class="font-bold text-indigo-600 block">Admin</span>
            <span class="text-gray-500">admin@vuemart.com</span>
          </button>
          <button @click="email = 'john@example.com'; password = 'customer123'" class="text-left p-2.5 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer border border-purple-100">
            <span class="font-bold text-purple-600 block">Customer</span>
            <span class="text-gray-500">john@example.com</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
