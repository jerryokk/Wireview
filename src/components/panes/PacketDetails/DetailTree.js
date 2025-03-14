import { h, reactive, watch } from "vue";
import DetailRow from "./DetailRow.vue";
import FrameDetailsTree from "../../../classes/FrameDetailsTree";
import { manager } from "../../../globals";

export default {
  props: {
    details: {
      type: FrameDetailsTree,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      collapsed: new Map(),
    });

    const getDetailId = (el) => {
      let element = el.closest("[data-detail-id]");
      const detailId = parseInt(element?.dataset?.detailId);
      return isNaN(detailId) ? null : detailId;
    };

    // if a frame detail is selected externally, we need to focus it,
    // and additionally expand any parents so that it is actually visible
    watch(
      () => manager.selectedFrameDetailId,
      (detailId) => {
        if (detailId === null) return;

        let element = document.querySelector(
          `[data-detail-id="${detailId}"]`
        )?.parentElement;

        while (element) {
          const detailId = parseInt(element.dataset.detailId);
          if (!isNaN(detailId)) state.collapsed.set(detailId, false);
          element = element.parentElement;
        }
      },
      { flush: "post" }
    );

    const onMousedown = (event) => {
      const detailId = getDetailId(event.target);
      console.log(event, detailId);
      if (detailId === null) return;

      if (event.target.dataset?.toggleCollapse) {
        state.collapsed.set(detailId, !(state.collapsed.get(detailId) ?? true));
        return;
      }
    };

    const onFocusin = (event) => {
      const detailId = getDetailId(event.target);
      if (detailId === null) return;

      manager.setSelectedFrameDetailId(detailId);
    };

    const onDblclick = (event) => {
      const detailId = getDetailId(event.target);
      if (detailId === null) return;

      // don't take into account elements that toggle collapse on mousedown
      if (!event.target.dataset?.toggleCollapse) {
        event.preventDefault();
        state.collapsed.set(detailId, !(state.collapsed.get(detailId) ?? true));
        return;
      }
    };

    const onKeydown = (event) => {
      const detailId = getDetailId(event.target);
      if (detailId === null) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        state.collapsed.set(detailId, true);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        // TODO: If already collapsed, jump to parent instead
        state.collapsed.set(detailId, false);
        return;
      }
    };

    const toVnode = (detail, indent = 0) => {
      const id = props.details.getId(detail);
      const { label, tree } = detail;
      const hasChildren = (tree?.length ?? 0) > 0;
      const row = h(DetailRow, {
        id,
        label,
        indent,
        active: detail === manager.selectedFrameDetail,
        collapsed: hasChildren ? state.collapsed.get(id) ?? true : null,
      });
      if (!hasChildren) return row;
      const children = tree.flatMap((detail) => toVnode(detail, indent + 1));
      const childrenContainer = h(
        "div",
        { class: "children", "data-detail-id": id },
        children
      );
      return [row, childrenContainer];
    };

    return () => {
      const children = props.details.tree.flatMap((detail) => toVnode(detail));
      return h(
        "div",
        { class: "children", onMousedown, onDblclick, onFocusin, onKeydown },
        children
      );
    };
  },
};
