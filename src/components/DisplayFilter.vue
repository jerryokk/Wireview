<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { manager } from "../globals";
import FilterApplyIcon from "./icons/FilterApplyIcon.vue";

const isFilterValid = ref(null);
const displayFilterInput = ref("");
const inputRef = useTemplateRef("dfilter");

watch(
  () => displayFilterInput.value,
  async (filter) => {
    if (filter === "") {
      isFilterValid.value = null;
      return;
    }

    const result = await manager.checkFilter(filter);
    isFilterValid.value = result.ok;
  }
);

const handleSubmit = () => {
  manager.setDisplayFilter(displayFilterInput.value);
};

// Ctrl-/ or Command-/
const handleGlobalKeydown = (event) => {
  if (event.key === "/" && !event.shiftKey && event.ctrlKey ^ event.metaKey) {
    event.preventDefault();
    inputRef.value.focus();
  }
};
onMounted(() => document.body.addEventListener("keydown", handleGlobalKeydown));
onBeforeUnmount(() =>
  document.body.removeEventListener("keydown", handleGlobalKeydown)
);
</script>
<template>
  <div class="filter-container" :class="{ disabled: !manager.sessionInfo }">
    <form class="filter-bar" @submit.prevent="handleSubmit">
      <input
        type="text"
        name="dfilter"
        ref="dfilter"
        v-model="displayFilterInput"
        :placeholder="
          manager.displayFilter
            ? `Current filter: ${manager.displayFilter}`
            : 'Apply a display filter ... <Ctrl-/>'
        "
        :disabled="!manager.sessionInfo"
        :style="{
          '--ws-display-filter-bg':
            isFilterValid === null
              ? 'transparent'
              : isFilterValid
              ? 'var(--ws-ugly-green)'
              : 'var(--ws-ugly-red)',
        }"
      />
      <button
        type="submit"
        class="apply-filter"
        title="Apply display filter"
        :disabled="
          isFilterValid === false ||
          manager.displayFilter === displayFilterInput
        "
      >
        <FilterApplyIcon />
      </button>
    </form>
    <!-- There's a button to add a display filter button. This feature is Not Planned -->
  </div>
</template>
<style scoped>
.filter-container {
  display: flex;
  padding: 4px;
  border-top: var(--ws-pane-border);
  border-bottom: var(--ws-pane-border);
}
.filter-container .filter-bar {
  flex-grow: 1;

  display: flex;
  background-color: white;
  border: 1px solid gray;
  border-radius: 3px;
  overflow: hidden;
}
.filter-container.disabled .filter-bar {
  filter: saturate(0);
  opacity: 0.75;
  pointer-events: none;
}
.filter-container .filter-bar input[type="text"] {
  flex-grow: 1;
  outline: none;
  border: none;
  background-color: var(--ws-display-filter-bg);
  padding: 1px 4px;
}
.apply-filter {
  border: none;
  background: none;
  padding: 0;
  outline: none;

  height: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
  margin: 0 5px;
  filter: brightness(1.75);
  opacity: 0.9;
}
.apply-filter:disabled {
  pointer-events: none;
  filter: grayscale(100%);
  opacity: 0.4;
}
.apply-filter:hover {
  filter: brightness(1.25);
}
.apply-filter:active {
  filter: brightness(1);
}
.apply-filter svg {
  height: 100%;
}
</style>
