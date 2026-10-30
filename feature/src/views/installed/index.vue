<template>
  <div class="page">
    <header class="page-header">
      <div class="min-w-0 flex-1">
        <h1 class="page-title">{{ $t('feature.installed.title') }}</h1>
      </div>
    </header>

    <div v-if="!localPlugins.length" class="surface-section">
      <GEmpty
        title=""
        :description="$t('feature.installed.tips1')"
        class="[&>div:first-child]:h-auto [&>div:first-child]:w-auto [&>div:first-child]:bg-transparent [&>div:first-child]:ring-0"
      >
        <template #icon>
          <Vue3Lottie :animationData="emptyJson" :height="240" :width="240" />
        </template>
        <template #action>
          <GButton variant="primary" @click="gotoFinder">
            {{ $t('feature.installed.tips2') }}
          </GButton>
        </template>
      </GEmpty>
    </div>

    <template v-else>
      <section class="section-block">
        <div class="row-list">
          <div
            v-for="(plugin, index) in localPlugins"
            :key="plugin.name || index"
            class="row-item text-glass-text"
            :class="currentSelect[0] === plugin.name ? 'bg-accent/10' : ''"
          >
            <button
              type="button"
              class="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
              @click="currentSelect = [plugin.name]"
            >
              <span class="icon-plinth">
                <img
                  :src="plugin.logo"
                  :alt="plugin.pluginName"
                  class="h-7 w-7 object-contain"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span
                    class="truncate text-[13px] font-medium"
                    :class="
                      currentSelect[0] === plugin.name
                        ? 'text-accent'
                        : 'text-glass-text'
                    "
                  >
                    {{ plugin.pluginName }}
                  </span>
                  <GTag v-if="plugin.version">{{ plugin.version }}</GTag>
                </span>
                <span class="mt-0.5 block truncate text-xs text-glass-muted">
                  {{ plugin.description }}
                </span>
                <span class="mt-1 flex items-center gap-2 text-[10.5px] text-glass-muted">
                  <span v-if="plugin.author" class="truncate">@{{ plugin.author }}</span>
                  <span class="text-emerald-600 dark:text-emerald-400">
                    {{ $t('feature.market.installed') }}
                  </span>
                </span>
              </span>
            </button>
            <span class="ml-auto flex shrink-0 items-center gap-2 pl-3">
              <GButton
                variant="danger"
                size="sm"
                :loading="plugin.isloading"
                @click.stop="deletePlugin(plugin)"
              >
                {{ $t('feature.installed.remove') }}
              </GButton>
            </span>
          </div>
        </div>
      </section>

      <section v-if="pluginDetail.name" class="section-block">
        <div class="section-head">
          <div class="flex min-w-0 items-center gap-2">
            <span class="section-title truncate text-[15px]">
              {{ pluginDetail.pluginName }}
            </span>
            <GTag v-if="pluginDetail.version">{{ pluginDetail.version }}</GTag>
          </div>
        </div>

        <div class="surface-section">
          <div class="field-row items-start">
            <div class="min-w-0 flex-1">
              <div class="text-[13px] text-glass-text">
                {{ pluginDetail.description }}
              </div>
              <div class="mt-1 text-xs text-glass-muted">
                {{ $t('feature.installed.developer') }}：{{
                  `${pluginDetail.author || $t('feature.installed.unknown')}`
                }}
              </div>
            </div>
          </div>
        </div>

        <div class="section-block">
          <div class="section-head">
            <span class="section-title">
              {{ $t('feature.installed.functionKey') }}
            </span>
          </div>
          <div class="surface-section">
            <template
              :key="index"
              v-for="(item, index) in pluginDetail.features"
            >
              <div
                v-if="item.cmds.filter(cmd => !cmd.label).length > 0"
                class="field-row flex-col items-start justify-start gap-2"
              >
                <div class="text-[13px] text-glass-text">{{ item.explain }}</div>
                <div class="flex flex-wrap gap-2">
                  <template :key="cmd" v-for="cmd in item.cmds">
                    <GButton
                      v-if="!cmd.label"
                      size="sm"
                      @click.stop="toggleMenu(cmd, item, $event)"
                    >
                      {{ cmd.label || cmd }}
                      <DownOutlined class="ml-1" />
                    </GButton>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <div
        v-if="openMenu !== null"
        class="fixed inset-0 z-[2500]"
        @click="openMenu = null"
      >
        <div
          class="surface-section absolute min-w-[180px] rounded-glass-sm p-1 shadow-[var(--shadow-popover)]"
          :style="{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }"
          @click.stop
        >
          <button
            type="button"
            class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-glass-text transition-colors hover:bg-glass-soft"
            @click.stop="selectMenu('open')"
          >
            <CaretRightOutlined />
            运行
          </button>
          <button
            v-if="!hasAdded(menuCmd)"
            type="button"
            class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-glass-text transition-colors hover:bg-glass-soft"
            @click.stop="selectMenu('add')"
          >
            <PushpinOutlined />
            固定到超级面板
          </button>
          <button
            v-else
            type="button"
            class="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-glass-text transition-colors hover:bg-glass-soft"
            @click.stop="selectMenu('remove')"
          >
            <PushpinFilled />
            从超级面板中取消固定
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  CaretRightOutlined,
  DownOutlined,
  PushpinFilled,
  PushpinOutlined,
} from '@ant-design/icons-vue';
import { computed, ref, toRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import emptyJson from '@/assets/lottie/empty.json';
import { GButton, GEmpty, GTag, toast } from '@/components/ui';

const { ipcRenderer } = window.require('electron');
const path = window.require('path');

const remote = window.require('@electron/remote');
const fs = window.require('fs');

const appPath = remote.app.getPath('userData');
const baseDir = path.join(appPath, './rubick-plugins');

const store = useStore();
const route = useRoute();
const router = useRouter();

const localPlugins = computed(() =>
  store.state.localPlugins.filter(
    (plugin) => plugin.name !== 'rubick-system-feature',
  ),
);
const updateLocalPlugin = () => store.dispatch('updateLocalPlugin');
const startUnDownload = (name) => store.dispatch('startUnDownload', name);
const errorUnDownload = (name) => store.dispatch('errorUnDownload', name);

const currentSelect = ref([route.query.plugin || localPlugins?.value[0]?.name]);

watch(localPlugins, () => {
  currentSelect.value = [localPlugins?.value[0]?.name];
});

const pluginDetail = computed(() => {
  return (
    localPlugins.value.find((v) => v.name === currentSelect.value[0]) || {}
  );
});

const superPanelPlugins = ref(
  window.rubick.db.get('super-panel-user-plugins') || {
    data: [],
    _id: 'super-panel-user-plugins',
  },
);

const openMenu = ref(null);
const menuItem = ref(null);
const menuCmd = ref(null);
const menuPosition = ref({ top: 0, left: 0 });
const toggleMenu = (cmd, item, event) => {
  if (openMenu.value === cmd) {
    openMenu.value = null;
    return;
  }
  openMenu.value = cmd;
  menuItem.value = item;
  menuCmd.value = cmd;
  const rect = event.currentTarget.getBoundingClientRect();
  menuPosition.value = { top: rect.bottom + 4, left: rect.left };
};
const selectMenu = (key) => {
  handleMenuClick(key, menuItem.value, menuCmd.value);
  openMenu.value = null;
};

const handleMenuClick = (key, item, cmd) => {
  if (key === 'open') {
    openPlugin({
      code: item.code,
      cmd,
    });
  } else if (key === 'add') {
    addCmdToSuperPanel({ cmd, code: item.code });
  } else {
    removePluginToSuperPanel({ cmd, name: item.name });
  }
};

const addCmdToSuperPanel = ({ cmd, code }) => {
  const plugin = {
    ...toRaw(pluginDetail.value),
    cmd,
    ext: {
      code,
      type: 'text',
      payload: null,
    },
  };
  superPanelPlugins.value.data.push(plugin);
  const { rev } = window.rubick.db.put(
    JSON.parse(JSON.stringify(superPanelPlugins.value)),
  );
  superPanelPlugins.value._rev = rev;
};

const removePluginToSuperPanel = ({ cmd, name }) => {
  superPanelPlugins.value.data = toRaw(superPanelPlugins.value).data.filter(
    (item) => {
      if (name) return item.name !== name;
      return item.cmd !== cmd;
    },
  );
  const { rev } = window.rubick.db.put(toRaw(superPanelPlugins.value));
  superPanelPlugins.value._rev = rev;
};

const hasAdded = (cmd) => {
  let added = false;
  superPanelPlugins.value.data.some((item) => {
    if (item.cmd === cmd) {
      added = true;
      return true;
    }
    return false;
  });
  return added;
};

const openPlugin = ({ cmd, code }) => {
  window.rubick.openPlugin(
    JSON.parse(
      JSON.stringify({
        ...pluginDetail.value,
        cmd,
        ext: {
          code,
          type: 'text',
          payload: null,
        },
      }),
    ),
  );
};

const deletePlugin = async (plugin) => {
  startUnDownload(plugin.name);
  const timer = setTimeout(() => {
    errorUnDownload(plugin.name);
    toast.error('卸载超时，请重试！');
  }, 20000);
  await window.market.deletePlugin(plugin);
  removePluginToSuperPanel({ name: plugin.name });
  updateLocalPlugin();
  clearTimeout(timer);
};

const gotoFinder = () => {
  router.push('/finder');
  store.commit('commonUpdate', { active: ['finder'] });
};
</script>
