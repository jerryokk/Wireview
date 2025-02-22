<template>
  <div class="layout-container">
    <div class="fl top">
      <slot name="slot1"></slot>
    </div>
    <div class="v-resize"></div>
    <div class="bottom">
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
  align-items: stretch;
}

.layout-container {
  flex-grow: 1;
  align-self: stretch;

  display: flex;
  flex-direction: column;
}
.top {
  height: 40vh;
}
.v-resize {
  height: 4px;
  border-top: 1px solid var(--ws-darker-gray);
}
.bottom {
  display: flex;
  flex-grow: 1;
}
.quarter {
  border: 1px solid var(--ws-darker-gray);
}
.first.quarter {
  border-left: none;
  width: 40vw;
}
.h-resize {
  width: 4px;
}
.second.quarter {
  border-right: none;
  flex-grow: 1;
}
</style>
