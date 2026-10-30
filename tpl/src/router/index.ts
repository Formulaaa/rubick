import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router';
import Doc from '../views/Doc.vue';
import List from '../views/List.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/list',
    name: 'list',
    component: List,
  },
  {
    path: '/doc',
    name: 'doc',
    component: Doc,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
