<script setup>
import { computed, reactive, watch } from "vue";
import { manager } from "../../globals";
import BytesDisplay from "./PacketBytes/BytesDisplay.vue";
import DataSourceTabBar from "./PacketBytes/DataSourceTabBar.vue";

const store = reactive({
  activeDataSourceIndex: null,
  activeDataSource: null,
  tabHeaders: computed(
    () =>
      manager.activeFrameDetails?.data_sources?.map(({ name }) => name) ?? []
  ),
});
store.activeDataSource = computed(
  () =>
    manager.activeFrameDetails?.data_sources[store.activeDataSourceIndex] ??
    null
);
watch(
  () => manager.activeFrameDetails,
  (activeFrameDetails) => {
    store.activeDataSourceIndex = activeFrameDetails?.data_sources?.length
      ? 0
      : null;
  }
);
</script>

<template>
  <div class="packet-bytes-wrapper">
    <BytesDisplay :bytes64="store.activeDataSource?.data ?? null" />
    <DataSourceTabBar
      :tabHeaders="store.tabHeaders"
      :activeIndex="store.activeDataSourceIndex"
      @tabchange="(index) => (store.activeDataSourceIndex = index)"
    />
  </div>
</template>

<style scoped>
.packet-bytes-wrapper {
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
  min-width: 0;
}
</style>
