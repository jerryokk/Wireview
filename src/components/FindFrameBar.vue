<script setup>
import { reactive } from "vue";
import { manager } from "../globals";

const state = reactive({
  searchInProgress: false,
});

const findParams = reactive({
  target: "list",
  input_type: "string",
  search_term: "",
  case_sensitive: false,
  backwards: false,
  multiple_occurrences: true,
});

const handleSubmit = () => {
  if (state.searchInProgress) return;
  state.searchInProgress = true;

  const params = {
    ...findParams,
    frame_number: manager.activeFrameNumber,
    filter: manager.displayFilter,
  };

  if (manager.activeFieldInfo) {
    const { ptr, range } = manager.activeFieldInfo;
    if (ptr) params.field_info_ptr = ptr;
    if (range) {
      params.search_pos = range[0];
      params.search_len = range[1] - range[0];
    }
  }

  manager
    .findFrame(params)
    .then((result) => {
      // TODO: this doesn't work for filtered views
      if (result?.frame_number)
        manager.setActiveFrameIndex(result.frame_number - 1);
      if (result?.field_info_ptr)
        manager.setActiveFieldInfo(result.field_info_ptr);
    })
    .finally(() => (state.searchInProgress = false));
};

const handleCancelKeyPress = (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    manager.setFindFrameBarHidden(true);
  }
};
</script>
<template>
  <form class="bar" action="/" @submit.prevent="handleSubmit">
    <div class="row">
      <select
        v-model="findParams.target"
        :disabled="['dfilter', 'hex_value'].includes(findParams.input_type)"
      >
        <option value="list">Packet list</option>
        <option value="details">Packet details</option>
        <option value="bytes">Packet bytes</option>
      </select>
      <select v-model="findParams.input_type">
        <option value="dfilter">Display filter</option>
        <option value="hex_value">Hex value</option>
        <option value="string">String</option>
        <option value="regex">Regular Expression</option>
      </select>
      <input type="text" v-model="findParams.search_term" />
      <button
        type="submit"
        :disabled="state.searchInProgress || findParams.search_term === ''"
        @mousedown.prevent
        @mouseup="handleSubmit"
      >
        Find
      </button>
      <button
        type="button"
        @mousedown.prevent
        @mouseup="() => manager.setFindFrameBarHidden(true)"
        @keypress="handleCancelKeyPress"
      >
        Cancel
      </button>
    </div>
    <div class="row">
      <label>
        <strong class="text">Options:</strong>&nbsp;
        <select name="target" :disabled="findParams.input_type !== 'string'">
          <option value="both">Narrow & Wide</option>
          <option value="ascii">Narrow (UTF-8 / ASCII)</option>
          <option value="wide">Wide (UTF-16)</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          v-model="findParams.case_sensitive"
          :disabled="['dfilter', 'hex_value'].includes(findParams.input_type)"
        />
        Case sensitive
      </label>
      <label>
        <input type="checkbox" v-model="findParams.backwards" />
        Backwards
      </label>
      <label>
        <input type="checkbox" v-model="findParams.multiple_occurrences" />
        Multiple occurrences
      </label>
    </div>
  </form>
</template>
<style scoped>
.bar {
  padding: 2px 5px 2px 5vw;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-bottom: var(--ws-pane-border);
}
.bar .row {
  display: flex;
  flex-wrap: wrap;
  height: 24px;
  align-items: stretch;
  gap: 5px;
}
.bar select {
  border-radius: 3px;
  border: var(--ws-pane-border);
  background: linear-gradient(to bottom, white, var(--ws-light-gray));
}
.bar input[type="text"] {
  border-radius: 3px;
  border: var(--ws-pane-border);
  flex-grow: 1;
}
.bar button {
  width: 80px;
  border: var(--ws-pane-border);
  background: linear-gradient(to bottom, white, var(--ws-light-gray));
  border-radius: 3px;
}
.bar label {
  display: flex;
  align-items: center;
}
.bar label select {
  align-self: stretch;
}
.bar select:hover:not(:disabled),
.bar button:hover:not(:disabled) {
  filter: brightness(1.05);
}
</style>
