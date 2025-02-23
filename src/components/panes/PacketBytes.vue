<script setup>
import { computed, reactive } from "vue";
import { manager } from "../../globals";
import { bytesToHex, formatHexString } from "../../util";

const goodiebag = reactive({
  rawBytes: computed(
    () =>
      manager.activeFrameDetails?.data_sources
        ?.map(({ data }) => atob(data))
        .join("") ?? ""
  ),
});
goodiebag.lineNumbers = computed(() => {
  const lineCount = Math.ceil(goodiebag.rawBytes.length / 16);
  return Array.from({ length: lineCount }, (_, i) =>
    (i * 16).toString(16).padStart(4, "0")
  );
});
goodiebag.hexBytes = computed(() =>
  formatHexString(bytesToHex(goodiebag.rawBytes))
);
goodiebag.textBytes = computed(() => {
  const textString = goodiebag.rawBytes.replace(/[^\w]/g, ".");
  let formatted = textString.substring(0, 8);
  for (let i = 8; i < textString.length; i += 8)
    formatted += (i % 16 ? " " : "\n") + textString.substring(i, i + 8);
  return formatted;
});
</script>
<template>
  <div class="bytes-container">
    <div class="line-numbers">
      <div v-for="lineNumber in goodiebag.lineNumbers">{{ lineNumber }}</div>
    </div>
    <div class="hex-bytes hexadecimal">
      <pre>{{ goodiebag.hexBytes }}</pre>
    </div>
    <div class="text-bytes">
      <pre>{{ goodiebag.textBytes }}</pre>
    </div>
  </div>
</template>
<style scoped>
.bytes-container {
  display: flex;
  background-color: white;
  font-family: var(--ws-font-family-monospace);
  font-size: var(--ws-font-size-monospace);
  line-height: var(--ws-row-height);

  width: 100%;
}
.bytes-container pre {
  margin: 0;
}
.line-numbers {
  display: flex;
  flex-direction: column;
  width: 6ch;
  padding: 0 1ch;
  background-color: var(--ws-light-gray);
  color: var(--ws-darkest-gray);
}
.hex-bytes.hexadecimal {
  width: 48ch;
  margin: 0 1ch;
}
.text-bytes {
  margin: 0 2ch;
}
</style>
