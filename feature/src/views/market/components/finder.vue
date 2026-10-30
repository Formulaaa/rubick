<template>
  <div class="page">
    <header class="page-header">
      <div class="min-w-0">
        <h1 class="page-title">{{ $t('feature.market.title') }}</h1>
        <p class="page-desc">{{ $t('feature.market.description') }}</p>
      </div>
    </header>

    <div
      v-if="loading"
      class="surface-section flex min-h-[220px] flex-col items-center justify-center gap-3 text-[12px] text-glass-muted"
    >
      <GSpinner />
      <span>{{ $t('feature.market.loading') }}</span>
    </div>

    <div
      v-else-if="error"
      class="surface-section flex min-h-[220px] flex-col items-center justify-center gap-3 text-center"
    >
      <div class="text-[13px] font-medium text-glass-text">
        {{ $t('feature.market.loadFailed') }}
      </div>
      <div class="max-w-[360px] text-[11.5px] text-glass-muted">
        {{ error }}
      </div>
      <GButton size="sm" @click="load">
        {{ $t('feature.market.retry') }}
      </GButton>
    </div>

    <div
      v-else-if="!hasData"
      class="surface-section flex min-h-[220px] flex-col items-center justify-center gap-3 text-center"
    >
      <div class="text-[13px] font-medium text-glass-text">
        {{ $t('feature.market.noData') }}
      </div>
      <GButton size="sm" @click="load">
        {{ $t('feature.market.retry') }}
      </GButton>
    </div>

    <template v-else>
      <PluginList
        v-if="must && must.length"
        :title="$t('feature.market.finder.must')"
        :list="must"
      />
      <PluginList
        v-if="recommend && recommend.length"
        :title="$t('feature.market.finder.recommended')"
        :list="recommend"
      />
      <PluginList
        v-if="newList && newList.length"
        :title="$t('feature.market.finder.lastUpdated')"
        :list="newList"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { GButton, GSpinner } from '@/components/ui';
import request from '../../../assets/request/index';
import PluginList from './plugin-list.vue';

const store = useStore();
const totalPlugins = computed(() => store.state.totalPlugins);

const data = ref([]);
const loading = ref(true);
const error = ref('');

const mapPlugins = (names = []) =>
  names
    .map((name) => totalPlugins.value.find((plugin) => plugin.name === name))
    .filter(Boolean);

const must = computed(() => mapPlugins(data.value.must));
const recommend = computed(() => mapPlugins(data.value.recommend));
const newList = computed(() => mapPlugins(data.value.new));
const hasData = computed(
  () => must.value.length + recommend.value.length + newList.value.length > 0,
);

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    data.value = (await request.getFinderDetail()) || {};
  } catch (cause) {
    error.value = cause?.message || String(cause);
  } finally {
    loading.value = false;
  }
};

onBeforeMount(load);
</script>
