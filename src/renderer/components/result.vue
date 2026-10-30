<template>
  <div
    v-show="!currentPlugin.name"
    class="result-body glass-scroll max-h-[544px] min-h-0 overflow-auto px-3 pb-2"
  >
    <template v-if="showHome">
      <div class="mb-1 flex h-7 items-center justify-between gap-2 px-1">
        <div v-if="hasPinned && hasRecent" class="flex items-center gap-1">
          <button
            type="button"
            class="focus-ring h-6 rounded-full px-2 text-[11px] transition-colors"
            :class="
              homeTab === 'pinned'
                ? 'bg-accent/10 text-accent'
                : 'text-glass-muted hover:text-glass-text'
            "
            @click="emit('setHomeTab', 'pinned')"
          >
            {{ copy.pinned }}
          </button>
          <button
            type="button"
            class="focus-ring h-6 rounded-full px-2 text-[11px] transition-colors"
            :class="
              homeTab === 'recent'
                ? 'bg-accent/10 text-accent'
                : 'text-glass-muted hover:text-glass-text'
            "
            @click="emit('setHomeTab', 'recent')"
          >
            {{ copy.recent }}
          </button>
        </div>
        <span v-else class="text-[12px] font-medium text-glass-muted">
          {{ homeTitle }}
        </span>
        <button
          v-if="canExpand"
          type="button"
          class="focus-ring flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] text-glass-muted transition-colors hover:bg-glass-soft hover:text-glass-text"
          :aria-expanded="expanded"
          @click="emit('toggleExpanded')"
        >
          {{ expanded ? copy.collapse : copy.expand }}
          <svg
            class="h-3.5 w-3.5 transition-transform duration-200"
            :class="expanded ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <div class="grid grid-cols-8 gap-1.5 max-[720px]:grid-cols-7 max-[640px]:grid-cols-6">
        <button
          v-for="(item, index) in homeItems"
          :key="item.name || index"
          type="button"
          class="group flex h-[96px] min-w-0 flex-col items-center justify-between rounded-[16px] px-1 py-3 transition-colors duration-150 focus-ring"
          :class="
            currentSelect === index
              ? 'bg-accent/10 shadow-[inset_0_0_0_1px_var(--accent-wash)]'
              : 'hover:bg-white/[0.04]'
          "
          :aria-label="itemLabel(item)"
          @click="() => openPlugin(item)"
          @contextmenu.prevent="openMenu($event, item)"
        >
          <span class="icon-plinth h-10 w-10">
            <img
              class="h-8 w-8 rounded-[9px] object-contain"
              :src="item.icon"
            />
          </span>
          <span
            class="line-clamp-2 w-full overflow-hidden text-center text-[11.5px] leading-[15px] text-glass-text"
          >
            {{ itemLabel(item) }}
          </span>
        </button>
      </div>
    </template>

    <div
      v-else-if="!options.length && !searchValue"
      class="flex flex-col items-center justify-center px-4 py-8 text-center"
    >
      <div class="text-[13px] font-medium text-glass-text">
        {{ copy.emptyTitle }}
      </div>
      <div class="mt-1 text-[11.5px] text-glass-muted">
        {{ copy.emptyDesc }}
      </div>
      <div class="mt-3 flex items-center gap-2 text-[11px] text-glass-muted">
        <span class="keycap">Esc</span>
        <span>{{ copy.emptyHint }}</span>
      </div>
    </div>

    <div
      v-else-if="searchValue && !options.length"
      class="flex flex-col items-center justify-center px-4 py-8 text-center"
    >
      <div class="text-[13px] font-medium text-glass-text">
        {{ copy.noResults }}
      </div>
      <div class="mt-1 max-w-[320px] text-[11.5px] text-glass-muted">
        {{ copy.noResultsHint }}
      </div>
      <button
        type="button"
        class="focus-ring mt-4 rounded-full border border-line px-3 py-1.5 text-[11px] text-glass-text transition-colors hover:bg-glass-soft"
        @click="emit('clearSearch')"
      >
        {{ copy.clearSearch }}
      </button>
    </div>

    <template v-else-if="options.length">
      <div class="mb-1 flex h-7 items-center justify-between px-1">
        <span class="text-[12px] font-medium text-glass-muted">
          {{ copy.results }}
        </span>
      </div>
      <div class="space-y-0.5">
        <button
          v-for="(item, index) in options"
          :key="`${item.name}-${index}`"
          type="button"
          :title="`${item.name} ${item.desc || ''}`"
          class="relative flex h-14 w-full items-center gap-3 rounded-[12px] px-3 text-left transition-colors duration-150 focus-ring"
          :class="
            currentSelect === index
              ? 'bg-accent/[0.08] shadow-[inset_0_0_0_1px_var(--accent-wash)]'
              : 'hover:bg-glass-soft/70'
          "
          @click="() => item.click()"
        >
          <span
            v-if="currentSelect === index"
            class="absolute left-1 top-1/2 h-7 w-[2px] -translate-y-1/2 rounded-full bg-accent"
          />
          <span class="icon-plinth h-9 w-9">
            <img
              class="h-7 w-7 rounded-[8px] object-contain"
              :src="item.icon"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span
              class="block truncate text-[13.5px] font-medium leading-5 text-glass-text"
            >
              <template
                v-for="(part, partIndex) in titleParts(item.name, item.match)"
                :key="partIndex"
              >
                <mark
                  v-if="part.match"
                  class="bg-transparent text-accent"
                >{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <span
              class="mt-0.5 block truncate text-[11.5px] leading-4 text-glass-muted"
            >
              {{ renderDesc(item.desc) }}
            </span>
          </span>
          <span
            class="shrink-0 rounded-full border border-line px-1.5 py-0.5 text-[10px] text-glass-muted"
          >
            {{ kindLabel(item) }}
          </span>
          <span
            v-if="currentSelect === index"
            class="keycap shrink-0"
          >↵</span>
        </button>
      </div>
    </template>

    <div
      class="mt-2 flex h-8 items-center justify-between border-t border-glass-divider px-2 text-[11px] text-glass-muted"
    >
      <span class="flex items-center gap-1.5">
        <template v-if="options.length || showHome">
          <span class="keycap">↑↓</span>
          <span>{{ copy.select }}</span>
          <span class="keycap">↵</span>
          <span>{{ copy.open }}</span>
        </template>
        <span class="keycap">Esc</span>
        <span>{{ copy.close }}</span>
      </span>
      <span v-if="options.length" class="tabular-nums">
        {{ currentSelect + 1 }} / {{ options.length }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, toRaw } from 'vue';
import localConfig from '../confOp';

const path = window.require('path');
const remote = window.require('@electron/remote');
const { ipcRenderer } = window.require('electron');

const config: any = ref(localConfig.getConfig());

ipcRenderer.on('config-changed', () => {
  config.value = localConfig.getConfig();
});

const props: any = defineProps({
  searchValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: (() => [])(),
  },
  currentSelect: {
    type: Number,
    default: 0,
  },
  currentPlugin: {
    type: Object,
    default: (() => ({}))(),
  },
  pluginHistory: {
    type: Array,
    default: (() => [])(),
  },
  homeItems: {
    type: Array,
    default: (() => [])(),
  },
  homeTab: {
    type: String,
    default: 'recent',
  },
  hasPinned: Boolean,
  hasRecent: Boolean,
  canExpand: Boolean,
  expanded: Boolean,
  clipboardFile: {
    type: Array,
    default: (() => [])(),
  },
});

