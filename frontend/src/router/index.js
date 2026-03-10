import { createRouter, createWebHashHistory } from 'vue-router'
import ProductList   from '@/pages/ProductList.vue'
import ProductCreate from '@/pages/ProductCreate.vue'
import ProductEdit   from '@/pages/ProductEdit.vue'
import NotFound      from '@/pages/NotFound.vue'

const routes = [
  { path: '/',                  redirect: '/products' },
  {
    path: '/products',
    name: 'products',
    component: ProductList,
    meta: { title: 'Products' },
  },
  {
    path: '/products/create',
    name: 'product-create',
    component: ProductCreate,
    meta: { title: 'Nuevo Producto' },
  },
  {
    path: '/products/:id/edit',
    name: 'product-edit',
    component: ProductEdit,
    meta: { title: 'Editar Producto' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: '404' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  document.title = `${to.meta.title ?? 'App'} · ProductMgr`
})

export default router
