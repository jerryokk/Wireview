import { computed, reactive, shallowReactive, watch } from "vue";
import SharkWorker from "../worker.js?worker&url";
import { calculateFontSize } from "../util";

class Manager {
  #worker;
  #callbacks;
  #props;
  #shallowProps;
  #dimensions;
  #handleMouseMove;

  constructor() {
    this.#props = reactive({
      initialized: false,
      capture: null,
      columns: [],
      frames: [],
      rowHeight: 14,
      packetCount: 0,
      activeFrameNumber: null,
    });
    this.#shallowProps = shallowReactive({
      activeFrameDetails: null,
    });
    this.#props.columnsSanitized = computed(() =>
      this.#props.columns.map((colName) =>
        colName.toLowerCase().replace(/[^a-z]/g, "")
      )
    );
    watch(
      () => this.#props.activeFrameNumber,
      async (packetNumber) => {
        if (packetNumber === null || packetNumber <= 0) return;
        this.#shallowProps.activeFrameDetails = await this.getFrame(
          packetNumber
        );
        console.log("frameDetails", this.#shallowProps.activeFrameDetails);
      }
    );

    this.#dimensions = reactive({
      fontSize: computed(() => calculateFontSize(this.#props.rowHeight)),

      resize: null,
      // not sure if we should store this here
      // colWidths: [],
    });
    this.#handleMouseMove = this.#handleMouseMoveUnbound.bind(this);

    watch(
      () => this.#props.activeFrameNumber,
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

  get activeFrameNumber() {
    return this.#props.activeFrameNumber;
  }

  setActiveFrameNumber(index) {
    this.#props.activeFrameNumber = index;
  }

  get packetCount() {
    return this.#props.packetCount;
  }

  get activeFrameDetails() {
    return this.#shallowProps.activeFrameDetails;
  }

  // TODO: This won't work with filters
  get canGoToPreviousPacket() {
    return (
      this.#props.activeFrameNumber !== null &&
      this.#props.activeFrameNumber > 1
    );
  }

  get canGoToNextPacket() {
    return (
      this.#props.activeFrameNumber !== null &&
      this.#props.activeFrameNumber < this.#props.packetCount
    );
  }

  goToPreviousPacket() {
    if (!this.canGoToPreviousPacket) return;
    this.#props.activeFrameNumber--;
  }

  goToNextPacket() {
    if (!this.canGoToNextPacket) return;
    this.#props.activeFrameNumber++;
  }

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
    this.#props.activeFrameNumber = 0;
    this.#props.capture = result.summary;
    console.log(result.summary);
    this.#props.columns = await this.getColumnHeaders();
    this.#props.frames = await this.getFrames("", 0, 100);
    this.#props.activeFrameNumber = 1;
    // this.#dimensions.colWidths = Array(this.#props.columns.length).fill(0);
  }

  async getColumnHeaders() {
    const { columns } = await this.#postMessage({ type: "columns" });
    return columns;
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
