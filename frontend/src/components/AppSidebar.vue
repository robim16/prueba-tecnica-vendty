<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <router-link to="/products" class="brand-logo">
        <div class="icon-wrap"><i class="fas fa-box-open" /></div>
        <span>ProductMgr</span>
      </router-link>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-label">Main</div>
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="nav-item"
      >
        <i class="fas fa-fw" :class="item.icon" />
        {{ item.label }}
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
const navItems = [
  { label: 'Products',  icon: 'fa-table-cells', to: '/products' },
]

</script>
