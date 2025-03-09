<script setup>
import { reactive } from "vue";
import { watchMouseDragMove } from "../../util";

// TODO: Refactor resize code into reusable block
// Can be done once we have more than a single layout

const state = reactive({
  firstPaneHeight: Math.round(window.innerHeight / 2),
  secondPaneWidth: Math.round(window.innerWidth / 2),
});

const handleVResize = (event) => {
  const originalHeight = state.firstPaneHeight;
  const handleMouseDragMove = ({ deltaY }) =>
    (state.firstPaneHeight = Math.max(0, originalHeight + deltaY));
  watchMouseDragMove(event, handleMouseDragMove);
};

const handleHResize = (event) => {
  const originalWidth = state.secondPaneWidth;
  const handleMouseDragMove = ({ deltaX }) =>
    (state.secondPaneWidth = Math.max(0, originalWidth + deltaX));
  watchMouseDragMove(event, handleMouseDragMove);
};
</script>

<template>
  <div class="fl layout-container">
    <div class="fl top" :style="{ height: state.firstPaneHeight + 'px' }">
      <slot name="slot1"></slot>
    </div>
    <div class="v-resize" @mousedown="handleVResize"></div>
    <div class="fl bottom">
      <div
        class="fl first quarter needs-border-bottom"
        :style="{ width: state.secondPaneWidth + 'px' }"
      >
        <slot name="slot2"></slot>
      </div>
      <div class="h-resize" @mousedown="handleHResize"></div>
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
}
.v-resize {
  flex-shrink: 0;

  height: 4px;
  border-top: var(--ws-pane-border);
  cursor: ns-resize;
}
.bottom {
  flex-grow: 1;
}
.quarter {
  border: var(--ws-pane-border);
  border-bottom: none;
}
.first.quarter {
  border-left: none;
}
.h-resize {
  flex-shrink: 0;

  width: 4px;
  cursor: ew-resize;
}
.second.quarter {
  flex-grow: 1;
  border-right: none;
}
</style>
