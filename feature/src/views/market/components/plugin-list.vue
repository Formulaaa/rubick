<template>
  <section class="section-block">
    <div v-if="title" class="section-head">
      <h3 class="section-title">{{ title }}</h3>
    </div>
    <div class="row-list">
      <div
        v-for="(item, index) in visibleList"
        :key="index"
        class="row-item min-h-[68px]"
      >
        <button
          type="button"
          class="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-[10px] py-1 text-left"
          @click="showDetail(item)"
        >
          <span class="icon-plinth">
            <img
              :src="item.logo"
              alt=""
              class="h-8 w-8 rounded-[9px] object-cover"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span
              class="block truncate text-[14px] font-semibold leading-5 text-glass-text"
            >
              {{ item.pluginName }}
            </span>
            <span class="block truncate text-[12px] leading-4 text-glass-muted">
              {{ item.description }}
            </span>
            <span class="mt-1 flex items-center gap-2 text-[11px] text-glass-muted">
              <span v-if="item.author" class="truncate">@{{ item.author }}</span>
              <span v-if="item.version">v{{ item.version }}</span>
              <span v-if="updatedLabel(item)" class="truncate">
                {{ updatedLabel(item) }}
              </span>
            </span>
          </span>
        </button>
        <div class="flex shrink-0 items-center">
          <GButton
            :variant="item.isdownload ? 'secondary' : 'primary'"
            size="sm"
            class="download-plugin-btn min-w-[68px]"
            :loading="item.isloading"
            :title="
              item.isdownload
                ? $t('feature.market.installed')
                : $t('feature.market.install')
            "
            @click.stop="
              item.isdownload
                ? openPlugin(item)
                : downloadPlugin(item, index)
            "
          >
            <CloudDownloadOutlined
              v-if="!item.isloading && !item.isdownload"
              class="text-[15px]"
            />
            <SelectOutlined
              v-if="!item.isloading && item.isdownload"
              class="text-[14px]"
            />
            {{
              item.isdownload
                ? $t('feature.market.installed')
                : $t('feature.market.install')
            }}
          </GButton>
        </div>
      </div>
    </div>
    <GDrawer v-model="visible" :width="720">
      <template #title>
        <div class="flex min-w-0 items-center gap-3.5">
          <span class="icon-plinth h-12 w-12 rounded-[14px]">
            <img
              :src="detail.logo"
              alt=""
              class="h-9 w-9 rounded-[10px] object-cover"
            />
          </span>
          <div class="min-w-0 flex-1">
            <div class="truncate text-[17px] font-semibold text-glass-text">
              {{ detail.pluginName }}
            </div>
            <div class="mt-0.5 truncate text-[11.5px] text-glass-muted">
              {{ detail.description }}
            </div>
          </div>
          <GButton
            v-if="!detail.isdownload"
            variant="primary"
            size="sm"
            class="shrink-0"
            @click.stop="downloadPlugin(detail)"
            :loading="detail.isloading"
          >
            <CloudDownloadOutlined
              v-show="!detail.isloading && !detail.isdownload"
            />
            {{ $t('feature.market.install') }}
          </GButton>
          <GButton
            v-else
            variant="secondary"
            size="sm"
            class="shrink-0"
            @click.stop="openPlugin(detail)"
          >
            <SelectOutlined />
            {{ $t('feature.market.installed') }}
          </GButton>
        </div>
      </template>
      <div
        v-if="detail.name"
        class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line pb-4 text-[11px] text-glass-muted"
      >
        <span>
          {{ $t('feature.market.author') }}
          <strong class="font-medium text-glass-text">{{ detail.author || '—' }}</strong>
        </span>
        <span>
          {{ $t('feature.market.version') }}
          <strong class="font-medium text-glass-text">{{ detail.version || '—' }}</strong>
        </span>
        <span v-if="detailSource">
          {{ $t('feature.market.source') }}
          <strong class="font-medium text-glass-text">{{ detailSource }}</strong>
        </span>
        <span v-if="updatedLabel(detail)">
          {{ $t('feature.market.updated') }}
          <strong class="font-medium text-glass-text">{{
            updatedLabel(detail)
          }}</strong>
        </span>
        <span class="w-full text-[11px] text-glass-muted">
          {{ $t('feature.market.trustNote') }}
        </span>
      </div>
      <div v-if="keywordList.length" class="mb-5">
        <div class="mb-2 flex items-center justify-between gap-3">
          <span class="text-[12px] font-semibold text-glass-text">
            {{ $t('feature.market.keywords') }}
          </span>
          <span class="text-[10.5px] text-glass-muted">
            {{ $t('feature.market.keywordHint') }}
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <GTag
            v-for="keyword in keywordList"
            :key="keyword"
            class="border border-line bg-panel-soft text-glass-text"
          >
            {{ keyword }}
          </GTag>
        </div>
      </div>
      <div
        v-if="!content"
        class="flex min-h-[320px] flex-col items-center justify-center gap-3 text-xs text-glass-muted"
      >
        <GSpinner />
        <span>正在加载插件介绍…</span>
      </div>
      <div
        v-else-if="content !== 'error'"
        v-html="content"
        class="plugin-detail"
      ></div>
      <GEmpty
        v-else
        title=""
        description="插件主页内容走丢啦！"
        class="[&>div:first-child]:h-auto [&>div:first-child]:w-auto [&>div:first-child]:bg-transparent [&>div:first-child]:ring-0"
      >
        <template #icon>
          <Vue3Lottie :animationData="notFountJson" :height="240" :width="240" />
        </template>
      </GEmpty>
    </GDrawer>
  </section>
