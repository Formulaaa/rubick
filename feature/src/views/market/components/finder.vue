<template>
  <div class="finder">
    <PluginList
      v-if="must && !!must.length"
      @downloadSuccess="downloadSuccess"
      :title="$t('feature.market.finder.must')"
      :list="must"
    />
    <PluginList
      v-if="recommend && !!recommend.length"
      @downloadSuccess="downloadSuccess"
      :title="$t('feature.market.finder.recommended')"
      :list="recommend"
    />
    <PluginList
      v-if="newList && !!newList.length"
      :title="$t('feature.market.finder.lastUpdated')"
      :list="newList"
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
  data.value = await request.getFinderDetail();
});

const must = computed(() => {
  const defaultData = data.value.must || [];
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

const recommend = computed(() => {
  const defaultData = data.value.recommend || [];
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

const newList = computed(() => {
  const defaultData = data.value.new || [];
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

<style lang="less">
.finder {
  position: relative;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    width: 0;
  }
}
</style>
