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
      columns: [],
      rowHeight: 14, // TODO: Originally I thought we'd manipulate this to change text size, but in-browser zoom seems to work fine for this
      activeFrameNumber: null,
      statusText: "Wireview by radiantly",
    });
    this.#shallowProps = shallowReactive({
      activeFrameDetails: null,
      sessionInfo: null,
    });
    this.#props.packetCount = computed(
      () => this.#shallowProps.sessionInfo?.packet_count ?? 0
    );
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

    // TODO: Do we really want to manage dimensions here?
    this.#dimensions = reactive({
      fontSize: computed(() => calculateFontSize(this.#props.rowHeight)),

      resize: null,
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

  get statusText() {
    return this.#props.statusText;
  }

  get sessionInfo() {
    return this.#shallowProps.sessionInfo;
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
    this.#props.statusText = "Initializing Wireshark WASM...";
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

    if (data.type === "init") {
      this.#props.initialized = data.success;
      this.#props.statusText = data.success
        ? "Successfully initialized Wireshark WASM"
        : `Failed to load Wireshark WASM. Error: ${data.error}`;
    }

    this.#callbacks.get(data.id)?.(data);
    this.#callbacks.delete(data.id);
  }

  async openFile(file) {
    this.#props.statusText = `Loading ${file.name}..`;
    const result = await this.#postMessage({ type: "open", file });
    console.log("result", result);
    if (result.code) return; // handle failure
    this.#props.statusText = `${result.summary.packet_count} packets loaded successfully`;
    this.#props.activeFrameNumber = 0;
    this.#shallowProps.sessionInfo = result.summary;
    this.#props.columns = await this.getColumnHeaders();
    this.#props.activeFrameNumber = 1;
  }

  async closeFile() {
    this.#props.columns = [];
    this.#props.activeFrameNumber = null;
    this.#shallowProps.activeFrameDetails = null;
    this.#shallowProps.sessionInfo = null;
    await this.#postMessage({ type: "close" });
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
