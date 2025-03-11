import { computed, reactive, shallowReactive, watch } from "vue";
import { calculateFontSize } from "../util";
import Bridge from "./Bridge";
import FrameDetailsTree from "./FrameDetailsTree";

class Manager {
  #core;
  #state;
  #shallowState;

  constructor() {
    this.#core = {
      bridge: new Bridge(),
      checkFilterCache: new Map(),
    };
    this.#state = reactive({
      rowHeight: 14, // TODO: Originally I thought we'd manipulate this to change text size, but in-browser zoom seems to work fine for this
      activeFrameIndex: null,
      statusText: "Wireview by radiantly", // TODO: this shouldn't be manually handled. A separate component should keep handle status text based on manager properties
      displayFilter: "",

      // computed
      fontSize: 0,
      activeFrameNumber: null,
      packetCount: 0,
      frameCount: 0,
      selectedFrameDetailId: null,
      canOpenFile: false,
    });
    this.#shallowState = shallowReactive({
      activeFrameDetails: null,
      selectedFrameDetail: null,
      sessionInfo: null,
      filteredFrames: null,
      filteredFramesRequest: null,
      activeFile: null,
      lastFileOpenError: false,
    });
    this.#state.fontSize = computed(() =>
      calculateFontSize(this.#state.rowHeight)
    );
    this.#state.activeFrameNumber = computed(() => {
      const index = this.#state.activeFrameIndex;
      if (index === null) return null;
      return this.#shallowState.filteredFrames?.[index]?.number ?? index + 1;
    });
    this.#state.packetCount = computed(
      () => this.#shallowState.sessionInfo?.packet_count ?? 0
    );
    this.#state.frameCount = computed(
      () => this.#shallowState.filteredFrames?.length ?? this.#state.packetCount
    );
    this.#state.selectedFrameDetailId = computed(
      () =>
        this.#shallowState.activeFrameDetails?.getId(
          this.#shallowState.selectedFrameDetail
        ) ?? null
    );
    this.#state.canOpenFile = computed(
      () =>
        this.#core.bridge.initialized &&
        (!this.#shallowState.activeFile || this.#shallowState.sessionInfo)
    );
    watch(
      () => this.#state.displayFilter,
      async (filter) => {
        if (this.#shallowState.sessionInfo === null) return;

        // get currently active frame
        const frameNumber =
          this.#shallowState.filteredFramesRequest?.frameNumber ??
          this.#state.activeFrameNumber;

        if (filter === "") {
          this.#shallowState.filteredFrames = null;
          this.#shallowState.filteredFramesRequest = null;
          if (frameNumber) this.#state.activeFrameIndex = frameNumber - 1;
          return;
        }

        this.#shallowState.filteredFrames = [];
        this.#shallowState.filteredFramesRequest = {
          promise: this.#core.bridge.getFrames(filter, 0, 0),
          frameNumber,
        };
        const frames = await this.#shallowState.filteredFramesRequest.promise;

        // the display filter may have changed while awaiting
        if (filter !== this.#state.displayFilter) return;

        this.#shallowState.filteredFrames = frames;
        this.#shallowState.filteredFramesRequest.frameNumber = null;
        this.#state.activeFrameIndex =
          this.#getFrameIndex(frameNumber) ?? (frames.length ? 0 : null);
      }
    );

    // TODO: Do this better
    watch(
      () => this.#core.bridge.initialized,
      (success) => {
        if (success)
          this.#state.statusText = "Successfully initialized Wireshark WASM";
        else
          this.#state.statusText =
            "Failed to load Wireshark WASM. Error: " +
            this.#core.bridge.initializationError;
      },
      { once: true }
    );

    // This watcher isn't a computed property because of the async request
    watch(
      () => this.#state.activeFrameNumber,
      async (frameNumber) => {
        if (frameNumber === null || frameNumber <= 0) {
          this.#shallowState.activeFrameDetails = null;
          return;
        }
        const rawFrameDetails = await this.#core.bridge.getFrame(frameNumber);
        this.#shallowState.activeFrameDetails = new FrameDetailsTree(
          rawFrameDetails
        );
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
    return this.#state.rowHeight;
  }

  get fontSize() {
    return this.#state.fontSize;
  }

  get displayFilter() {
    return this.#state.displayFilter;
  }

  async setDisplayFilter(filter) {
    const result = await this.checkFilter(filter);
    if (result.ok) this.#state.displayFilter = filter;
  }

  get activeFrameNumber() {
    return this.#state.activeFrameNumber;
  }

  setActiveFrameIndex(index) {
    this.#state.activeFrameIndex = index;
  }

  get packetCount() {
    return this.#state.packetCount;
  }

  get frameCount() {
    return this.#state.frameCount;
  }

  get activeFile() {
    return this.#shallowState.activeFile;
  }

  get lastFileOpenError() {
    return this.#shallowState.lastFileOpenError;
  }

  get canOpenFile() {
    return this.#state.canOpenFile;
  }

  get statusText() {
    return this.#state.statusText;
  }

  get sessionInfo() {
    return this.#shallowState.sessionInfo;
  }

  get activeFrameDetails() {
    return this.#shallowState.activeFrameDetails;
  }

  get selectedFrameDetail() {
    return this.#shallowState.selectedFrameDetail;
  }

  get selectedFrameDetailId() {
    return this.#state.selectedFrameDetailId;
  }

  setSelectedFrameDetail(detail) {
    this.#shallowState.selectedFrameDetail = detail;
  }

  setSelectedFrameDetailId(detailId) {
    const detail = this.#shallowState.activeFrameDetails?.getDetail(detailId);
    if (detail) this.#shallowState.selectedFrameDetail = detail;
  }

  get canGoToPreviousPacket() {
    if (this.#state.activeFrameIndex === null) return false;
    return this.#state.activeFrameIndex > 0;
  }

  get canGoToNextPacket() {
    if (this.#state.activeFrameIndex === null) return false;
    return this.#state.activeFrameIndex + 1 < this.#state.frameCount;
  }

  goToPreviousPacket() {
    if (!this.canGoToPreviousPacket) return;
    this.#state.activeFrameIndex -= 1;
  }

  goToNextPacket() {
    if (!this.canGoToNextPacket) return;
    this.#state.activeFrameIndex += 1;
  }

  initialize() {
    this.#state.statusText = "Initializing Wireshark WASM...";
    this.#core.bridge.initialize();

    // FOR DEBUG
    window.manager = this;
  }

  deinitialize() {
    this.#core.bridge.deinitialize();
  }

  async openFile(file) {
    if (this.#shallowState.activeFile) await this.closeFile();

    this.#shallowState.activeFile = file;
    this.#state.statusText = `Loading ${file.name}..`;
    const result = await this.#core.bridge.createSession(file);

    // handle error
    if (result.code) {
      this.#shallowState.lastFileOpenError = {
        ...result,
        filename: file.name,
      };
      this.#shallowState.activeFile = null;
      this.#core.bridge.closeSession();
      return;
    }

    this.#state.statusText = `${file.name} loaded successfully`;
    this.#shallowState.sessionInfo = result.summary;
    this.#state.activeFrameIndex = result.summary.packet_count ? 0 : null;
  }

  async closeFile() {
    this.#state.activeFrameIndex = null;
    this.#shallowState.sessionInfo = null;
    this.#shallowState.lastFileOpenError = null;
    this.#shallowState.activeFile = null;
    await this.#core.bridge.closeSession();
  }

  // say you want n frames from the mth position
  // n = limit, m = skip
  // returns a frames array, where you should start reading from frames[offset]
  // the "skipped" field returns the frameIndex of frames[0]
  async getFrames(filter, skip, limit) {
    if (this.#shallowState.sessionInfo === null)
      return { frames: [], offset: 0, skipped: 0 };

    if (
      filter === this.#state.displayFilter &&
      this.#shallowState.filteredFramesRequest
    ) {
      const frames = await this.#shallowState.filteredFramesRequest.promise;
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

    const frames = this.#shallowState.filteredFrames;
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
