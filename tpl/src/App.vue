<template>
  <div class="app-aurora fixed inset-0 overflow-hidden text-glass-text">
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
window.rubick.onPluginEnter(({ code, type, payload }) => {
  const current = window.exports[code];
  if (current.mode === 'none') {
    current.args.enter && current.args.enter({ code: code, type, payload });
    return;
  }
  router.push({
    name: current.mode,
    params: {
      code,
      type,
      payload,
    },
  });
});
</script>
