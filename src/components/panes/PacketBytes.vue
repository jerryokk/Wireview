<script setup>
import { computed, reactive } from "vue";
import { manager } from "../../globals";
import { bytesToHex, formatHexString } from "../../util";

const goodiebag = reactive({
  hexBytes: computed(() => {
    const hexString = manager.activeFrameDetails?.data_sources
      ?.map(({ data }) => bytesToHex(atob(data)))
      .join("");
    return formatHexString(hexString);
  }),
});
</script>
<template>
  <div class="bytes-container">
    <div class="line-numbers"></div>
    <div class="hex-bytes hexadecimal">
      <pre>{{ goodiebag.hexBytes }}</pre>
    </div>
    <div class="text-bytes"></div>
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
.hex-bytes.hexadecimal {
  width: 48ch;
}
</style>
