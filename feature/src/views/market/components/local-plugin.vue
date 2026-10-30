<template>
  <div class="page local-plugin">
    <header class="page-header">
      <div class="min-w-0">
        <h1 class="page-title">{{ $t('feature.market.localPlugin') }}</h1>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GButton variant="primary" @click="visible = true">
          <UploadOutlined />
          {{ $t('feature.localPlugin.title') }}
        </GButton>

        <GButton variant="danger" @click="deleteVisible = true">
          <DeleteOutlined />
          {{ $t('feature.localPlugin.deleteLocalPluginButton') }}
        </GButton>
      </div>
    </header>
    <PluginList
      v-if="pluginList && !!pluginList.length"
      @downloadSuccess="downloadSuccess"
      :list="pluginList"
    />
    <GModal
      :model-value="visible"
      :title="$t('feature.localPlugin.title')"
      @update:model-value="onModalVisibleChange"
    >
      <div class="flex flex-col gap-4">
        <GAlert :message="$t('feature.localPlugin.tips')" type="success" />

        <div class="flex flex-col gap-2">
          <span class="text-sm text-glass-muted">
            {{ $t('feature.localPlugin.importType') }}
          </span>
          <div class="flex items-center gap-4 text-sm text-glass-text">
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="formState.importType"
                type="radio"
                :value="1"
                class="accent-[var(--glass-accent)]"
              />
              {{ $t('feature.localPlugin.localImport') }}
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="formState.importType"
                type="radio"
                :value="2"
                class="accent-[var(--glass-accent)]"
              />
              {{ $t('feature.localPlugin.remoteImport') }}
            </label>
          </div>
        </div>

        <div v-if="formState.importType == '1'" class="flex flex-col gap-2">
          <span class="text-sm text-glass-muted">
            {{ $t('feature.localPlugin.localImport') }}
          </span>
          <div class="flex items-center gap-3">
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="sr-only"
              @change="handleFileChange"
            />
            <GButton variant="primary" @click="fileInput?.click()">
              <UploadOutlined />
              {{ $t('feature.localPlugin.importFile') }}
            </GButton>
            <span
              v-if="formState.importFile.length"
              class="truncate text-xs text-glass-muted"
            >
              {{ formState.importFile[0].name }}
            </span>
          </div>
        </div>

        <div v-if="formState.importType == '2'" class="flex flex-col gap-2">
          <span class="text-sm text-glass-muted">
            {{ $t('feature.localPlugin.remoteImport') }}
          </span>
          <GInput
            v-model="formState.importUrl"
            :placeholder="$t('feature.localPlugin.importUrlPlaceholder')"
          />
        </div>
      </div>
      <template #footer>
        <GButton variant="secondary" @click="handleCancel">
          {{ $t('feature.localPlugin.cancelText') }}
        </GButton>
        <GButton variant="primary" @click="handleOk">
          {{ $t('feature.localPlugin.okText') }}
        </GButton>
      </template>
    </GModal>
    <GModal
      v-model="deleteVisible"
      :title="$t('feature.localPlugin.deleteLocalPluginConfirm')"
    >
      <p class="text-sm text-glass-muted">
        {{ $t('feature.localPlugin.deleteLocalPluginConfirm') }}
      </p>
      <template #footer>
        <GButton variant="secondary" @click="deleteVisible = false">
          {{ $t('feature.localPlugin.deleteLocalPluginCancelText') }}
        </GButton>
        <GButton variant="danger" @click="confirmDelete">
          {{ $t('feature.localPlugin.deleteLocalPluginConfirmText') }}
        </GButton>
      </template>
    </GModal>
  </div>
</template>

<script setup>
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { computed, getCurrentInstance, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { GAlert, GButton, GInput, GModal, toast } from '@/components/ui';
import PluginList from './plugin-list.vue';

const visible = ref(false);
const deleteVisible = ref(false);
const fileInput = ref(null);
const store = useStore();
const { proxy } = getCurrentInstance();
const pluginList = computed(() => {
  return store.state.totalPlugins.filter((i) => i['#type'] == 'localPlugin');
});
const formState = reactive({
  importType: 1,
  importFile: [],
  importUrl: '',
});
const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  formState.importFile = file ? [{ name: file.name, originFileObj: file }] : [];
};
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
const handleOk = () => {
  if (formState.importType == 1 && !formState.importFile.length) {
    toast.error(proxy.$t('feature.localPlugin.importFileErrorMsg'));
    return;
  }
  if (formState.importType == 2 && !formState.importUrl) {
    toast.error(proxy.$t('feature.localPlugin.importUrlErrorMsg'));
    return;
  }
  if (formState.importType == 1) {
    readPlguinJsonByFile();
  } else {
    readPlguinJsonByUrl();
  }
};
const readPlguinJsonByFile = () => {
  const file = formState.importFile[0];
  const reader = new FileReader();
  reader.readAsText(file.originFileObj);
  reader.onload = () => {
    const json = JSON.parse(reader.result);
    configFetchSuccess(json);
  };
};
const readPlguinJsonByUrl = () => {
  fetch(formState.importUrl)
    .then((response) => response.json())
    .then((json) => {
      configFetchSuccess(json);
    });
};

// onMounted(() => {
//   const json = window.rubick.db.get(LOCAL_PLUGIN_JSON);
//   pluginList.value = JSON.parse(json.data);
// });
const configFetchSuccess = (json) => {
  // 打上标记，表示本地插件
  const plugins = json.map((i) => ({ ...i, '#type': 'localPlugin' }));
  toast.success(proxy.$t('feature.localPlugin.configFetchSuccess'));
  visible.value = false;
  formState.importFile = [];
  formState.importUrl = '';
  formState.importType = 1;
  resetFileInput();
  store.dispatch('saveLocalPlugins', plugins);
};
const handleCancel = () => {
  visible.value = false;
  formState.importFile = [];
  formState.importUrl = '';
  formState.importType = 1;
  resetFileInput();
};
const onModalVisibleChange = (value) => {
  if (value) {
    visible.value = true;
  } else {
    handleCancel();
  }
};
const handleDeleteClick = async () => {
  await store.dispatch('deleteLocalPlugins');
  toast.success(proxy.$t('feature.localPlugin.deleteLocalPluginSuccess'));
};
const confirmDelete = async () => {
  await handleDeleteClick();
  deleteVisible.value = false;
};
</script>
