// Unit 7.1, stage 1 — explore: stretch the two legs of an L-shaped plate and watch
// each part's centroid and the whole plate's centroid C move.
// Part 1: w × t1 along the bottom, part 2: t2 × h on its left end (see library/shapes.js, L-plate).
// Starting sizes (3 × 1 and 1 × 0.5): x̄ = (4.5 + 0.25)/3.5 = 1.357 m, ȳ = (1.5 + 0.625)/3.5 = 0.607 m — inside.
// With part 2 raised to h = 2 m: x̄ = ȳ = 1.1 m, OUTSIDE the plate (in the L's corner).
// ȳ > 1.5 m and x̄ < 0.8 m e.g. with w = 1.5, h = 4: A = 1.5 + 4 = 5.5 m²,
//   ȳ = (1.5·0.5 + 4·3)/5.5 = 2.318 m,  x̄ = (1.5·0.75 + 4·0.5)/5.5 = 0.568 m.

import { lPlate } from "../library/shapes.js";

const setup = JSON.parse(JSON.stringify(lPlate.setup));
setup.parts[1].h = 0.5;

export default {
  id: "centroids/1-explore",
  challenge: "explore",
  solver: "statics.centroid",
  title: "Find the Balance Point",
  mission: "Stretch the plate and watch its centroid move — even off the plate.",
  instructions:
    "An L-shaped plate is made of two rectangles. The dots mark each part's centroid ($C_1$, $C_2$), the ring the whole plate's centroid C — the point it would balance on. " +
    "Stretch the legs and see how C moves.",
  setup: { ...setup, showParts: true },
  view: { xmin: -1.1, xmax: 4, ymin: -1.2, ymax: 4.7 },
  editable: [
    { path: "parts.0.w", label: "Bottom leg length", min: 1, max: 3.5, step: 0.1, unit: "m" },
    { path: "parts.1.h", label: "Upright leg height", min: 0.5, max: 3.5, step: 0.1, unit: "m" },
  ],
  tasks: [
    { text: "Make the centroid C fall **outside** the plate.", check: (v) => v.inside === 0 },
    { text: "Make $\\bar{x}$ equal $\\bar{y}$ (within 0.01 m).", check: (v) => Math.abs(v.xbar - v.ybar) < 0.01 },
    { text: "Raise the centroid above **1.5 m**.", check: (v) => v.ybar > 1.5 },
    { text: "Pull the centroid left of **x = 0.8 m**.", check: (v) => v.xbar < 0.8 },
  ],
  hints: [
    "C always lies on the line between $C_1$ and $C_2$ — nearer the bigger part.",
    "Make both legs long and thin: C lands in the empty corner between them.",
    "To move C up or left, make the upright part bigger and the bottom part smaller.",
  ],
  explanation:
    "The centroid is the area-weighted average of the parts' centroids: it lies on the line joining $C_1$ and $C_2$, closer to the bigger part. " +
    "It doesn't have to be on the material at all — an L's centroid can sit in its empty corner, like a ring's centre.",
};
