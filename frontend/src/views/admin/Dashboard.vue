<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import { toastError } from '../../utils/toast'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const stats = ref(null)
const loading = ref(true)

const statCards = [
  { key: 'total_sales', label: 'Total Revenue', prefix: '$', icon: '💰', gradient: 'from-indigo-500 to-purple-600' },
  { key: 'total_orders', label: 'Total Orders', prefix: '', icon: '📦', gradient: 'from-emerald-500 to-teal-600' },
  { key: 'total_customers', label: 'Customers', prefix: '', icon: '👥', gradient: 'from-orange-500 to-red-500' },
  { key: 'total_products', label: 'Products', prefix: '', icon: '🏷️', gradient: 'from-pink-500 to-rose-600' },
]

async function fetchStats() {
  try {
    const { data } = await api.get('/admin/stats')
    stats.value = data
  } catch {
    toastError('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

function ordersChartData() {
  if (!stats.value?.orders_per_day.length) return null
  return {
    labels: stats.value.orders_per_day.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Revenue ($)',
      data: stats.value.orders_per_day.map(d => Number(d.revenue)),
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }
}

function topProductsChartData() {
  if (!stats.value?.top_products.length) return null
  return {
    labels: stats.value.top_products.map(p => p.name),
    datasets: [{
      data: stats.value.top_products.map(p => Number(p.total_sold)),
      backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  }
}

function categoryChartData() {
  if (!stats.value?.revenue_by_category.length) return null
  return {
    labels: stats.value.revenue_by_category.map(c => c.category || 'Other'),
    datasets: [{
      data: stats.value.revenue_by_category.map(c => Number(c.revenue)),
      backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false } },
    x: { grid: { display: false }, border: { display: false } }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12 } } } },
  cutout: '65%'
}

onMounted(fetchStats)
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-500 mt-1">Overview of your store performance</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-6 border border-gray-100"><div class="skeleton h-6 w-16 mb-2"></div><div class="skeleton h-8 w-24"></div></div>
    </div>

    <div v-else-if="stats">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div v-for="(card, i) in statCards" :key="card.key" class="relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up" :style="{ animationDelay: `${i * 0.1}s` }">
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full -translate-y-6 translate-x-6" :class="card.gradient"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-medium">{{ card.label }}</p>
              <p class="text-2xl font-extrabold text-gray-900 mt-1">{{ card.prefix }}{{ Number(stats[card.key]).toLocaleString('en', { minimumFractionDigits: card.prefix === '$' ? 2 : 0 }) }}</p>
            </div>
            <div class="text-3xl">{{ card.icon }}</div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-if="ordersChartData()" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
          <h3 class="font-bold text-gray-900 mb-4">Revenue Per Day</h3>
          <Bar :data="ordersChartData()" :options="chartOptions" />
        </div>
        <div v-if="topProductsChartData()" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
          <h3 class="font-bold text-gray-900 mb-4">Top Products</h3>
          <Doughnut :data="topProductsChartData()" :options="doughnutOptions" />
        </div>
        <div v-if="categoryChartData()" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
          <h3 class="font-bold text-gray-900 mb-4">Revenue by Category</h3>
          <Doughnut :data="categoryChartData()" :options="doughnutOptions" />
        </div>
      </div>

      <div v-if="!stats.orders_per_day.length && !stats.top_products.length" class="text-center py-16 bg-white rounded-2xl border border-gray-100 mt-6">
        <span class="text-5xl block mb-4">📊</span>
        <p class="text-gray-500 font-medium">No order data yet. Charts will appear once orders are placed.</p>
      </div>
    </div>
  </div>
</template>
