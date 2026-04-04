<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import { toastSuccess, toastError, confirmDialog } from '../../utils/toast'

const coupons = ref([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)

const form = ref({ code: '', discount_percent: '', expiry_date: '' })

async function fetchCoupons() {
  try {
    const { data } = await api.get('/coupons')
    coupons.value = data
  } catch {
    toastError('Failed to load coupons')
  } finally {
    loading.value = false
  }
}

async function createCoupon() {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.expiry_date) delete payload.expiry_date
    const { data } = await api.post('/coupons', payload)
    coupons.value.unshift(data)
    form.value = { code: '', discount_percent: '', expiry_date: '' }
    showForm.value = false
    toastSuccess('Coupon created!')
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to create coupon')
  } finally {
    saving.value = false
  }
}

async function deleteCoupon(id, code) {
  const result = await confirmDialog(`Delete "${code}"?`, 'This coupon will be permanently removed')
  if (!result.isConfirmed) return
  try {
    await api.delete(`/coupons/${id}`)
    coupons.value = coupons.value.filter(c => c.id !== id)
    toastSuccess('Coupon deleted')
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to delete')
  }
}

onMounted(fetchCoupons)
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Coupon Management</h1>
        <p class="text-gray-500 mt-1">{{ coupons.length }} coupons</p>
      </div>
      <button @click="showForm = !showForm" class="btn-primary py-2.5">
        <span class="flex items-center gap-2">
          <svg v-if="!showForm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
          {{ showForm ? 'Cancel' : 'New Coupon' }}
        </span>
      </button>
    </div>

    <!-- Create Form -->
    <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-4" leave-to-class="opacity-0 -translate-y-4">
      <div v-if="showForm" class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100">
        <form @submit.prevent="createCoupon" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Code</label>
            <input v-model="form.code" required placeholder="e.g. SAVE25" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase bg-white text-sm font-mono font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount %</label>
            <input v-model="form.discount_percent" type="number" min="1" max="100" required class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
            <input v-model="form.expiry_date" type="date" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm" />
          </div>
          <button type="submit" :disabled="saving" class="btn-primary py-2.5 disabled:opacity-50"><span>{{ saving ? 'Creating...' : 'Create' }}</span></button>
        </form>
      </div>
    </Transition>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
        <div class="skeleton h-8 w-24 rounded-lg"></div>
        <div class="skeleton h-4 w-16"></div>
        <div class="skeleton h-4 w-24"></div>
      </div>
    </div>

    <div v-else-if="coupons.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(coupon, i) in coupons" :key="coupon.id" class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden animate-fade-in-up" :style="{ animationDelay: `${i * 0.05}s` }">
        <!-- Dashed border accent -->
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>

        <div class="pl-3">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono font-extrabold text-lg text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">{{ coupon.code }}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold" :class="coupon.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
              {{ coupon.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ coupon.discount_percent }}%</span>
            <span class="text-gray-400">{{ coupon.expiry_date ? `Expires ${new Date(coupon.expiry_date).toLocaleDateString()}` : 'No expiry' }}</span>
          </div>
          <button @click="deleteCoupon(coupon.id, coupon.code)" class="mt-3 text-xs text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <span class="text-5xl block mb-4">🎟️</span>
      <p class="text-gray-500 font-medium">No coupons yet</p>
      <p class="text-gray-400 text-sm mt-1">Create your first coupon to attract customers</p>
    </div>
  </div>
</template>
