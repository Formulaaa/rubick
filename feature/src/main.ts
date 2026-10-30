import { createApp } from 'vue';
import Vue3Lottie from 'vue3-lottie';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import localConfig from './confOp';
import registerI18n from './languages/i18n';

const applyTheme = () => {
  const config: any = localConfig.getConfig();
  const isDark = !!config.perf.common.darkMode;
  const theme = (config.perf.custom?.theme || 'SPRING').toLowerCase();
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.backgroundColor = 'transparent';
  document.body.style.backgroundColor = 'transparent';
  document.documentElement.style.setProperty(
    '--accent',
    config.perf.custom?.primaryColor || '#ff7aa2',
  );
  window.rubick.theme = isDark ? 'dark' : 'light';
};

applyTheme();

window.rubick.changeTheme = applyTheme;

createApp(App)
  .use(registerI18n)
  .use(store)
  .use(router)
  .use(Vue3Lottie)
  .mount('#app');
