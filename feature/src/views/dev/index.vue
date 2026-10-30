<template>
  <div class="page">
    <header class="page-header">
      <div class="min-w-0">
        <h1 class="page-title">{{ $t('feature.dev.title') }}</h1>
      </div>
    </header>

    <GAlert :message="$t('feature.dev.tips')" type="warning" />

    <section class="section-block">
      <div class="section-head">
        <span class="section-title">{{ $t('feature.dev.pluginName') }}</span>
      </div>
      <div class="surface-section">
        <div class="field-row">
          <label class="shrink-0 text-sm text-glass-muted">
            {{ $t('feature.dev.pluginName') }}
          </label>
          <GInput class="max-w-[320px] flex-1" v-model="formState.name" />
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <GButton variant="secondary" @click="refresh">
          {{ $t('feature.dev.refreshPlugins') }}
        </GButton>
        <GButton :loading="loading" variant="primary" @click="onSubmit">
          {{ $t('feature.dev.install') }}
        </GButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GAlert, GButton, GInput, toast } from '@/components/ui';

const { t } = useI18n();

const formState = reactive({
  name: undefined,
});
const onSubmit = () => {
  if (!formState.name) {
    toast.warning('Please input name');
    return;
  }
  downloadPlugin(formState.name);
};

const loading = ref(false);
const downloadPlugin = async (pluginName) => {
  loading.value = true;
  await window.market.downloadPlugin({
    name: pluginName,
    isDev: true,
  });
  toast.success(t('feature.dev.installSuccess', { pluginName: pluginName }));
  loading.value = false;
};

const refresh = () => {
  if (!formState.name) {
    toast.warning('Please input name');
    return;
  }
  window.market.refreshPlugin({
    name: formState.name,
  });
  toast.success(
    t('feature.dev.refreshSuccess', { pluginName: formState.name }),
  );
};
</script>
