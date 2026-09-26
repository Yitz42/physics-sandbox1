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
//   note     { lines: [text | {text, role}] } a small key/working box in a free corner
//
// Arrow labels are placed last, each moved to a free spot if its first
// choice would overlap something (see labels.js).

import { labelPosition, drawLabel, cssColor } from "./arrows.js";
import { drawShape, roleColor } from "./shapes.js";
import { placeLabels, placeLegend } from "./labels.js";

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

  const notes = []; // "note" shapes: small text boxes placed in a free corner
  for (const s of sorted) {
    if (s.type === "note") {
      notes.push(...s.lines);
      continue;
    }
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
      wanted.push({ text: s.label, ...labelPosition(a, b, 14, mid, side), size, weight, color: roleColor(s.role), fromArrow: s.role !== "shadow" });
    }
  }

  // Working notes (e.g. how d is found) go in a box in the freest corner.
  if (notes.length) {
    // A line is plain text, or { text, role } to colour it like the matching drawing.
    const items = notes.map((n) => (typeof n === "string" ? { text: n, color: env.ink } : { text: n.text, color: n.role ? roleColor(n.role) : env.ink }));
    const box = placeLegend(ctx, items, { obstacles, segments, view: cv.view });
    drawLegend(ctx, box, env);
    obstacles.push(box.box);
  }

  const layout = { obstacles, segments, view: cv.view };
  let placed = placeLabels(ctx, wanted, layout);

  // Crowded picture (several arrow labels had to move well away from their arrows)?
  // Then keep only the short name at each arrow ("W_10") and list the full
  // values ("W_10 = 98.1 N") in a tidy box in a free corner.
  const valued = wanted.filter((l) => l.fromArrow && l.text.includes(" = "));
  // "Struggled" = had to move ~45 px or more, or still overlaps something.
  const struggled = placed.filter((l) => l.fromArrow && l.cost > 45);
  const crowded = struggled.length >= 2 || struggled.some((l) => l.cost > 150);
  if (crowded && valued.length > 1) {
    const legend = placeLegend(ctx, valued.map((l) => ({ text: l.text, color: l.color })), { ...layout, obstacles: [...obstacles] });
    const shortened = wanted.map((l) => (valued.includes(l) ? { ...l, text: l.text.split(" = ")[0] } : l));
    placed = placeLabels(ctx, shortened, { ...layout, obstacles: [...obstacles, legend.box] });
    drawLegend(ctx, legend, env);
  }

  for (const l of placed) {
    drawLabel(ctx, l.text, l.pos[0], l.pos[1], { color: l.color, size: l.size, weight: l.weight, align: l.align, background: l.plain ? null : env.paper });
  }
}

// The corner list of values: a light box with one coloured line per force.
function drawLegend(ctx, legend, env) {
  const { box, lines, size } = legend;
  ctx.save();
  ctx.fillStyle = env.paper;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = env.faint;
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x0 + 0.5, box.y0 + 0.5, box.x1 - box.x0 - 1, box.y1 - box.y0 - 1);
  ctx.restore();
  for (const l of lines) drawLabel(ctx, l.text, l.x, l.y, { color: l.color, size, align: "left" });
}
