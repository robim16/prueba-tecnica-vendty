import { ref } from 'vue'

// Singleton compartido entre componentes
const toasts = ref([])
let tid = 0

export function useToast() {
  const add = (type, title, message, duration = 4000) => {
    const id = ++tid
    toasts.value.push({ id, type, title, message })
    setTimeout(() => remove(id), duration)
  }

  const remove = (id) => {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  return {
    toasts,
    remove,
    success: (title, msg) => add('success', title, msg),
    error:   (title, msg) => add('error',   title, msg),
    info:    (title, msg) => add('info',     title, msg),
  }
}
