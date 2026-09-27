// bounds.js — checking a picture against the "object boundaries" rule.
//
// Every drawn object reports its outline (boxes) and its solid lines
// (segments), and every label its box (see diagrams.js). Here we look for
// CLASHES: a label on another label, a label closer than CLEAR to an object's
// outline or a solid line, or a label running off the canvas.
//   findClashes(report)       → [{ kind, text, box }]  (used by the gallery and the tests)
//   drawBounds(ctx, report)   draws every outline, line and label box on top of the
//                             picture, with the clashes in red (the gallery's
//                             "Show boundaries" switch)
//   showBounds / setShowBounds  the switch itself: while it's on, every picture
//                             (the gallery's and the stage pages') draws its boundaries.

import { CLEAR, overlapArea, segmentHits } from "./labels.js";

let on = false;
export const showBounds = () => on;
export function setShowBounds(value) {
  on = !!value;
}

// Grazing a corner by a pixel or two isn't a clash (rounding of text widths).
const SLACK = 1;
const grow = (b, m) => ({ x0: b.x0 - m, y0: b.y0 - m, x1: b.x1 + m, y1: b.y1 + m });

// report: { labels: [{ text, box, breaks? }], obstacles: [box], segments: [[p, q, kind]], view }
export function findClashes({ labels = [], obstacles = [], segments = [], view }) {
  const out = [];
  labels.forEach((l, i) => {
    if (!l.box) return;
    const near = (l.clear ?? CLEAR) - SLACK; // (a letter's own, smaller gap)
    const padded = grow(l.box, near);
    const why = [];
    for (let j = 0; j < i; j++) if (labels[j].box && overlapArea(l.box, labels[j].box) > 4) why.push(`on the label "${labels[j].text}"`);
    // (Soft areas — a plate, a load, the inside of a moment's circle — may be
    // covered: labels only avoid them when they can. Other outlines need the gap.)
    for (const t of obstacles) {
      if (t.soft) continue;
      if (overlapArea(padded, t) > 6) {
        why.push("too close to a drawing");
        break;
      }
    }
    for (const [p, q, kind] of segments) {
      if (kind === true || kind === "dim") continue; // faint guides and dimension lines may be broken by a label
      if (segmentHits(padded, p, q) > 1) {
        why.push("on a line");
        break;
      }
    }
    if (view && (l.box.x0 < -SLACK || l.box.y0 < -SLACK || l.box.x1 > view.width + SLACK || l.box.y1 > view.height + SLACK)) why.push("off the edge");
    if (why.length) out.push({ kind: why[0], why, text: l.text, box: l.box });
  });
  return out;
}

export function drawBounds(ctx, report) {
  ctx.save();
  ctx.lineWidth = 1;
  // Solid lines (thin blue) and faint/dimension lines (dotted).
  for (const [p, q, kind] of report.segments) {
    ctx.strokeStyle = kind ? "rgba(37, 99, 235, 0.45)" : "rgba(37, 99, 235, 0.9)";
    ctx.setLineDash(kind ? [2, 3] : []);
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // Object outlines (orange), with the clear gap round them (faint).
  for (const b of report.obstacles) {
    ctx.strokeStyle = b.soft ? "rgba(234, 88, 12, 0.35)" : "rgba(234, 88, 12, 0.85)";
    ctx.strokeRect(b.x0 + 0.5, b.y0 + 0.5, b.x1 - b.x0, b.y1 - b.y0);
  }
  // Label boxes (green), clashes filled red.
  const bad = new Set(report.clashes.map((c) => c.box));
  for (const l of report.labels) {
    if (!l.box) continue;
    const b = l.box;
    if (bad.has(b)) {
      ctx.fillStyle = "rgba(220, 38, 38, 0.28)";
      ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    }
    ctx.strokeStyle = bad.has(b) ? "rgba(220, 38, 38, 0.95)" : "rgba(22, 163, 74, 0.9)";
    ctx.strokeRect(b.x0 + 0.5, b.y0 + 0.5, b.x1 - b.x0, b.y1 - b.y0);
  }
  ctx.restore();
}
