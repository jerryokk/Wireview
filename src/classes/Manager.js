import { computed, reactive, shallowReactive, watch } from "vue";
import { calculateFontSize } from "../util";
import Bridge from "./Bridge";

class Manager {
  #core;
  #props;
  #shallowProps;

  constructor() {
    this.#core = {
      bridge: new Bridge(),
      checkFilterCache: new Map(),
    };
    this.#props = reactive({
      rowHeight: 14, // TODO: Originally I thought we'd manipulate this to change text size, but in-browser zoom seems to work fine for this
      activeFrameIndex: null,
      statusText: "Wireview by radiantly", // TODO: this shouldn't be manually handled. A separate component should keep handle status text based on manager properties
      displayFilter: "",
    });
    this.#shallowProps = shallowReactive({
      activeFrameDetails: null,
      sessionInfo: null,
      filteredFrames: null,
      filteredFramesRequest: null,
    });
    this.#props.fontSize = computed(() =>
      calculateFontSize(this.#props.rowHeight)
    );
    this.#props.activeFrameNumber = computed(() => {
      const index = this.#props.activeFrameIndex;
      if (index === null) return null;
      return this.#shallowProps.filteredFrames?.[index]?.number ?? index + 1;
    });
    this.#props.packetCount = computed(
      () => this.#shallowProps.sessionInfo?.packet_count ?? 0
    );
    this.#props.frameCount = computed(
      () => this.#shallowProps.filteredFrames?.length ?? this.#props.packetCount
    );
    watch(
      () => this.#props.displayFilter,
      async (filter) => {
        if (this.#shallowProps.sessionInfo === null) return;

        // get currently active frame
        const frameNumber =
          this.#shallowProps.filteredFramesRequest?.frameNumber ??
          this.#props.activeFrameNumber;

        if (filter === "") {
          this.#shallowProps.filteredFrames = null;
          this.#shallowProps.filteredFramesRequest = null;
          if (frameNumber) this.#props.activeFrameIndex = frameNumber - 1;
          return;
        }

        this.#shallowProps.filteredFrames = [];
        this.#shallowProps.filteredFramesRequest = {
          promise: this.#core.bridge.getFrames(filter, 0, 0),
          frameNumber,
        };
        const frames = await this.#shallowProps.filteredFramesRequest.promise;

        // the display filter may have changed while awaiting
        if (filter !== this.#props.displayFilter) return;

        this.#shallowProps.filteredFrames = frames;
        this.#shallowProps.filteredFramesRequest.frameNumber = null;
        this.#props.activeFrameIndex =
          this.#getFrameIndex(frameNumber) ?? (frames.length ? 0 : null);
      }
    );

    // TODO: Do this better
    watch(
      () => this.#core.bridge.initialized,
      (success) => {
        if (success)
          this.#props.statusText = "Successfully initialized Wireshark WASM";
        else
          this.#props.statusText =
            "Failed to load Wireshark WASM. Error: " +
            this.#core.bridge.initializationError;
      },
      { once: true }
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
  }

  get initialized() {
    return this.#core.bridge.initialized;
  }

  get columns() {
    return this.#core.bridge.columns;
  }

  get rowHeight() {
    return this.#props.rowHeight;
  }

  get fontSize() {
    return this.#props.fontSize;
  }

  get displayFilter() {
    return this.#props.displayFilter;
  }

  async setDisplayFilter(filter) {
    const result = await this.checkFilter(filter);
    if (result.ok) this.#props.displayFilter = filter;
  }

  get activeFrameNumber() {
    return this.#props.activeFrameNumber;
  }

  setActiveFrameIndex(index) {
    this.#props.activeFrameIndex = index;
  }

  get packetCount() {
    return this.#props.packetCount;
  }

  get frameCount() {
    return this.#props.frameCount;
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

  get canGoToPreviousPacket() {
    if (this.#props.activeFrameIndex === null) return false;
    return this.#props.activeFrameIndex > 0;
  }

  get canGoToNextPacket() {
    if (this.#props.activeFrameIndex === null) return false;
    return this.#props.activeFrameIndex + 1 < this.#props.frameCount;
  }

  goToPreviousPacket() {
    if (!this.canGoToPreviousPacket) return;
    this.#props.activeFrameIndex -= 1;
  }

  goToNextPacket() {
    if (!this.canGoToNextPacket) return;
    this.#props.activeFrameIndex += 1;
  }

  initialize() {
    this.#props.statusText = "Initializing Wireshark WASM...";
    this.#core.bridge.initialize();

    // FOR DEBUG
    window.manager = this;
  }

  deinitialize() {
    this.#core.bridge.deinitialize();
  }

  async openFile(file) {
    this.#props.statusText = `Loading ${file.name}..`;
    const result = await this.#core.bridge.createSession(file);
    if (result.code) return; // TODO: handle failure
    this.#props.statusText = `${file.name} loaded successfully`;
    this.#shallowProps.sessionInfo = result.summary;
    this.#props.activeFrameIndex = result.summary.packet_count ? 0 : null;
  }

  async closeFile() {
    this.#props.activeFrameIndex = null;
    this.#shallowProps.activeFrameDetails = null;
    this.#shallowProps.sessionInfo = null;
    this.#core.bridge.closeSession();
  }

  async getFrames(filter, skip, limit) {
    if (this.#shallowProps.sessionInfo === null)
      return { frames: [], offset: 0, skipped: 0 };

    if (
      filter === this.#props.displayFilter &&
      this.#shallowProps.filteredFramesRequest
    ) {
      const frames = await this.#shallowProps.filteredFramesRequest.promise;
      return { frames, offset: skip, skipped: 0 };
    }
    const frames = await this.#core.bridge.getFrames(filter, skip, limit);
    return { frames, offset: 0, skipped: skip };
  }

  async checkFilter(filter) {
    if (!this.#core.checkFilterCache.has(filter)) {
      const result = await this.#core.bridge.checkFilter(filter);
      this.#core.checkFilterCache.set(filter, result);
    }
    return this.#core.checkFilterCache.get(filter);
  }

  // returns index of the largest frame that has a number smaller or equal to the passed frame number
  // returns null if it does not exist
  #getFrameIndex(frameNumber) {
    if (frameNumber === null) return null;

    const frames = this.#shallowProps.filteredFrames;
    if (frames === null) return frameNumber ? frameNumber - 1 : null;

    // binary search, the way I like it
    let index = 0;
    for (let n = frames.length; n; n >>= 1)
      while (
        index + n < frames.length &&
        frames[index + n].number <= frameNumber
      )
        index += n;

    return index;
  }
}

export default Manager;
