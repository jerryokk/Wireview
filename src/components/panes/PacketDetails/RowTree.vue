<script setup>
import { reactive, watch } from "vue";
import Triangle from "../../icons/TriangleIcon.vue";
import { manager } from "../../../globals";

const { tree, indent } = defineProps({
  tree: {
    type: [Object, Array],
    required: true,
  },
  indent: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["focuswithin"]);

const state = reactive({
  collapsed: indent !== 0,
});

const handleDblclick = (event) => {
  if (event.target.dataset.skipDblclick === "true") return;
  state.collapsed = !state.collapsed;
};
const handleFocuswithin = () => {
  emit("focuswithin");
  state.collapsed = false;
};
watch(
  () => manager.selectedFrameDetail,
  () => {
    if (tree === manager.selectedFrameDetail) handleFocuswithin();
  }
);
</script>
<template>
  <div
    class="row"
    v-if="indent !== 0"
    @dblclick="handleDblclick"
    :tabindex="tree === manager.selectedFrameDetail ? 0 : -1"
    @focus="() => manager.setSelectedFrameDetail(tree)"
  >
    <div class="indent" :style="{ width: (indent - 1) * 20 + 'px' }"></div>
    <div
      class="triangle"
      data-skip-dblclick="true"
      :class="{ collapsed: state.collapsed }"
      @mousedown="() => (state.collapsed = !state.collapsed)"
    >
      <Triangle v-show="tree.tree?.length" />
    </div>
    <div class="label">{{ tree.label }}</div>
  </div>
  <div class="children" v-if="tree.tree?.length" v-show="!state.collapsed">
    <RowTree
      v-for="child in tree.tree"
      :tree="child"
      :indent="indent + 1"
      @focuswithin="handleFocuswithin"
    />
  </div>
</template>
<style scoped>
.row {
  display: flex;
}
.row > * {
  flex-shrink: 0;
}
.row[tabindex="0"] {
  background-color: var(--ws-selected-unfocused-bg);
  color: var(--ws-selected-unfocused-fg);
}
.row[tabindex="0"]:focus {
  background-color: var(--ws-selected-bg);
  color: var(--ws-selected-fg);
}
.row .triangle {
  width: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
}
.row .triangle svg {
  width: 7px;
  height: 7px;
  object-fit: contain;
  fill: var(--ws-darkest-gray);
  pointer-events: none;
}
.row .triangle.collapsed svg {
  transform: rotateZ(-90deg);
}
.row .label {
  white-space: nowrap;
}
.children {
  flex-shrink: 0;

  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
