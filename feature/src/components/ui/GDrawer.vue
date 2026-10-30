<template>
  <Teleport to="body">
    <div v-if="model" class="fixed inset-0 z-[3000]">
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        @click="model = false"
      />
      <div
        class="drawer-panel absolute right-0 top-0 flex h-full w-full flex-col overflow-hidden rounded-l-glass"
        :style="{ maxWidth: `${width}px` }"
      >
        <div
          class="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-5"
        >
          <div class="min-w-0 flex-1 text-base font-semibold text-glass-text">
            <slot name="title">{{ title }}</slot>
          </div>
          <button
            type="button"
            aria-label="关闭"
            class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-full text-glass-muted transition-colors hover:bg-glass-soft hover:text-glass-text"
            @click="model = false"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-auto px-6 py-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; width?: number }>(), {
  title: '',
  width: 560,
});
const model = defineModel<boolean>({ default: false });
</script>
