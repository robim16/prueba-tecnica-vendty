import { defineComponent } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.esm-browser.prod.js';
import AppSidebar from './components/AppSidebar.js';
import ToastStack from './components/ToastStack.js';

export default defineComponent({
  name: 'App',
  components: { AppSidebar, ToastStack },
  template: `
    <div style="display:flex;min-height:100vh">
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
  `,
});
