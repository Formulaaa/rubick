<template>
  <span
    class="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-glass-soft ring-1 ring-white/15"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img v-if="src" :src="src" class="h-full w-full object-cover" />
    <slot v-else />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ src?: string; size?: number }>(), { size: 28 });
</script>
