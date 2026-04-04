<script setup>
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { confirmDialog } from '../utils/toast'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

function checkout() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/checkout')
}

async function clearAll() {
  const result = await confirmDialog('Clear Cart?', 'All items will be removed from your cart')
  if (result.isConfirmed) cart.clearCart()
}
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="flex items-center gap-3 mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
      <span v-if="cart.items.length" class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold">{{ cart.totalItems }} items</span>
    </div>

    <div v-if="cart.items.length" class="lg:flex gap-8">
      <!-- Cart Items -->
      <div class="flex-1 space-y-3">
        <TransitionGroup name="list" tag="div" class="space-y-3">
          <div v-for="item in cart.items" :key="item.product_id" class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-all duration-300">
            <img :src="item.image_url" :alt="item.name" class="w-20 h-20 object-cover rounded-xl shadow-sm" />
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 truncate">{{ item.name }}</h3>
              <p class="text-indigo-600 font-extrabold text-lg">${{ item.price.toFixed(2) }}</p>
            </div>
            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button @click="cart.updateQuantity(item.product_id, item.quantity - 1)" class="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600 font-bold text-sm">-</button>
              <span class="px-3 py-2 text-sm font-bold text-gray-900 min-w-[2.5rem] text-center border-x border-gray-200">{{ item.quantity }}</span>
              <button @click="cart.updateQuantity(item.product_id, item.quantity + 1)" class="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600 font-bold text-sm">+</button>
            </div>
            <p class="font-extrabold text-gray-900 w-20 text-right">${{ (item.price * item.quantity).toFixed(2) }}</p>
            <button @click="cart.removeItem(item.product_id)" class="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </TransitionGroup>
      </div>

      <!-- Summary -->
      <div class="lg:w-80 mt-6 lg:mt-0">
        <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
          <h3 class="text-lg font-extrabold text-gray-900 mb-4">Order Summary</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span class="font-bold">${{ cart.subtotal.toFixed(2) }}</span></div>
            <div v-if="cart.coupon" class="flex justify-between text-emerald-600"><span>Discount ({{ cart.coupon.discount_percent }}%)</span><span class="font-bold">-${{ cart.discount.toFixed(2) }}</span></div>
            <div class="flex justify-between text-gray-500"><span>Shipping</span><span class="font-medium text-emerald-600">Free</span></div>
            <hr class="border-gray-100" />
            <div class="flex justify-between text-xl font-extrabold"><span>Total</span><span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ cart.total.toFixed(2) }}</span></div>
          </div>
          <button @click="checkout" class="w-full mt-5 btn-primary py-3 text-base"><span>Proceed to Checkout</span></button>
          <button @click="clearAll" class="w-full mt-2 text-sm text-red-400 hover:text-red-600 font-medium py-2 transition-colors">Clear Cart</button>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-20 animate-fade-in">
      <div class="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      </div>
      <p class="text-2xl font-bold text-gray-700">Your cart is empty</p>
      <p class="text-gray-400 mt-2">Looks like you haven't added anything yet</p>
      <router-link to="/" class="inline-block mt-6 btn-primary py-3 px-8 text-base"><span>Start Shopping</span></router-link>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active { transition: all 0.3s ease; }
.list-leave-active { transition: all 0.2s ease; }
.list-enter-from { opacity: 0; transform: translateX(-30px); }
.list-leave-to { opacity: 0; transform: translateX(30px); }
</style>
