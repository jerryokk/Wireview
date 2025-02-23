<script setup>
import { computed, ref } from "vue";
import Triangle from "../../icons/Triangle.vue";

const { tree, indent } = defineProps({
  tree: {
    type: [Object, Array],
    required: true,
  },
  indent: {
    type: [Number, null],
    default: null,
  },
});
const isRoot = computed(() => !tree.label);
const collapsed = ref(!isRoot.value);
</script>
<template>
  <div class="row" v-if="!isRoot">
    <div class="indent" :style="{ width: (indent ?? 0) * 20 + 'px' }"></div>
    <div
      class="triangle"
      @mousedown="() => (collapsed = !collapsed)"
      :class="{ collapsed }"
    >
      <Triangle v-show="tree.tree?.length" />
    </div>
    <div class="label">{{ tree.label }}</div>
  </div>
  <div class="children" v-if="tree.tree?.length" v-show="!collapsed">
    <RowTree
      v-for="child in tree.tree"
      :tree="child"
      :indent="(indent ?? -1) + 1"
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
