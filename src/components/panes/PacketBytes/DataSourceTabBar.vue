<script setup>
const { tabHeaders } = defineProps({
  tabHeaders: {
    type: Array,
    required: true,
  },
});

const activeIndex = defineModel("index");

const handleKeypress = (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    event.target.previousElementSibling?.focus();
  }

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    event.target.nextElementSibling?.focus();
  }
};
</script>
<template>
  <div class="bar" v-if="tabHeaders.length > 1">
    <div
      class="tab"
      v-for="(tabHeader, index) in tabHeaders"
      :tabindex="index === activeIndex ? 0 : -1"
      @keydown="handleKeypress"
      @focus="() => (activeIndex = index)"
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
.tab[tabindex="0"] {
  padding: 5px 10px;
  background-color: var(--ws-almost-white);
}
</style>
