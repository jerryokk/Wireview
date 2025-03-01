<script setup>
import { computed, reactive } from "vue";
import Base64 from "../../../classes/Base64";
import BytesFormatter from "../../../classes/BytesFormatter";

const props = defineProps({
  bytes64: {
    type: Object,
    required: true,
  },
});

const goodiebag = reactive({
  bytes: computed(() =>
    props.bytes64 === null ? null : Base64.decode(props.bytes64)
  ),
});
goodiebag.lineNumbers = computed(() => {
  const lineCount = Math.ceil((goodiebag.bytes?.length ?? 0) / 16);
  return Array.from({ length: lineCount }, (_, i) =>
    (i * 16).toString(16).padStart(4, "0")
  );
});

const spacers = {
  hexadecimal: [" ", "  "],
  decimal: [" ", "  "],
  ascii: ["", " "],
  ebcdic: ["", " "],
};

const displayBuddy = (dataSource, format) => {
  if (!dataSource?.length) return "";

  const { displayBytes } = BytesFormatter.format(dataSource, format);
  console.log("db", displayBytes, format);

  let result = displayBytes[0];
  const spacer = spacers[format];
  for (let i = 1; i < displayBytes.length; ++i)
    result +=
      (i % 16 ? (i % 8 ? spacer[0] : spacer[1]) : "\n") + displayBytes[i];
  return result;
};
</script>

<template>
  <div class="bytes-container" v-if="goodiebag.bytes !== null">
    <div class="line-numbers">
      <div v-for="lineNumber in goodiebag.lineNumbers">{{ lineNumber }}</div>
    </div>
    <div class="hex-bytes hexadecimal">
      <pre>{{ displayBuddy(goodiebag.bytes, "hexadecimal") }}</pre>
    </div>
    <div class="text-bytes">
      <pre>{{ displayBuddy(goodiebag.bytes, "ascii") }}</pre>
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
