<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toastSuccess, toastError } from '../utils/toast'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  if (password.value.length < 6) {
    toastError('Password must be at least 6 characters')
    return
  }
  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    toastSuccess('Account created successfully!')
    router.push('/')
  } catch (err) {
    toastError(err.response?.data?.error || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-md animate-scale-in">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900">Create Account</h2>
        <p class="text-gray-500 mt-1">Join VueMart today</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input v-model="name" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white focus:bg-white" placeholder="John Doe" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input v-model="email" type="email" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white focus:bg-white" placeholder="your@email.com" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input v-model="password" type="password" required minlength="6" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white focus:bg-white" placeholder="Min 6 characters" />
          </div>
          <button type="submit" :disabled="loading" class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5">
            <span class="flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Already have an account? <router-link to="/login" class="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">Sign In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
