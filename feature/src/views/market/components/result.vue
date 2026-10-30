<template>
  <div class="page">
    <header class="page-header">
      <div class="min-w-0">
        <h1 class="page-title">{{ $t('feature.market.searchResult') }}</h1>
        <p v-if="searchValue" class="page-desc">{{ searchValue }}</p>
      </div>
    </header>
    <PluginList
      v-if="result && !!result.length"
      @downloadSuccess="downloadSuccess"
      :list="result"
    />
    <GEmpty
      v-else
      title=""
      description="哎呀，暂时还没有这个插件哟！"
      class="[&>div:first-child]:h-auto [&>div:first-child]:w-auto [&>div:first-child]:bg-transparent [&>div:first-child]:ring-0"
    >
      <template #icon>
        <Vue3Lottie :animationData="emptyJson" :height="240" :width="240" />
      </template>
    </GEmpty>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import emptyJson from '@/assets/lottie/empty.json';
import { GEmpty } from '@/components/ui';
import PluginList from './plugin-list.vue';

const store = useStore();

const totalPlugins = computed(() => store.state.totalPlugins);
const searchValue = computed(() => store.state.searchValue);

const result = computed(() => {
  if (searchValue.value.trim().length > 0) {
    const pattern = new RegExp(searchValue.value.toLowerCase());
    return totalPlugins.value.filter((plugin) => {
      if (plugin.pluginName.toLowerCase().match(pattern)) {
        return true;
      } else {
        return false;
      }
    });
  } else {
    return totalPlugins.value;
  }
});
</script>
