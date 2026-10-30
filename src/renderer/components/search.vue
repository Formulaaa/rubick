<template>
  <div class="search-shell relative flex h-[60px] shrink-0 items-center px-2.5">
    <div
      class="search-well well flex h-11 w-full items-center gap-2.5 rounded-[14px] px-2.5"
    >
      <div
        v-if="!!clipboardFile.length"
        class="flex h-7 max-w-[220px] items-center gap-2 rounded-lg border border-glass-border bg-glass-soft px-2 text-[13px] text-glass-text"
      >
        <img class="h-5 w-5 rounded-md" :src="getIcon()" />
        <span class="truncate">{{ clipboardFile[0].name }}</span>
        <span
          v-if="clipboardFile.length > 1"
          class="rounded-full bg-white/10 px-1.5 text-[10px] text-glass-muted"
        >
          {{ clipboardFile.length }}
        </span>
      </div>
      <button
        v-else
        type="button"
        title="打开插件市场"
        aria-label="打开插件市场"
        class="focus-ring flex shrink-0 items-center gap-2 rounded-lg transition-transform active:scale-95"
        @click="emit('openMenu')"
      >
        <img
          @error="onLogoError"
          class="rubick-logo h-7 w-7 rounded-full ring-1 ring-white/20"
          :src="config.perf.custom.logo || currentPlugin.logo"
        />
        <span
          v-show="currentPlugin.cmd && currentPlugin.name !== 'rubick-system-feature'"
          class="whitespace-pre text-sm text-glass-text"
        >
          {{ currentPlugin.cmd }}
        </span>
      </button>
      <input
        id="search"
        ref="mainInput"
        type="text"
        autocomplete="off"
        spellcheck="false"
        aria-label="搜索应用、插件或命令"
        class="main-input h-9 min-w-0 flex-1 appearance-none border-0 bg-transparent px-0.5 text-[15px] text-glass-text outline-none ring-0 placeholder:text-glass-muted focus:outline-none focus:ring-0"
        @input="(e) => changeValue(e)"
        @keydown.down="(e) => keydownEvent(e, 'down')"
        @keydown.up="(e) => keydownEvent(e, 'up')"
        @keydown="(e) => checkNeedInit(e)"
        :value="searchValue"
        :placeholder="displayPlaceholder"
        @keypress.enter="(e) => keydownEvent(e, 'enter')"
        @keypress.space="(e) => keydownEvent(e, 'space')"
        @focus="emit('focus')"
      />
      <span class="keycap shrink-0">Esc</span>
      <button
        type="button"
        aria-label="更多选项"
        class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-glass-muted transition-colors hover:bg-glass-soft hover:text-glass-text"
        @click="showSeparate()"
      >
        <MoreOutlined class="text-lg" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MoreOutlined } from '@ant-design/icons-vue';
import { ipcRenderer } from 'electron';
import { computed, ref } from 'vue';
import fileIcon from '../assets/file.png';
import defaultLogo from '../assets/logo.png';

const remote = window.require('@electron/remote');

import localConfig from '../confOp';

const { Menu } = remote;

const config: any = ref(localConfig.getConfig());

const onLogoError = (e) => {
  // 兜底默认头像，避免自定义图片失效后一直显示裂图
  const fallback = new URL(defaultLogo, document.baseURI).href;
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
};

ipcRenderer.on('config-changed', () => {
  config.value = localConfig.getConfig();
});

const props: any = defineProps({
  searchValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  pluginHistory: (() => [])(),
  currentPlugin: {},
  pluginLoading: Boolean,
  clipboardFile: (() => [])(),
});

const displayPlaceholder = computed(() => {
  if (props.pluginLoading) return '更新检测中...';
  if (props.placeholder) return props.placeholder;
  const custom = config.value.perf.custom?.placeholder;
  if (
    !custom ||
    custom === '你好，Rubick！请输入插件关键词' ||
    custom === '你好，Rubick！请输入插件关键词。'
  ) {
    return config.value.perf.common.lang === 'en-US'
      ? 'Search apps, plugins, files or commands'
      : '搜索应用、插件、文件或命令';
  }
  return custom;
});

const changeValue = (e) => {
  // if (props.currentPlugin.name === 'rubick-system-feature') return;
  targetSearch({ value: e.target.value });
  emit('onSearch', e);
};

