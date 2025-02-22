<script setup>
import { useElementSize } from "@vueuse/core";
import { ref, watch, watchEffect } from "vue";
import { manager } from "../globals";

const minimapRef = ref(null);
const canvasRef = ref(null);
const { width, height } = useElementSize(minimapRef);

watchEffect(() => {
  if (!canvasRef.value) return;
  canvasRef.value.width = width;
  canvasRef.value.height = height;
});
</script>

<template>
  <div class="minimap" ref="minimapRef">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.minimap {
  flex-shrink: 0;
  width: var(--minimap-width);
  background-color: yellow;

  position: sticky;
  right: 0;

  display: flex;
  align-items: stretch;
}
.minimap canvas {
  flex-grow: 1;
}
</style>
