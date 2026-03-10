<template>
  <div style="display:flex; min-height:100vh">
    <AppSidebar />
    <div class="main-wrap">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <ToastStack />
  </div>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import ToastStack from '@/components/ToastStack.vue'
</script>
