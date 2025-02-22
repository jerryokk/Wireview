<script setup>
import OpenFileIcon from "./icons/OpenFileIcon.vue";
import SaveCaptureIcon from "./icons/SaveCaptureIcon.vue";
import CloseCaptureIcon from "./icons/CloseCaptureIcon.vue";
import ReloadCaptureIcon from "./icons/ReloadCaptureIcon.vue";
import FindIcon from "./icons/FindIcon.vue";
import PreviousPacketIcon from "./icons/PreviousPacketIcon.vue";
import NextPacketIcon from "./icons/NextPacketIcon.vue";

const onFileSelect = (e) => {
  console.log(e.target.files);

  manager.openFile(e.target.files[0]);
};
</script>

<template>
  <div class="ribbon">
    <label class="icon" title="Open capture file">
      <OpenFileIcon />

      <input
        type="file"
        accept=".cap,.pcap,.pcapng,application/vnd.tcpdump.pcap"
        @change="onFileSelect"
      />
    </label>
    <div class="icon disabled" title="Save capture file">
      <SaveCaptureIcon />
    </div>
    <div class="icon disabled" title="Close this capture file">
      <CloseCaptureIcon />
    </div>
    <div class="icon disabled" title="Reload this file">
      <ReloadCaptureIcon />
    </div>
    <div class="separator"></div>
    <div class="icon disabled" title="Find a packet">
      <FindIcon />
    </div>
    <div class="icon disabled" title="Go to the previous packet">
      <PreviousPacketIcon />
    </div>
    <div class="icon disabled" title="Go to the next packet">
      <NextPacketIcon />
    </div>
  </div>
</template>

<style scoped>
.ribbon {
  background: linear-gradient(
    to bottom,
    var(--ws-lighter-gray),
    var(--ws-light-gray)
  );
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 1px;
}
.icon {
  padding: 3px;
  display: flex;
  border: 1px solid transparent;
  border-radius: 4px;
}
.icon:hover {
  background: linear-gradient(
    to bottom,
    var(--ws-almost-white),
    var(--ws-gray)
  );
  border-color: var(--ws-darkest-gray);
}
.icon.disabled {
  pointer-events: none;
  filter: saturate(0);
}
.icon input[type="file"] {
  display: none;
}
.separator {
  margin: 0 2px 0 3px;
  width: 2px;
  height: 50%;
  background-color: var(--ws-dark-gray);
  border-right: 1px solid var(--ws-almost-white);
}
</style>
