<template>
  <div class="modal-backdrop-custom" @click.self="$emit('cancel')">
    <div class="modal-card">

      <div class="modal-card-header">
        <div class="modal-card-title">Confirmar Eliminación</div>
        <button class="modal-close" @click="$emit('cancel')">
          <i class="fas fa-xmark" />
        </button>
      </div>

      <div class="modal-card-body" style="text-align:center; padding-top:32px">
        <div class="delete-icon-wrap">
          <i class="fas fa-trash-can" />
        </div>
        <p style="font-size:.95rem; font-weight:600; margin-bottom:8px">
          ¿Eliminar este producto?
        </p>
        <p style="font-size:.82rem; color:var(--text-muted)">
          Estás a punto de eliminar
          <strong style="color:var(--text)">{{ product?.name }}</strong>
          <span class="sku-badge ms-1" style="font-size:.72rem">{{ product?.sku }}</span>.
          Esta acción no se puede deshacer.
        </p>
      </div>

      <div class="modal-card-footer">
        <button class="btn-ghost" @click="$emit('cancel')">Cancelar</button>
        <button class="btn-danger-custom" :disabled="deleting" @click="$emit('confirm')">
          <i class="fas" :class="deleting ? 'fa-circle-notch fa-spin' : 'fa-trash'" />
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  product:  { type: Object,  default: null  },
  deleting: { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>
