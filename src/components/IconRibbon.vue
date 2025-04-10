<script setup>
import OpenFileIcon from "./icons/OpenFileIcon.vue";
import SaveCaptureIcon from "./icons/SaveCaptureIcon.vue";
import CloseCaptureIcon from "./icons/CloseCaptureIcon.vue";
import ReloadCaptureIcon from "./icons/ReloadCaptureIcon.vue";
import FindIcon from "./icons/FindIcon.vue";
import PreviousPacketIcon from "./icons/PreviousPacketIcon.vue";
import NextPacketIcon from "./icons/NextPacketIcon.vue";
import { manager } from "../globals";
import PcapFileInput from "../PcapFileInput.vue";
import GoFirstIcon from "./icons/GoFirstIcon.vue";
import GoLastIcon from "./icons/GoLastIcon.vue";
</script>

<template>
  <div class="ribbon">
    <label class="icon" title="Open capture file">
      <OpenFileIcon />

      <PcapFileInput />
    </label>
    <div class="icon disabled" title="Save capture file">
      <SaveCaptureIcon />
    </div>
    <div
      class="icon"
      :class="{ disabled: manager.sessionInfo === null }"
      title="Close this capture file"
      @click="() => manager.closeFile()"
    >
      <CloseCaptureIcon />
    </div>
    <div class="icon disabled" title="Reload this file">
      <ReloadCaptureIcon />
    </div>
    <div class="separator"></div>
    <div
      class="icon"
      :class="{ disabled: manager.sessionInfo === null }"
      title="Find a packet"
      @mousedown.prevent
      @mouseup="() => manager.setFindFrameBarHidden()"
    >
      <FindIcon />
    </div>
    <!-- In Firefox, the css :active selector does not fire if we run
    event.preventDefault() on the mousedown event. We need to prevent default
    so that focus is not lost (from, say, a currently focused row) -->
    <div
      class="icon"
      :class="{
        disabled: !manager.canGoToPreviousPacket,
      }"
      title="Go to the previous packet"
      @mousedown.prevent
      @mouseup="() => manager.goToNearbyPacket(-1)"
    >
      <PreviousPacketIcon />
    </div>
    <div
      class="icon"
      :class="{
        disabled: !manager.canGoToNextPacket,
      }"
      title="Go to the next packet"
      @mousedown.prevent
      @mouseup="() => manager.goToNearbyPacket(1)"
    >
      <NextPacketIcon />
    </div>
    <div
      class="icon"
      :class="{
        disabled: !manager.canGoToPreviousPacket,
      }"
      title="Go to the first packet"
      @mousedown.prevent
      @mouseup="() => manager.setActiveFrameIndex(0)"
    >
      <GoFirstIcon />
    </div>
    <div
      class="icon"
      :class="{
        disabled: !manager.canGoToNextPacket,
      }"
      title="Go to the last packet"
      @mousedown.prevent
      @mouseup="() => manager.setActiveFrameIndex(-1)"
    >
      <GoLastIcon />
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
.icon:active {
  background: var(--ws-dark-gray);
}
.icon.disabled,
.icon:has(input[disabled]) {
  pointer-events: none;
  filter: saturate(0);
  opacity: 0.75;
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
a.demo {
  color: #555;
  text-decoration: 1px underline dotted;
}
</style>
