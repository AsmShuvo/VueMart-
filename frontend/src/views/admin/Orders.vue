<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import { toastSuccess, toastError } from '../../utils/toast'

const orders = ref([])
const loading = ref(true)

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-800', icon: '⏳' },
  processing: { color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  delivered: { color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

async function fetchOrders() {
  try {
    const { data } = await api.get('/orders/all')
    orders.value = data
  } catch {
    toastError('Failed to load orders')
  } finally {
    loading.value = false
  }
}

async function updateStatus(orderId, status) {
  try {
    await api.put(`/orders/${orderId}/status`, { status })
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = status
    toastSuccess(`Order #${orderId} → ${status}`)
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to update status')
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">Manage Orders</h1>
      <p class="text-gray-500 mt-1">{{ orders.length }} total orders</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex justify-between mb-3"><div class="skeleton h-5 w-32"></div><div class="skeleton h-8 w-24 rounded-full"></div></div>
        <div class="skeleton h-12 w-full"></div>
      </div>
    </div>

    <div v-else-if="orders.length" class="space-y-4">
      <div v-for="(order, i) in orders" :key="order.id" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in-up" :style="{ animationDelay: `${i * 0.05}s` }">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-3">
              <span class="font-extrabold text-gray-900 text-lg">Order #{{ order.id }}</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold" :class="statusConfig[order.status]?.color">
                {{ statusConfig[order.status]?.icon }} {{ order.status }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <div class="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white text-[10px] font-bold">{{ order.user_name[0] }}</span>
              </div>
              <span class="text-sm text-gray-600 font-medium">{{ order.user_name }}</span>
              <span class="text-xs text-gray-400">({{ order.user_email }})</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ new Date(order.created_at).toLocaleString() }}</p>
            <p v-if="order.discount_percent" class="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1 inline-block mt-1">Coupon: {{ order.coupon_code }} (-{{ order.discount_percent }}%)</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ Number(order.total).toFixed(2) }}</p>
            <select @change="updateStatus(order.id, $event.target.value)" :value="order.status" class="mt-2 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white cursor-pointer transition-all font-medium">
              <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="divide-y divide-gray-50 bg-gray-50/50 rounded-xl p-3">
          <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between py-2 text-sm">
            <span class="text-gray-700 font-medium">{{ item.product_name }}</span>
            <span class="text-gray-500">{{ item.quantity }} x ${{ Number(item.price).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <span class="text-5xl block mb-4">📋</span>
      <p class="text-gray-500 font-medium">No orders yet</p>
    </div>
  </div>
</template>
