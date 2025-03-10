<script setup>
import { computed, reactive } from "vue";
import { manager } from "../globals";
import GitHubIcon from "./icons/GitHubIcon.vue";

const store = reactive({
  packetCountInfo: computed(() => {
    if (manager.packetCount === 0) return "No Packets";

    const packetCountInfo = `Packets: ${manager.packetCount}`;
    if (manager.displayFilter === "") return packetCountInfo;

    const displayedPercent = (
      (manager.frameCount * 100) /
      manager.packetCount
    ).toFixed(1);

    return `${packetCountInfo} · Displayed: ${manager.frameCount} (${displayedPercent}%)`;
  }),
});
</script>
<template>
  <div class="status-bar">
    <div>{{ manager.statusText }}</div>
    <div style="flex-grow: 1"></div>
    <div>
      {{ store.packetCountInfo }}
    </div>
    <div style="flex-grow: 1"></div>
    <a
      class="github"
      href="https://github.com/radiantly/Wireview"
      aria-label="Visit the Wireview project page on GitHub"
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
