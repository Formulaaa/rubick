<template>
  <div class="page">
    <div class="page-header">
      <div class="min-w-0 flex-1">
        <div class="page-title">{{ $t('feature.settings.title') }}</div>
      </div>
    </div>

    <nav
      class="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-full border border-line bg-glass-soft p-1"
    >
      <button
        v-for="item in settingTabs"
        :key="item.key"
        type="button"
        class="focus-ring h-8 rounded-full px-3.5 text-[13px] transition-colors duration-150"
        :class="
          currentSelect[0] === item.key
            ? 'bg-accent/15 text-accent'
            : 'text-glass-muted hover:text-glass-text'
        "
        @click="selectTab(item.key)"
      >
        {{ $t(item.label) }}
      </button>
    </nav>

    <div class="min-w-0 flex-1">
      <UserInfo v-if="currentSelect[0] === 'userInfo'" />

      <div v-if="currentSelect[0] === 'normal'" class="space-y-6">
        <section class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.settings.basic.shortcutKey') }}
            </span>
          </div>
          <div class="surface-section">
            <div class="field-row">
              <div class="min-w-0 flex-1">
                <div class="text-[13px] text-glass-text">
                  {{ $t('feature.settings.basic.showOrHiddle') }}
                </div>
                <div v-if="isWindows" class="mt-1 flex gap-3 text-[11px]">
                  <button
                    type="button"
                    class="focus-ring rounded text-glass-muted underline underline-offset-2 hover:text-accent"
                    @click="resetDefault('Alt')"
                  >
                    Alt+Space
                  </button>
                  <button
                    type="button"
                    class="focus-ring rounded text-glass-muted underline underline-offset-2 hover:text-accent"
                    @click="resetDefault('Ctrl')"
                  >
                    Ctrl+Space
                  </button>
                </div>
              </div>
              <div
                class="focus-ring flex h-9 w-[240px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-glass-soft px-3 text-[13px] text-glass-text"
                tabindex="0"
                :title="tipText"
                @keyup="(e) => changeShortCut(e, 'showAndHidden')"
              >
                {{ shortCut.showAndHidden }}
              </div>
            </div>
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.screenCapture') }}
              </div>
              <div
                class="focus-ring flex h-9 w-[240px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-glass-soft px-3 text-[13px] text-glass-text"
                tabindex="0"
                :title="tipText"
                @keyup="(e) => changeShortCut(e, 'capture')"
              >
                {{ shortCut.capture }}
              </div>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.settings.basic.common') }}
            </span>
          </div>
          <div class="surface-section">
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.autoPaste') }}
              </div>
              <GSwitch v-model="common.autoPast" class="focus-ring" />
            </div>
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.autoBoot') }}
              </div>
              <GSwitch v-model="common.start" class="focus-ring" />
            </div>
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.spaceExec') }}
              </div>
              <GSwitch v-model="common.space" class="focus-ring" />
            </div>
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.history') }}
              </div>
              <GSwitch v-model="common.history" class="focus-ring" />
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.settings.basic.windowPosition') }}
            </span>
          </div>
          <div class="surface-section">
            <div class="field-row">
              <div class="min-w-0 flex-1">
                <div class="text-[13px] text-glass-text">
                  {{ $t('feature.settings.basic.windowPositionDesc') }}
                </div>
              </div>
              <GButton size="sm" @click="resetWindowPosition">
                {{ $t('feature.settings.basic.resetPosition') }}
              </GButton>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.settings.basic.theme') }}
            </span>
          </div>
          <div class="surface-section">
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.darkMode') }}
              </div>
              <GSwitch v-model="common.darkMode" class="focus-ring" />
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.settings.basic.language') }}
            </span>
          </div>
          <div class="surface-section">
            <div class="field-row">
              <div class="min-w-0 flex-1 text-[13px] text-glass-text">
                {{ $t('feature.settings.basic.changeLang') }}
              </div>
              <div class="w-[200px] shrink-0">
                <GSelect
                  v-model="state.common.lang"
                  class="w-full"
                  :options="options"
                  @change="changeLanguage"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-if="currentSelect[0] === 'global'" class="space-y-6">
        <section class="section-block">
          <div class="surface-section">
            <details>
              <summary
                class="focus-ring flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-medium text-glass-text marker:content-none [&::-webkit-details-marker]:hidden"
              >
                {{ $t('feature.settings.global.instructions') }}
              </summary>
              <div class="border-t border-line px-4 py-4">
                <div class="text-[12px] text-glass-muted">
                  {{ $t('feature.settings.global.tips') }}
                </div>
                <h3 class="mt-3 text-[13px] font-semibold text-glass-text">
                  {{ $t('feature.settings.global.example') }}
                </h3>
                <div class="mt-1 flex flex-col divide-y divide-line">
                  <div
                    v-for="item in examples"
                    :key="item.title"
                    class="py-2.5"
                  >
                    <div class="text-[13px] text-glass-text">
                      {{ item.title }}
                    </div>
                    <div class="mt-0.5 text-[11px] text-glass-muted">
                      {{ item.desc }}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.settings.global.title') }}
            </span>
            <button
              type="button"
              class="focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] text-accent transition-colors hover:bg-accent/10"
              @click="addConfig"
            >
              <PlusCircleOutlined />
              {{ $t('feature.settings.global.addShortcutKey') }}
            </button>
          </div>
          <div class="surface-section">
            <div
              v-for="(item, index) in global"
              :key="index"
              class="field-row"
            >
              <div class="min-w-0 flex-1">
                <div class="text-[11px] text-glass-muted">
                  {{ $t('feature.settings.global.shortcutKey') }}
                </div>
                <div
                  class="focus-ring group relative mt-1 flex h-9 w-full max-w-[240px] cursor-pointer items-center justify-center rounded-[10px] border border-line bg-glass-soft px-8 text-[13px] text-glass-text"
                  tabindex="0"
                  :title="tipText"
                  @keyup="(e) => changeGlobalKey(e, index)"
                >
                  {{ item.key }}
                  <button
                    type="button"
                    class="focus-ring absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-glass-muted opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
                    @keyup.stop
                    @click.stop="deleteGlobalKey($event, index)"
                  >
                    <MinusCircleOutlined />
                  </button>
                </div>
              </div>
              <div class="w-[240px] shrink-0">
                <div class="text-[11px] text-glass-muted">
                  {{ $t('feature.settings.global.funtionKey') }}
                </div>
                <GInput
                  :model-value="item.value"
                  class="mt-1 h-9 rounded-[10px] text-center text-[13px]"
                  :disabled="!item.key"
                  @update:model-value="(value) => changeGlobalValue(index, value)"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Localhost v-if="currentSelect[0] === 'localhost'" />
      <LocalStart v-if="currentSelect[0] === 'localstart'" />
      <DataBase v-if="currentSelect[0] === 'database'" />
    </div>
  </div>
