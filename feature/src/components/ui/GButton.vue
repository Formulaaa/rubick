<template>
  <button
    type="button"
    :disabled="disabled || loading"
    class="focus-ring inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium outline-none transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
    :class="[variantClass, sizeClass, block ? 'w-full' : '']"
  >
    <span
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
  }>(),
  { variant: 'secondary', size: 'md' },
);

const variantClass = computed(
  () =>
    ({
      primary:
        'bg-accent text-white shadow-[0_10px_30px_-10px_var(--glass-accent)] hover:brightness-110',
      secondary:
        'glass-soft text-glass-text hover:bg-glass-strong hover:text-glass-text',
      ghost: 'text-glass-muted hover:bg-glass-soft hover:text-glass-text',
      danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
      success: 'bg-emerald-500/90 text-white hover:bg-emerald-500',
    })[props.variant],
);

const sizeClass = computed(
  () =>
    ({
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4',
      lg: 'h-11 px-5 text-[15px]',
    })[props.size],
);
</script>
