<template>
  <div
    class="space-y-4"
    @drop.prevent="dropFile"
    @dragenter="checkDrop"
    @dragover="checkDrop"
  >
    <GAlert
      message="可拖放文件夹到这里加入启动"
      type="info"
    />

    <div v-if="localStartList.length" class="row-list">
      <div
        v-for="item in localStartList"
        :key="item.desc"
        class="row-item"
      >
        <GAvatar :src="item.icon" :size="36" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-[13px] text-glass-text">
            <span :class="item.del ? 'line-through decoration-red-500' : ''">{{
              item.name
            }}</span>
            <span v-if="item.del" class="ml-1.5 text-[11px] text-red-500">
              文件不存在
            </span>
          </div>
          <div class="truncate text-[11px] text-glass-muted">
            {{ item.desc }}
          </div>
        </div>
        <GButton variant="ghost" size="sm" @click="remove(item)">
          移除
        </GButton>
      </div>
    </div>

    <div
      v-else
      class="surface-section flex min-h-[120px] items-center justify-center px-6 text-center text-[12px] text-glass-muted"
    >
      将文件夹拖放到这里加入启动
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { GAlert, GAvatar, GButton } from '@/components/ui';

const fs = window.require('fs');
const process = window.require('process');

const dbId = 'rubick-local-start-app';

const localStartList = ref(window.rubick.dbStorage.getItem(dbId) || []);

const checkFileExists = () => {
  localStartList.value = localStartList.value.map((plugin) => {
    if (!fs.existsSync(plugin.desc)) {
      return {
        ...plugin,
        del: true,
      };
    }
    return plugin;
  });
};

checkFileExists();

const dropFile = (e) => {
  const files = Array.from(e.dataTransfer.files).map((file) => {
    const action =
      process.platform === 'win32'
        ? `start "dummyclient" "${file.path}"`
        : `open ${file.path.replace(/ /g, '\\ ')}`;
    const plugin = {
      icon: window.rubick.getFileIcon(file.path),
      value: 'plugin',
      desc: file.path,
      pluginType: 'app',
      name: file.name,
      action,
      keyWords: [file.name],
      names: [file.name],
    };
    window.market.addLocalStartPlugin(plugin);
    return plugin;
  });
  localStartList.value = [...localStartList.value, ...files];
  window.rubick.dbStorage.setItem(
    dbId,
    JSON.parse(JSON.stringify(localStartList.value)),
  );
};

const remove = (item) => {
  localStartList.value = localStartList.value.filter(
    (app) => app.desc !== item.desc,
  );
  window.rubick.dbStorage.setItem(
    dbId,
    JSON.parse(JSON.stringify(localStartList.value)),
  );
  window.market.removeLocalStartPlugin(JSON.parse(JSON.stringify(item)));
};

const checkDrop = (e) => {
  e.preventDefault();
};
</script>
