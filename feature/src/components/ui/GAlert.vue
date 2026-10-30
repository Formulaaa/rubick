<template>
  <div
    class="glass-soft flex gap-3 rounded-glass-sm border p-3 text-sm"
    :class="typeClass"
  >
    <span class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current" />
    <div class="min-w-0">
      <div class="font-medium text-glass-text">
        <slot name="message">{{ message }}</slot>
      </div>
      <div v-if="$slots.default || description" class="mt-1 text-glass-muted">
        <slot>{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: 'info' | 'success' | 'warning' | 'error';
    message?: string;
    description?: string;
  }>(),
  { type: 'info' },
);

const typeClass = computed(
  () =>
    ({
      info: 'text-sky-400',
      success: 'text-emerald-400',
      warning: 'text-amber-400',
      error: 'text-rose-400',
    })[props.type],
);
</script>
