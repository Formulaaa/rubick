<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    class="relative h-6 w-11 shrink-0 rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40"
    :class="model ? 'bg-accent shadow-[0_0_20px_-4px_var(--glass-accent)]' : 'bg-white/15'"
    @click="model = !model"
  >
    <span
      class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
      :class="model ? 'translate-x-[20px]' : 'translate-x-0'"
    />
  </button>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false });
</script>
