<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { manager } from "../../globals";
import { useResizeObserver } from "@vueuse/core";
import Minimap from "../Minimap.vue";

// Scroll code
const scrollPercent = ref(0);
const handleScroll = (e) => {
  const scrollTopMax = e.target.scrollHeight - e.target.clientHeight;
  scrollPercent.value = scrollTopMax ? e.target.scrollTop / scrollTopMax : 0;
};

// Row code
const scrollableRef = ref(null);
const rowCount = ref(0);
const calcRowCount = () => {
  rowCount.value = Math.floor(
    scrollableRef.value.clientHeight / manager.rowHeight
  );
  console.log("rows:", rowCount.value, scrollableRef.value.clientHeight);
};
onMounted(calcRowCount);
useResizeObserver(scrollableRef, calcRowCount);

// TODO: Refactor column code
const minColWidth = 34;
const defaultColWidth = 80;
const minimapWidth = 34;

const contentRef = ref(null);
const totWidth = ref(0);

const colWidths = reactive([]);

const updateLastColWidth = () => {
  if (!colWidths.length) return;
  let widthOfOtherCols = 0;
  for (let i = 0; i < colWidths.length - 1; ++i)
    widthOfOtherCols += colWidths[i];
  colWidths[colWidths.length - 1] = Math.max(
    minColWidth,
    totWidth.value - widthOfOtherCols
  );
};

useResizeObserver(contentRef, (entries) => {
  const entry = entries.at(-1);
  totWidth.value = entry.borderBoxSize[0].inlineSize;

  updateLastColWidth();
});

watch(
  () => manager.columns,
  () => {
    if (manager.columns.length === colWidths.length) return;

    let totColWidth = 0;
    for (const [i, col] of manager.columns.entries()) {
      if (i < colWidths.length) continue;

      colWidths[i] = ["Source", "Destination"].includes(col)
        ? 200
        : defaultColWidth;
      totColWidth += colWidths[i];
    }

    updateLastColWidth();
    console.log("c2w", colWidths);
  }
);

const handleColResize = (e, index) => {
  const originalColWidth = colWidths[index];
  manager.registerResizeCallback(
    e.clientX,
    "horizontal",
    (delta) =>
      (colWidths[index] = Math.max(minColWidth, originalColWidth + delta))
  );
};
</script>

<template>
  <div
    class="packet-list-scrollable"
    @scroll.passive="handleScroll"
    ref="scrollableRef"
  >
    <div
      class="content"
      :style="{
        '--minimap-width': `${minimapWidth}px`,
      }"
    >
      <div
        ref="contentRef"
        class="table"
        :style="{
          '--row-height': manager.rowHeight + 'px',
          '--font-size': manager.fontSize + 'px',

          // column widths
          ...Object.fromEntries(
            colWidths.map((width, index) => [`--col${index}`, `${width}px`])
          ),
        }"
      >
        <div class="header">
          <div
            v-for="(col, index) in manager.columns"
            :style="{ width: `var(--col${index})` }"
          >
            <div class="text">{{ col }}</div>
            <div
              class="h-resize"
              @mousedown="(e) => handleColResize(e, index)"
            ></div>
          </div>
        </div>
        <div class="rows">
          <div
            class="row"
            v-for="frame in manager.frames"
            :style="{
              backgroundColor: `#${
                frame.bg?.toString(16)?.padStart(6, '0') ?? 'f00'
              }`,
              color: `#${frame.fg?.toString(16)?.padStart(6, '0') ?? 'f00'}`,
            }"
            :class="{
              selected: frame.number === manager.activeFrameNumber,
            }"
            @mousedown="() => manager.setActiveFrameNumber(frame.number)"
          >
            <div
              v-for="(col, index) in manager.columns"
              :class="{ [manager.columnsSanitized[index]]: true }"
              :style="{ width: `var(--col${index})` }"
            >
              <div class="text">{{ frame.columns[index] }}</div>
            </div>
          </div>
        </div>
      </div>
      <Minimap />
    </div>
    <div class="scroller"></div>
    <div class="scroller"></div>
  </div>
</template>
<style scoped>
.packet-list-scrollable {
  flex-grow: 1;
  position: relative;
  overflow: auto;
  border-top: 1px solid var(--ws-darkest-gray);
}
.scroller {
  height: 100vh;
}
.content {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100%;

  display: flex;
}
.table {
  flex-grow: 1;
  align-items: stretch;
  background-color: white;
}
.table > .header {
  display: flex;
  font: var(--ws-font-sans-serif);
  background: linear-gradient(
    to bottom,
    var(--ws-lighter-gray),
    var(--ws-gray)
  );
  border-bottom: 1px solid var(--ws-darkest-gray);
  user-select: none;
}
.table > .header > div {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  min-width: 0;
}
.table > .header .text {
  flex-grow: 1;
  padding: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}
.table > .header .h-resize {
  width: 1px;
  background-color: var(--ws-darker-gray);
  cursor: e-resize;
  position: relative;
}
.table > .header .h-resize::after {
  content: "";
  position: absolute;
  top: 0;
  left: -3px;
  height: 100%;
  width: 7px;
}
.rows {
  font-family: var(--ws-font-family-monospace);
  font-size: var(--font-size);
}
.row {
  height: var(--row-height);
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
}
.row .no {
  text-align: right;
}
</style>
