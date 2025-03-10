<script setup>
import { manager } from "./globals";

const onFileSelect = (e) => {
  console.log("file selected", e.target.files);

  manager.openFile(e.target.files[0]);
};
</script>

<template>
  <input
    type="file"
    accept=".cap,.pcap,.pcapng,application/vnd.tcpdump.pcap"
    @change="onFileSelect"
    :disabled="!manager.canOpenFile"
  />
</template>
