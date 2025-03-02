<template>
  <div class="fl layout-container">
    <div class="fl top">
      <slot name="slot1"></slot>
    </div>
    <div class="v-resize"></div>
    <div class="fl bottom">
      <div class="fl first quarter needs-border-bottom">
        <slot name="slot2"></slot>
      </div>
      <div class="h-resize"></div>
      <div class="fl second quarter needs-border-bottom">
        <slot name="slot3"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fl {
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  align-items: stretch;
}
.layout-container {
  flex-grow: 1;

  flex-direction: column;
}
.top {
  flex-shrink: 0;

  height: 50vh;
}
.v-resize {
  flex-shrink: 0;

  height: 4px;
  border-top: var(--ws-pane-border);
}
.bottom {
  flex-grow: 1;
}
.quarter {
  border: var(--ws-pane-border);
  border-bottom: none;
}
.first.quarter {
  width: 50vw;
  border-left: none;
}
.h-resize {
  flex-shrink: 0;

  width: 4px;
}
.second.quarter {
  flex-grow: 1;
  border-right: none;
}
</style>
