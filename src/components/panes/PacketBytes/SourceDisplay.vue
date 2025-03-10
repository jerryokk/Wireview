<script setup>
import { computed, reactive, watch } from "vue";
import BytesDisplay from "./BytesDisplay";
import { manager } from "../../../globals";

const props = defineProps({
  sourceIndex: {
    type: [Number, null],
    required: true,
  },
});

const state = reactive({
  bytesDisplayFormat: "hexadecimal",
  textDisplayFormat: "ascii",
  activeDetailId: null,

  // computed
  bytesPerLine: 0,
  lineNumbers: [],
  containerStyles: {},
});

state.bytesPerLine = computed(() =>
  state.bytesDisplayFormat === "bits" ? 8 : 16
);

state.lineNumbers = computed(() => {
  const bytes = manager.activeFrameDetails?.getSourceData(props.sourceIndex);
  const lineCount = Math.ceil((bytes?.length ?? 0) / 16);
  return Array.from({ length: lineCount }, (_, i) =>
    (i * 16).toString(16).padStart(4, "0")
  );
});

state.containerStyles = computed(() => {
  if (state.activeDetailId === null) return {};
  return {
    [`--ws-detail-fg-${state.activeDetailId}`]: "white",
    [`--ws-detail-bg-${state.activeDetailId}`]: "#3f3f3f",
  };
});

const handleMouseover = (event) => {
  const detailId = parseInt(event.target.dataset?.detailId);
  if (isNaN(detailId)) return;
  state.activeDetailId = detailId;
};

const handleMousedown = () => {
  if (state.activeDetailId)
    manager.setSelectedFrameDetailId(state.activeDetailId);
};

watch(
  () => manager.selectedFrameDetailId,
  (id) => (state.activeDetailId = id)
);
</script>

<template>
  <div
    class="source-container"
    v-if="sourceIndex !== null"
    :style="state.containerStyles"
  >
    <div class="line-numbers">
      <div v-for="lineNumber in state.lineNumbers">{{ lineNumber }}</div>
    </div>
    <BytesDisplay
      class="display bytes"
      :displayFormat="state.bytesDisplayFormat"
      :bytesPerLine="state.bytesPerLine"
      :sourceIndex
      @mouseover="handleMouseover"
      @mousedown="handleMousedown"
    />
    <BytesDisplay
      class="display text"
      :displayFormat="state.textDisplayFormat"
      :bytesPerLine="state.bytesPerLine"
      :sourceIndex
      @mouseover="handleMouseover"
      @mousedown="handleMousedown"
    />
  </div>
</template>

<style scoped>
/* this comes from the layout */
.needs-border-bottom .source-container {
  border-bottom: var(--ws-pane-border);
}
.source-container {
  flex-grow: 1;

  display: flex;
  background-color: white;
  font-family: var(--ws-font-family-monospace);
  font-size: var(--ws-font-size-monospace);
  line-height: var(--ws-row-height);
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}
.line-numbers {
  display: flex;
  flex-direction: column;
  width: 6ch;
  height: fit-content;
  min-height: 100%;
  padding: 0 1ch;
  background-color: var(--ws-light-gray);
  color: var(--ws-darkest-gray);
}
.display {
  --ws-detail-fg-default: black;
  --ws-detail-bg-default: transparent;
  white-space: pre-wrap;
  flex-shrink: 0;
}
.display.bytes {
  margin: 0 1ch;
}
.display.text {
  margin: 0 2ch;
}
</style>
