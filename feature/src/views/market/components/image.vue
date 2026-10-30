<template>
  <div class="page">
    <header class="page-header">
      <div class="min-w-0">
        <h1 class="page-title">{{ $t('feature.market.imageTool') }}</h1>
      </div>
    </header>
    <PluginList
      v-if="system && !!system.length"
      @downloadSuccess="downloadSuccess"
      :list="system"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import request from '../../../assets/request/index';
import PluginList from './plugin-list.vue';

const store = useStore();
const totalPlugins = computed(() => store.state.totalPlugins);

const data = ref([]);

onBeforeMount(async () => {
  data.value = await request.getImageDetail();
  console.log(data.value);
});

const system = computed(() => {
  const defaultData = data.value || [];
  if (!defaultData.length) return [];
  return defaultData.map((plugin) => {
    let searchInfo = null;
    totalPlugins.value.forEach((t) => {
      if (t.name === plugin) {
        searchInfo = t;
      }
    });
    return searchInfo;
  });
});
</script>
