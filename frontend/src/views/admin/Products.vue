<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import { toastSuccess, toastError, confirmDialog } from '../../utils/toast'

const products = ref([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)

const form = ref({ name: '', description: '', price: '', stock: '', category: '', image_url: '' })

async function fetchProducts() {
  try {
    const { data } = await api.get('/products')
    products.value = data
  } catch {
    toastError('Failed to load products')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editing.value = null
  form.value = { name: '', description: '', price: '', stock: '', category: '', image_url: '' }
  showModal.value = true
}

function openEdit(product) {
  editing.value = product.id
  form.value = { name: product.name, description: product.description, price: product.price, stock: product.stock, category: product.category, image_url: product.image_url }
  showModal.value = true
}

async function saveProduct() {
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/products/${editing.value}`, form.value)
      toastSuccess('Product updated!')
    } else {
      await api.post('/products', form.value)
      toastSuccess('Product added!')
    }
    showModal.value = false
    fetchProducts()
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to save product')
  } finally {
    saving.value = false
  }
}

async function deleteProduct(id, name) {
  const result = await confirmDialog(`Delete "${name}"?`, 'This action cannot be undone')
  if (!result.isConfirmed) return
  try {
    await api.delete(`/products/${id}`)
    toastSuccess('Product deleted')
    products.value = products.value.filter(p => p.id !== id)
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to delete')
  }
}

onMounted(fetchProducts)
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Manage Products</h1>
        <p class="text-gray-500 mt-1">{{ products.length }} products in store</p>
      </div>
      <button @click="openAdd" class="btn-primary py-2.5"><span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
        Add Product
      </span></button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
        <div class="skeleton h-12 w-12 rounded-xl"></div>
        <div class="flex-1 space-y-2"><div class="skeleton h-4 w-1/3"></div><div class="skeleton h-3 w-1/4"></div></div>
      </div>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th class="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="product.image_url" class="w-12 h-12 rounded-xl object-cover shadow-sm" />
                  <div>
                    <span class="font-bold text-gray-900 text-sm">{{ product.name }}</span>
                    <p class="text-xs text-gray-400 truncate max-w-[200px]">{{ product.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4"><span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{{ product.category }}</span></td>
              <td class="px-5 py-4 font-bold text-gray-900">${{ Number(product.price).toFixed(2) }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold" :class="product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'">{{ product.stock }}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <button @click="openEdit(product)" class="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </button>
                  <button @click="deleteProduct(product.id, product.name)" class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-200" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-extrabold text-gray-900">{{ editing ? 'Edit Product' : 'Add Product' }}</h2>
            <button @click="showModal = false" class="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
          <form @submit.prevent="saveProduct" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
              <input v-model="form.name" required class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price ($)</label>
                <input v-model="form.price" type="number" step="0.01" min="0" required class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stock</label>
                <input v-model="form.stock" type="number" min="0" required class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
              <input v-model="form.category" required class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Image URL</label>
              <input v-model="form.image_url" type="url" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button type="button" @click="showModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">Cancel</button>
              <button type="submit" :disabled="saving" class="btn-primary text-sm disabled:opacity-50"><span>{{ saving ? 'Saving...' : editing ? 'Update' : 'Add Product' }}</span></button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
