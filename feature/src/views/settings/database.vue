<template>
  <div class="space-y-4">
    <div class="section-head">
      <span class="section-title">
        {{ $t('feature.settings.database.title') }}
      </span>
      <div class="flex shrink-0 items-center gap-2">
        <GButton variant="primary" size="sm" @click="exportData">
          <ExportOutlined />
          导出数据
        </GButton>
        <GButton variant="danger" size="sm" @click="importData">
          <ImportOutlined />
          导入数据
        </GButton>
        <GButton
          variant="ghost"
          size="sm"
          title="webdav 账户配置"
          aria-label="webdav 账户配置"
          @click="showSetting = true"
        >
          <SettingOutlined />
        </GButton>
      </div>
    </div>

    <div class="row-list">
      <div
        v-for="item in dataPlugins"
        :key="item.name"
        class="row-item"
      >
        <GAvatar :src="item.plugin?.logo" :size="36" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-[13px] text-glass-text">
            {{ item.plugin?.pluginName }}
          </div>
          <div class="text-[11px] text-glass-muted">
            {{ item.keys.length }} 份文档
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            v-if="!item.plugin?.isdownload && !item.plugin?.isloading"
            type="button"
            class="focus-ring grid h-8 w-8 place-items-center rounded-full text-accent transition-colors hover:bg-accent/10"
            title="下载"
            aria-label="下载"
            @click="downloadPlugin(item.plugin)"
          >
            <CloudDownloadOutlined class="text-[16px]" />
          </button>
          <span
            v-if="item.plugin?.isloading"
            class="grid h-8 w-8 place-items-center text-glass-muted"
          >
            <LoadingOutlined class="text-[16px]" />
          </span>
          <button
            type="button"
            class="focus-ring grid h-8 w-8 place-items-center rounded-full text-accent transition-colors hover:bg-accent/10"
            title="查看文档"
            aria-label="查看文档"
            @click="showKeys(item)"
          >
            <DatabaseOutlined class="text-[16px]" />
          </button>
        </div>
      </div>
    </div>

    <GDrawer
      v-model="open"
      :width="400"
      :title="currentSelect.plugin.pluginName"
    >
      <button
        v-for="key in currentSelect.keys"
        :key="key"
        type="button"
        class="focus-ring block w-full truncate rounded-lg px-2 py-1.5 text-left text-[13px] text-glass-text transition-colors hover:bg-glass-soft hover:text-accent"
        @click="showDetail(key)"
      >
        {{ key }}
      </button>
    </GDrawer>

    <GModal v-model="show" :width="640">
      <pre class="overflow-auto text-glass-text [&]:bg-transparent">{{
        JSON.stringify(detail, null, 2)
      }}</pre>
    </GModal>

    <GModal v-model="showSetting" title="webdav 账户配置" :width="520">
      <GAlert
        v-if="formState.suport === 'jianguo'"
        class="mb-5"
        type="info"
      >
        <template #message>
          <button
            type="button"
            class="focus-ring rounded text-left underline underline-offset-2"
            @click="openHelp"
          >
            点击查看如何获取坚果云账号密码
          </button>
        </template>
      </GAlert>
      <form class="space-y-4" autocomplete="off" @submit.prevent="handleOk">
        <div class="flex items-center gap-4">
          <label class="w-28 shrink-0 text-[13px] text-glass-text">
            webdav 提供商
          </label>
          <GSelect
            v-model="formState.suport"
            class="flex-1"
            :options="webdavOptions"
          />
        </div>
        <div
          v-show="formState.suport === 'auto'"
          class="flex items-center gap-4"
        >
          <label class="w-28 shrink-0 text-[13px] text-glass-text">
            服务器地址
          </label>
          <GInput v-model="formState.url" class="flex-1" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-28 shrink-0 text-[13px] text-glass-text">账户</label>
          <GInput v-model="formState.username" class="flex-1" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-28 shrink-0 text-[13px] text-glass-text">密码</label>
          <GInput
            v-model="formState.password"
            type="password"
            class="flex-1"
          />
        </div>
        <div class="flex justify-end">
          <GButton variant="primary" @click="handleOk">保存设置</GButton>
        </div>
      </form>
    </GModal>

    <GModal v-model="confirmVisible" title="导入确认">
      <p class="text-[13px] text-glass-muted">
        导入坚果云数据将会覆盖本地数据，是否确认导入？
      </p>
      <template #footer>
        <GButton variant="secondary" @click="confirmVisible = false">
          取消
        </GButton>
        <GButton variant="danger" @click="confirmImport">确认导入</GButton>
      </template>
    </GModal>
  </div>
