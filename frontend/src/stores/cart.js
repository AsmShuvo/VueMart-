import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
  const coupon = ref(null)

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const discount = computed(() => coupon.value ? subtotal.value * coupon.value.discount_percent / 100 : 0)
  const total = computed(() => subtotal.value - discount.value)

  function save() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function addItem(product, quantity = 1) {
    const existing = items.value.find(i => i.product_id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity
      })
    }
    save()
  }

  function removeItem(productId) {
    items.value = items.value.filter(i => i.product_id !== productId)
    save()
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.product_id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      save()
    }
  }

  function applyCoupon(c) {
    coupon.value = c
  }

  function clearCart() {
    items.value = []
    coupon.value = null
    localStorage.removeItem('cart')
  }

  return { items, coupon, totalItems, subtotal, discount, total, addItem, removeItem, updateQuantity, applyCoupon, clearCart }
})
