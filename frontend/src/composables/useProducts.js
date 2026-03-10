import { ref } from 'vue'
import api from '@/axios.js'

export const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Sports', 'Home']

// Estado reactivo compartido (singleton)
const products = ref([])

export function useProducts() {
  /**
   * GET /api/products
   * Obtiene todos los productos desde el servidor.
   * Acepta filtros opcionales vía query params (search, category_id, etc.).
   */
  const fetchAll = async (params = {}) => {
    const { data } = await api.get('/products', { params })
    products.value = data
    return data
  }

  /**
   * GET /api/products/:id
   * Obtiene un producto por su ID.
   */
  const getById = async (id) => {
    const { data } = await api.get(`/products/${id}`)
    return data
  }

  /**
   * POST /api/products
   * Crea un nuevo producto y lo agrega al estado local.
   */
  const create = async (payload) => {
    const { data } = await api.post('/products', payload)
    products.value.push(data)
    return data
  }

  /**
   * PUT /api/products/:id
   * Actualiza un producto existente y sincroniza el estado local.
   */
  const update = async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload)
    const idx = products.value.findIndex(p => p.id === Number(id))
    if (idx !== -1) products.value[idx] = data
    return data
  }

  /**
   * DELETE /api/products/:id
   * Elimina un producto y lo remueve del estado local.
   */
  const remove = async (id) => {
    await api.delete(`/products/${id}`)
    const idx = products.value.findIndex(p => p.id === Number(id))
    if (idx !== -1) products.value.splice(idx, 1)
  }

  /**
   * Verifica si un SKU ya existe en el estado local.
   * Útil para validación del formulario sin llamadas extra al servidor.
   * excludeId: ignora el producto que se está editando.
   */
  const skuExists = (sku, excludeId = null) =>
    products.value.some(
      p => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== excludeId
    )


   /**
   * GET /api/products/:id
   * Obtiene un producto por su ID.
   */
  const getCategories = async (id) => {
    const { data } = await api.get(`/categories`)
    return data
  }

  return { products, fetchAll, getById, create, update, remove, skuExists, getCategories }
}
