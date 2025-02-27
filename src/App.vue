<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import IconRibbon from "./components/IconRibbon.vue";
import DisplayFilter from "./components/DisplayFilter.vue";
import DefaultLayout from "./components/layouts/DefaultLayout.vue";
import PacketList from "./components/panes/PacketList.vue";
import PacketBytes from "./components/panes/PacketBytes.vue";
import PacketDetails from "./components/panes/PacketDetails.vue";
import { manager } from "./globals";
import StatusBar from "./components/StatusBar.vue";
onMounted(() => {
  manager.initialize();
});

onBeforeUnmount(() => {
  manager.deinitialize();
});
</script>

<template>
  <IconRibbon />
  <DisplayFilter />
  <DefaultLayout
    :style="{
      '--ws-row-height': manager.rowHeight + 'px',
      '--ws-font-size-monospace': manager.fontSize + 'px',
    }"
  >
    <template #slot1>
      <PacketList />
    </template>
    <template #slot2>
      <PacketDetails />
    </template>
    <template #slot3>
      <PacketBytes />
    </template>
  </DefaultLayout>
  <StatusBar />
</template>
