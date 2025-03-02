<script setup>
const { tabHeaders, activeIndex } = defineProps({
  tabHeaders: {
    type: Array,
    required: true,
  },
  activeIndex: {
    type: [Number, null],
    required: true,
  },
});
</script>
<template>
  <div class="bar" v-if="tabHeaders.length > 1">
    <div
      class="tab"
      :class="{
        active: index === activeIndex,
      }"
      v-for="(tabHeader, index) in tabHeaders"
      @click.prevent="$emit('tabchange', index)"
    >
      {{ tabHeader }}
    </div>
  </div>
</template>
<style scoped>
.bar {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}
.tab {
  padding: 4px 10px;
  border: var(--ws-pane-border);
  border-top: none;
  border-left: none;
  border-radius: 0 0 3px 3px;
  cursor: default;
}
.tab:last-child {
  border-right: var(--ws-pane-border);
}
.tab.active {
  padding: 5px 10px;
  background-color: var(--ws-almost-white);
}
</style>
