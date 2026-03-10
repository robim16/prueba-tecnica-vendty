# ProductMgr — Vue 3 + Vite + Vue Router

Aplicación de gestión de productos con CRUD completo.

## Stack
- **Vue 3** con `<script setup>` y Composition API
- **Vue Router 4** con `createWebHashHistory`
- **Vite 5** como bundler
- **Bootstrap 5** + **FontAwesome 6** (CDN en index.html)

## Estructura

```
product-manager/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/
    │   └── main.css              ← Estilos globales
    ├── router/
    │   └── index.js              ← Rutas
    ├── composables/
    │   ├── useProducts.js        ← Estado + API (mock / real)
    │   ├── useToast.js           ← Notificaciones globales
    │   └── useProductForm.js     ← Validación de formulario
    ├── components/
    │   ├── AppSidebar.vue
    │   ├── ProductForm.vue       ← Formulario reutilizable (crear/editar)
    │   ├── DeleteModal.vue
    │   └── ToastStack.vue
    └── pages/
        ├── ProductList.vue       ← /products
        ├── ProductCreate.vue     ← /products/create
        ├── ProductEdit.vue       ← /products/:id/edit
        └── NotFound.vue          ← 404
```

## Instalación y uso

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Rutas

| Ruta                      | Nombre         | Página          |
|---------------------------|----------------|-----------------|
| /products                 | products       | ProductList     |
| /products/create          | product-create | ProductCreate   |
| /products/:id/edit        | product-edit   | ProductEdit     |
| /*                        | not-found      | NotFound        |

## Conectar tu API real

En `src/composables/useProducts.js` cada método tiene un bloque comentado
`── Real API ──`. Descomenta esos bloques y comenta los bloques `── Mock ──`
para usar tu backend. Solo necesitas cambiar la variable `API_URL`.


## MEJORAS DE CARA A UN 1000000 DE PRODUCTOS
- paginación server-side
- usar datatables con server side 
- búsqueda y filtros del lado del backend