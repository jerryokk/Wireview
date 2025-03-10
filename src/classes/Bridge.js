import { computed, reactive, shallowReactive } from "vue";
import SharkWorker from "../worker.js?no-inline&url";

class Bridge {
  #core;
  #state;
  #shallowState;

  constructor() {
    this.#core = {
      worker: null,
      callbacks: new Map(),
      timestamps: new Map(),
    };

    this.#state = reactive({
      // computed
      initialized: false,
      initializationError: "",
      columns: [],
    });

    this.#shallowState = shallowReactive({
      initializationResult: null,
    });

    this.#state.initialized = computed(
      () => this.#shallowState.initializationResult?.success ?? false
    );
    this.#state.initializationError = computed(
      () => this.#shallowState.initializationResult?.error ?? "Unknown"
    );
    this.#state.columns = computed(
      () => this.#shallowState.initializationResult?.columns ?? []
    );
  }

  get initialized() {
    return this.#state.initialized;
  }

  get initializationError() {
    return this.#state.initializationError;
  }

  get columns() {
    return this.#state.columns;
  }

  initialize() {
    this.#core.worker = new Worker(SharkWorker);
    this.#core.worker.addEventListener("message", (e) =>
      this.#processMessage(e)
    );
  }

  deinitialize() {
    this.#core.worker.terminate();
    this.#shallowState.initializationResult = null;
  }

  #processMessage({ data }) {
    if (this.#core.timestamps.has(data.id)) {
      const timeTaken = Date.now() - this.#core.timestamps.get(data.id);
      this.#core.timestamps.delete(data.id);
      console.log(timeTaken + "ms", data);
    } else console.log(data);

    if (data.type === "init") this.#shallowState.initializationResult = data;

    this.#core.callbacks.get(data.id)?.(data);
    this.#core.callbacks.delete(data.id);
  }

  #postMessage(data) {
    data.id = crypto.randomUUID();
    this.#core.timestamps.set(data.id, Date.now());
    const promise = new Promise((resolve) =>
      this.#core.callbacks.set(data.id, resolve)
    );
    this.#core.worker.postMessage(data);
    return promise;
  }

  async getFrame(number) {
    const { frame } = await this.#postMessage({
      type: "frame",
      number,
    });
    return frame;
  }

  async getFrames(filter, skip, limit) {
    const { frames } = await this.#postMessage({
      type: "frames",
      filter,
      skip,
      limit,
    });
    return frames;
  }

  async checkFilter(filter) {
    const { result } = await this.#postMessage({
      type: "check-filter",
      filter,
    });
    return result;
  }

  async createSession(file) {
    const { result } = await this.#postMessage({ type: "open", file });
    return result;
  }

  async closeSession() {
    await this.#postMessage({ type: "close" });
  }
}

export default Bridge;
