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
      '--ws-row-bg': toHexColor(frame.bg),
      '--ws-row-fg': toHexColor(frame.fg),
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
  background-color: var(--ws-row-bg);
  color: var(--ws-row-fg);
}
.row.selected {
  background-color: var(--ws-selected-bg);
  color: var(--ws-selected-fg);
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