</template>

<script setup>
import {
  DatabaseOutlined,
  FolderOpenOutlined,
  LaptopOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SafetyOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import debounce from 'lodash.debounce';
import { computed, reactive, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { GButton, GInput, GSelect, GSwitch, toast } from '@/components/ui';
import localConfig from '@/confOp';
import DataBase from './database';
import keycodes from './keycode';
import LocalStart from './local-start';
import Localhost from './localhost.vue';
import UserInfo from './user-info';

const { locale, t } = useI18n();

const { ipcRenderer } = window.require('electron');

const resetWindowPosition = () => {
  window.rubick.resetWindowPosition();
  toast.success(t('feature.settings.basic.resetPositionSuccess'));
};

const examples = [
  {
    title: t('feature.settings.global.example1'),
    desc: t('feature.settings.global.tips1'),
  },
  {
    title: t('feature.settings.global.example2'),
    desc: t('feature.settings.global.tips2'),
  },
];

const state = reactive({
  shortCut: {},
  common: {},
  local: {},
  global: [],
  custom: {},
});

// 添加lastKeyPressTime变量来跟踪按键时间
const lastKeyPressTime = ref(0);
const DOUBLE_CLICK_THRESHOLD = 300; // 双击时间阈值（毫秒）

const isWindows = window?.rubick?.isWindows();
const tipText = computed(() => {
  const optionKeyName = isWindows ? 'Alt' : 'Option、Command';
  return (
    t('feature.settings.global.addShortcutKeyTips', {
      optionKeyName: optionKeyName,
    }) + `此外你也可以双击修饰键如（Ctrl+Ctrl）`
  );
});

const currentSelect = ref(['userInfo']);

const settingTabs = [
  { key: 'userInfo', label: 'feature.settings.account.accountInfo' },
  { key: 'normal', label: 'feature.settings.basic.title' },
  { key: 'localstart', label: 'feature.settings.localstart.title' },
  { key: 'global', label: 'feature.settings.global.title' },
  { key: 'database', label: 'feature.settings.database.title' },
  { key: 'localhost', label: 'feature.settings.intranet.title' },
];

const selectTab = (key) => {
  currentSelect.value = [key];
};

const { perf, global: defaultGlobal } = localConfig.getConfig();

state.shortCut = perf.shortCut;
state.custom = perf.custom;
state.common = perf.common;
state.local = perf.local;
state.global = defaultGlobal;

const setConfig = debounce(() => {
  const { perf } = localConfig.getConfig();
  localConfig.setConfig(
    JSON.parse(
      JSON.stringify({
        perf: {
          ...perf,
          shortCut: state.shortCut,
          common: state.common,
          local: state.local,
        },
        global: state.global,
      }),
    ),
  );
  ipcRenderer.send('re-register');
}, 500);

watch(state, setConfig);

const changeShortCut = (e, key) => {
  let compose = '';
  const currentTime = Date.now();
  const isDoubleClick =
    currentTime - lastKeyPressTime.value < DOUBLE_CLICK_THRESHOLD;
  lastKeyPressTime.value = currentTime;

  // 处理 F1-F12 功能键
  if (e.keyCode >= 112 && e.keyCode <= 123) {
    state.shortCut[key] = keycodes[e.keyCode].toUpperCase();
    return;
  }

  // 处理双击功能键的情况
  if (isDoubleClick) {
    if (e.keyCode === 17) {
      // Ctrl
      state.shortCut[key] = 'Ctrl+Ctrl';
      return;
    }
    if (e.keyCode === 18) {
      // Alt
      state.shortCut[key] = 'Option+Option';
      return;
    }
    if (e.keyCode === 16) {
      // Shift
      state.shortCut[key] = 'Shift+Shift';
      return;
    }
    if (e.key === 'Meta' || [91, 92, 93].includes(e.keyCode)) {
      // Command
      state.shortCut[key] = 'Command+Command';
      return;
    }
  }

  // 处理功能键+普通键的组合
  let hasModifierKey = false;

  if (e.ctrlKey && e.keyCode !== 17) {
    compose += '+Ctrl';
    hasModifierKey = true;
  }
  if (e.shiftKey && e.keyCode !== 16) {
    compose += '+Shift';
    hasModifierKey = true;
  }
  if (e.altKey && e.keyCode !== 18) {
    compose += '+Option';
    hasModifierKey = true;
  }
  if (e.metaKey && e.key !== 'Meta') {
    compose += '+Command';
    hasModifierKey = true;
  }

  // 只有当有修饰键时才添加普通键
  if (hasModifierKey) {
    compose += '+' + keycodes[e.keyCode].toUpperCase();
    compose = compose.substring(1);
    state.shortCut[key] = compose;
  } else {
    // 不做处理
  }
};

const changeGlobalKey = (e, index) => {
  let compose = '';
  // 添加是否包含功能键的判断
  let incluFuncKeys = false;
  if (e.ctrlKey && e.keyCode !== 17) {
    compose += '+Ctrl';
    incluFuncKeys = true;
  }
  if (e.shiftKey && e.keyCode !== 16) {
    compose += '+Shift';
    incluFuncKeys = true;
  }
  if (e.altKey && e.keyCode !== 18) {
    compose += '+Option';
    incluFuncKeys = true;
  }
  if (e.metaKey && e.key !== 'Meta') {
    compose += '+Command';
    incluFuncKeys = true;
  }
  compose += '+' + keycodes[e.keyCode].toUpperCase();
  compose = compose.substring(1);
  if (
    incluFuncKeys &&
    e.keyCode !== 16 &&
    e.keyCode !== 17 &&
    e.keyCode !== 18 &&
    e.key !== 'Meta'
  ) {
    state.global[index].key = compose;
  } else {
    // 不做处理
  }
  // f1 - f12
  if (!incluFuncKeys && e.keyCode >= 112 && e.keyCode <= 123) {
    compose = keycodes[e.keyCode].toUpperCase();
    state.global[index].key = compose;
  }
};

const resetDefault = (key) => {
  switch (key) {
    case 'Alt':
      state.shortCut['showAndHidden'] = 'Option+SPACE';
      // copyValue.value = "Option+SPACE";
      break;
    case 'Ctrl':
      state.shortCut['showAndHidden'] = 'Ctrl+SPACE';
      // copyValue.value = "Ctrl+SPACE";
      break;
    default:
      break;
  }
  setConfig();
};

const changeGlobalValue = (index, value) => {
  state.global[index].value = value;
};

const deleteGlobalKey = (e, index) => {
  state.global.splice(index, 1);
  // delete state.global[index];
};

const addConfig = () => {
  state.global.push({
    key: '',
    value: '',
  });
};

const { shortCut, common, local, global } = toRefs(state);

const options = ref([
  {
    value: 'zh-CN',
    label: t('feature.settings.basic.cn'),
  },
  {
    value: 'en-US',
    label: t('feature.settings.basic.en'),
  },
]);

const changeLanguage = (event) => {
  const value = event?.target?.value ?? event;
  state.common.lang = value;
  locale.value = value;
};
</script>
