<script setup>
import { computed, reactive } from "vue";
import { manager } from "../../globals";
import SourceDisplay from "./PacketBytes/SourceDisplay.vue";
import DataSourceTabBar from "./PacketBytes/DataSourceTabBar.vue";

const state = reactive({
  // computed
  activeSourceIndex: null,
  tabHeaders: [],
});
state.activeSourceIndex = computed(() =>
  manager.activeFrameDetails?.sourceCount ? 0 : null
);
state.tabHeaders = computed(
  () => manager.activeFrameDetails?.getSourceNames() ?? []
);
</script>

<template>
  <div class="packet-bytes-wrapper" v-if="state.activeSourceIndex !== null">
    <SourceDisplay :sourceIndex="state.activeSourceIndex" />
    <DataSourceTabBar
      :tabHeaders="state.tabHeaders"
      :activeIndex="state.activeSourceIndex"
      @tabchange="(index) => (state.activeSourceIndex = index)"
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
