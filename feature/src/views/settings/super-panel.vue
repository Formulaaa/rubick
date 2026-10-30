<template>
  <div class="space-y-4">
    <p class="text-[12px] text-glass-muted">
      {{ $t('feature.settings.superPanel.tips') }}
    </p>

    <div class="surface-section grid grid-cols-2 gap-1 p-1">
      <div
        v-for="item in localPlugins.filter((item) => !!item)"
        :key="item.name"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-glass-soft"
      >
        <GAvatar :src="item.logo" :size="36" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-[13px] text-glass-text">
            {{ item.pluginName }}
          </div>
          <div class="truncate text-[11px] text-glass-muted">
            {{ item.description }}
          </div>
        </div>
        <GButton
          v-if="!hasAdded(item)"
          variant="ghost"
          size="sm"
          class="text-emerald-500!"
          @click="addPluginToSuperPanel(item)"
        >
          {{ $t('feature.settings.superPanel.add') }}
        </GButton>
        <GButton
          v-else
          variant="ghost"
          size="sm"
          class="text-accent!"
          @click="removePluginToSuperPanel(item)"
        >
          {{ $t('feature.settings.superPanel.remove') }}
        </GButton>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, toRaw } from 'vue';
import { useStore } from 'vuex';
import { GAvatar, GButton } from '@/components/ui';

const store = useStore();
const localPlugins = computed(() =>
  store.state.localPlugins.filter(
    (plugin) =>
      plugin.name !== 'rubick-system-feature' &&
      plugin.name !== 'rubick-system-super-panel',
  ),
);

const hasAdded = (plugin) => {
  let added = false;
  superPanelPlugins.value.data.some((item) => {
    if (item.name === plugin.name) {
      added = true;
      return true;
    }
    return false;
  });
  return added;
};

const superPanelPlugins = ref(
  window.rubick.db.get('super-panel-db') || {
    data: [],
    _id: 'super-panel-db',
  },
);

const addPluginToSuperPanel = (plugin) => {
  superPanelPlugins.value.data.push(toRaw(plugin));
  window.rubick.db.put(toRaw(superPanelPlugins.value));
};

const removePluginToSuperPanel = (plugin) => {
  superPanelPlugins.value.data = toRaw(superPanelPlugins.value).data.filter(
    (item) => {
      return item.name !== plugin.name;
    },
  );
  window.rubick.db.put(toRaw(superPanelPlugins.value));
};
</script>
