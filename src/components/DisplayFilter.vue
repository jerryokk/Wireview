<script setup>
import { ref, watch } from "vue";
import { manager } from "../globals";

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
</style>
