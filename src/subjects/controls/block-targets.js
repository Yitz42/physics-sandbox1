// block-targets.js — where each block and group of a block diagram sits in
// the picture, for the workbench's pointer (hovering and dropping a block).

import { layout, H } from "./block-layout.js";
import { partialDiagram, kindOf } from "./block-diagram.js";

// Where each block and group sits (for the workbench's pointer): innermost
// first, so the smallest thing under the pointer wins.
//   → [{ path, kind, box: [x0, y0, x1, y1] }]  (an empty diagram: its "?" box, path [])
export function blockTargets(setup) {
  if (!setup.diagram) return [{ path: [], kind: "empty", box: [0, -H / 2, 1.4, H / 2] }];
  const { diagram } = partialDiagram(setup, setup.reduce ?? 0);
  const ctx = { params: setup.params || {}, boxes: new Map(), tunable: [], selected: [] };
  const L = layout(diagram, ctx);
  L.place(0, 0, []);
  const out = [];
  const walk = (node, path) => {
    const box = ctx.boxes.get(node);
    if (box) out.push({ path, kind: kindOf(node), box, depth: path.length });
    if (node.series) node.series.forEach((c, i) => walk(c, [...path, ["series", i]]));
    if (node.parallel) node.parallel.forEach((c, i) => walk(c, [...path, ["parallel", i]]));
    if (node.loop) {
      walk(node.loop, [...path, ["loop"]]);
      if (node.back) walk(node.back, [...path, ["back"]]);
    }
  };
  walk(setup.diagram, []);
  return out.sort((a, b) => b.depth - a.depth);
}
