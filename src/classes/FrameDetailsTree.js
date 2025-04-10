import Base64 from "./Base64";
import { isNullish } from "../util";

class FrameDetailsTree {
  #core;
  constructor(frameDetails) {
    this.#core = {
      ...frameDetails,

      byteGroups: null,
    };

    // Decode Base64
    for (const data_source of this.#core.data_sources)
      data_source.data = Base64.decode(data_source.data);

    this.#core.byteGroups = Object.freeze(this.#parseByteGroups());
  }

  get sourceCount() {
    return this.#core.data_sources.length;
  }

  get tree() {
    return this.#core.tree;
  }

  get byteGroups() {
    return this.#core.byteGroups;
  }

  getId(detail) {
    return detail?.field_info_ptr ?? null;
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
      const { data_source_idx, start, length, tree, field_info_ptr } = detail;
      const id = field_info_ptr;

      if (!isNullish(data_source_idx) && !isNullish(start) && length)
        groups[data_source_idx].push({ start, length, id });

      tree.forEach(parseDetail);
    };

    this.#core.tree.forEach(parseDetail);

    // sort start asc, length desc
    for (const group of groups)
      group.sort((a, b) => a.start - b.start || b.length - a.length);

    return groups;
  }
}

export default FrameDetailsTree;
