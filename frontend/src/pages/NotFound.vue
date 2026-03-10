<template>
  <div>
    <header class="topbar">
      <div class="page-title">404 <span>/ Not Found</span></div>
      <div class="avatar">AD</div>
    </header>

    <div class="content">
      <div class="not-found-wrap">
        <div class="not-found-code">404</div>
        <p style="font-size:1.1rem; font-weight:600; color:var(--text)">Página no encontrada</p>
        <p style="color:var(--text-muted); font-size:.9rem">La ruta que buscas no existe.</p>
        <router-link to="/products" class="btn-primary-custom mt-2">
          <i class="fas fa-arrow-left" /> Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>