const emit = defineEmits([
  'choosePlugin',
  'setPluginHistory',
  'toggleExpanded',
  'setHomeTab',
  'clearSearch',
]);

const copy = computed(() =>
  config.value.perf.common.lang === 'en-US'
    ? {
        pinned: 'Pinned',
        recent: 'Recent',
        results: 'Results',
        expand: 'Show all',
        collapse: 'Show less',
        emptyTitle: 'Search apps, plugins and commands',
        emptyDesc: 'One place for everything you need to launch.',
        emptyHint: 'Hide the launcher',
        select: 'Select',
        open: 'Open',
        switch: 'Switch',
        close: 'Hide',
        app: 'App',
        plugin: 'Plugin',
        command: 'Command',
        noResults: 'No results',
        noResultsHint: 'Try a shorter keyword or check the search scope.',
        clearSearch: 'Clear search',
      }
    : {
        pinned: '常用应用',
        recent: '最近使用',
        results: '搜索结果',
        expand: '展开',
        collapse: '收起',
        emptyTitle: '搜索应用、插件或命令',
        emptyDesc: '应用、插件、文件和命令都能在这里找到。',
        emptyHint: '收起搜索面板',
        select: '选择',
        open: '打开',
        switch: '切换',
        close: '收起',
        app: '应用',
        plugin: '插件',
        command: '命令',
        noResults: '没有找到结果',
        noResultsHint: '试试更短的关键词，或检查搜索范围。',
        clearSearch: '清除搜索',
      },
);

