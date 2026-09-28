// library/sections.js — the lesson library's beam cross-sections (Unit 10.1; see
// src/subjects/statics/inertia.js). Lengths in mm; I in 10⁶ mm⁴, about the horizontal axis
// through the section's centroid unless said otherwise.
// Questions:
//   Ix      the section's Ī_x
//   tee     where its centroid is (ȳ), then Ī_x
//   axis    I about another axis (the base), by the parallel-axis theorem
// Hand checks (default numbers):
//   I-beam: flanges 200 × 20, web 20 × 260 (300 tall), symmetric: ȳ = 150.
//            web 20(260)³/12 = 29.293; each flange 200(20)³/12 + 4000(140)² = 0.133 + 78.4 = 78.533
//            → Ī_x = 29.293 + 2(78.533) = 186.36 ×10⁶ mm⁴.
//   T-beam: flange 150 × 20 on a web 20 × 180. A = 3600 + 3000 = 6600; ȳ = (3600·90 + 3000·190)/6600 = 135.45 mm.
//            web 9.72 + 3600(45.45)² = 9.72 + 7.438; flange 0.1 + 3000(54.55)² = 0.1 + 8.926 → Ī_x = 26.18 ×10⁶ mm⁴.
//   unequal I: bottom flange 250 × 20, web 10 × 200, top flange 150 × 20. ȳ = 980 000/10 000 = 98.0 mm.
//            0.1667 + 5000(88)² = 38.887; 6.667 + 2000(22)² = 7.635; 0.1 + 3000(132)² = 52.372 → 98.89 ×10⁶ mm⁴.
//   hollow box: 120 × 120 outside, walls 20: (120⁴ − 80⁴)/12 = (207.36 − 40.96)/12 = 13.87 ×10⁶ mm⁴.
//   plank about its base: 60 × 150: Ī = 60(150)³/12 = 16.875; + A d² = 9000(75)² = 50.625 → 67.5 ×10⁶ mm⁴ (= bh³/3).

import { scenario } from "../../../src/core/library.js";

const I_HINTS = [
  "Split the section into rectangles. Each has its own $\\bar{I} = bh^3/12$ about its own centroid (h is its vertical size).",
  "Move each to the section's centroid with the parallel-axis theorem: add $A d^2$, where d is from the part's centroid to the section's.",
  "$\\bar{I}_x = \\Sigma(\\bar{I}_i + A_i d_i^2)$. Work in mm, and divide by $10^6$ at the end.",
];
const TEE_HINTS = [
  "First the centroid: $\\bar{y} = \\Sigma\\tilde{y}_i A_i / \\Sigma A_i$, measured from the bottom.",
  "Each rectangle's own $\\bar{I} = bh^3/12$; its distance to the section's centroid is $d = \\tilde{y}_i - \\bar{y}$.",
  "$\\bar{I}_x = \\Sigma(\\bar{I}_i + A_i d_i^2)$ — the flange's $A d^2$ is usually the biggest part.",
];

export const iBeam = scenario({
  name: "steel I-beam",
  story: "A steel I-beam's cross-section: two flanges joined by a web. It bends about the horizontal axis through its centroid.",
  setup: { section: { kind: "I", b: 200, tf: 20, hw: 260, tw: 20 } },
  vary: [
    { path: "section.b", values: [150, 175, 200, 225, 250] },
    { path: "section.hw", values: [200, 230, 260, 290, 320] },
    { path: "section.tw", values: [15, 20] },
  ],
  questions: { Ix: { instruction: "Find its moment of inertia $\\bar{I}_x$ about that axis.", ask: [{ quantity: "Ix6", precision: 0.01 }], hints: I_HINTS } },
});

export const tBeam = scenario({
  name: "T-beam",
  story: "A T-shaped beam section: a flange on top of a web.",
  setup: { section: { kind: "T", b: 150, tf: 20, hw: 180, tw: 20 } },
  vary: [
    { path: "section.b", values: [120, 135, 150, 165, 180] },
    { path: "section.hw", values: [150, 165, 180, 195, 210] },
    { path: "section.tf", values: [15, 20] },
  ],
  questions: { tee: { instruction: "Find its centroid's height $\\bar{y}$ above the bottom, and its moment of inertia $\\bar{I}_x$ about the horizontal axis through the centroid.",
    ask: [{ quantity: "ybar" }, { quantity: "Ix6", precision: 0.01 }], hints: TEE_HINTS } },
});

export const unequalI = scenario({
  name: "I-beam with unequal flanges",
  story: "A built-up beam section: a wide bottom flange, a web, and a narrower top flange.",
  setup: { section: { kind: "I", b: 150, b2: 250, tf: 20, hw: 200, tw: 10 } },
  vary: [
    { path: "section.b", values: [120, 150, 180] },
    { path: "section.b2", values: [200, 250, 300] },
    { path: "section.hw", values: [160, 200, 240] },
    { path: "section.tw", values: [8, 10] },
  ],
  questions: { tee: { instruction: "Find its centroid's height $\\bar{y}$ above the bottom, and its moment of inertia $\\bar{I}_x$ about the horizontal axis through the centroid.",
    ask: [{ quantity: "ybar" }, { quantity: "Ix6", precision: 0.01 }], hints: TEE_HINTS } },
});

export const hollowBox = scenario({
  name: "hollow box section",
  story: "A hollow box section: a square tube with walls of the same thickness all round.",
  setup: { section: { kind: "box", B: 120, H: 120, t: 20 } },
  vary: [
    { path: "section.B", values: [100, 110, 120, 130, 140, 150, 160] },
    { path: "section.H", values: [100, 110, 120, 130, 140, 150, 160] },
    { path: "section.t", values: [15, 20] },
  ],
  questions: { Ix: { instruction: "Find its moment of inertia $\\bar{I}_x$ about the horizontal axis through its centroid.", ask: [{ quantity: "Ix6", precision: 0.01 }],
    hints: [
      "Treat it as the solid outside rectangle MINUS the hole.",
      "Both share the same centroid, so d = 0 for each: no $A d^2$ terms.",
      "$\\bar{I}_x = \\dfrac{B H^3}{12} - \\dfrac{b h^3}{12}$, with b and h the hole's size.",
    ] } },
});

export const plankBase = scenario({
  name: "plank about its base",
  story: "A rectangular timber plank's cross-section stands on its base.",
  setup: { section: { kind: "plank", b: 60, h: 150, y0: 0 }, axis: { y: 0, name: "base" } },
  vary: [
    { path: "section.b", values: [40, 50, 60, 70, 80, 90, 100] },
    { path: "section.h", values: [100, 120, 140, 160, 180, 200] },
  ],
  questions: { axis: { instruction: "Find its moment of inertia about its BASE (the dashed line).", ask: [{ quantity: "Ia6", precision: 0.01 }],
    hints: [
      "Start from its own $\\bar{I} = bh^3/12$ about its centroid, halfway up.",
      "Move it down to the base: add $A d^2$, with d = h/2.",
      "$\\dfrac{bh^3}{12} + bh\\left(\\dfrac{h}{2}\\right)^2 = \\dfrac{bh^3}{3}$.",
    ] } },
});