const emit = defineEmits([
  'onSearch',
  'changeCurrent',
  'openMenu',
  'changeSelect',
  'choosePlugin',
  'focus',
  'clearSearchValue',
  'readClipboardContent',
  'clearClipbord',
]);

const keydownEvent = (e, key: string) => {
  key !== 'space' && e.preventDefault();
  const { ctrlKey, shiftKey, altKey, metaKey } = e;
  const modifiers: Array<string> = [];
  ctrlKey && modifiers.push('control');
  shiftKey && modifiers.push('shift');
  altKey && modifiers.push('alt');
  metaKey && modifiers.push('meta');
  ipcRenderer.send('msg-trigger', {
    type: 'sendPluginSomeKeyDownEvent',
    data: {
      keyCode: e.code,
      modifiers,
    },
  });
  const runPluginDisable =
    (e.target.value === '' && !props.pluginHistory.length) ||
    props.currentPlugin.name;
  switch (key) {
    case 'up':
      emit('changeCurrent', -1);
      break;
    case 'down':
      emit('changeCurrent', 1);
      break;
    case 'enter':
      if (runPluginDisable) return;
      emit('choosePlugin');
      break;
    case 'space':
      if (runPluginDisable || !config.value.perf.common.space) return;
      e.preventDefault();
      emit('choosePlugin');
      break;
    default:
      break;
  }
};

const checkNeedInit = (e) => {
  const { ctrlKey, metaKey } = e;

  if (e.target.value === '' && e.keyCode === 8) {
    closeTag();
  }
  // 手动粘贴
  if ((ctrlKey || metaKey) && e.key === 'v') {
    emit('readClipboardContent');
  }
};

const targetSearch = ({ value }) => {
  if (props.currentPlugin.name) {
    return ipcRenderer.sendSync('msg-trigger', {
      type: 'sendSubInputChangeEvent',
      data: { text: value },
    });
  }
};

const closeTag = () => {
  emit('changeSelect', {});
  emit('clearClipbord');
  ipcRenderer.send('msg-trigger', {
    type: 'removePlugin',
  });
};

const showSeparate = () => {
  let pluginMenu: any = [
    {
      label: config.value.perf.common.hideOnBlur ? '钉住' : '自动隐藏',
      click: changeHideOnBlur,
    },
    {
      label:
        config.value.perf.common.lang === 'zh-CN'
          ? '切换语言'
          : 'Change Language',
      submenu: [
        {
          label: '简体中文',
          click: () => {
            changeLang('zh-CN');
          },
        },
        {
          label: 'English',
          click: () => {
            changeLang('en-US');
          },
        },
      ],
    },
  ];
  if (props.currentPlugin && props.currentPlugin.logo) {
    pluginMenu = pluginMenu.concat([
      {
        label: '开发者工具',
        click: () => {
          ipcRenderer.send('msg-trigger', { type: 'openPluginDevTools' });
          // todo
        },
      },
      {
        label: '当前插件信息',
        submenu: [
          {
            label: '简介',
          },
          {
            label: '功能',
          },
        ],
      },
      {
        label: '分离窗口',
        click: newWindow,
      },
    ]);
  }
  let menu = Menu.buildFromTemplate(pluginMenu);
  menu.popup();
};

const changeLang = (lang) => {
  let cfg = { ...config.value };
  cfg.perf.common.lang = lang;
  localConfig.setConfig(JSON.parse(JSON.stringify(cfg)));
  config.value = cfg;
};

const changeHideOnBlur = () => {
  let cfg = { ...config.value };
  cfg.perf.common.hideOnBlur = !cfg.perf.common.hideOnBlur;
  localConfig.setConfig(JSON.parse(JSON.stringify(cfg)));
  config.value = cfg;
};

const getIcon = () => {
  if (props.clipboardFile[0].dataUrl) return props.clipboardFile[0].dataUrl;
  try {
    return ipcRenderer.sendSync('msg-trigger', {
      type: 'getFileIcon',
      data: { path: props.clipboardFile[0].path },
    });
  } catch (e) {
    return fileIcon;
  }
};

const newWindow = () => {
  ipcRenderer.send('msg-trigger', {
    type: 'detachPlugin',
  });
  // todo
};

const mainInput = ref(null);
window.rubick.hooks.onShow = () => {
  (mainInput.value as unknown as HTMLDivElement).focus();
};

window.rubick.hooks.onHide = () => {
  emit('clearSearchValue');
};
</script>
