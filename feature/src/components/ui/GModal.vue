<template>
  <Teleport to="body">
    <div
      v-if="model"
      class="fixed inset-0 z-[3000] flex items-center justify-center p-6"
      @keydown.esc="model = false"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="model = false"
      />
      <div
        class="glass-panel relative max-h-[80vh] w-full overflow-auto rounded-glass p-6"
        :style="{ maxWidth: `${width}px` }"
      >
        <div class="mb-5 flex items-center justify-between gap-4">
          <div class="text-base font-semibold text-glass-text">
            <slot name="title">{{ title }}</slot>
          </div>
          <button
            type="button"
            class="focus-ring grid h-8 w-8 place-items-center rounded-full text-glass-muted transition-colors hover:bg-glass-soft hover:text-glass-text"
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
        <slot />
        <div v-if="$slots.footer" class="mt-5 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; width?: number }>(), {
  title: '',
  width: 520,
});
const model = defineModel<boolean>({ default: false });
</script>
