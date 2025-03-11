<script setup>
import { computed, reactive, useTemplateRef, watch } from "vue";
import { manager } from "../../../globals";
import { toHexColor } from "../../../util.js";

const { frameInfo, width, height } = defineProps({
  frameInfo: {
    type: Object,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
});

const state = reactive({
  // refs
  canvasRef: useTemplateRef("minimap-canvas"),

  // computed
  canvasWidth: 0,
  canvasHeight: 0,
});

// subtract border px
state.canvasWidth = computed(() => Math.floor(width - 2));
state.canvasHeight = computed(() => Math.floor(height - 2));

watch([() => frameInfo, () => manager.activeFrameNumber], () => {
  const frames = frameInfo?.frames ?? [];
  const context = state.canvasRef.getContext("2d");
  for (let i = 0; i < state.canvasHeight; i++) {
    const frameIdx = frameInfo.offset + i;
    if (frameIdx < frames.length) {
      const frame = frames[frameIdx];
      if (manager.activeFrameNumber === frame.number)
        context.fillStyle = "#404040";
      else context.fillStyle = toHexColor(frame.bg);
    } else context.fillStyle = "white";
    context.fillRect(0, i, state.canvasRef.width, 1);
  }
});
</script>

<template>
  <div class="minimap">
    <canvas
      ref="minimap-canvas"
      :width="state.canvasWidth"
      :height="state.canvasHeight"
    ></canvas>
  </div>
</template>

<style scoped>
.minimap {
  flex-shrink: 0;

  position: sticky;
  right: 0;

  background-color: white;
  border: 1px solid var(--ws-darker-gray);
}
.minimap canvas {
  display: block;
}
</style>
