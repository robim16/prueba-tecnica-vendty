<template>
  <div>
    <header class="topbar">
      <div>
        <div class="page-title">Products <span>/ New</span></div>
        <div class="page-breadcrumb">
          <router-link to="/products">Products</router-link> / Nuevo Producto
        </div>
      </div>
      <div class="avatar">AD</div>
    </header>

    <div class="content">
      <ProductForm
        v-model="form"
        :errors="errors"
        :submitting="submitting"
        :is-editing="false"
        @submit="submit"
        @cancel="router.push({ name: 'products' })"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts.js'
import { useToast }    from '@/composables/useToast.js'
import { useProductForm } from '@/composables/useProductForm.js'
import ProductForm from '@/components/ProductForm.vue'

const router = useRouter()
const { create, skuExists } = useProducts()
const { success, error: toastError } = useToast()
const { errors, validate, sanitize } = useProductForm(skuExists)

const submitting = ref(false)
const form = ref({ name: '', sku: '', price: '', stock: '', category_id: '' })

const submit = async () => {
  if (!validate(form.value)) return
  submitting.value = true
  try {
    const payload = sanitize(form.value)
    await create(payload)
    success('Producto creado', `"${payload.name}" fue agregado correctamente.`)
    router.push({ name: 'products' })
  } catch (e) {
    toastError('Error al crear', e.message ?? 'No se pudo crear el producto.')
  } finally {
    submitting.value = false
  }
}
</script>
