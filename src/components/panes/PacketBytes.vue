<script setup>
import { computed, reactive, watch } from "vue";
import { manager } from "../../globals";
import BytesDisplay from "./PacketBytes/BytesDisplay.vue";

const store = reactive({
  activeDataSourceIndex: null,
  activeDataSource: null,
});
watch(
  () => manager.activeFrameDetails,
  (activeFrameDetails) => {
    store.activeDataSourceIndex = activeFrameDetails?.data_sources?.length
      ? 0
      : null;
  }
);
store.activeDataSource = computed(
  () =>
    manager.activeFrameDetails?.data_sources[store.activeDataSourceIndex] ??
    null
);
</script>

<template>
  <BytesDisplay :bytes64="store.activeDataSource?.data ?? null" />
</template>
