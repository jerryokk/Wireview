<script setup>
import { manager } from "../../../globals";
import { toHexColor } from "../../../util.js";

const props = defineProps({
  frame: {
    type: Object,
    required: true,
  },
});
</script>
<template>
  <div
    class="row"
    :style="{
      backgroundColor: toHexColor(frame.bg),
      color: toHexColor(frame.fg),
    }"
    :class="{
      selected: frame.number === manager.activeFrameNumber,
    }"
    @mousedown="() => manager.setActiveFrameNumber(frame.number)"
  >
    <div
      v-for="(_, index) in manager.columns"
      :class="{ [manager.columnsSanitized[index]]: true }"
      :style="{ width: `var(--col${index})` }"
    >
      <div class="text">{{ frame.columns[index] }}</div>
    </div>
  </div>
</template>
<style scoped>
.row {
  height: var(--ws-row-height);
  display: flex;
  min-width: none;
}
.row.selected {
  /* TODO: Find an alternative to using !important */
  background-color: var(--ws-selected-bg) !important;
  color: var(--ws-selected-fg) !important;
}
.row .text {
  padding: 0 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.row .no {
  text-align: right;
}
</style>
