<script setup>
import { computed, reactive } from "vue";
import { manager } from "../globals";
import GitHubIcon from "./icons/GitHubIcon.vue";
import { useInterval } from "../composables.js";

const state = reactive({
  bridgeLoader: null,

  // computed
  packetCountInfo: null,
});

state.packetCountInfo = computed(() => {
  if (manager.packetCount === 0) return "No Packets";

  const packetCountInfo = `Packets: ${manager.packetCount}`;
  if (manager.displayFilter === "") return packetCountInfo;

  const displayedPercent = (
    (manager.frameCount * 100) /
    manager.packetCount
  ).toFixed(1);

  return `${packetCountInfo} · Displayed: ${manager.frameCount} (${displayedPercent}%)`;
});

const generateDescription = (request) => {
  if (request.type === "frames") {
    if (manager.displayFilter)
      return `Loading frames for display filter '${manager.displayFilter}'`;
    return "Loading frames";
  }

  if (request.type === "open") return "Parsing frames from file";
  return "Loading";
};

const updateLoader = () => {
  const request = manager.activeBridgeRequest;
  if (request === null) {
    state.bridgeLoader = null;
    return;
  }

  const timeTaken = Date.now() - request.timestamp;
  if (timeTaken < 1000) {
    state.bridgeLoader = null;
    return;
  }

  const description = generateDescription(request);
  state.bridgeLoader = `${description}... ${Math.round(timeTaken / 1000)}s`;
};

useInterval(updateLoader, 1000);
</script>
<template>
  <div class="status-bar">
    <div>{{ state.bridgeLoader || "Wireview by radiantly" }}</div>
    <div style="flex-grow: 1"></div>
    <div>
      {{ state.packetCountInfo }}
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
