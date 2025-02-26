<script setup>
import {
  computed,
  reactive,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from "vue";
import { useResizeObserver, useScroll } from "@vueuse/core";
import { manager } from "../../globals";
import Minimap from "./PacketList/Minimap.vue";
import Row from "./PacketList/Row.vue";

// Row code
const headerHeight = 20; // TODO: use resizeObserver to set this?
const minimapRef = useTemplateRef("minimap");
const scrollableRef = useTemplateRef("packet-list-scrollable");
const { y: scrollY } = useScroll(scrollableRef);
const clientHeight = ref(0);
const scrollMaxY = ref(0);
useResizeObserver(scrollableRef, () => {
  clientHeight.value = scrollableRef.value.clientHeight;
  scrollMaxY.value =
    scrollableRef.value.scrollHeight - scrollableRef.value.clientHeight;
});
// count of rows that are completely visible
const rowCount = computed(() => {
  const availableHeight = Math.max(0, clientHeight.value - headerHeight);
  const fullRows = Math.floor(availableHeight / manager.rowHeight);
  console.log("fullRows", fullRows, "availableHeight", availableHeight);
  return fullRows;
});
// the index of the current first row
const firstRowIndex = computed(() => {
  // scrollMaxY can be 0
  const percent = scrollMaxY.value ? scrollY.value / scrollMaxY.value : 0;
  console.log("scrollY", scrollY.value, "scrollMaxY", scrollMaxY.value);
  return Math.round(Math.max(0, manager.frameCount - rowCount.value) * percent);
});
// number of frames required
const requiredFrameCount = computed(() =>
  Math.max(rowCount.value + 1, minimapRef.value?.rowCount ?? 0)
);

const frameInfo = shallowRef(null);
let framesRequestPending = false;
const requestFrames = async () => {
  if (framesRequestPending) return;
  framesRequestPending = true;
  const currentFirstRowIndex = firstRowIndex.value;
  frameInfo.value = await manager.getFrames(
    manager.displayFilter,
    currentFirstRowIndex,
    requiredFrameCount.value
  );
  framesRequestPending = false;
  console.log("firstRowIndex", currentFirstRowIndex, firstRowIndex.value);
  if (currentFirstRowIndex != firstRowIndex.value) requestFrames();
};
watch(
  [
    firstRowIndex,
    requiredFrameCount,
    () => manager.displayFilter,
    () => manager.sessionInfo,
  ],
  requestFrames
);

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
  <div class="packet-list-scrollable" ref="packet-list-scrollable">
    <div
      class="content"
      :style="{
        '--minimap-width': `${minimapWidth}px`,
      }"
    >
      <div
        ref="contentRef"
        class="table"
        :class="{
          invisible: manager.columns.length === 0,
        }"
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
        <div class="rows" v-if="frameInfo">
          <Row
            v-for="i in Math.min(
              rowCount + 1,
              frameInfo.frames.length - frameInfo.offset
            )"
            :frame="frameInfo.frames[frameInfo.offset + i - 1]"
            :key="manager.displayFilter + (frameInfo.offset + i)"
            :index="frameInfo.skipped + frameInfo.offset + i - 1"
          />
        </div>
      </div>
      <Minimap ref="minimap" :frameInfo="frameInfo" />
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
.table.invisible {
  opacity: 0;
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
</style>
