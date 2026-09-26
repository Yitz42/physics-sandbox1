// diagrams.js — draws a "scene": a list of simple shapes in metres.
//
// Subjects describe WHAT to draw (see e.g. subjects/statics/particle-scene.js);
// render/shapes.js decides HOW each shape looks. Shape types:
//   arrow    { id, from, to, label, role }   role: known | unknown | resultant |
//                                            component | target | wrong | student | shadow
//   line     { id?, from, to, style }        style: cable | reference | dashed
//   support  { from, to, normal }            hatched ground/ceiling/wall
//   point    { at, label, style }            style: ring | dot | pin
//   box      { id?, at, w, h, label }        a crate or block (at = centre)
//   arc      { center, r, start, end, label }  angle marking (degrees, CCW from +x)
//   triangle { at, dx, dy, labels }          slope triangle, e.g. 3-4-5
//   zone     { from, to, label }             a shaded "not allowed" area
//   text     { at, text }                    a caption
//   axes     {}                              little x-y axes (bottom-left corner)
//   handle   { at }                          a grab circle on a draggable arrow tip
//   beam, pivot, dim, rightangle, moment     see shapes-extra.js
//
// Arrow labels are placed last, each moved to a free spot if its first
// choice would overlap something (see labels.js).

import { labelPosition, drawLabel, cssColor } from "./arrows.js";
import { drawShape, roleColor } from "./shapes.js";
import { placeLabels } from "./labels.js";

export { roleColor };

// Draw in layers so arrows and labels sit on top of lines and boxes.
const ORDER = ["zone", "support", "pivot", "beam", "line", "dim", "rightangle", "box", "arc", "triangle", "axes", "moment", "point", "arrow", "handle", "text"];

// opts.highlight: id of the force to glow (clicked arrow or equation term)
export function drawScene(cv, shapes, opts = {}) {
  const { ctx } = cv;
  const env = { ink: cssColor("--c-ink", "#1d2330"), faint: cssColor("--c-faint", "#94a3b8"), paper: cssColor("--c-canvas", "#ffffff") };
  cv.clear();

  const sorted = [...shapes].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
  const obstacles = [];
  const segments = [];
  const wanted = []; // arrow labels, placed after everything else is drawn

  for (const s of sorted) {
    const lit = !!opts.highlight && s.id === opts.highlight;
    const out = drawShape(cv, s, { ...env, lit });
    obstacles.push(...out.boxes);
    segments.push(...out.segments);
    wanted.push(...out.labels);
    if (s.type === "point" && s.label) {
      const [x, y] = cv.toScreen(s.at);
      // Point names go first, so they get their preferred spot (below-left).
      wanted.unshift({ text: s.label, pos: [x - 10, y + 17], align: "right", size: 14, weight: 700, color: env.ink, plain: true });
    }
    if (s.type === "arrow" && s.label) {
      const a = cv.toScreen(s.from), b = cv.toScreen(s.to);
      // Components and targets prefer the middle of their arrow; others the tip.
      const mid = s.role === "component" || s.role === "target";
      const side = s.labelSide || (s.role === "target" ? -1 : 1);
      const size = lit ? 15 : 14, weight = lit ? 700 : 500;
      wanted.push({ text: s.label, ...labelPosition(a, b, 14, mid, side), size, weight, color: roleColor(s.role) });
    }
  }

  for (const l of placeLabels(ctx, wanted, { obstacles, segments, view: cv.view })) {
    drawLabel(ctx, l.text, l.pos[0], l.pos[1], { color: l.color, size: l.size, weight: l.weight, align: l.align, background: l.plain ? null : env.paper });
  }
}
