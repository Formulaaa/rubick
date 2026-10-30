<template>
  <div
    id="components-layout"
    class="launcher-stage relative h-screen w-screen overflow-hidden"
    :class="currentPlugin.name ? (isFeaturePlugin ? 'plugin-mode' : 'plugin-mode-plain') : 'p-2'"
    @mousedown="onMouseDown"
  >
    <div
      ref="surfaceRef"
      class="launcher-surface flex w-full flex-col overflow-hidden"
      :class="currentPlugin.name ? 'h-[60px]' : 'max-h-[604px] rounded-[24px]'"
    >
      <Search
        :currentPlugin="currentPlugin"
        @changeCurrent="changeIndex"
        @onSearch="onSearch"
        @openMenu="openMenu"
        @changeSelect="changeSelect"
        :searchValue="searchValue"
        :placeholder="placeholder"
        :pluginLoading="pluginLoading"
        :pluginHistory="pluginHistory"
        :clipboardFile="clipboardFile || []"
        @choosePlugin="choosePlugin"
        @focus="searchFocus"
        @clear-search-value="clearSearchValue"
        @clearClipbord="clearClipboardFile"
        @readClipboardContent="readClipboardContent"
      />
      <Result
        :pluginHistory="pluginHistory"
        :homeItems="homeItems"
        :homeTab="homeTab"
        :hasPinned="!!pinnedHistory.length"
        :hasRecent="!!recentSource.length"
        :canExpand="canExpand"
        :expanded="expanded"
        :currentPlugin="currentPlugin"
        :searchValue="searchValue"
        :currentSelect="currentSelect"
        :options="options"
        :clipboardFile="clipboardFile || []"
        @setPluginHistory="setPluginHistory"
        @choosePlugin="choosePlugin"
        @toggleExpanded="toggleExpanded"
        @setHomeTab="changeHomeTab"
        @clearSearch="clearSearchValue"
      />
    </div>
      <div
        v-if="isFeaturePlugin && !featureReady"
        class="plugin-skeleton pointer-events-none absolute bottom-2 left-2 right-2 top-[68px] flex overflow-hidden rounded-b-[24px] rounded-t-none border-t-0"
      >
        <aside class="flex h-full w-[188px] shrink-0 flex-col gap-3 border-r border-line p-4">
          <div class="flex items-center gap-2.5">
            <span class="skeleton-block h-9 w-9 rounded-[10px]" />
            <span class="skeleton-block h-3.5 w-20 rounded-full" />
          </div>
          <div class="mt-4 space-y-2">
            <span
              v-for="index in 7"
              :key="index"
              class="skeleton-block block h-8 rounded-[10px]"
              :class="index === 1 ? 'w-full' : 'w-[86%]'"
            />
          </div>
        </aside>
        <main class="min-w-0 flex-1 p-6">
          <span class="skeleton-block block h-5 w-32 rounded-full" />
          <span class="skeleton-block mt-5 block h-3 w-10 rounded-full" />
          <div class="mt-4 space-y-1">
            <div
              v-for="index in 5"
              :key="index"
              class="flex h-16 items-center gap-3 border-b border-line/70"
            >
              <span class="skeleton-block h-9 w-9 rounded-[10px]" />
              <span class="min-w-0 flex-1 space-y-2">
                <span class="skeleton-block block h-3 w-28 rounded-full" />
                <span class="skeleton-block block h-2.5 w-52 rounded-full" />
              </span>
            </div>
          </div>
        </main>
      </div>

  </div>
</template>

<script setup lang="ts">
import { getGlobal } from '@electron/remote';
import { exec } from 'child_process';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  watch,
} from 'vue';
import { PLUGIN_HISTORY } from '@/common/constans/renderer';
import useDrag from '../common/utils/dragWindow';
import Result from './components/result.vue';
import Search from './components/search.vue';
import localConfig from './confOp';
import createPluginManager from './plugins-manager';
import { toast } from './utils/toast';

const { onMouseDown } = useDrag();
const remote = window.require('@electron/remote');
const { ipcRenderer } = window.require('electron');

const {
  initPlugins,
  getPluginInfo,
  options,
  onSearch,
  searchValue,
  changeSelect,
  openPlugin,
  currentPlugin,
  placeholder,
  pluginLoading,
  searchFocus,
  clipboardFile,
  setSearchValue,
  clearClipboardFile,
  readClipboardContent,
  pluginHistory,
  setPluginHistory,
  changePluginHistory,
} = createPluginManager();

initPlugins();

const currentSelect = ref(0);
const expanded = ref(false);
const homeTab = ref<'pinned' | 'recent'>('pinned');
const featureReady = ref(false);
const surfaceRef = ref<HTMLElement>();
const menuPluginInfo: any = ref({});
const config: any = ref(localConfig.getConfig());

ipcRenderer.on('config-changed', () => {
  config.value = localConfig.getConfig();
  scheduleHeight();
});

