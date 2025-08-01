<script setup>
import { onMounted, reactive, useTemplateRef, watch } from "vue";
import { manager } from "../../../globals";
import { toHexColor } from "../../../util.js";

const { frame, index } = defineProps({
  frame: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const state = reactive({
  // refs
  rowRef: useTemplateRef("row"),
});

const checkAndFocus = () => {
  if (manager.activeFrameNumber !== frame.number) return;

  // if another row is currently focused
  const focusedIndex = parseInt(document.activeElement.dataset?.frameIndex);
  const isAnotherRowFocused = !isNaN(focusedIndex) && focusedIndex !== index;

  if (
    document.activeElement === document.body ||
    document.activeElement === document.documentElement ||
    isAnotherRowFocused
  )
    state.rowRef.focus();
};

// if a selected frame row scrolls into the viewport, focus it if nothing else is focused
onMounted(checkAndFocus);

watch(() => manager.activeFrameNumber, checkAndFocus, { flush: "post" });
</script>
<template>
  <div
    class="row"
    ref="row"
    :style="{
      '--ws-row-bg': toHexColor(frame.bg),
      '--ws-row-fg': toHexColor(frame.fg),
    }"
    :data-frame-index="index"
    :tabindex="frame.number === manager.activeFrameNumber ? 0 : -1"
  >
    <div v-for="(_, index) in frame.columns">
      <div class="text">{{ frame.columns[index] }}</div>
    </div>
  </div>
</template>
<style scoped>
.row {
  height: var(--ws-row-height);
  display: flex;
  min-width: none;
  background-color: var(--ws-row-bg);
  color: var(--ws-row-fg);
  position: relative;
}
.row[tabindex="0"] {
  background-color: var(--ws-selected-unfocused-bg);
  color: var(--ws-selected-unfocused-fg);
}
.row[tabindex="0"]::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-top: 1px solid var(--ws-selected-bg);
  border-bottom: 1px solid var(--ws-selected-bg);
}
.row:focus {
  background-color: var(--ws-selected-bg);
  color: var(--ws-selected-fg);
}
.row .text {
  padding: 0 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Assumes that the first column is the No. column */
.row > div:first-child {
  text-align: right;
}

/* TODO: Generate this ?? */
.row > div:nth-child(1) {
  width: var(--ws-col0-width);
}
.row > div:nth-child(2) {
  width: var(--ws-col1-width);
}
.row > div:nth-child(3) {
  width: var(--ws-col2-width);
}
.row > div:nth-child(4) {
  width: var(--ws-col3-width);
}
.row > div:nth-child(5) {
  width: var(--ws-col4-width);
}
.row > div:nth-child(6) {
  width: var(--ws-col5-width);
}
.row > div:nth-child(7) {
  width: var(--ws-col6-width);
}
</style>
