<script setup>
import { useElementSize } from "@vueuse/core";
import { computed, ref, watch, watchEffect } from "vue";
import { manager } from "../../../globals";
import { toHexColor } from "../../../util.js";

const minimapRef = ref(null);
const canvasRef = ref(null);
const { width, height } = useElementSize(minimapRef);

const props = defineProps({
  frameInfo: {
    type: Object,
  },
});

const rowCount = computed(() => Math.ceil(height.value));
defineExpose({ rowCount });

watch(
  () => [props.frameInfo, manager.activeFrameNumber],
  () => {
    const frames = props.frameInfo?.frames ?? [];
    const context = canvasRef.value.getContext("2d");
    for (let i = 0; i < rowCount.value; i++) {
      const frameIdx = props.frameInfo.offset + i;
      if (frameIdx < frames.length) {
        const frame = frames[frameIdx];
        if (manager.activeFrameNumber === frame.number)
          context.fillStyle = "#404040";
        else context.fillStyle = toHexColor(frame.bg);
      } else context.fillStyle = "white";
      context.fillRect(0, i, canvasRef.value.width, 1);
    }
  }
);
</script>

<template>
  <div class="minimap" ref="minimapRef">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<style scoped>
.minimap {
  flex-shrink: 0;

  position: sticky;
  right: 0;
  width: var(--minimap-width);

  display: flex;
  align-items: stretch;
  background-color: white;
  border: 1px solid var(--ws-darker-gray);
}
.minimap canvas {
  flex-grow: 1;
}
</style>
