// labels.js — keeps arrow labels from landing on top of each other.
//
// Each label has a preferred spot (just past its arrow's tip). If that spot
// is already covered — by another label, a point's name, the drag handle,
// the x-y axes icon, or an arrow's line — we try nearby spots and keep the
// one that overlaps the least, preferring spots close to the original.

import { measureLabel, labelBox } from "./arrows.js";

// Nearby spots to try, in pixels from the preferred one (closest first).
const TRIES = [
  [0, 0], [0, 18], [0, -18], [30, 0], [-30, 0], [30, 18], [-30, 18], [30, -18], [-30, -18],
  [0, 36], [0, -36], [60, 0], [-60, 0], [0, 54], [0, -54], [60, 36], [-60, 36], [60, -36], [-60, -36],
];

function overlapArea(a, b) {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return w > 0 && h > 0 ? w * h : 0;
}

// How much of line segment p→q runs through box (checked every 3 px).
function segmentHits(box, p, q) {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const steps = Math.max(1, Math.ceil(len / 3));
  let hits = 0;
  for (let i = 0; i <= steps; i++) {
    const x = p[0] + ((q[0] - p[0]) * i) / steps;
    const y = p[1] + ((q[1] - p[1]) * i) / steps;
    if (x > box.x0 && x < box.x1 && y > box.y0 && y < box.y1) hits++;
  }
  return hits;
}

// labels:    [{ text, pos: [x, y], align, size, weight, maxMove? }]
// obstacles: boxes already on the picture
// segments:  [[p, q], ...] arrow and cable lines (pixels)
// view:      { width, height } of the canvas
// Returns the labels with an adjusted `pos`.
export function placeLabels(ctx, labels, { obstacles = [], segments = [], view }) {
  const taken = obstacles.slice();
  return labels.map((l) => {
    const width = measureLabel(ctx, l.text, l.size, l.weight);
    let best = null;
    let bestCost = Infinity;
    // Try each nearby spot, with the preferred alignment and also centred.
    const tries = TRIES.flatMap(([dx, dy]) => [[dx, dy, l.align], [dx, dy, "center"]]);
    for (const [dx, dy, align] of tries) {
      if (l.maxMove != null && Math.hypot(dx, dy) > l.maxMove) continue; // e.g. angles stay by their arc
      const pos = [l.pos[0] + dx, l.pos[1] + dy];
      const box = labelBox(pos[0], pos[1], width, l.size, align);
      // Prefer the original spot: moving away (or re-aligning) costs a little.
      let cost = Math.hypot(dx, dy) + (align === l.align ? 0 : 8);
      for (const t of taken) cost += overlapArea(box, t) * 4;
      for (const [p, q] of segments) cost += segmentHits(box, p, q) * 40;
      // Keep it on the canvas.
      if (box.x0 < 0 || box.y0 < 0 || box.x1 > view.width || box.y1 > view.height) cost += 5000;
      if (cost < bestCost) {
        bestCost = cost;
        best = { pos, box, align };
      }
      if (cost === 0) break;
    }
    taken.push(best.box);
    return { ...l, pos: best.pos, align: best.align };
  });
}
