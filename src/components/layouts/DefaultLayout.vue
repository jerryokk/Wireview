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
/* TODO: nicely handle pane borders */
/* Here's an interesting question. Do you put the pane borders in the resize
 * handle div, the parent container, or should the child component deal with it? */
.v-resize {
  flex-shrink: 0;

  height: 4px;
  border-top: var(--ws-pane-border);
}
.bottom {
  flex-grow: 1;
}
.first.quarter {
  width: 50vw;
  border: var(--ws-pane-border);
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
