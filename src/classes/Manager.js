import { computed, reactive, shallowReactive, watch } from "vue";
import { watchOnce } from "@vueuse/core";
import { calculateFontSize } from "../util";
import Bridge from "./Bridge";

class Manager {
  #core;
  #props;
  #shallowProps;
  #dimensions;
  #handleMouseMove;

  constructor() {
    this.#core = {
      bridge: new Bridge(),
      checkFilterCache: new Map(),
    };
    this.#props = reactive({
      columns: [],
      rowHeight: 14, // TODO: Originally I thought we'd manipulate this to change text size, but in-browser zoom seems to work fine for this
      activeFrameNumber: null,
      statusText: "Wireview by radiantly", // TODO: this shouldn't be manually handled. A separate component should keep handle status text based on manager properties
      displayFilter: "",
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
    // TODO: Do this better
    watchOnce(
      () => this.#core.bridge.initialized,
      (success) => {
        if (success)
          this.#props.statusText = "Successfully initialized Wireshark WASM";
        else
          this.#props.statusText =
            "Failed to load Wireshark WASM. Error: " +
            this.#core.bridge.initializationError;
      }
    );
    watch(
      () => this.#props.activeFrameNumber,
      async (packetNumber) => {
        if (packetNumber === null || packetNumber <= 0) return;
        this.#shallowProps.activeFrameDetails =
          await this.#core.bridge.getFrame(packetNumber);
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
    return this.#core.bridge.initialized;
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

  get displayFilter() {
    return this.#props.displayFilter;
  }

  // for v-model
  set displayFilter(filter) {
    this.#props.displayFilter = filter;
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
    this.#core.bridge.initialize();

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

    this.#core.bridge.deinitialize();
  }

  async openFile(file) {
    this.#props.statusText = `Loading ${file.name}..`;
    const result = await this.#core.bridge.createSession(file);
    if (result.code) return; // TODO: handle failure
    this.#props.statusText = `${result.summary.packet_count} packets loaded successfully`;
    this.#props.activeFrameNumber = 0;
    this.#shallowProps.sessionInfo = result.summary;
    this.#props.columns = await this.#core.bridge.getColumns();
    this.#props.activeFrameNumber = 1;
  }

  async closeFile() {
    this.#props.columns = [];
    this.#props.activeFrameNumber = null;
    this.#shallowProps.activeFrameDetails = null;
    this.#shallowProps.sessionInfo = null;
    this.#core.bridge.closeSession();
  }

  async getFrames(filter, skip, limit) {
    return await this.#core.bridge.getFrames(filter, skip, limit);
  }

  async checkFilter(filter) {
    if (!this.#core.checkFilterCache.has(filter)) {
      const result = await this.#core.bridge.checkFilter(filter);
      this.#core.checkFilterCache.set(filter, result);
    }
    return this.#core.checkFilterCache.get(filter);
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
