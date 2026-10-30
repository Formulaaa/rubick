<template>
  <div class="relative">
    <select
      v-model="model"
      class="glass-soft focus-ring h-9 w-full appearance-none rounded-xl border px-3 pr-8 text-sm text-glass-text outline-none"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="bg-[var(--app-bg-2)] text-glass-text"
      >
        {{ option.label }}
      </option>
    </select>
    <svg
      class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-glass-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: Array<{ label: string; value: string | number }>;
}>();
const model = defineModel<string | number>();
</script>
