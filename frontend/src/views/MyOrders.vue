<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { toastError } from '../utils/toast'

const orders = ref([])
const loading = ref(true)

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-800', icon: '��' },
  processing: { color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  delivered: { color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: '��' }
}

async function fetchOrders() {
  try {
    const { data } = await api.get('/orders/my')
    orders.value = data
  } catch {
    toastError('Failed to load orders')
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="animate-fade-in-up">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex justify-between mb-4">
          <div class="space-y-2"><div class="skeleton h-4 w-24"></div><div class="skeleton h-3 w-32"></div></div>
          <div class="skeleton h-8 w-20 rounded-full"></div>
        </div>
        <div class="skeleton h-16 w-full"></div>
      </div>
    </div>

    <div v-else-if="orders.length" class="space-y-4">
      <div v-for="(order, i) in orders" :key="order.id" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in-up" :style="{ animationDelay: `${i * 0.1}s` }">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-gray-900">Order #{{ order.id }}</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold" :class="statusConfig[order.status]?.color">
                {{ statusConfig[order.status]?.icon }} {{ order.status }}
              </span>
            </div>
            <p class="text-sm text-gray-400 mt-1">{{ new Date(order.created_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
          <span class="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ Number(order.total).toFixed(2) }}</span>
        </div>
        <div v-if="order.discount_percent" class="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5 inline-block mb-3">
          Coupon "{{ order.coupon_code }}" — {{ order.discount_percent }}% off
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="item in order.items" :key="item.id" class="flex items-center gap-3 py-2.5">
            <img :src="item.image_url" :alt="item.product_name" class="w-12 h-12 object-cover rounded-lg shadow-sm" />
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm">{{ item.product_name }}</p>
              <p class="text-xs text-gray-400">{{ item.quantity }} x ${{ Number(item.price).toFixed(2) }}</p>
            </div>
            <p class="font-bold text-sm">${{ (item.quantity * Number(item.price)).toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 animate-fade-in">
      <div class="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="text-5xl">📦</span>
      </div>
      <p class="text-2xl font-bold text-gray-700">No orders yet</p>
      <p class="text-gray-400 mt-2">Your order history will appear here</p>
      <router-link to="/" class="inline-block mt-6 btn-primary py-3 px-8"><span>Start Shopping</span></router-link>
    </div>
  </div>
</template>
