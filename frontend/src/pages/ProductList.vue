<template>
  <div>
    <!-- Topbar -->
    <header class="topbar">
      <div>
        <div class="page-title">Products <span>/ List</span></div>
        <div class="page-breadcrumb">
          <router-link to="/products">Products</router-link> / All
        </div>
      </div>
      <div class="avatar">AD</div>
    </header>

    <div class="content">
      <div class="panel">

        <!-- Preloader overlay -->
        <div v-if="loading" class="preloader-overlay">
          <div class="preloader-box">
            <div class="spinner-ring" />
            <div class="preloader-text">Cargando productos...</div>
          </div>
        </div>

        <!-- Panel header -->
        <div class="panel-header">
          <div class="panel-title">
            <i class="fas fa-list me-2" style="color:var(--accent-light)" />
            Product List
            <span style="font-size:.75rem; font-weight:500; color:var(--text-muted); margin-left:8px">
              ({{ filtered.length }})
            </span>
          </div>

          <div class="d-flex gap-2 align-items-center flex-wrap">
            <!-- Search -->
            <div class="search-wrap">
              <i class="fas fa-magnifying-glass" />
              <input
                v-model="searchQuery"
                type="text"
                class="custom-input search-input"
                placeholder="Nombre o SKU..."
                @input="currentPage = 1"
              />
            </div>

            <!-- Category filter -->
            <select v-model="selectedCat" class="custom-select" @change="currentPage = 1">
              <option value="">Todas las categorías</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>

            <!-- New product -->
            <router-link :to="{ name: 'product-create' }" class="btn-primary-custom">
              <i class="fas fa-plus" /> Nuevo Producto
            </router-link>
          </div>
        </div>

        <!-- Table -->
        <div style="overflow-x:auto">
          <table class="products-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th style="text-align:right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in paginated" :key="p.id">
                <td><span class="product-name">{{ p.name }}</span></td>
                <td><span class="sku-badge">{{ p.sku }}</span></td>
                <td><span class="price-val">${{ formatPrice(p.price) }}</span></td>
                <td>
                  <span class="stock-indicator" :class="stockClass(p.stock)">
                    <span class="stock-dot" />{{ p.stock }}
                  </span>
                </td>
                <td>
                  <span class="category-badge" :class="`cat-${p.category}`">{{ p.category?.name }}</span>
                </td>
                <td style="text-align:right">
                  <div class="d-flex gap-1 justify-content-end">
                    <router-link
                      :to="{ name: 'product-edit', params: { id: p.id } }"
                      class="btn-sm-icon edit"
                      title="Editar"
                    >
                      <i class="fas fa-pen" />
                    </router-link>
                    <button class="btn-sm-icon del" title="Eliminar" @click="openDelete(p)">
                      <i class="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div v-if="!loading && filtered.length === 0" class="empty-state">
            <div class="empty-icon"><i class="fas fa-box-open" /></div>
            <p>No se encontraron productos con los filtros aplicados.</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filtered.length > 0" class="pagination-wrap">
          <div class="page-info">
            Mostrando <strong>{{ fromItem }}–{{ toItem }}</strong>
            de <strong>{{ filtered.length }}</strong> productos
          </div>
          <div class="d-flex align-items-center gap-2">
            <div class="page-nums">
              <button
                v-for="pg in visiblePages"
                :key="pg"
                class="page-num-btn"
                :class="{ active: pg === currentPage }"
                @click="currentPage = pg"
              >{{ pg }}</button>
            </div>
            <button class="btn-ghost" :disabled="currentPage <= 1" @click="currentPage--">
              <i class="fas fa-chevron-left" /> Anterior
            </button>
            <button class="btn-ghost" :disabled="currentPage >= totalPages" @click="currentPage++">
              Siguiente <i class="fas fa-chevron-right" />
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Delete modal -->
    <DeleteModal
      v-if="showDelete"
      :product="toDelete"
      :deleting="deleting"
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProducts, CATEGORIES } from '@/composables/useProducts.js'
import { useToast } from '@/composables/useToast.js'
import DeleteModal from '@/components/DeleteModal.vue'
import { useCategories } from '@/composables/useCategories.js'

const { products, fetchAll, remove } = useProducts()
const { success, error: toastError } = useToast()
const { categories, fetchCategories } = useCategories()

// State
const loading     = ref(false)
const searchQuery = ref('')
const selectedCat = ref('')
const currentPage = ref(1)
const PAGE_SIZE   = 10
const showDelete  = ref(false)
const toDelete    = ref(null)
const deleting    = ref(false)

// Load
onMounted(async () => {
  loading.value = true
  try {
    await fetchAll()
  } catch (e) {
    toastError('Error loading products', e.message ?? 'No se pudo conectar con el servidor.')
  } finally {
    loading.value = false
  }
})

// Filters & pagination
const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return products.value.filter(p => {
    const matchQ   = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchCat = !selectedCat.value || p.category === selectedCat.value
    return matchQ && matchCat
  })
})

const totalPages   = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE))
const paginated    = computed(() => filtered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))
const fromItem     = computed(() => filtered.value.length ? (currentPage.value - 1) * PAGE_SIZE + 1 : 0)
const toItem       = computed(() => Math.min(currentPage.value * PAGE_SIZE, filtered.value.length))
const visiblePages = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  let s = Math.max(1, cur - 2)
  let e = Math.min(total, s + 4)
  if (e - s < 4) s = Math.max(1, e - 4)
  return Array.from({ length: e - s + 1 }, (_, i) => s + i)
})

// Helpers
const formatPrice = v => Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const stockClass  = s => s > 10 ? 'stock-ok' : s > 0 ? 'stock-low' : 'stock-none'

// Delete
const openDelete = (p) => { toDelete.value = p; showDelete.value = true }
const confirmDelete = async () => {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.id)
    if (paginated.value.length === 0 && currentPage.value > 1) currentPage.value--
    success('Producto eliminado', `"${toDelete.value.name}" fue eliminado.`)
    showDelete.value = false
    toDelete.value   = null
  } catch (e) {
    toastError('Error al eliminar', e.message)
  } finally {
    deleting.value = false
  }
}
</script>
