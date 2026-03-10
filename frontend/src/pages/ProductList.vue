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
              ({{ meta.total ?? 0 }})
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
              />
            </div>

            <!-- Category filter -->
            <select v-model="selectedCatId" class="custom-select">
              <option value="">Todas las categorías</option>
              <template v-if="loadingCats">
                <option disabled>Cargando...</option>
              </template>
              <option
                v-else
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >{{ cat.name }}</option>
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
              <tr v-for="p in products" :key="p.id">
                <td><span class="product-name">{{ p.name }}</span></td>
                <td><span class="sku-badge">{{ p.sku }}</span></td>
                <td><span class="price-val">${{ formatPrice(p.price) }}</span></td>
                <td>
                  <span class="stock-indicator" :class="stockClass(p.stock)">
                    <span class="stock-dot" />{{ p.stock }}
                  </span>
                </td>
                <td>
                  <span class="category-badge" :class="`cat-${categoryName(p.category_id)}`">
                    {{ categoryName(p.category_id) }}
                  </span>
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
          <div v-if="!loading && products.length === 0" class="empty-state">
            <div class="empty-icon"><i class="fas fa-box-open" /></div>
            <p>No se encontraron productos con los filtros aplicados.</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta.total > 0" class="pagination-wrap">
          <div class="page-info">
            Mostrando <strong>{{ meta.from }}–{{ meta.to }}</strong>
            de <strong>{{ meta.total }}</strong> productos
          </div>
          <div class="d-flex align-items-center gap-2">
            <div class="page-nums">
              <button
                v-for="pg in visiblePages"
                :key="pg"
                class="page-num-btn"
                :class="{ active: pg === currentPage }"
                @click="goToPage(pg)"
              >{{ pg }}</button>
            </div>
            <button class="btn-ghost" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
              <i class="fas fa-chevron-left" /> Anterior
            </button>
            <button class="btn-ghost" :disabled="currentPage >= meta.last_page" @click="goToPage(currentPage + 1)">
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
import { ref, computed, watch, onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts.js'
import { useCategories } from '@/composables/useCategories.js'
import { useToast } from '@/composables/useToast.js'
import DeleteModal from '@/components/DeleteModal.vue'

const { fetchAll, remove } = useProducts()
const { categories, fetchCategories } = useCategories()
const { success, error: toastError } = useToast()

// ── State ──────────────────────────────────────────────────────────
const products    = ref([])
const meta        = ref({ total: 0, from: 0, to: 0, last_page: 1 })
const loading     = ref(false)
const loadingCats = ref(false)
const searchQuery = ref('')
const selectedCatId = ref('')
const currentPage = ref(1)
const PAGE_SIZE   = 10

const showDelete = ref(false)
const toDelete   = ref(null)
const deleting   = ref(false)

// ── Debounce search ────────────────────────────────────────────────
let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 400)
})

// Cambio de categoría: resetea página y recarga inmediatamente
watch(selectedCatId, () => {
  currentPage.value = 1
  loadProducts()
})

// ── Load products ──────────────────────────────────────────────────
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value.trim())  params.search      = searchQuery.value.trim()
    if (selectedCatId.value)       params.category_id = selectedCatId.value

    // El backend devuelve un arreglo simple filtrado; paginamos en el frontend.
    const all = await fetchAll(params)

    const total    = all.length
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

    if (currentPage.value > lastPage) {
      currentPage.value = lastPage
    }

    const start = (currentPage.value - 1) * PAGE_SIZE
    const end   = start + PAGE_SIZE

    products.value = all.slice(start, end)
    meta.value = {
      total,
      from: total === 0 ? 0 : start + 1,
      to:   Math.min(end, total),
      last_page: lastPage,
    }
  } catch (e) {
    toastError('Error loading products', e.message ?? 'No se pudo conectar con el servidor.')
  } finally {
    loading.value = false
  }
}

// ── Load categories (para el select y los badges) ──────────────────
const loadCats = async () => {
  loadingCats.value = true
  try {
    await fetchCategories()
  } catch {
    toastError('Error al cargar categorías', 'No se pudieron obtener las categorías.')
  } finally {
    loadingCats.value = false
  }
}

onMounted(() => {
  loadCats()
  loadProducts()
})

// ── Helpers ────────────────────────────────────────────────────────
const formatPrice  = v => Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const stockClass   = s => s > 10 ? 'stock-ok' : s > 0 ? 'stock-low' : 'stock-none'

// Resuelve el nombre de categoría a partir de su id
const categoryName = (id) => categories.value.find(c => c.id === id)?.name ?? '—'

// ── Pagination ─────────────────────────────────────────────────────
const visiblePages = computed(() => {
  const total = meta.value.last_page
  const cur   = currentPage.value
  let s = Math.max(1, cur - 2)
  let e = Math.min(total, s + 4)
  if (e - s < 4) s = Math.max(1, e - 4)
  return Array.from({ length: e - s + 1 }, (_, i) => s + i)
})

const goToPage = (page) => {
  currentPage.value = page
  loadProducts()
}

// ── Delete ─────────────────────────────────────────────────────────
const openDelete = (p) => { toDelete.value = p; showDelete.value = true }

const confirmDelete = async () => {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.id)
    success('Producto eliminado', `"${toDelete.value.name}" fue eliminado.`)
    showDelete.value = false
    toDelete.value   = null
    // Si era el último de la página, retrocede una
    if (products.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    loadProducts()
  } catch (e) {
    toastError('Error al eliminar', e.message)
  } finally {
    deleting.value = false
  }
}
</script>