</template>

<script setup>
import { CloudDownloadOutlined, SelectOutlined } from '@ant-design/icons-vue';
import MarkdownIt from 'markdown-it';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import notFountJson from '@/assets/lottie/404.json';
import request from '@/assets/request/index';
import {
  GButton,
  GDrawer,
  GEmpty,
  GSpinner,
  GTag,
  toast,
} from '@/components/ui';

const { t } = useI18n();

const store = useStore();
const router = useRouter();

const startDownload = (name) => store.dispatch('startDownload', name);
const successDownload = (name) => store.dispatch('successDownload', name);
const errorDownload = (name) => store.dispatch('errorDownload', name);

const props = defineProps({
  list: {
    type: [Array],
    default: () => [],
  },
  title: String,
});

const visibleList = computed(() => props.list.filter((item) => !!item));

const downloadPlugin = async (plugin) => {
  startDownload(plugin.name);
  try {
    await window.market.downloadPlugin(plugin);
    toast.success(
      t('feature.dev.installSuccess', { pluginName: plugin.pluginName }),
    );
    successDownload(plugin.name);
  } catch (error) {
    errorDownload(plugin.name);
    const reason =
      error?.message?.includes('network') || error?.code === 'ERR_NETWORK'
        ? t('feature.market.installNetworkError')
        : t('feature.market.installFailed');
    toast.error(reason);
  }
};

const visible = ref(false);
const showIndex = ref(0);
const markdown = new MarkdownIt();
const defaultImage = markdown.renderer.rules.image;
markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('loading', 'lazy');
  tokens[idx].attrSet('decoding', 'async');
  tokens[idx].attrSet('referrerpolicy', 'no-referrer');
  return defaultImage(tokens, idx, options, env, self);
};
const content = ref('');

const normalizeDetail = (html, title) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const heading = doc.body.querySelector('h1');
  if (heading?.textContent?.trim() === title) {
    heading.remove();
  }
  doc.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noreferrer');
  });
  return doc.body.innerHTML;
};

const showDetail = async (item) => {
  visible.value = true;
  showIndex.value = props.list.indexOf(item);
  content.value = '';
  let mdContent = '暂无内容';
  try {
    if (item.homePage) {
      mdContent = await request.getPluginDetail(item.homePage);
    }
    content.value = normalizeDetail(
      markdown.render(mdContent),
      item.pluginName,
    );
  } catch (e) {
    content.value = 'error';
  }
};

const updatedLabel = (item) => {
  const value = item.updateTime || item.updatedAt || item.lastUpdated;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
};

const detail = computed(() => props.list[showIndex.value]);

const detailSource = computed(() => {
  try {
    return new URL(detail.value.homePage).hostname;
  } catch {
    return '';
  }
});

const keywordList = computed(() => {
  const keywords = new Set();
  (detail.value.features || []).forEach((feature) => {
    (feature.cmds || []).forEach((command) => {
      const label =
        typeof command === 'string' ? command : command?.label || '';
      if (label) keywords.add(label);
    });
  });
  return [...keywords];
});

const openPlugin = (item) => {
  store.commit('commonUpdate', { active: ['installed'] });
  router.push({
    path: '/installed',
    query: { plugin: item.name },
  });
};
</script>
