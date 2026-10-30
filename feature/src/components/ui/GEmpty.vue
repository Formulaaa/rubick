<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <div class="mb-4 grid h-16 w-16 place-items-center rounded-[22px] bg-glass-soft text-2xl text-glass-muted ring-1 ring-white/10">
      <slot name="icon">
        <svg
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
        </svg>
      </slot>
    </div>
    <div class="text-base font-semibold text-glass-text">
      <slot name="title">{{ title }}</slot>
    </div>
    <div v-if="$slots.description || description" class="mt-2 max-w-[420px] text-sm text-glass-muted">
      <slot name="description">{{ description }}</slot>
    </div>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: '暂无内容',
  description: '',
});
</script>
