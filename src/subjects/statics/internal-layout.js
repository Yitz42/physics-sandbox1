// internal-layout.js — where the shear (V) and moment (M) diagrams go under the beam,
// sized for the canvas they'll be drawn on (Units 8.2–8.3).
//
// Why pixels matter here: labels (A_y = 1050 N, a diagram's values) are a fixed
// number of PIXELS tall, but the drawing is in METRES, scaled to fit the canvas. On a
// phone a metre is less than half as many pixels as on a computer, so gaps measured
// in metres alone leave too little room there — a reaction's label ran into the
// shear diagram's first value. So each gap below is some metres (what the drawing
// needs) plus some pixels (what the labels need), turned into metres at the scale the
// canvas will use. And the diagrams grow to fill a tall canvas, instead of leaving it
// empty above and below.
//
// The scene then carries the exact frame to show ({ type: "frame" }), so the canvas
// uses that same scale (workspace.js fits to it).

import { boundsOf } from "../../render/canvas.js";

const PAD = 36; // the canvas's pixel border (render/canvas.js)
const NO_CANVAS = { width: 750, height: 720 }; // without a canvas (the tests): a computer's tall picture

// Pixel room for labels (tuned by eye and by the picture-clash test, on a phone and a computer).
const PX = {
  side: 26, //    each side: a diagram's name (V, M); labels past that use the canvas border
  above: 30, //   above the loads: their labels (w = 400 N/m, P = 600 N)
  below: 92, //   under the beam: the support symbols, two rows of dimensions, the reactions' labels
  between: 50, // between V's lowest point and M's highest: a value under V, a value over M
  foot: 12, //    under M
  numbers: 30, // the segment numbers (showSegments) under that
};

// beam: the beam scene's shapes (loads, supports, reactions, dimensions)
// opts: { x0, x1, size (the beam's length scale), canvasSize, showSegments }
// Returns { yV, yM, hV, hM, bottom, numbersY, frame }: the zero lines of V and M, the
// height of each diagram's largest value, where the guides end, and the frame.
export function plotLayout(beam, { x0, x1, size, canvasSize, showSegments }) {
  const { width: W, height: H } = canvasSize || NO_CANVAS;
  // (Faint guides don't count: only what's really drawn.)
  const b = boundsOf(beam.filter((s) => !(s.type === "line" && (s.style === "action" || s.style === "reference"))), 0);
  const left = Math.min(b.xmin, x0), right = Math.max(b.xmax, x1);
  const beamH = b.ymax - b.ymin; // the beam picture's height in metres

  // Pixels needed from top to bottom, and the diagrams' base heights in metres
  // (the largest V is 0.16 of the beam's size tall, the largest M 0.18).
  const px = PX.above + PX.below + PX.between + PX.foot + (showSegments ? PX.numbers : 0);
  const base = 0.34 * size; // hV + hM at their base size
  // Metres → pixels: as big as the width allows...
  let s = (W - 2 * PAD - 2 * PX.side) / (right - left);
  // ...then the diagrams stretch (or shrink a little) to fill the height: each
  // diagram is drawn twice its height at most (a positive and a negative part).
  let grow = (H - 2 * PAD - px - s * beamH) / (2 * s * base);
  if (grow < 0.8) {
    grow = 0.8; // any smaller and the diagrams get hard to read: shrink the whole picture instead
    s = (H - 2 * PAD - px) / (beamH + 2 * base * grow);
  }
  grow = Math.min(grow, 1.8);
  const m = (p) => p / s; // pixels → metres at this scale
  const hV = 0.16 * size * grow, hM = 0.18 * size * grow;

  const yV = b.ymin - m(PX.below) - hV;
  const yM = yV - hV - m(PX.between) - hM;
  const bottom = yM - hM - m(PX.foot);
  const numbersY = bottom - m(PX.numbers / 2);
  const frame = {
    xmin: left - m(PX.side), xmax: right + m(PX.side),
    ymin: bottom - m(showSegments ? PX.numbers : 0), ymax: b.ymax + m(PX.above),
  };
  return { yV, yM, hV, hM, bottom, numbersY, frame };
}
