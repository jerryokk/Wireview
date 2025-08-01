<script setup>
import {
  computed,
  reactive,
  shallowReactive,
  useTemplateRef,
  watch,
} from "vue";
import { useResizeObserver, useScroll, watchThrottled } from "@vueuse/core";
import { areArraysEqual, clamp } from "../../util";
import { manager } from "../../globals";
import Minimap from "./PacketList/Minimap.vue";
import PacketTable from "./PacketList/PacketTable.vue";
import PacketTableRows from "./PacketList/PacketTableRows.vue";

// Row code
const headerHeight = 20; // TODO: use resizeObserver to set this?

const state = reactive({
  clientHeight: 0,
  clientWidth: 0,

  // refs
  minimapRef: useTemplateRef("minimap"),
  scrollableRef: useTemplateRef("packet-list-scrollable"),
  scrollY: null,

  // computed
  rowCount: 0, // count of rows that are completely visible
  extraRows: 0, // rows that aren't in the view
  scrollYPercent: 0, // how much percent is scrolled
  firstRowIndex: 0, // the index of the current first row
  visibleTableWidth: 0, // available width for table (total width - minimap width)
  minimapFirstRowIndex: 0, // first row of the minimap index
  frameReqArgs: [], // filter, skip, limit (minimap)
  frameReqArgsForTable: [], // filter, skip, limit (table)
});

const shallowState = shallowReactive({
  frameBank: null,
  table: null,
});

state.scrollY = useScroll(() => state.scrollableRef).y;

state.rowCount = computed(() => {
  const availableHeight = Math.max(0, state.clientHeight - headerHeight);
  const fullRows = Math.floor(availableHeight / manager.rowHeight);
  console.debug("fullRows", fullRows, "availableHeight", availableHeight);
  return fullRows;
});

state.extraRows = computed(() =>
  Math.max(0, manager.frameCount - state.rowCount)
);

state.scrollYPercent = computed(() =>
  // clamping is required because many mobile browsers under/overscroll
  clamp(0, state.extraRows ? state.scrollY / state.extraRows : 0, 1)
);

state.firstRowIndex = computed(() => {
  const clamped = clamp(0, state.scrollY, state.extraRows);
  console.debug("scrollY", state.scrollY, "fri", clamped);
  return clamped;
});
state.visibleTableWidth = computed(() => state.clientWidth - minimapWidth);

state.minimapFirstRowIndex = computed(() =>
  Math.max(
    0,
    Math.round((manager.frameCount - state.clientHeight) * state.scrollYPercent)
  )
);

state.frameReqArgs = computed(() => [
  manager.displayFilter,
  state.minimapFirstRowIndex,
  state.clientHeight,
]);

state.frameReqArgsForTable = computed(() => [
  manager.displayFilter,
  state.firstRowIndex,
  state.rowCount + 1,
]);

useResizeObserver(
  () => state.scrollableRef,
  () => {
    state.clientHeight = state.scrollableRef.clientHeight;
    state.clientWidth = state.scrollableRef.clientWidth;
  }
);

const updateRowsForTable = () => {
  if (shallowState.frameBank === null) return;
  const {
    frames,
    offset,
    reqArgs: [filter, skip, limit],
  } = shallowState.frameBank;

  // so let's say starts at frame index 50, while the first table row starts at index 60
  // that is (state.firstRowIndex - skip)

  // normal case
  // have [50,,, 100], offset = 0
  // want [60, 75], startSliceIdx = 10 -> startIndex = 60

  // have [50,,, 100], offset = 0
  // want [45, 60], startSliceIdx = 0  -> startIndex = 50

  // have [50,,, 100], offset = 10
  // want [45, 60], startSliceIdx = 5  -> startIndex = 45

  const minIndex = skip - offset;
  const haveEndFrames = minIndex + frames.length === manager.frameCount;
  const maxIndex = Math.max(
    0,
    skip + frames.length - state.rowCount - !haveEndFrames
  );
  const startIndex = clamp(minIndex, state.firstRowIndex, maxIndex);
  const startSliceIdx = startIndex - minIndex;
  shallowState.table = {
    frames: frames.slice(startSliceIdx, startSliceIdx + state.rowCount + 1),
    startIndex,
  };
};

let framesRequest = null;
const requestFrames = async () => {
  if (framesRequest) return;
  const reqArgs = state.frameReqArgs;
  const [filter, skip, limit] = reqArgs;
  framesRequest = manager.getFrames(filter, skip, limit);
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const { frames, offset } = await framesRequest;
  framesRequest = null;

  shallowState.frameBank = { frames, offset, reqArgs };

  updateRowsForTable();
  if (!areArraysEqual(reqArgs, state.frameReqArgs)) return requestFrames();
};

watchThrottled(() => state.frameReqArgs, requestFrames, { throttle: 111 });

watch(() => state.frameReqArgsForTable, updateRowsForTable);

const minimapWidth = 34;

// Scrolling via mousewheel scrolls too much because a row contributes only 1px to the scrollbar
const handleWheel = (event) => {
  if (!event.deltaY) return;
  event.preventDefault();
  state.scrollY += Math.round(event.deltaY / manager.rowHeight);
};

// ensure that active row is in viewport
// may not be in viewport already due to keyboard navigation
watch(
  () => manager.activeFrameIndex,
  (index) => {
    if (index === null) return;

    console.log("idx", index, state.firstRowIndex, document.activeElement);
    if (index < state.firstRowIndex)
      state.scrollY -= state.firstRowIndex - index;
    else if (index >= state.firstRowIndex + state.rowCount)
      state.scrollY += index - (state.firstRowIndex + state.rowCount) + 1;
  }
);
</script>

<template>
  <div
    class="packet-list-scrollable"
    ref="packet-list-scrollable"
    @wheel="handleWheel"
  >
    <div
      class="content"
      :style="{
        '--minimap-width': `${minimapWidth}px`,
      }"
    >
      <PacketTable :visibleWidth="state.visibleTableWidth">
        <PacketTableRows :table="shallowState.table" />
      </PacketTable>
      <Minimap
        ref="minimap"
        :frameInfo="shallowState.frameBank"
        :width="minimapWidth"
        :height="state.clientHeight"
      />
    </div>
    <div
      :style="{
        height: state.extraRows + 'px',
      }"
    ></div>
  </div>
</template>
<style scoped>
.packet-list-scrollable {
  flex-grow: 1;
  position: relative;
  overflow-y: scroll;
  overflow-x: auto;
}
.content {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100%;

  display: flex;
}
</style>