const showHome = computed(
  () => !props.searchValue && !props.options.length && !!props.homeItems.length,
);

const homeTitle = computed(() =>
  props.homeTab === 'pinned' ? copy.value.pinned : copy.value.recent,
);

const kindLabel = (item: any) => {
  const kind = item.pluginType || item.type;
  if (kind === 'app') return copy.value.app;
  if (
    kind === 'ui' ||
    kind === 'system' ||
    kind === 'plugin' ||
    item.value === 'plugin'
  ) {
    return copy.value.plugin;
  }
  return copy.value.command;
};

const itemLabel = (item: any) =>
  item.cmd || item.pluginName || item._name || item.name || '';

const titleParts = (title: any, match: any) => {
  if (typeof title !== 'string') return [];
  if (!props.searchValue || !match) return [{ text: title, match: false }];
  const start = Math.max(0, match[0]);
  const end = Math.min(title.length, match[1] + 1);
  if (start >= end) return [{ text: title, match: false }];
  return [
    { text: title.slice(0, start), match: false },
    { text: title.slice(start, end), match: true },
    { text: title.slice(end), match: false },
  ].filter((part) => part.text);
};

const renderDesc = (desc = '') => {
  if (desc.length > 80) {
    return `${desc.substring(0, 63)}...${desc.substring(
      desc.length - 14,
      desc.length,
    )}`;
  }
  return desc;
};

const openPlugin = (item) => {
  emit('choosePlugin', item);
};

const menuState: any = reactive({
  plugin: null,
});
let mainMenus;

const openMenu = (e, item) => {
  const pinToMain = mainMenus.getMenuItemById('pinToMain');
  const unpinFromMain = mainMenus.getMenuItemById('unpinFromMain');
  pinToMain.visible = !item.pin;
  unpinFromMain.visible = item.pin;
  mainMenus.popup({
    x: e.pageX,
    y: e.pageY,
  });
  menuState.plugin = item;
};

const initMainCmdMenus = () => {
  const menu = [
    {
      id: 'removeRecentCmd',
      label: '从"使用记录"中删除',
      icon: path.join(window.__static, 'icons', 'delete@2x.png'),
      click: () => {
        const history = props.pluginHistory.filter(
          (item) => item.name !== menuState.plugin.name,
        );
        emit('setPluginHistory', toRaw(history));
      },
    },
    {
      id: 'pinToMain',
      label: '固定到"搜索面板"',
      icon: path.join(window.__static, 'icons', 'pin@2x.png'),
      click: () => {
        const history = props.pluginHistory.map((item) => {
          if (item.name === menuState.plugin.name) {
            item.pin = true;
          }
          return item;
        });
        emit('setPluginHistory', toRaw(history));
      },
    },
    {
      id: 'unpinFromMain',
      label: '从"搜索面板"取消固定',
      icon: path.join(window.__static, 'icons', 'unpin@2x.png'),
      click: () => {
        const history = props.pluginHistory.map((item) => {
          if (item.name === menuState.plugin.name) {
            item.pin = false;
          }
          return item;
        });
        emit('setPluginHistory', toRaw(history));
      },
    },
  ];
  mainMenus = remote.Menu.buildFromTemplate(menu);
};

initMainCmdMenus();
</script>
