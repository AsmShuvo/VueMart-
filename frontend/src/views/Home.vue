<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { useCartStore } from '../stores/cart'
import { toastSuccess, toastError } from '../utils/toast'
import StarRating from '../components/StarRating.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

const products = ref([])
const topProducts = ref([])
const categories = ref([])
const search = ref('')
const selectedCategory = ref('')
const pageLoading = ref(true)
const productsLoading = ref(false)
const minPrice = ref(0)
const maxPrice = ref(500)
const cart = useCartStore()
const router = useRouter()
const swiperModules = [Navigation, Pagination, Autoplay, EffectCoverflow]

const heroBanners = [
  { title: 'Summer Collection 2026', subtitle: 'Up to 50% off on trending products', gradient: 'from-indigo-600 via-purple-600 to-pink-500', emoji: '☀️' },
  { title: 'Free Shipping', subtitle: 'On orders over $100 — limited time offer', gradient: 'from-emerald-500 via-teal-500 to-cyan-500', emoji: '🚚' },
  { title: 'New Arrivals', subtitle: 'Check out the latest products in store', gradient: 'from-orange-500 via-red-500 to-pink-500', emoji: '🔥' },
]

async function fetchProducts() {
  productsLoading.value = true
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (minPrice.value > 0) params.min_price = minPrice.value
    if (maxPrice.value < 500) params.max_price = maxPrice.value
    const { data } = await api.get('/products', { params })
    products.value = data
  } catch {
    toastError('Failed to load products')
  } finally {
    productsLoading.value = false
  }
}

async function loadInitialData() {
  pageLoading.value = true
  try {
    const [productsRes, categoriesRes, topRes] = await Promise.all([
      api.get('/products'),
      api.get('/products/categories'),
      api.get('/products/top-selling')
    ])
    products.value = productsRes.data
    categories.value = categoriesRes.data
    topProducts.value = topRes.data.slice(0, 3)
  } catch {
    toastError('Failed to load products')
  } finally {
    pageLoading.value = false
  }
}

function addToCart(product) {
  cart.addItem(product)
  toastSuccess(`${product.name} added to cart!`)
}

const filteredCount = computed(() => products.value.length)

let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchProducts, 300)
})
watch(selectedCategory, fetchProducts)

function onMinPriceChange(e) {
  const val = Number(e.target.value)
  if (val > maxPrice.value) return
  minPrice.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchProducts, 400)
}

function onMaxPriceChange(e) {
  const val = Number(e.target.value)
  if (val < minPrice.value) return
  maxPrice.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchProducts, 400)
}

function resetPriceRange() {
  minPrice.value = 0
  maxPrice.value = 500
  fetchProducts()
}

onMounted(loadInitialData)
</script>

