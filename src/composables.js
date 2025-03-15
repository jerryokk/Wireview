import { onBeforeUnmount, onMounted } from "vue";

export const useInterval = (fn, ms) => {
  let interval;
  onMounted(() => (interval = setInterval(fn, ms)));
  onBeforeUnmount(() => clearInterval(interval));
};
