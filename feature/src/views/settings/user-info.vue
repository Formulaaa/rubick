<template>
  <div class="space-y-6">
    <section class="section-block">
      <div class="section-head">
        <span class="section-title">
          {{ $t('feature.settings.account.themeColor') }}
        </span>
      </div>
      <div
        class="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-full border border-line bg-glass-soft p-1"
      >
        <button
          v-for="option in themeOptions"
          :key="option.value"
          type="button"
          class="focus-ring h-8 rounded-full px-4 text-[13px] transition-colors duration-150"
          :class="
            theme === option.value
              ? 'bg-accent/15 text-accent'
              : 'text-glass-muted hover:text-glass-text'
          "
          @click="selectTheme(option.value)"
        >
          {{ $t(option.label) }}
        </button>
      </div>
    </section>

    <section class="section-block">
      <div class="section-head">
        <span class="section-title">
          {{ $t('feature.settings.account.personalized') }}
        </span>
      </div>
      <div class="surface-section">
        <div class="field-row">
          <div class="min-w-0 flex-1 text-[13px] text-glass-text">
            {{ $t('feature.settings.account.greeting') }}
          </div>
          <GInput v-model="custom.placeholder" class="!w-[280px] shrink-0" />
        </div>
        <div class="field-row">
          <div class="min-w-0 flex-1 text-[13px] text-glass-text">
            {{ $t('feature.settings.account.name') }}
          </div>
          <GInput v-model="custom.username" class="!w-[280px] shrink-0" />
        </div>
        <div class="field-row">
          <div class="min-w-0 flex-1 text-[13px] text-glass-text">
            {{ $t('feature.settings.account.logo') }}
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <img
              class="h-11 w-11 rounded-xl object-cover ring-1 ring-white/15"
              :src="custom.logo"
            />
            <GButton variant="primary" size="sm" @click="changeLogo">
              {{ $t('feature.settings.account.replace') }}
            </GButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import debounce from 'lodash.debounce';
import { reactive, ref, toRefs, watch } from 'vue';
import * as Themes from '@/assets/constans';
import { GButton, GInput } from '@/components/ui';
import localConfig from '@/confOp';

const { ipcRenderer } = window.require('electron');
const path = window.require('path');
const fs = window.require('fs');
const remote = window.require('@electron/remote');
const { pathToFileURL } = window.require('url');

const state = reactive({
  custom: {},
});

const { perf } = localConfig.getConfig();

const theme = ref(perf.custom.theme);

const themeOptions = [
  { value: 'SPRING', label: 'feature.settings.account.spring' },
  { value: 'SUMMER', label: 'feature.settings.account.summer' },
  { value: 'AUTUMN', label: 'feature.settings.account.autumn' },
  { value: 'WINTER', label: 'feature.settings.account.winter' },
];

state.custom = perf.custom || {};

const setConfig = debounce(() => {
  const { perf } = localConfig.getConfig();

  localConfig.setConfig(
    JSON.parse(
      JSON.stringify({
        perf: {
          ...perf,
          custom: state.custom,
        },
      }),
    ),
  );
  ipcRenderer.send('re-register');
}, 500);

watch(state, setConfig);
const { custom } = toRefs(state);

const changeLogo = () => {
  const result = window.rubick.showOpenDialog({
    title: '请选择 logo 路径',
    filters: [{ name: 'images', extensions: ['png'] }],
    properties: ['openFile'],
  });
  if (!result || !result[0]) return;
  const [logoPath] = result;
  try {
    // 把图片复制到应用数据目录，避免原图被移动/删除后头像裂图
    const targetPath = path.join(
      remote.app.getPath('userData'),
      'custom-logo.png',
    );
    fs.copyFileSync(logoPath, targetPath);
    // 使用 pathToFileURL 做 URI 编码，并带上时间戳绕过头像缓存
    state.custom.logo = `${pathToFileURL(targetPath).href}?t=${Date.now()}`;
  } catch (e) {
    console.error('set custom logo failed', e);
  }
};

const changeTheme = () => {
  state.custom = {
    ...state.custom,
    ...Themes[theme.value],
  };
};

const selectTheme = (value) => {
  theme.value = value;
  changeTheme();
};

// const reset = () => {
//   Modal.warning({
//     title: '确定恢复默认设置吗？',
//     content: '回复后之前的设置将会被清空',
//     onOk() {
//       const defaultcustom = remote.getGlobal('OP_CONFIG').getDefaultConfig()
//         .perf.custom;
//       state.custom = JSON.parse(JSON.stringify(defaultcustom));
//     },
//   });
// };
</script>