<template>
  <div>
    <!-- ═══ Full Page Loader ═══ -->
    <div v-if="pageLoading" class="animate-fade-in">
      <!-- Hero skeleton -->
      <div class="skeleton h-72 sm:h-80 md:h-96 rounded-2xl mb-12 -mt-4"></div>

      <!-- Popular section skeleton -->
      <div class="mb-16">
        <div class="text-center mb-8">
          <div class="skeleton h-6 w-36 mx-auto rounded-full mb-3"></div>
          <div class="skeleton h-10 w-80 mx-auto mb-2"></div>
          <div class="skeleton h-4 w-64 mx-auto"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div class="skeleton h-64 w-full"></div>
            <div class="p-5 space-y-3">
              <div class="flex gap-2"><div class="skeleton h-5 w-20 rounded-full"></div><div class="skeleton h-5 w-24 rounded-full"></div></div>
              <div class="skeleton h-6 w-3/4"></div>
              <div class="skeleton h-4 w-full"></div>
              <div class="flex justify-between items-center"><div class="skeleton h-8 w-20"></div><div class="skeleton h-10 w-28 rounded-xl"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products skeleton -->
      <div>
        <div class="flex justify-between mb-6">
          <div><div class="skeleton h-8 w-40 mb-2"></div><div class="skeleton h-4 w-28"></div></div>
        </div>
        <div class="skeleton h-28 w-full rounded-2xl mb-8"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div class="skeleton h-52 w-full"></div>
            <div class="p-4 space-y-3">
              <div class="skeleton h-4 w-20"></div>
              <div class="skeleton h-5 w-3/4"></div>
              <div class="skeleton h-4 w-1/2"></div>
              <div class="flex justify-between"><div class="skeleton h-6 w-16"></div><div class="skeleton h-9 w-24 rounded-xl"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Loaded Content ═══ -->
    <template v-else>
      <!-- ═══ Hero Carousel ═══ -->
      <div class="mb-12 -mt-4 animate-fade-in">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="1"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          :loop="true"
          class="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10"
        >
          <SwiperSlide v-for="(banner, i) in heroBanners" :key="i">
            <div class="relative h-72 sm:h-80 md:h-96 bg-gradient-to-r animate-gradient flex items-center" :class="banner.gradient">
              <div class="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"></div>
              <div class="absolute bottom-0 left-10 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 blur-sm"></div>
              <div class="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full animate-float"></div>

              <div class="relative z-10 px-8 sm:px-16 max-w-2xl">
                <span class="text-5xl sm:text-6xl mb-4 block">{{ banner.emoji }}</span>
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">{{ banner.title }}</h2>
                <p class="text-white/80 text-lg sm:text-xl mb-6">{{ banner.subtitle }}</p>
                <button @click="router.push('/')" class="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-xl shadow-lg">
                  Shop Now →
                </button>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- ═══ Popular Products Section ═══ -->
      <div v-if="topProducts.length" class="mb-16 animate-fade-in-up delay-200">
        <div class="text-center mb-8">
          <span class="inline-block px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold mb-3">TRENDING NOW</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Most Popular Products</h2>
          <p class="text-gray-500 mt-2 max-w-xl mx-auto">Discover what everyone's buying — our top sellers based on real orders</p>
        </div>

        <Swiper
          :modules="swiperModules"
          :slides-per-view="1"
          :space-between="24"
          :navigation="true"
          :pagination="{ clickable: true }"
          :breakpoints="{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }"
          :autoplay="{ delay: 3500, disableOnInteraction: false }"
          class="pb-12"
        >
          <SwiperSlide v-for="(product, i) in topProducts" :key="product.id">
            <div class="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 mx-2 my-4 cursor-pointer" @click="router.push(`/products/${product.id}`)">
              <div class="absolute top-4 left-4 z-20 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-white font-extrabold text-sm">#{{ i + 1 }}</span>
              </div>
              <div v-if="i === 0" class="absolute top-4 right-4 z-20 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse-glow">
                🔥 BEST SELLER
              </div>

              <div class="relative h-64 overflow-hidden">
                <img :src="product.image_url" :alt="product.name" class="w-full h-full object-cover product-image group-hover:scale-110 transition-transform duration-700" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div class="p-5">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{{ product.category }}</span>
                  <div class="flex items-center gap-1">
                    <StarRating :rating="Number(product.avg_rating)" size="h-3.5 w-3.5" />
                  </div>
                </div>
                <h3 class="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{{ product.name }}</h3>
                <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ product.description }}</p>
                <div class="flex items-center justify-between mt-4">
                  <span class="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ Number(product.price).toFixed(2) }}</span>
                  <button @click.stop="addToCart(product)" class="btn-primary text-sm py-2 px-4"><span>Add to Cart</span></button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- ═══ All Products Section ═══ -->
      <div class="animate-fade-in-up delay-300">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900">All Products</h2>
            <p class="text-gray-500 text-sm mt-1">{{ filteredCount }} products found</p>
          </div>
        </div>

        <!-- Filters Bar -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <!-- Search -->
            <div class="md:col-span-1">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
              <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input v-model="search" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white" />
              </div>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
              <select v-model="selectedCategory" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 hover:bg-white focus:bg-white transition-all appearance-none cursor-pointer">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Price Range Min -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Min Price: ${{ minPrice }}</label>
              <input type="range" :value="minPrice" min="0" :max="500" step="5" @input="onMinPriceChange" class="w-full" />
            </div>

            <!-- Price Range Max -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Max Price: ${{ maxPrice }}</label>
              <input type="range" :value="maxPrice" min="0" :max="500" step="5" @input="onMaxPriceChange" class="w-full" />
            </div>
          </div>

          <!-- Active Filters Tags -->
          <div v-if="search || selectedCategory || minPrice > 0 || maxPrice < 500" class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span v-if="search" class="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              Search: "{{ search }}"
              <button @click="search = ''" class="hover:text-indigo-900 ml-1">✕</button>
            </span>
            <span v-if="selectedCategory" class="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
              {{ selectedCategory }}
              <button @click="selectedCategory = ''" class="hover:text-purple-900 ml-1">✕</button>
            </span>
            <span v-if="minPrice > 0 || maxPrice < 500" class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              ${{ minPrice }} – ${{ maxPrice }}
              <button @click="resetPriceRange()" class="hover:text-emerald-900 ml-1">✕</button>
            </span>
            <button @click="search = ''; selectedCategory = ''; resetPriceRange()" class="text-xs text-red-500 hover:text-red-700 font-medium px-2">Clear All</button>
          </div>
        </div>

        <!-- Loading Spinner for products filter -->
        <div v-if="productsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div class="skeleton h-52 w-full"></div>
            <div class="p-4 space-y-3">
              <div class="skeleton h-4 w-20"></div>
              <div class="skeleton h-5 w-3/4"></div>
              <div class="skeleton h-4 w-1/2"></div>
              <div class="flex justify-between">
                <div class="skeleton h-6 w-16"></div>
                <div class="skeleton h-9 w-24 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="(product, index) in products" :key="product.id"
            class="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-fade-in-up"
            :style="{ animationDelay: `${index * 0.05}s` }">
            <div class="relative overflow-hidden group cursor-pointer" @click="router.push(`/products/${product.id}`)">
              <img :src="product.image_url" :alt="product.name" class="product-image w-full h-52 object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                <p class="text-white text-sm p-4 line-clamp-2">{{ product.description }}</p>
              </div>
              <span v-if="product.stock <= 5 && product.stock > 0" class="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">Only {{ product.stock }} left</span>
              <span v-if="product.stock <= 0" class="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">Sold Out</span>
            </div>
            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{{ product.category }}</span>
              </div>
              <h3 class="font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors leading-tight" @click="router.push(`/products/${product.id}`)">{{ product.name }}</h3>
              <div class="flex items-center gap-1.5 mt-1.5">
                <StarRating :rating="Number(product.avg_rating)" size="h-3.5 w-3.5" />
                <span class="text-[11px] text-gray-400 font-medium">({{ product.review_count }})</span>
              </div>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span class="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">${{ Number(product.price).toFixed(2) }}</span>
                <button @click="addToCart(product)" class="btn-primary text-xs py-2 px-3" :disabled="product.stock <= 0">
                  <span>{{ product.stock > 0 ? '+ Add' : 'Sold Out' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 animate-fade-in">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p class="text-xl font-semibold text-gray-700">No products found</p>
          <p class="text-gray-400 mt-1">Try adjusting your search or filters</p>
          <button @click="search = ''; selectedCategory = ''; resetPriceRange()" class="mt-4 btn-primary text-sm"><span>Reset Filters</span></button>
        </div>
      </div>
    </template>
  </div>
</template>
