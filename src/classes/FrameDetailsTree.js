import Base64 from "./Base64";
import { isNullish } from "../util";

class FrameDetailsTree {
  #core;
  constructor(frameDetails) {
    this.#core = {
      ...frameDetails,

      counter: 0,
      byteGroups: null,
      toDetail: new Map(),
      toId: new Map(),
    };

    // Decode Base64
    for (const data_source of this.#core.data_sources)
      data_source.data = Base64.decode(data_source.data);
  }

  get sourceCount() {
    return this.#core.data_sources.length;
  }

  get tree() {
    return this.#core.tree;
  }

  get byteGroups() {
    if (this.#core.byteGroups === null)
      this.#core.byteGroups = this.#parseByteGroups();
    return this.#core.byteGroups;
  }

  getId(detail) {
    return this.#core.toId.get(detail) ?? null;
  }

  getDetail(id) {
    return this.#core.toDetail.get(id) ?? null;
  }

  getSourceData(index) {
    return this.#core.data_sources.at(index).data;
  }

  getSourceNames() {
    return this.#core.data_sources.map(({ name }) => name);
  }

  getGroupsForSource(sourceIndex) {
    return this.byteGroups[sourceIndex];
  }

  #parseByteGroups() {
    const { length } = this.#core.data_sources;
    const groups = Array.from({ length }, () => []);

    const parseDetail = (detail) => {
      const { data_source_idx, start, length, tree } = detail;
      if (!isNullish(data_source_idx) && !isNullish(start) && length) {
        const id = ++this.#core.counter;
        this.#core.toDetail.set(id, detail);
        this.#core.toId.set(detail, id);

        groups[data_source_idx].push({ start, length, id });
      }

      tree.forEach(parseDetail);
    };

    this.#core.tree.forEach(parseDetail);

    // sort start asc, length desc
    for (const group of groups)
      group.sort((a, b) =>
        a.start == b.start ? b.length - a.length : a.start - b.start
      );

    return groups;
  }
}

export default FrameDetailsTree;
