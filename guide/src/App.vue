<template>
  <div class="guide-container app-aurora fixed inset-0 overflow-hidden text-glass-text">
    <div
      class="step0 glass-panel absolute inset-3 flex flex-col rounded-glass-lg p-7 pt-9 box-border"
      v-show="step === 0"
    >
      <div class="title text-[28px] font-semibold text-glass-text">您好，我叫 Rubick</div>
      <div class="desc box-border pt-2.5 text-2xl text-glass-text">快捷键 <span class="down-line leading-6 text-accent">Alt + R</span> 可以快速打开我</div>
      <div class="img-container flex flex-1 flex-col items-center justify-center">
        <img class="img block w-[680px]" src="./assets/img.png" />
        <div class="info relative ml-[84px] box-border self-start pt-[42px] text-left text-glass-text">
          <svg class="top-icon absolute left-0 top-0 inline-block h-[1em] w-[1em] shrink-0 select-none fill-current text-2xl transition-[fill] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="NorthIcon"><path d="m5 9 1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7-7 7z"></path></svg>
          点击 logo 进入插件市场
        </div>
      </div>
    </div>
    <div
      class="step0 step1 glass-panel absolute inset-3 flex flex-col rounded-glass-lg p-7 pt-9 box-border"
      v-show="step === 1"
    >
      <div class="title text-[28px] font-semibold text-glass-text">选择需要的插件安装</div>
      <div class="desc box-border pt-2.5 text-2xl text-glass-text">基于 <span class="down-line leading-6 text-accent">npm</span> 的插件包管理，像小程序一样，用完即走</div>
      <div class="img-container flex flex-1 flex-col items-center justify-center">
        <img class="img block w-[550px]" src="./assets/img_1.png" />
      </div>
    </div>
    <div
      class="step0 glass-panel absolute inset-3 flex flex-col rounded-glass-lg p-7 pt-9 box-border"
      v-show="step === 2"
    >
      <div class="title text-[28px] font-semibold text-glass-text"><span class="down-line leading-6 text-accent">关键字</span>搜索应用和插件</div>
      <div class="desc box-border pt-2.5 text-2xl text-glass-text">搜索框内输入关键字可以搜索安装的应用和插件</div>
      <div class="img-container flex flex-1 flex-col items-center justify-center">
        <img class="img block w-[680px]" src="./assets/img_2.png" />
      </div>
    </div>
    <div
      class="step0 step1 glass-panel absolute inset-3 flex flex-col rounded-glass-lg p-7 pt-9 box-border"
      v-show="step === 3"
    >
      <div class="title text-[28px] font-semibold text-glass-text">完全开源免费，支持内网部署</div>
      <div class="desc box-border pt-2.5 text-2xl text-glass-text">进入插件市场的 <span class="down-line leading-6 text-accent">账户与设置</span> 菜单，进行内网部署设置</div>
      <div class="img-container flex flex-1 flex-col items-center justify-center">
        <img class="img block w-[550px]" src="./assets/img_3.png" />
      </div>
    </div>
    <div class="footer fixed bottom-0 left-0 z-20 flex w-full items-center justify-between p-5 box-border">
      <div></div>
      <div class="step flex items-center">
        <span class="step-num mr-5 text-glass-muted">{{ step + 1 }} / 4</span>
        <div
          class="button glass-hover glass-press flex h-10 w-[100px] cursor-pointer select-none items-center justify-center rounded-glass-sm bg-accent leading-10 text-white"
          @click="netStep"
        >{{ step + 1 === 4 ? '完成' : '下一步' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const step = ref(0);
const { ipcRenderer } = window.require('electron');

const netStep = () => {
  if (step.value >= 3) {
    return ipcRenderer.send('guide:service', { type: 'close' });
  }
  step.value = step.value + 1;
};
</script>
