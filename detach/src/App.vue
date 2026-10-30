<template>
  <div
    :class="[
      process.platform,
      'detach app-aurora glass-panel fixed inset-x-0 top-0 flex h-[60px] w-full flex-1 select-none items-center justify-between box-border pl-2.5 font-sans text-lg font-medium text-glass-text [&.darwin]:pl-20 [&.darwin]:[-webkit-app-region:drag] [&.win32]:[-webkit-app-region:drag]',
    ]"
  >
    <div class="info flex items-center">
      <img :src="plugInfo.logo" class="mr-2.5 h-9 w-9 shrink-0" />
      <input
        autofocus
        @input="changeValue"
        v-if="showInput"
        :value="plugInfo.subInput?.value"
        :placeholder="plugInfo.subInput?.placeholder"
        class="glass-soft box-border h-9 w-[360px] rounded-glass-sm px-2.5 text-sm leading-9 text-glass-text outline-none [-webkit-app-region:no-drag] placeholder:text-glass-muted"
      />
      <span v-else>{{ plugInfo.pluginName }}</span>
    </div>
    <div class="handle-container flex items-center">
      <div class="handle flex [-webkit-app-region:no-drag]">
        <div
          class="devtool mr-1.5 h-9 w-9 cursor-pointer rounded-full bg-[url(./tool.svg)] bg-center bg-no-repeat hover:bg-glass-strong"
          @click="openDevTool"
          title="开发者工具"
        ></div>
      </div>
      <div
        class="window-handle flex items-center [-webkit-app-region:no-drag]"
        v-if="process.platform !== 'darwin'"
      >
        <div
          class="minimize h-14 w-12 cursor-pointer bg-[url(./minimize.svg)] bg-[length:20px] bg-center bg-no-repeat hover:bg-glass-strong"
          @click="minimize"
        ></div>
        <div
          class="maximize h-14 w-12 cursor-pointer bg-[url(./maximize.svg)] bg-[length:20px] bg-center bg-no-repeat hover:bg-glass-strong [&.unmaximize]:bg-[url(./unmaximize.svg)]"
          @click="maximize"
        ></div>
        <div
          class="close h-14 w-12 cursor-pointer bg-[url(./close.svg)] bg-[length:20px] bg-center bg-no-repeat hover:bg-[#e53935] hover:bg-[url(./close-hover.svg)]"
          @click="close"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import throttle from 'lodash.throttle';
import { ref } from 'vue';

const { ipcRenderer } = window.require('electron');

const process = window.require('process');
const showInput = ref(false);

const storeInfo = localStorage.getItem('rubick-system-detach') || '{}';
const plugInfo = ref({});

window.initDetach = (pluginInfo) => {
  plugInfo.value = pluginInfo;
  showInput.value =
    pluginInfo.subInput &&
    (!!pluginInfo.subInput.value || !!pluginInfo.subInput.placeholder);
  localStorage.setItem('rubick-system-detach', JSON.stringify(pluginInfo));
};

try {
  window.initDetach(JSON.parse(storeInfo));
} catch (e) {
  // ...
}

const changeValue = throttle((e) => {
  ipcRenderer.send('msg-trigger', {
    type: 'detachInputChange',
    data: {
      text: e.target.value,
    },
  });
}, 500);

const openDevTool = () => {
  ipcRenderer.send('msg-trigger', { type: 'openPluginDevTools' });
};

const minimize = () => {
  ipcRenderer.send('detach:service', { type: 'minimize' });
};

const maximize = () => {
  ipcRenderer.send('detach:service', { type: 'maximize' });
};

const close = () => {
  ipcRenderer.send('detach:service', { type: 'close' });
};

Object.assign(window, {
  setSubInputValue: ({ value }) => {
    plugInfo.value.subInput.value = value;
  },
  setSubInput: (placeholder) => {
    plugInfo.value.subInput.placeholder = placeholder;
  },
  removeSubInput: () => {
    plugInfo.value.subInput = null;
  },
});

window.enterFullScreenTrigger = () => {
  document.querySelector('.detach').classList.remove('darwin');
};
window.leaveFullScreenTrigger = () => {
  const titleDom = document.querySelector('.detach');
  if (!titleDom.classList.contains('darwin')) {
    titleDom.classList.add('darwin');
  }
};

window.maximizeTrigger = () => {
  const btnMaximize = document.querySelector('.maximize');
  if (!btnMaximize || btnMaximize.classList.contains('unmaximize')) return;
  btnMaximize.classList.add('unmaximize');
};

window.unmaximizeTrigger = () => {
  const btnMaximize = document.querySelector('.maximize');
  if (!btnMaximize) return;
  btnMaximize.classList.remove('unmaximize');
};

if (process.platform === 'darwin') {
  window.onkeydown = (e) => {
    if (e.code === 'Escape') {
      ipcRenderer.send('detach:service', { type: 'endFullScreen' });
      return;
    }
    if (e.metaKey && (e.code === 'KeyW' || e.code === 'KeyQ')) {
      window.handle.close();
    }
  };
} else {
  window.onkeydown = (e) => {
    if (e.ctrlKey && e.code === 'KeyW') {
      window.handle.close();
      return;
    }
  };
}
</script>
