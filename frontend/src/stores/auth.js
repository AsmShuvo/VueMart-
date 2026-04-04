import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  let fetchPromise = null

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchUser() {
    if (fetchPromise) return fetchPromise
    fetchPromise = _doFetch()
    return fetchPromise
  }

  async function _doFetch() {
    try {
      const { data } = await api.get('/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    user.value = data.user
    return data.user
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    user.value = data.user
    return data.user
  }

  async function logout() {
    await api.post('/auth/logout')
    user.value = null
  }

  return { user, loading, isLoggedIn, isAdmin, fetchUser, login, register, logout }
})
