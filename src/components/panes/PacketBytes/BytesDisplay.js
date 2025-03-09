import { h } from "vue";
import BytesFormatter from "../../../classes/BytesFormatter";
import { manager } from "../../../globals";

const spacers = {
  hexadecimal: { every1: " ", every8: "  " },
  decimal: { every1: " ", every8: "  " },
  octal: { every1: " ", every8: "  " },
  bits: { every1: " ", every8: "  " },
  ascii: { every1: null, every8: " " },
  ebcdic: { every1: null, every8: " " },
};

// TODO: possible reactivity issues here

export default {
  props: {
    displayFormat: {
      type: String,
      required: true,
    },
    bytesPerLine: {
      type: Number,
      required: true,
    },
    sourceIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const spacer = spacers[props.displayFormat];
      const bytes = manager.activeFrameDetails.getSourceData(props.sourceIndex);
      const displayBytes = BytesFormatter.format(bytes, props.displayFormat);
      const groups = manager.activeFrameDetails.getGroupsForSource(
        props.sourceIndex
      );

      const nodeStack = [{ end: Infinity, children: [] }];

      let groupIdx = 0;
      for (const [idx, displayByte] of displayBytes.entries()) {
        let nodes = nodeStack.at(-1).children;
        // spacers
        if (idx) {
          if (idx % props.bytesPerLine === 0) nodes.push("\n");
          else if (idx % 8 === 0) nodes.push(spacer.every8);
          else if (spacer.every1 !== null) nodes.push(spacer.every1);
        }

        // start groups
        while (groupIdx < groups.length && groups[groupIdx].start <= idx) {
          const { start, length, id } = groups[groupIdx++];
          console.assert(start === idx, "start is not the same as index");

          const end = start + length;
          if (end > nodeStack.at(-1).end) continue;
          nodes = [];
          nodeStack.push({ end, children: nodes, id });
        }

        // actual bytes
        nodes.push(displayByte);

        // end groups
        while (nodeStack.at(-1).end === idx + 1) {
          const { id, children } = nodeStack.pop();

          const nodeProps = {
            style: {
              backgroundColor: `var(--ws-detail-bg-${id}, var(--ws-detail-bg-default))`,
            },
          };
          const vnode = h("span", nodeProps, children);

          nodes = nodeStack.at(-1).children;
          nodes.push(vnode);
        }
      }
      return h("div", nodeStack[0].children);
    };
  },
};
