<template>
  <div class="toast-stack">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast-item"
        :class="`toast-${t.type}`"
      >
        <div class="toast-icon">
          <i class="fas" :class="iconClass(t.type)" />
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ t.title }}</div>
          <div class="toast-msg">{{ t.message }}</div>
        </div>
        <button class="toast-close" @click="remove(t.id)">
          <i class="fas fa-xmark" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast.js'

const { toasts, remove } = useToast()

const iconClass = (type) => ({
  error:   'fa-circle-xmark',
  success: 'fa-circle-check',
  info:    'fa-circle-info',
}[type] ?? 'fa-circle-info')
</script>
