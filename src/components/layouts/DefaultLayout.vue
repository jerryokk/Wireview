<template>
  <div class="fl layout-container">
    <div class="fl top">
      <slot name="slot1"></slot>
    </div>
    <div class="v-resize"></div>
    <div class="fl bottom">
      <div class="fl first quarter">
        <slot name="slot2"></slot>
      </div>
      <div class="h-resize"></div>
      <div class="fl second quarter">
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
  border-top: 1px solid var(--ws-darker-gray);
}
.bottom {
  flex-grow: 1;
}
.quarter {
  border: 1px solid var(--ws-darker-gray);
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
