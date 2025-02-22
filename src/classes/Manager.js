import { computed, reactive, shallowReactive, watch } from "vue";
import SharkWorker from "../worker.js?url";
import { calculateFontSize } from "../util";

class Manager {
  #worker;
  #callbacks;
  #props;
  #dimensions;
  #loadedPackets;
  #handleMouseMove;

  constructor() {
    this.#props = reactive({
      initialized: false,
      capture: null,
      columns: [],
      frames: [],
      rowHeight: 14,
      packetCount: 0,
      activePacketIndex: null,
    });
    this.#props.columnsSanitized = computed(() =>
      this.#props.columns.map((colName) =>
        colName.toLowerCase().replace(/[^a-z]/g, "")
      )
    );

    this.#loadedPackets = shallowReactive(new Map());
    this.#dimensions = reactive({
      fontSize: computed(() => calculateFontSize(this.#props.rowHeight)),

      resize: null,
      // not sure if we should store this here
      // colWidths: [],
    });
    this.#handleMouseMove = this.#handleMouseMoveUnbound.bind(this);

    watch(
      () => this.#props.activePacketIndex,
      (idx) => {
        if (idx === null) return;
      }
    );
  }

  get initialized() {
    return this.#props.initialized;
  }

  get columns() {
    return this.#props.columns;
  }

  get columnsSanitized() {
    return this.#props.columnsSanitized;
  }

  get frames() {
    return this.#props.frames;
  }

  get rowHeight() {
    return this.#props.rowHeight;
  }

  get fontSize() {
    return this.#dimensions.fontSize;
  }

  get activePacketIndex() {
    return this.#props.activePacketIndex;
  }

  get packetCount() {
    return this.#props.packetCount;
  }

  setActivePacketIndex(index) {
    this.#props.activePacketIndex = index;
  }

  // get colWidths() {
  //   return this.#dimensions.colWidths;
  // }

  initialize() {
    this.#worker = new Worker(SharkWorker);
    this.#callbacks = new Map();
    this.#worker.addEventListener("message", (e) => this.#processMessage(e));

    document.body.addEventListener("mousemove", this.#handleMouseMove, {
      capture: true,
      passive: true,
    });

    // FOR DEBUG
    window.manager = this;
  }

  deinitialize() {
    document.body.removeEventListener("mousemove", this.#handleMouseMove, {
      capture: true,
    });

    this.#worker.terminate();
    this.#props.initialized = false;
    this.#props.capture = null;
  }

  #postMessage(data) {
    data.id = crypto.randomUUID();
    const promise = new Promise((resolve) =>
      this.#callbacks.set(data.id, resolve)
    );
    this.#worker.postMessage(data);
    return promise;
  }

  #processMessage({ data }) {
    console.log(data);

    if (data.type === "init") this.#props.initialized = data.success;

    this.#callbacks.get(data.id)?.(data);
    this.#callbacks.delete(data.id);
  }

  async openFile(file) {
    const result = await this.#postMessage({ type: "open", file });
    console.log("result", result);
    if (result.code) return; // handle failure
    this.#props.packetCount = result.summary.packet_count;
    this.#props.activePacketIndex = 0;
    this.#props.capture = result.summary;
    console.log(result.summary);
    this.#props.columns = await this.getColumnHeaders();
    this.#props.frames = await this.getFrames("", 0, 100);
    // this.#dimensions.colWidths = Array(this.#props.columns.length).fill(0);
  }

  async getColumnHeaders() {
    const { columns } = await this.#postMessage({ type: "columns" });
    return columns;
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

  #handleMouseMoveUnbound(e) {
    if (this.#dimensions.resize) {
      if (!(e.buttons & 1)) {
        this.#dimensions.resize = null;
        return;
      }
      const initialPos = this.#dimensions.resize.initial;
      const newPos =
        this.#dimensions.resize.direction === "horizontal"
          ? e.clientX
          : e.clientY;
      this.#dimensions.resize.callback(newPos - initialPos);
    }
  }

  registerResizeCallback(initial, direction, callback) {
    this.#dimensions.resize = {
      initial,
      direction,
      callback,
    };
  }
}

export default Manager;
