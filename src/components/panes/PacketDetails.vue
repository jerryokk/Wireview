<script setup>
import RowTree from "./PacketDetails/RowTree.vue";
import { manager } from "../../globals";
</script>
<template>
  <div class="details-container">
    <RowTree
      v-if="manager.activeFrameDetails"
      :tree="manager.activeFrameDetails"
    />
  </div>
</template>
<style scoped>
/* this comes from the layout */
.needs-border-bottom .details-container {
  border-bottom: var(--ws-pane-border);
}
.details-container {
  flex-grow: 1;
  overflow: auto;
  min-width: 0;
  min-height: 0;
  display: flex;

  background-color: white;
  font-family: var(--ws-font-family-monospace);
  font-size: var(--ws-font-size-monospace);
  line-height: var(--ws-row-height);
}
</style>
