import { shallowReactive } from "vue";
import SharkWorker from "../worker.js?no-inline&url";

class Bridge {
  #core;
  #shallowProps;

  constructor() {
    this.#core = {
      worker: null,
      callbacks: new Map(),
    };

    this.#shallowProps = shallowReactive({
      initializationResult: null,
    });
  }

  get initialized() {
    return this.#shallowProps.initializationResult?.success ?? false;
  }

  get initializationError() {
    return this.#shallowProps.initializationResult?.error ?? "Unknown";
  }

  initialize() {
    this.#core.worker = new Worker(SharkWorker);
    this.#core.worker.addEventListener("message", (e) =>
      this.#processMessage(e)
    );
  }

  deinitialize() {
    this.#core.worker.terminate();
    this.#shallowProps.initializationResult = null;
  }

  #processMessage({ data }) {
    console.log(data);

    if (data.type === "init") this.#shallowProps.initializationResult = data;

    this.#core.callbacks.get(data.id)?.(data);
    this.#core.callbacks.delete(data.id);
  }

  #postMessage(data) {
    data.id = crypto.randomUUID();
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

  async getColumns() {
    const { columns } = await this.#postMessage({ type: "columns" });
    return columns;
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
