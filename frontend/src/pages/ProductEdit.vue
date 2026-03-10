<template>
  <div>
    <header class="topbar">
      <div>
        <div class="page-title">Products <span>/ Edit</span></div>
        <div class="page-breadcrumb">
          <router-link to="/products">Products</router-link> / Editar Producto
        </div>
      </div>
      <div class="avatar">AD</div>
    </header>

    <div class="content">

      <!-- Page loader -->
      <div v-if="loading" class="page-loader">
        <div class="spinner-ring lg" />
        <span style="color:var(--text-muted); font-size:.9rem">Cargando producto...</span>
      </div>

      <!-- Not found -->
      <div v-else-if="notFound" class="empty-state" style="min-height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center">
        <div class="empty-icon"><i class="fas fa-triangle-exclamation" /></div>
        <p>Producto no encontrado.</p>
        <router-link to="/products" class="btn-ghost mt-3">
          <i class="fas fa-arrow-left" /> Volver
        </router-link>
      </div>

      <!-- Form -->
      <ProductForm
        v-else
        v-model="form"
        :errors="errors"
        :submitting="submitting"
        :is-editing="true"
        @submit="submit"
        @cancel="router.push({ name: 'products' })"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProducts } from '@/composables/useProducts.js'
import { useToast }    from '@/composables/useToast.js'
import { useProductForm } from '@/composables/useProductForm.js'
import ProductForm from '@/components/ProductForm.vue'

const router  = useRouter()
const route   = useRoute()
const id      = Number(route.params.id)

const { getById, update, skuExists } = useProducts()
const { success, error: toastError } = useToast()
const { errors, validate, sanitize } = useProductForm(skuExists, id)

const loading    = ref(true)
const notFound   = ref(false)
const submitting = ref(false)
const form = ref({ name: '', sku: '', price: '', stock: '', category_id: '' })

onMounted(async () => {
  try {
    const product = await getById(id)
    if (!product) { notFound.value = true; return }
    form.value = {
      name:        product.name,
      sku:         product.sku,
      price:       product.price,
      stock:       product.stock,
      category_id: product.category_id,
    }
  } catch (e) {
    toastError('Error loading products', e.message)
    notFound.value = true
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  if (!validate(form.value)) return
  submitting.value = true
  try {
    const payload = sanitize(form.value)
    await update(id, payload)
    success('Producto actualizado', `"${payload.name}" fue guardado correctamente.`)
    router.push({ name: 'products' })
  } catch (e) {
    toastError('Error al guardar', e.message ?? 'No se pudo actualizar el producto.')
  } finally {
    submitting.value = false
  }
}
</script>
