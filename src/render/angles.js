// angles.js — an angle marking and its number, kept together.
//
//   arc { center, r, start, end, label }   (degrees, counterclockwise from +x;
//                                            `start` is the side the angle is
//                                            measured from, e.g. the x-axis)
//
// The number always sits with its arc: just outside it, inside the angle, next
// to the reference side. If something is already there (an arrow, a label, a
// drawing), the arc grows outward until the number has room — the grey arc
// and the reference line simply reach further to meet it. So the number never
// wanders off on its own. An angle too narrow to hold its number (a few
// degrees against a thick bar) has it just outside, beside the arc.
//
// Arcs are drawn AFTER the rest of the picture (see diagrams.js), so this can
// see everything that might be in the way.

import { measureLabel, labelBox } from "./arrows.js";
import { overlapArea, segmentHits, CLEAR } from "./labels.js";

const GAP = 16; // px from the arc to the number's centre
const SIDE = 12; // px between the reference line and the number's centre
const GROW = 10; // px the arc grows each time the number doesn't fit
const TRIES = 9;
const SIDES = [SIDE, SIDE + 7, SIDE + 14, SIDE + 22]; // px from the reference line, nearest first

// Draws the arc; returns { label (fixed position), boxes, segments }.
export function drawArc(cv, s, env, { obstacles, segments }) {
  const { ctx } = cv;
  const [x, y] = cv.toScreen(s.center);
  const r0 = s.r * cv.view.scale;
  const diff = ((s.end - s.start + 540) % 360) - 180; // shortest way round
  const sign = Math.sign(diff || 1);
  const w = s.label ? measureLabel(ctx, s.label, 12) : 0;

  // Where the number goes for an arc of radius r (pixels).
  // side: px from the reference line (further in when that line is a thick beam).
  // out: +1 just past the angle's far side, −1 just before its reference side
  // (for an angle too narrow to hold its number: it then sits beside the arc).
  const spot = (r, side = SIDE, out = 0) => {
    const R = r + GAP;
    const off = (Math.asin(Math.min(1, side / R)) * 180) / Math.PI;
    const into = out > 0 ? Math.abs(diff) + off : out < 0 ? -off : Math.min(Math.abs(diff) / 2, off);
    const a = ((s.start + sign * into) * Math.PI) / 180;
    const pos = [x + Math.cos(a) * R, y - Math.sin(a) * R + 4];
    return { R, pos, box: labelBox(pos[0], pos[1], w, 12, "center") };
  };
  // Is that spot clear? Faint dashed guides don't count (the number may sit on one).
  // (The object-boundaries rule: the number keeps CLEAR from outlines and solid lines.)
  const clear = (b) => {
    const box = { x0: b.x0 - CLEAR + 1, y0: b.y0 - CLEAR + 1, x1: b.x1 + CLEAR - 1, y1: b.y1 + CLEAR - 1 };
    return !obstacles.some((t) => !t.soft && overlapArea(box, t) > 2) &&
      !segments.some(([p, q, kind]) => kind !== true && segmentHits(box, p, q));
  };

  // Try a bigger arc, and the number further from the reference side (a thick
  // beam as the reference needs more room), until the number is clear.
  let r = r0;
  let best = spot(r);
  if (s.label && !clear(best.box)) {
    let found = null;
    for (let k = 0; k <= TRIES && !found; k++) {
      for (const side of SIDES) {
        const t = spot(r0 + k * GROW, side);
        if (clear(t.box)) {
          found = { r: r0 + k * GROW, spot: t };
          break;
        }
      }
    }
    // Too narrow (e.g. a few degrees against a thick bar): just outside the
    // angle, past its far side, else before its reference side.
    for (let k = 0; k <= TRIES && !found; k++) {
      for (const out of [1, -1]) {
        const t = spot(r0 + k * GROW, SIDE + 4, out);
        if (clear(t.box)) {
          found = { r: r0 + k * GROW, spot: t };
          break;
        }
      }
    }
    // Nowhere clear: keep the arc its own size and the number beside it.
    if (found) {
      r = found.r;
      best = found.spot;
    }
  }

  ctx.save();
  ctx.strokeStyle = env.faint;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  // Canvas angles run clockwise (y down), so negate.
  ctx.arc(x, y, r, (-s.start * Math.PI) / 180, (-(s.start + diff) * Math.PI) / 180, diff > 0);
  ctx.stroke();
  // The reference side, dashed, reaching just past the number.
  const ref = (s.start * Math.PI) / 180;
  const reach = s.label ? best.R + w / 2 + 6 : r;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ref) * reach, y - Math.sin(ref) * reach);
  ctx.stroke();
  ctx.restore();

  return {
    label: s.label ? { text: s.label, pos: best.pos, align: "center", size: 12, weight: 500, color: env.ink, plain: true, maxMove: 0 } : null,
    boxes: [],
    segments: [[[x, y], [x + Math.cos(ref) * reach, y - Math.sin(ref) * reach], true]],
  };
}
