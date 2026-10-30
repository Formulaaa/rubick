<template>
  <span :title="text" class="inline-flex">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>();
</script>
