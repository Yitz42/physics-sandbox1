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
  [100, 0], [-100, 0], [100, 36], [-100, 36], [100, -36], [-100, -36], // far tries: to get back inside a diagram
];

// Straight-down spots, for labels that prefer to go below (18 px steps).
const DOWN = [0, 18, 36, 54, 72, 90, 108, 126].map((dy) => [0, dy]);

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
// segments:  [[p, q, kind?], ...] lines (pixels); kind true = a faint dashed
//            guide (labels may sit on it), "dim" = a dimension line (labels may hop over it)
// view:      { width, height } of the canvas
// Returns the labels with an adjusted `pos` (and the `box` each one covers).
export function placeLabels(ctx, labels, { obstacles = [], segments = [], view }) {
  const taken = obstacles.slice();
  return labels.map((l) => {
    const width = measureLabel(ctx, l.text, l.size, l.weight);
    let best = null;
    let bestCost = Infinity;
    // Try each nearby spot, with the preferred alignment, then centred, then
    // running the other way (e.g. a long label that must stay inside its diagram).
    const aligns = [l.align, ...["center", "left", "right"].filter((a) => a !== l.align)];
    // prefer: "down" (point names, a resultant's label): step straight down
    // first — below any dimension lines there — before trying sideways.
    // "down" steps up to 72 px (past a dimension line or two); "far-down" (a
    // resultant's label) keeps going until it's below every dimension line.
    const down = l.prefer === "down" || l.prefer === "far-down";
    const maxDown = l.prefer === "far-down" ? Infinity : 72;
    const spots = down ? [...DOWN.filter(([, dy]) => dy <= maxDown), ...TRIES] : TRIES;
    const tries = spots.flatMap(([dx, dy]) => aligns.map((a) => [dx, dy, a]));
    for (const [dx, dy, align] of tries) {
      if (l.maxMove != null && Math.hypot(dx, dy) > l.maxMove) continue; // e.g. angles stay by their arc
      const pos = [l.pos[0] + dx, l.pos[1] + dy];
      const box = labelBox(pos[0], pos[1], width, l.size, align);
      // Prefer the original spot: moving away (or re-aligning) costs a little.
      let cost = (down && dx === 0 && dy > 0 && dy <= maxDown ? 0.4 * dy : Math.hypot(dx, dy)) + (align === l.align ? 0 : 8);
      // soft: a plate (avoid if possible); heavy: a point (never cover it)
      for (const t of taken) cost += overlapArea(box, t) * (t.soft ? 1 : t.heavy ? 60 : 4);
      // A faint dashed guide (a line of action) barely counts: a label may sit on it.
      for (const [p, q, kind] of segments) cost += segmentHits(box, p, q) * (kind === true ? 1 : 40);
      // Stepping down may hop over dimension lines, but never past an arrow or
      // the body: check the strip the label would slide through.
      if (down && dy > 18) {
        const start = labelBox(l.pos[0], l.pos[1], width, l.size, align);
        const strip = { x0: start.x0, y0: start.y1, x1: start.x1, y1: box.y0 };
        for (const [p, q, kind] of segments) if (kind !== "dim" && kind !== true && segmentHits(strip, p, q)) cost += 500;
        // …nor through a drawing (an eyebolt, a support): only dimension lines.
        for (const t of obstacles) if (!t.soft && !t.dim && overlapArea(strip, t) > 0) cost += 500;
      }
      // Keep it on the canvas, and inside its own diagram (minX/maxX, set by dividers).
      if (box.x0 < 0 || box.y0 < 0 || box.x1 > view.width || box.y1 > view.height) cost += 5000;
      if ((l.minX != null && box.x0 < l.minX) || (l.maxX != null && box.x1 > l.maxX)) cost += 5000;
      if (cost < bestCost) {
        bestCost = cost;
        best = { pos, box, align };
      }
      if (cost === 0) break;
    }
    taken.push(best.box);
    // cost tells the caller how hard it was to fit (0 = its first choice was free).
    return { ...l, pos: best.pos, align: best.align, box: best.box, cost: bestCost };
  });
}

// A small list of labels in a corner of the picture, for when there isn't
// room to put every value beside its arrow. Picks the corner (top-right,
// top-left, bottom-right) that covers the least of the drawing.
// items: [{ text, color }]. Returns { box, lines: [{ text, color, x, y }] }.
export function placeLegend(ctx, items, { obstacles = [], segments = [], view }) {
  const size = 14, lineH = 20, pad = 10;
  const width = Math.max(...items.map((it) => measureLabel(ctx, it.text, size))) + 2 * pad;
  const height = items.length * lineH + pad;
  const m = 8; // margin from the canvas edge
  const corners = [
    [view.width - width - m, m],
    [m, m],
    [view.width - width - m, view.height - height - m],
  ];
  let best = null;
  let bestCost = Infinity;
  for (const [x0, y0] of corners) {
    const box = { x0, y0, x1: x0 + width, y1: y0 + height };
    let cost = 0;
    for (const t of obstacles) cost += overlapArea(box, t);
    for (const [p, q] of segments) cost += segmentHits(box, p, q) * 40;
    if (cost < bestCost) {
      bestCost = cost;
      best = box;
    }
  }
  const lines = items.map((it, i) => ({ ...it, x: best.x0 + pad, y: best.y0 + pad + i * lineH + size * 0.55 }));
  return { box: best, lines, size };
}
