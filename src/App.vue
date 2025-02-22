<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import IconRibbon from "./components/IconRibbon.vue";
import DefaultLayout from "./components/layouts/DefaultLayout.vue";
import PacketList from "./components/panes/PacketList.vue";
import PacketBytes from "./components/panes/PacketBytes.vue";
import { manager } from "./globals";
onMounted(() => {
  manager.initialize();
});

onBeforeUnmount(() => {
  manager.deinitialize();
});
</script>

<template>
  <IconRibbon />
  <DefaultLayout
    :style="{
      '--ws-row-height': manager.rowHeight + 'px',
      '--ws-font-size-monospace': manager.fontSize + 'px',
    }"
  >
    <template #slot1>
      <PacketList />
    </template>
    <template #slot3>
      <PacketBytes />
    </template>
  </DefaultLayout>
  <div>Hello World</div>
</template>
