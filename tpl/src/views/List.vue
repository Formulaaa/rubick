<template>
  <div class="launcher-stage h-full w-full p-2">
    <div
      class="launcher-surface flex h-full w-full flex-col overflow-hidden rounded-[24px] p-2"
    >
      <div
        class="row-list glass-scroll max-h-full overflow-auto"
        v-show="!!(lists || []).length"
      >
        <div
          :key="index"
          :class="[
            'row-item relative cursor-pointer text-left',
            currentSelect === index ? 'bg-accent/10' : '',
          ]"
          v-for="(item, index) in lists"
          @click="select(item)"
        >
          <span
            v-if="currentSelect === index"
            class="absolute left-1 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-accent"
          />
          <span v-if="item.icon" class="icon-plinth h-9 w-9">
            <img class="h-7 w-7 rounded-full object-cover" :src="item.icon" />
          </span>
          <div class="content min-w-0 flex-1">
            <div class="title truncate text-[13.5px] font-medium text-glass-text">
              {{ item.title }}
            </div>
            <div class="desc truncate text-[11.5px] text-glass-muted">
              {{ decodeURIComponent(item.description) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const { ipcRenderer } = window.require('electron');

const route = useRoute();

const itemHeight = 60;
const itemMaxNum = 10;
const defaultHeight = 16;

const { code, type, payload } = route.params;
const current = window.exports[code];
window.rubick.setExpendHeight(defaultHeight);

const lists = ref([]);
watch([lists], () => {
  const height =
    lists.value.length > itemMaxNum
      ? itemMaxNum * itemHeight
      : itemHeight * lists.value.length;
  window.rubick.setExpendHeight(defaultHeight + height);
});
current.args.enter &&
  current.args.enter({ code: code, type, payload }, (result) => {
    lists.value = result;
  });

const currentSelect = ref(0);
ipcRenderer.on(`changeCurrent`, (e, result) => {
  if (
    currentSelect.value + result > lists.value.length - 1 ||
    lists.value + result < 0
  ) {
    return;
  }
  currentSelect.value = currentSelect.value + result;
});
window.rubick.setSubInput(({ text }) => {
  current.args.search &&
    current.args.search({ code, type: '', payload: [] }, text, (result) => {
      lists.value = result || [];
    });
}, '搜索');

const select = (item) => {
  current.args.select &&
    current.args.select({ code, type: '', payload: [] }, item);
};

const onKeydownAction = (e) => {
  if (e.code === 'Enter') {
    return select(lists.value[currentSelect.value]);
  }
  let index = 0;
  if (e.code === 'ArrowDown') {
    index = 1;
  }
  if (e.code === 'ArrowUp') {
    index = -1;
  }
  if (!lists.value.length) return;
  if (
    currentSelect.value + index > lists.value.length - 1 ||
    currentSelect.value + index < 0
  )
    return;
  currentSelect.value = currentSelect.value + index;
};

window.addEventListener('keydown', onKeydownAction);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydownAction);
});
</script>
