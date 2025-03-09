<script setup>
import { computed, reactive } from "vue";
import BytesDisplay from "./BytesDisplay";

const props = defineProps({
  sourceIndex: {
    type: [Number, null],
    required: true,
  },
});

const state = reactive({
  bytesDisplayFormat: "hexadecimal",
  textDisplayFormat: "ascii",

  // computed
  bytesPerLine: 0,
  lineNumbers: [],
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
</script>

<template>
  <div class="bytes-container" v-if="bytes !== null">
    <div class="line-numbers">
      <div v-for="lineNumber in state.lineNumbers">{{ lineNumber }}</div>
    </div>
    <BytesDisplay
      class="display bytes"
      :displayFormat="state.bytesDisplayFormat"
      :bytesPerLine="state.bytesPerLine"
      :sourceIndex
    />
    <BytesDisplay
      class="display text"
      :displayFormat="state.textDisplayFormat"
      :bytesPerLine="state.bytesPerLine"
      :sourceIndex
    />
  </div>
</template>

<style scoped>
/* this comes from the layout */
.needs-border-bottom .bytes-container {
  border-bottom: var(--ws-pane-border);
}
.bytes-container {
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
  --ws-detail-bg-default: transparent;
  white-space: pre-wrap;
}
.display.bytes {
  margin: 0 1ch;
}
.display.text {
  margin: 0 2ch;
}
</style>