ipcRenderer.on('feature-ready', () => {
  featureReady.value = true;
});

let resizeObserver: ResizeObserver | null = null;
let lastHeight = 0;

const isFeaturePlugin = computed(
  () => currentPlugin.value.name === 'rubick-system-feature',
);

const pinnedHistory = computed(() =>
  pluginHistory.value.filter((item: any) => item.pin),
);

const recentHistory = computed(() =>
  pluginHistory.value.filter((item: any) => !item.pin),
);

const historyEnabled = computed(() => !!config.value.perf.common.history);
const recentSource = computed(() =>
  historyEnabled.value ? recentHistory.value : [],
);

const homeSource = computed(() =>
  homeTab.value === 'pinned' ? pinnedHistory.value : recentSource.value,
);

const homeItems = computed(() =>
  homeSource.value.slice(0, expanded.value ? 16 : 8),
);

const canExpand = computed(() => homeSource.value.length > 8);

watch(
  [pinnedHistory, recentSource],
  () => {
    if (homeTab.value === 'pinned' && !pinnedHistory.value.length) {
      homeTab.value = 'recent';
    } else if (homeTab.value === 'recent' && !recentSource.value.length) {
      homeTab.value = 'pinned';
    }
  },
  { immediate: true },
);

const syncHeight = () => {
  if (currentPlugin.value.name || !surfaceRef.value) return;
  const next = Math.min(
    Math.max(
      Math.ceil(surfaceRef.value.getBoundingClientRect().height + 16),
      68,
    ),
    620,
  );
  if (next === lastHeight) return;
  lastHeight = next;
  window.rubick.setExpendHeight(next);
};

const scheduleHeight = () => {
  nextTick(() => requestAnimationFrame(syncHeight));
};

onMounted(() => {
  if (!surfaceRef.value) return;
  resizeObserver = new ResizeObserver(scheduleHeight);
  resizeObserver.observe(surfaceRef.value);
  scheduleHeight();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(
  [options, pluginHistory, currentPlugin, expanded, searchValue],
  () => {
    currentSelect.value = 0;
    if (currentPlugin.value.name) {
      lastHeight = 0;
      featureReady.value = !isFeaturePlugin.value;
      setTimeout(() => {
        document.getElementById('search')?.focus({ preventScroll: true });
      }, 120);
      return;
    }
    featureReady.value = true;
    scheduleHeight();
  },
  { immediate: true },
);

getPluginInfo({
  pluginName: 'feature',
  // eslint-disable-next-line no-undef
  pluginPath: `${window.__static}/feature/package.json`,
}).then((res) => {
  menuPluginInfo.value = res;
  remote.getGlobal('LOCAL_PLUGINS').addPlugin(res);
});

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const changeHomeTab = (tab: 'pinned' | 'recent') => {
  homeTab.value = tab;
  currentSelect.value = 0;
  expanded.value = false;
  scheduleHeight();
};

const changeIndex = (index) => {
  const len = options.value.length || homeItems.value.length;
  if (!len) return;
  if (currentSelect.value + index > len - 1) {
    currentSelect.value = 0;
  } else if (currentSelect.value + index < 0) {
    currentSelect.value = len - 1;
  } else {
    currentSelect.value = currentSelect.value + index;
  }
};

const openMenu = (ext) => {
  openPlugin({
    ...toRaw(menuPluginInfo.value),
    feature: menuPluginInfo.value.features[0],
    cmd: '插件市场',
    ext,
    click: () => openMenu(ext),
  });
};

window.rubick.openMenu = openMenu;

const choosePlugin = (plugin) => {
  if (options.value.length) {
    const currentChoose = options.value[currentSelect.value];
    currentChoose.click();
  } else {
    const localPlugins = getGlobal('LOCAL_PLUGINS').getLocalPlugins();
    const currentChoose = plugin || homeItems.value[currentSelect.value];
    if (!currentChoose) return;
    let hasRemove = true;
    if (currentChoose.pluginType === 'app') {
      hasRemove = false;
      changePluginHistory(currentChoose);
      exec(currentChoose.action);
      return;
    }
    localPlugins.find((plugin) => {
      if (plugin.name === currentChoose.originName) {
        hasRemove = false;
        return true;
      }
      return false;
    });
    if (hasRemove) {
      const result = window.rubick.db.get(PLUGIN_HISTORY) || {};
      const history = result.data.filter(
        (item) => item.originName !== currentChoose.originName,
      );
      setPluginHistory(history);
      return toast.warning('插件已被卸载！');
    }
    changePluginHistory(currentChoose);
    window.rubick.openPlugin(
      JSON.parse(
        JSON.stringify({
          ...currentChoose,
          ext: {
            code: currentChoose.feature.code,
            type: currentChoose.cmd.type || 'text',
            payload: null,
          },
        }),
      ),
    );
  }
};

const clearSearchValue = () => {
  setSearchValue('');
};
</script>
