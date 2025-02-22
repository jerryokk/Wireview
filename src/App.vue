<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import IconRibbon from "./components/IconRibbon.vue";
import DefaultLayout from "./components/layouts/DefaultLayout.vue";
import PacketList from "./components/areas/PacketList.vue";
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
  <DefaultLayout>
    <template #slot1>
      <PacketList />
    </template>
  </DefaultLayout>
  <div>Hello World</div>
</template>
