<script setup>
import { manager } from "../globals";
import GitHubIcon from "./icons/GitHubIcon.vue";
</script>
<template>
  <div class="status-bar">
    <div>{{ manager.statusText }}</div>
    <div style="flex-grow: 1"></div>
    <a
      class="github"
      href="https://github.com/radiantly/Wireview"
      target="_blank"
    >
      <GitHubIcon />
    </a>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  padding: 2px 5px;
}
.github {
  display: flex;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
.github svg {
  height: 100%;
}
</style>
