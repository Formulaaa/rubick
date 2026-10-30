import {
  Avatar,
  Button,
  Col,
  ConfigProvider,
  Divider,
  Input,
  List,
  Row,
  Spin,
  Tag,
} from 'ant-design-vue';
import { createApp } from 'vue';
import App from './App.vue';
import localConfig from './confOp';

import 'ant-design-vue/dist/antd.variable.min.css';

const applyTheme = () => {
  const current: any = localConfig.getConfig();
  const isDark = !!current.perf.common.darkMode;
  const background = isDark ? '#1c1c28' : '#fff';
  document.body.classList.toggle('dark', isDark);
  document.documentElement.style.backgroundColor = background;
  document.body.style.backgroundColor = background;
  window.rubick.theme = isDark ? 'dark' : 'light';
  ConfigProvider.config({
    theme: current.perf.custom || {},
  });
};

// 主进程可能在渲染进程加载完成前就尝试设置主题，这里在渲染层再兜底一次
applyTheme();

window.rubick.changeTheme = applyTheme;

createApp(App)
  .use(Button)
  .use(List)
  .use(Spin)
  .use(Input)
  .use(Avatar)
  .use(Tag)
  .use(Row)
  .use(Col)
  .use(Divider)
  .mount('#app');
