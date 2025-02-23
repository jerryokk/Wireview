<script setup>
import { useElementSize } from "@vueuse/core";
import { computed, ref, watch, watchEffect } from "vue";
import { manager } from "../../../globals";
import { toHexColor } from "../../../util.js";

const minimapRef = ref(null);
const canvasRef = ref(null);
const { width, height } = useElementSize(minimapRef);

const props = defineProps(["frames"]);

watch(
  () => [props.frames, manager.activeFrameNumber],
  () => {
    let line = 0;
    console.log("pframes", props.frames);
    const context = canvasRef.value.getContext("2d");
    for (const frame of props.frames) {
      if (manager.activeFrameNumber === frame.number)
        context.fillStyle = "#404040";
      else context.fillStyle = toHexColor(frame.bg);
      context.fillRect(0, line, canvasRef.value.width, 1);
      line += 1;
    }
  }
);
const rowCount = computed(() => Math.ceil(height.value));
defineExpose({ rowCount });
</script>

<template>
  <div class="minimap" ref="minimapRef">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<style scoped>
.minimap {
  flex-shrink: 0;
  width: var(--minimap-width);
  background-color: white;

  position: sticky;
  right: 0;

  display: flex;
  align-items: stretch;
}
.minimap canvas {
  flex-grow: 1;
}
</style>
