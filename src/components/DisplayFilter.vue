<script setup>
import { ref, watch } from "vue";
import { manager } from "../globals";
import FilterApplyIcon from "./icons/FilterApplyIcon.vue";

const isFilterValid = ref(null);
const displayFilterInput = ref("");

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
</script>
<template>
  <div class="filter-container">
    <form class="filter-bar" @submit.prevent="handleSubmit">
      <input
        type="text"
        name="dfilter"
        v-model="displayFilterInput"
        placeholder="Apply a display filter ... <Ctrl-/>"
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
        :class="{
          disabled:
            isFilterValid === false ||
            manager.displayFilter === displayFilterInput,
        }"
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
  border-top: 1px solid gray;
}
.filter-bar {
  flex-grow: 1;

  display: flex;
  background-color: white;
  border: 1px solid gray;
  border-radius: 3px;
  overflow: hidden;
}
.filter-bar input[type="text"] {
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
.apply-filter.disabled {
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
