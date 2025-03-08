<script setup>
import { manager } from "../../../globals";
import { toHexColor } from "../../../util.js";

const props = defineProps({
  frame: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <div
    class="row"
    :style="{
      '--ws-row-bg': toHexColor(frame.bg),
      '--ws-row-fg': toHexColor(frame.fg),
    }"
    :tabindex="frame.number === manager.activeFrameNumber ? 0 : -1"
    @focus="() => manager.setActiveFrameIndex(index)"
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
}
.row[tabindex="0"] {
  background-color: var(--ws-selected-unfocused-bg);
  color: var(--ws-selected-unfocused-fg);
}
.row[tabindex="0"]:focus {
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
