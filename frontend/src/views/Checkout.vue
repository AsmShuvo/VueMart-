<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { toastSuccess, toastError, successDialog } from '../utils/toast'
import api from '../api'

const cart = useCartStore()
const router = useRouter()

const couponCode = ref('')
const couponLoading = ref(false)
const placing = ref(false)

async function applyCoupon() {
  if (!couponCode.value) return
  couponLoading.value = true
  try {
    const { data } = await api.post('/coupons/validate', { code: couponCode.value })
    cart.applyCoupon({ code: couponCode.value, discount_percent: data.discount_percent })
    toastSuccess(`Coupon applied! ${data.discount_percent}% off`)
  } catch (err) {
    toastError(err.response?.data?.error || 'Invalid coupon')
    cart.applyCoupon(null)
  } finally {
    couponLoading.value = false
  }
}

async function placeOrder() {
  if (!cart.items.length) return
  placing.value = true
  try {
    const payload = {
      items: cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      coupon_code: cart.coupon?.code || null
    }
    await api.post('/orders', payload)
    cart.clearCart()
    await successDialog('Order Placed!', 'Your order has been placed successfully. You can track it in My Orders.')
    router.push('/orders')
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to place order')
  } finally {
    placing.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto animate-fade-in-up">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

    <div v-if="!cart.items.length" class="text-center py-16">
      <p class="text-gray-500 text-lg">Your cart is empty</p>
      <router-link to="/" class="inline-block mt-4 btn-primary"><span>Go Shopping</span></router-link>
    </div>

    <div v-else class="space-y-6">
      <!-- Items -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <span class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-extrabold">1</span>
          Order Items
        </h2>
        <div v-for="item in cart.items" :key="item.product_id" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div class="flex items-center gap-3">
            <img :src="item.image_url" :alt="item.name" class="w-14 h-14 object-cover rounded-xl shadow-sm" />
            <div>
              <p class="font-semibold text-gray-900">{{ item.name }}</p>
              <p class="text-sm text-gray-400">Qty: {{ item.quantity }} x ${{ item.price.toFixed(2) }}</p>
            </div>
          </div>
          <p class="font-bold text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Coupon -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-extrabold">2</span>
          Coupon Code
        </h2>
        <div class="flex gap-2">
          <input v-model="couponCode" type="text" placeholder="Enter coupon code" class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all uppercase" />
          <button @click="applyCoupon" :disabled="couponLoading" class="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-semibold transition-all hover:shadow-lg">
            {{ couponLoading ? '...' : 'Apply' }}
          </button>
        </div>
        <div v-if="cart.coupon" class="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          <span class="font-semibold">"{{ cart.coupon.code }}" applied — {{ cart.coupon.discount_percent }}% off</span>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <span class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-extrabold">3</span>
          Order Summary
        </h2>
        <div class="space-y-3">
          <div class="flex justify-between text-sm"><span class="text-gray-500">Subtotal</span><span class="font-semibold">${{ cart.subtotal.toFixed(2) }}</span></div>
          <div v-if="cart.coupon" class="flex justify-between text-sm text-emerald-600"><span>Discount ({{ cart.coupon.discount_percent }}%)</span><span class="font-semibold">-${{ cart.discount.toFixed(2) }}</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">Shipping</span><span class="font-medium text-emerald-600">Free</span></div>
          <hr class="border-gray-200" />
          <div class="flex justify-between text-2xl font-extrabold"><span>Total</span><span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ cart.total.toFixed(2) }}</span></div>
        </div>
        <button @click="placeOrder" :disabled="placing" class="w-full mt-6 btn-primary py-3.5 text-lg disabled:opacity-50">
          <span class="flex items-center justify-center gap-2">
            <svg v-if="placing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ placing ? 'Placing Order...' : 'Place Order' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
