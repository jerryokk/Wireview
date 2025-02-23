<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { manager } from "../../globals";
import { useResizeObserver } from "@vueuse/core";
import Minimap from "./PacketList/Minimap.vue";
import { toHexColor } from "../../util.js";

// Row code
const headerHeight = 20; // TODO: use resizeObserver to set this?
const scrollableRef = ref(null);
const rowCount = ref(0);
const calcRowCount = () => {
  const availableHeight = scrollableRef.value.clientHeight - headerHeight;
  rowCount.value = Math.floor(availableHeight / manager.rowHeight);
  console.log("rows:", rowCount.value, availableHeight);
};
onMounted(calcRowCount);
useResizeObserver(scrollableRef, calcRowCount);

// Minimap ref
const minimapRef = ref(null);

// Manage rows
const currentTopRow = ref(0);
const frames = ref([]);
let pendingFramesRequest = false;

const updateFrames = async () => {
  if (pendingFramesRequest) return;
  pendingFramesRequest = true;
  // TODO: implement a caching layer here
  const requiredTopRow = currentTopRow.value;
  frames.value = await manager.getFrames(
    "",
    requiredTopRow,
    minimapRef?.value?.rowCount
  );
  pendingFramesRequest = false;
  if (requiredTopRow !== currentTopRow.value) updateFrames();
};

watch(
  [
    () => manager.packetCount,
    currentTopRow,
    rowCount,
    () => minimapRef?.value?.rowCount,
  ],
  async () => {
    if (manager.packetCount === 0) return;
    if (minimapRef?.value?.rowCount === null) return;

    console.log("req", minimapRef?.value?.rowCount);

    updateFrames();
  }
);

// Scroll code
const handleScroll = (e) => {
  const scrollTopMax = e.target.scrollHeight - e.target.clientHeight;
  const percent = scrollTopMax ? e.target.scrollTop / scrollTopMax : 0;

  // TODO: We use manager.packetCount, but this will not work with filters
  currentTopRow.value = (manager.packetCount - rowCount.value) * percent;
};

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
            v-for="frame in frames"
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
              v-for="(col, index) in manager.columns"
              :class="{ [manager.columnsSanitized[index]]: true }"
              :style="{ width: `var(--col${index})` }"
            >
              <div class="text">{{ frame.columns[index] }}</div>
            </div>
          </div>
        </div>
      </div>
      <Minimap ref="minimapRef" :frames="frames" />
    </div>
    <div class="scroller"></div>
    <div class="scroller"></div>
  </div>
</template>
<style scoped>
.packet-list-scrollable {
  flex-grow: 1;
  position: relative;
  overflow-y: scroll;
  overflow-x: auto;
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
  font-size: var(--ws-font-size-monospace);
}
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
