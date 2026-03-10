import { ref } from 'vue'

export function useProductForm(skuExistsFn, editingId = null) {
  const errors = ref({})

  const validate = (form) => {
    const e = {}
    const name = form.name?.trim()
    const sku  = form.sku?.trim()

    if (!name)                e.name = 'El nombre es requerido'
    else if (name.length < 3) e.name = 'Mínimo 3 caracteres'

    if (!sku)
      e.sku = 'El SKU es requerido'
    else if (skuExistsFn(sku, editingId))
      e.sku = 'Este SKU ya está en uso'

    if (form.price === '' || form.price === null || form.price === undefined)
      e.price = 'El precio es requerido'
    else if (isNaN(form.price) || Number(form.price) < 0)
      e.price = 'Precio inválido'

    if (form.stock === '' || form.stock === null || form.stock === undefined)
      e.stock = 'El stock es requerido'
    else if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Debe ser entero ≥ 0'

    if (!form.category_id) e.category_id = 'Selecciona una categoría'

    errors.value = e
    return Object.keys(e).length === 0
  }

  const clearErrors = () => { errors.value = {} }

  const sanitize = (form) => ({
    name:        form.name.trim(),
    sku:         form.sku.trim().toUpperCase(),
    price:       Number(form.price),
    stock:       Number(form.stock),
    category_id: Number(form.category_id),
  })

  return { errors, validate, clearErrors, sanitize }
}
