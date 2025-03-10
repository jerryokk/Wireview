<script setup>
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useResizeObserver, useScroll } from "@vueuse/core";
import { manager } from "../../globals";
import Minimap from "./PacketList/Minimap.vue";
import Row from "./PacketList/Row.vue";
import PacketTable from "./PacketList/PacketTable.vue";

// Row code
const headerHeight = 20; // TODO: use resizeObserver to set this?
const minimapRef = useTemplateRef("minimap");
const scrollableRef = useTemplateRef("packet-list-scrollable");
const { y: scrollY } = useScroll(scrollableRef);
const clientHeight = ref(0);
const clientWidth = ref(0);
useResizeObserver(scrollableRef, () => {
  clientHeight.value = scrollableRef.value.clientHeight;
  clientWidth.value = scrollableRef.value.clientWidth;
});
// count of rows that are completely visible
const rowCount = computed(() => {
  const availableHeight = Math.max(0, clientHeight.value - headerHeight);
  const fullRows = Math.floor(availableHeight / manager.rowHeight);
  console.log("fullRows", fullRows, "availableHeight", availableHeight);
  return fullRows;
});
// rows that aren't in the view
const extraRows = computed(() =>
  Math.max(0, manager.frameCount - rowCount.value)
);
// the index of the current first row
const firstRowIndex = computed(() => {
  const clamped = Math.min(extraRows.value, Math.max(0, scrollY.value));
  console.log("scrollY", scrollY.value, "fri", clamped);
  return clamped;
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

const minimapWidth = 34;
const visibleTableWidth = computed(() => clientWidth.value - minimapWidth);

///////// keyboard
// TODO: update firstRowIndex if row does not exist
// TODO: Add support for Page Up/Down
const handleRowKeydown = (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    event.target.previousElementSibling?.focus();
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    event.target.nextElementSibling?.focus();
    return;
  }
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
      <PacketTable :visibleWidth="visibleTableWidth">
        <div
          ref="rows"
          class="rows"
          v-if="frameInfo"
          @keydown="handleRowKeydown"
        >
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
      </PacketTable>
      <Minimap ref="minimap" :frameInfo="frameInfo" />
    </div>
    <div
      :style="{
        height: extraRows + 'px',
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
.rows {
  font-family: var(--ws-font-family-monospace);
  font-size: var(--ws-font-size-monospace);
  cursor: default;
}
</style>