</template>
<script setup>
import {
  CloudDownloadOutlined,
  DatabaseOutlined,
  ExportOutlined,
  ImportOutlined,
  LoadingOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import {
  GAlert,
  GAvatar,
  GButton,
  GDrawer,
  GInput,
  GModal,
  GSelect,
  toast,
} from '@/components/ui';
import logoImage from '../../assets/logo.png';

const { t } = useI18n();

const open = ref(false);
const show = ref(false);
const showSetting = ref(false);
const confirmVisible = ref(false);
const currentSelect = ref({ plugin: {} });
const detail = ref({});

const webdavOptions = [
  { label: '坚果云', value: 'jianguo' },
  { label: '自定义', value: 'auto' },
];

const defaultConfig = window.rubick.dbStorage.getItem(
  'rubick-db-jg-webdav',
) || {
  url: 'https://dav.jianguoyun.com/dav/',
  username: '',
  password: '',
};

if (!defaultConfig.suport) {
  defaultConfig.suport = 'jianguo';
}

const formState = reactive(defaultConfig);

const showKeys = (item) => {
  open.value = true;
  currentSelect.value = item;
};

const handleOk = () => {
  window.rubick.dbStorage.setItem(
    'rubick-db-jg-webdav',
    JSON.parse(JSON.stringify(formState)),
  );
  toast.success('保存成功');
  showSetting.value = false;
};

const showDetail = (key) => {
  show.value = true;
  detail.value = window.rubick.db.get(key);
};

const exportData = () => {
  if (!formState.password || !formState.username) {
    return (showSetting.value = true);
  }
  window.market.dbDump(JSON.parse(JSON.stringify(formState)));
};

const importData = () => {
  if (!formState.password || !formState.username) {
    return (showSetting.value = true);
  }
  confirmVisible.value = true;
};

const confirmImport = () => {
  window.market.dbImport(JSON.parse(JSON.stringify(formState)));
  confirmVisible.value = false;
};

const openHelp = () => {
  window.rubick.shellOpenExternal('https://help.jianguoyun.com/?p=2064');
};

const store = useStore();

const pluginsData = window.rubick.db.get('RUBICK_PLUGIN_INFO');

const totalPlugins = computed(() => store.state.totalPlugins);

const dataPlugins = computed(() => {
  if (!pluginsData) return [];
  return pluginsData.data.map((item) => {
    let plugin = null;
    if (['rubick-system-feature'].includes(item.name)) {
      plugin = {
        pluginName: '主程序',
        isdownload: true,
        logo: logoImage,
      };
    } else {
      plugin = totalPlugins.value.find((p) => p.name === item.name);
    }
    const data = item.keys.map((key) => window.rubick.db.get(key));
    return {
      ...item,
      plugin,
      data,
    };
  });
});

const startDownload = (name) => store.dispatch('startDownload', name);
const successDownload = (name) => store.dispatch('successDownload', name);

const downloadPlugin = async (plugin) => {
  startDownload(plugin.name);
  await window.market.downloadPlugin(plugin);
  toast.success(t('feature.dev.installSuccess', { pluginName: plugin.name }));
  successDownload(plugin.name);
};
</script>
