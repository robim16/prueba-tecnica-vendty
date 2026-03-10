<template>
  <div class="form-card">

    <div class="form-card-header">
      <div class="form-card-title">
        <span class="title-icon">
          <i class="fas" :class="isEditing ? 'fa-pen' : 'fa-plus'" />
        </span>
        {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
      </div>
    </div>

    <div class="form-card-body">
      <div class="row g-3">

        <!-- Name -->
        <div class="col-12">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input
              :value="modelValue.name"
              type="text"
              class="form-control-custom"
              :class="{ 'is-invalid': errors.name }"
              placeholder="Nombre del producto"
              @input="emit('update:modelValue', { ...modelValue, name: $event.target.value })"
            />
            <div v-if="errors.name" class="invalid-feedback">
              <i class="fas fa-circle-exclamation" /> {{ errors.name }}
            </div>
          </div>
        </div>

        <!-- SKU -->
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">SKU *</label>
            <input
              :value="modelValue.sku"
              type="text"
              class="form-control-custom"
              :class="{ 'is-invalid': errors.sku }"
              placeholder="EJ-0001"
              style="font-family:'JetBrains Mono',monospace"
              @input="emit('update:modelValue', { ...modelValue, sku: $event.target.value })"
            />
            <div v-if="errors.sku" class="invalid-feedback">
              <i class="fas fa-circle-exclamation" /> {{ errors.sku }}
            </div>
          </div>
        </div>

        <!-- Category -->
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">Categoría *</label>

            <!-- Loading skeleton -->
            <div v-if="loadingCats" class="form-control-custom d-flex align-items-center gap-2" style="color:var(--text-muted)">
              <i class="fas fa-circle-notch fa-spin" style="font-size:.8rem" />
              <span style="font-size:.82rem">Cargando categorías...</span>
            </div>

            <!-- Error fallback -->
            <div v-else-if="catError" class="form-control-custom d-flex align-items-center gap-2" style="color:var(--danger); cursor:pointer" @click="loadCategories">
              <i class="fas fa-rotate-right" style="font-size:.8rem" />
              <span style="font-size:.82rem">Error al cargar. Clic para reintentar.</span>
            </div>

            <!-- Select -->
            <select
              v-else
              :value="modelValue.category_id"
              class="form-control-custom"
              :class="{ 'is-invalid': errors.category_id }"
              @change="emit('update:modelValue', { ...modelValue, category_id: Number($event.target.value) })"
            >
              <option value="">Seleccionar...</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >{{ cat.name }}</option>
            </select>

            <div v-if="errors.category_id" class="invalid-feedback">
              <i class="fas fa-circle-exclamation" /> {{ errors.category_id }}
            </div>
          </div>
        </div>

        <!-- Price -->
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">Precio *</label>
            <input
              :value="modelValue.price"
              type="number"
              min="0"
              step="0.01"
              class="form-control-custom"
              :class="{ 'is-invalid': errors.price }"
              placeholder="0.00"
              @input="emit('update:modelValue', { ...modelValue, price: $event.target.value })"
            />
            <div v-if="errors.price" class="invalid-feedback">
              <i class="fas fa-circle-exclamation" /> {{ errors.price }}
            </div>
          </div>
        </div>

        <!-- Stock -->
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">Stock *</label>
            <input
              :value="modelValue.stock"
              type="number"
              min="0"
              class="form-control-custom"
              :class="{ 'is-invalid': errors.stock }"
              placeholder="0"
              @input="emit('update:modelValue', { ...modelValue, stock: $event.target.value })"
            />
            <div v-if="errors.stock" class="invalid-feedback">
              <i class="fas fa-circle-exclamation" /> {{ errors.stock }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="form-card-footer">
      <button class="btn-ghost" type="button" @click="emit('cancel')">
        <i class="fas fa-arrow-left" /> Cancelar
      </button>
      <button
        class="btn-primary-custom"
        type="button"
        :disabled="submitting || loadingCats"
        @click="emit('submit')"
      >
        <i class="fas" :class="submitting ? 'fa-circle-notch fa-spin' : (isEditing ? 'fa-floppy-disk' : 'fa-plus')" />
        {{ submitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories.js'

defineProps({
  modelValue: { type: Object,  required: true },
  errors:     { type: Object,  default: () => ({}) },
  submitting: { type: Boolean, default: false },
  isEditing:  { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const { categories, fetchCategories } = useCategories()
const loadingCats = ref(false)
const catError    = ref(false)

const loadCategories = async () => {
  loadingCats.value = true
  catError.value    = false
  try {
    await fetchCategories()
  } catch {
    catError.value = true
  } finally {
    loadingCats.value = false
  }
}

onMounted(loadCategories)
</script>

