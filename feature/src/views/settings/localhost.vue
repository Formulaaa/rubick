<template>
  <div class="space-y-4">
    <GAlert
      :message="$t('feature.settings.intranet.tips')"
      type="warning"
    />

    <div class="surface-section">
      <div class="field-row">
        <label class="w-32 shrink-0 text-[13px] text-glass-text">
          {{ $t('feature.settings.intranet.npmMirror') }}
        </label>
        <GInput
          class="!w-[320px] shrink-0"
          placeholder="https://registry.npmmirror.com"
          v-model="formState.register"
        />
      </div>
      <div class="field-row">
        <label class="w-32 shrink-0 text-[13px] text-glass-text">
          {{ $t('feature.settings.intranet.dbUrl') }}
        </label>
        <GInput
          class="!w-[320px] shrink-0"
          placeholder="https://gitee.com/monkeyWang/rubickdatabase/raw/master"
          v-model="formState.database"
        />
      </div>
      <div class="field-row">
        <label class="w-32 shrink-0 text-[13px] text-glass-text">
          {{ $t('feature.settings.intranet.accessToken') }}
        </label>
        <GInput
          class="!w-[320px] shrink-0"
          :placeholder="$t('feature.settings.intranet.placeholder')"
          v-model="formState.access_token"
        />
      </div>
      <div class="flex justify-end gap-2 border-t border-line px-4 py-3">
        <GButton variant="primary" size="sm" @click="submit">
          确定
        </GButton>
        <GButton variant="secondary" size="sm" @click="resetForm">
          恢复默认
        </GButton>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { GAlert, GButton, GInput, toast } from '@/components/ui';

let _rev: any;

let defaultConfig = {
  register: 'https://registry.npmmirror.com',
  database: 'https://gitee.com/monkeyWang/rubickdatabase/raw/master',
  access_token: '',
};

try {
  const dbdata = window.rubick.db.get('rubick-localhost-config');
  defaultConfig = dbdata.data;
  _rev = dbdata._rev;
} catch (e) {
  // ignore
}

const formState = ref(JSON.parse(JSON.stringify(defaultConfig)));

const resetForm = () => {
  formState.value = {
    register: 'https://registry.npmmirror.com',
    database: 'https://gitee.com/monkeyWang/rubickdatabase/raw/master',
    access_token: '',
  };
};

const submit = () => {
  const changeData: any = {
    _id: 'rubick-localhost-config',
    data: toRaw(formState.value),
  };

  if (_rev) {
    changeData._rev = _rev;
  }

  window.rubick.db.put(changeData);
  toast.success('设置成功！重启插件市场后生效！');
};
</script>
