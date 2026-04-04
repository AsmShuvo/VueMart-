<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { toastSuccess, toastError, successDialog } from '../utils/toast'
import StarRating from '../components/StarRating.vue'

const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()

const product = ref(null)
const loading = ref(true)
const quantity = ref(1)
const reviewRating = ref(5)
const reviewComment = ref('')
const submittingReview = ref(false)
const addedToCart = ref(false)

async function fetchProduct() {
  loading.value = true
  try {
    const { data } = await api.get(`/products/${route.params.id}`)
    product.value = data
  } catch {
    toastError('Failed to load product')
  } finally {
    loading.value = false
  }
}

function addToCart() {
  cart.addItem(product.value, quantity.value)
  addedToCart.value = true
  toastSuccess(`${product.value.name} added to cart!`)
  setTimeout(() => addedToCart.value = false, 2000)
}

async function submitReview() {
  submittingReview.value = true
  try {
    const { data } = await api.post(`/reviews/${product.value.id}`, {
      rating: reviewRating.value,
      comment: reviewComment.value
    })
    product.value.reviews.unshift(data)
    reviewComment.value = ''
    reviewRating.value = 5
    successDialog('Review Submitted!', 'Thank you for your feedback')
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to submit review')
  } finally {
    submittingReview.value = false
  }
}

onMounted(fetchProduct)
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="animate-fade-in">
    <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div class="md:flex">
        <div class="md:w-1/2 skeleton h-96"></div>
        <div class="p-8 md:w-1/2 space-y-4">
          <div class="skeleton h-6 w-24 rounded-full"></div>
          <div class="skeleton h-10 w-3/4"></div>
          <div class="skeleton h-4 w-1/3"></div>
          <div class="skeleton h-20 w-full"></div>
          <div class="skeleton h-10 w-32"></div>
          <div class="skeleton h-12 w-full rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="product" class="animate-fade-in-up">
    <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
      <div class="md:flex">
        <!-- Image -->
        <div class="md:w-1/2 relative overflow-hidden group">
          <img :src="product.image_url" :alt="product.name" class="w-full h-80 md:h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <!-- Details -->
        <div class="p-6 md:p-8 md:w-1/2 flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{{ product.category }}</span>
            <span v-if="product.stock > 0" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">In Stock</span>
            <span v-else class="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>

          <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{{ product.name }}</h1>

          <div class="flex items-center gap-3 mt-3">
            <StarRating :rating="Number(product.avg_rating)" />
            <span class="text-sm text-gray-500 font-medium">{{ Number(product.avg_rating).toFixed(1) }} ({{ product.review_count }} reviews)</span>
          </div>

          <p class="text-gray-600 mt-4 leading-relaxed flex-1">{{ product.description }}</p>

          <div class="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <p class="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ Number(product.price).toFixed(2) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ product.stock }} units available</p>
          </div>

          <div class="flex items-center gap-4 mt-6">
            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button @click="quantity = Math.max(1, quantity - 1)" class="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-bold">-</button>
              <span class="px-5 py-3 font-bold text-gray-900 min-w-[3rem] text-center border-x border-gray-200">{{ quantity }}</span>
              <button @click="quantity++" class="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-bold">+</button>
            </div>
            <button @click="addToCart" :disabled="product.stock <= 0" class="flex-1 btn-primary py-3 text-base disabled:opacity-50" :class="addedToCart ? 'bg-gradient-to-r from-emerald-500 to-green-500' : ''">
              <span class="flex items-center justify-center gap-2">
                <svg v-if="addedToCart" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                {{ addedToCart ? 'Added!' : 'Add to Cart' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="mt-10">
      <div class="flex items-center gap-3 mb-6">
        <h2 class="text-2xl font-extrabold text-gray-900">Reviews</h2>
        <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">{{ product.reviews.length }}</span>
      </div>

      <!-- Write Review -->
      <div v-if="auth.isLoggedIn && !auth.isAdmin" class="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100 animate-fade-in-up">
        <h3 class="font-bold text-gray-900 mb-4 text-lg">Write a Review</h3>
        <form @submit.prevent="submitReview" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
            <div class="flex gap-2">
              <button v-for="i in 5" :key="i" type="button" @click="reviewRating = i"
                class="text-3xl transition-all duration-200 hover:scale-125"
                :class="i <= reviewRating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 hover:text-yellow-200'">★</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
            <textarea v-model="reviewComment" rows="3" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none" placeholder="Share your experience with this product..."></textarea>
          </div>
          <button type="submit" :disabled="submittingReview" class="btn-primary py-2.5 disabled:opacity-50">
            <span>{{ submittingReview ? 'Submitting...' : 'Submit Review' }}</span>
          </button>
        </form>
      </div>

      <!-- Review List -->
      <div v-if="product.reviews.length" class="space-y-4">
        <div v-for="(review, i) in product.reviews" :key="review.id" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-fade-in-up" :style="{ animationDelay: `${i * 0.1}s` }">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                <span class="text-white text-sm font-bold">{{ review.user_name[0] }}</span>
              </div>
              <div>
                <span class="font-bold text-gray-900">{{ review.user_name }}</span>
                <StarRating :rating="review.rating" size="h-3.5 w-3.5" class="mt-0.5" />
              </div>
            </div>
            <span class="text-xs text-gray-400 font-medium">{{ new Date(review.created_at).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
          </div>
          <p class="text-gray-600 mt-3 leading-relaxed">{{ review.comment }}</p>
        </div>
      </div>
      <div v-else class="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <span class="text-2xl">💬</span>
        </div>
        <p class="text-gray-500 font-medium">No reviews yet</p>
        <p class="text-gray-400 text-sm">Be the first to review this product!</p>
      </div>
    </div>
  </div>
</template>
