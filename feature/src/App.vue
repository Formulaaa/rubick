<template>
  <div
    class="feature-shell main-container flex h-screen w-full overflow-hidden text-glass-text"
  >
    <aside
      class="flex h-full w-[188px] shrink-0 flex-col border-r border-line bg-black/[0.025] px-3 py-4 dark:bg-white/[0.035]"
    >
      <nav class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto">
        <button
          v-for="item in menuItems"
          :key="item.key"
          type="button"
          class="focus-ring relative flex h-9 items-center gap-3 rounded-[10px] px-3 text-left text-[13px] transition-colors duration-150"
          :class="
            active[0] === item.key
              ? 'bg-accent/10 text-accent'
              : 'text-glass-muted hover:bg-glass-soft hover:text-glass-text'
          "
          @click="changeMenu(item.key)"
        >
          <span
            v-if="active[0] === item.key"
            class="absolute left-0 h-4 w-[2px] rounded-full bg-accent"
          />
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ $t(item.label) }}</span>
        </button>
      </nav>

      <div class="relative mt-3 border-t border-line pt-3">
        <button
          type="button"
          class="focus-ring flex w-full items-center gap-2 rounded-[10px] p-2 text-left transition-colors hover:bg-glass-soft"
          @click="userMenuOpen = !userMenuOpen"
        >
          <img
            :src="perf.custom.logo"
            class="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/15"
          />
          <span class="min-w-0 flex-1 truncate text-[12px] text-glass-text">
            {{ perf.custom.username }}
          </span>
          <svg
            class="h-3.5 w-3.5 text-glass-muted transition-transform"
            :class="userMenuOpen ? 'rotate-90' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <div
          v-if="userMenuOpen"
          class="glass-panel absolute bottom-[calc(100%+8px)] left-0 right-0 rounded-[16px] p-1.5"
        >
          <button
            v-for="item in userMenuItems"
            :key="item.key"
            type="button"
            class="focus-ring flex w-full items-center gap-2 rounded-[9px] px-3 py-2 text-left text-[12px] text-glass-muted transition-colors hover:bg-glass-soft hover:text-glass-text"
            @click="changeMenu(item.key); userMenuOpen = false"
          >
            <component :is="item.icon" class="h-4 w-4" />
            <span>{{ $t(item.label) }}</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="relative h-full min-w-0 flex-1 overflow-auto">
      <div
        class="glass-scroll mx-auto flex min-h-full w-full max-w-[1060px] flex-col px-6 py-5"
      >
        <router-view />
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import {
  ApiOutlined,
  BugOutlined,
  CodeOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  HeartOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StarOutlined,
} from '@ant-design/icons-vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import localConfig from '@/confOp';

const store = useStore();
const router = useRouter();
const active = computed(() => store.state.active);
const { perf } = localConfig.getConfig();
const userMenuOpen = ref(false);

const menuItems = [
  { key: 'finder', label: 'feature.market.explore', icon: StarOutlined },
  { key: 'worker', label: 'feature.market.efficiency', icon: SendOutlined },
  { key: 'tools', label: 'feature.market.searchTool', icon: SearchOutlined },
  { key: 'image', label: 'feature.market.imageTool', icon: FileImageOutlined },
  { key: 'devPlugin', label: 'feature.market.developTool', icon: CodeOutlined },
  { key: 'system', label: 'feature.market.systemTool', icon: DatabaseOutlined },
  {
    key: 'localPlugin',
    label: 'feature.market.localPlugin',
    icon: ApiOutlined,
  },
];

const userMenuItems = [
  { key: 'settings', label: 'feature.settings.title', icon: SettingOutlined },
  { key: 'installed', label: 'feature.installed.title', icon: HeartOutlined },
  { key: 'dev', label: 'feature.dev.title', icon: BugOutlined },
];

const changeMenu = (key: any) => {
  store.commit('commonUpdate', { active: [key] });
  router.push(key);
};

window.rubick.onPluginEnter(({ code }: { code: string }) => {
  code = code === '已安装插件' ? 'installed' : code;
  changeMenu(code);
  store.commit('commonUpdate', { active: [code] });
});

window.rubick.setSubInput((e: any) => {
  if (
    [
      'finder',
      'result',
      'devPlugin',
      'image',
      'tools',
      'worker',
      'system',
    ].includes(active.value[0])
  ) {
    if (e.text) {
      store.commit('setSearchValue', e.text);
      router.push('result');
    } else {
      store.commit('commonUpdate', { active: ['finder'] });
      router.push('finder');
    }
  }
}, '搜索插件');

const init = () => store.dispatch('init');
init();
</script>
