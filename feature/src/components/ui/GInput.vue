<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    class="glass-soft focus-ring h-9 w-full rounded-xl border px-3 text-sm text-glass-text outline-none transition-shadow placeholder:text-glass-muted disabled:opacity-50"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  { type: 'text' },
);

const model = defineModel<string>({ default: '' });
</script>
