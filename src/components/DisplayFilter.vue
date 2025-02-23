<script setup></script>
<template>
  <div class="filter-container">
    <div class="filter-bar">
      <input type="text" placeholder="Apply a display filter ... <Ctrl-/>" />
    </div>
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
  background-color: transparent;
  padding: 1px 4px;
}
</style>
