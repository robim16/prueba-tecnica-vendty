import { ref } from 'vue'
import api from '@/axios.js'

// Estado singleton — se carga una sola vez
const categories = ref([])
const loaded = ref(false)

export function useCategories() {

  const fetchCategories = async (force = false) => {
    if (loaded.value && !force) return categories.value

    const { data } = await api.get('/categories')
    categories.value = data
    loaded.value = true
    return data
  }

  return { categories, fetchCategories }
}
