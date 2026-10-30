import { createApp } from 'vue';
import App from './App.vue';
import localConfig from './confOp';
import './assets/tailwind.css';

const applyTheme = () => {
  const current: any = localConfig.getConfig();
  const isDark = !!current.perf.common.darkMode;
  const theme = (current.perf.custom?.theme || 'SPRING').toLowerCase();
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.backgroundColor = 'transparent';
  document.body.style.backgroundColor = 'transparent';
  document.documentElement.style.setProperty(
    '--accent',
    current.perf.custom?.primaryColor || '#ff7aa2',
  );
  window.rubick.theme = isDark ? 'dark' : 'light';
};

// 主进程可能在渲染进程加载完成前就尝试设置主题，这里在渲染层再兜底一次
applyTheme();

window.rubick.changeTheme = applyTheme;

createApp(App).mount('#app');
