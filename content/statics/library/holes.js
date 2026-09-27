// library/holes.js — the lesson library's shapes with holes and cut-outs (Unit 7.2;
// see src/core/library.js). A hole is a part with hole: true — its area counts NEGATIVE.
// Questions:
//   centroid   predict x̄ and/or ȳ
//   area       predict the net area A
// Hand checks (A = ΣA_solid − ΣA_hole;  x̄ = Σx̃A/ΣA with the hole's terms negative):
//   plate with a hole: 1 = 4 × 2 at (0, 0) → 8 m², (2, 1);  2 = hole r = 0.5 at (1, 1) → 0.785 m²
//            A = 7.215 m²;  Σx̃A = 16 − 0.785 = 15.215 → x̄ = 2.109 m (pushed AWAY from the hole);  ȳ = 1 m
//   cut-out bracket: 1 = 3 × 3 square → 9 m², (1.5, 1.5);  2 = hole 1.5 × 1.5 in its top-right corner → 2.25 m², (2.25, 2.25)
//            A = 6.75 m²;  x̄ = ȳ = (13.5 − 5.0625)/6.75 = 1.25 m  (an L-shape, found by subtracting)
//   notched plate: 1 = 4 × 2 → 8 m², (2, 1);  2 = half-circle notch r = 0.8 in the top edge, centred (2, 2),
//            bulging down → 1.005 m², ỹ = 2 − 4(0.8)/(3π) = 1.660 m.  A = 6.995 m²;  ȳ = (8 − 1.669)/6.995 = 0.905 m
//   link plate: 1 = 3 × 2 → 6 m², (1.5, 1);  2 = half circle r = 1 on its right end, centred (3, 1) → 1.571 m²,
//            x̃ = 3 + 4/(3π) = 3.424 m;  3 = hole r = 0.5 at (3, 1) → 0.785 m²
//            A = 6.785 m²;  Σx̃A = 9 + 5.379 − 2.356 = 12.023 → x̄ = 1.772 m;  ȳ = 1 m

import { scenario } from "../../../src/core/library.js";

const rect = (id, at, w, h, extra = {}) => ({ id, shape: "rect", at, w, h, ...extra });
const hole = (id, at, r) => ({ id, shape: "circle", at, r, hole: true });
const combos = (lists, make) => lists.reduce((acc, list) => acc.flatMap((a) => list.map((x) => [...a, x])), [[]]).map((c) => make(...c));

// Hints every hole question shares.
const HOLE_HINTS = [
  "Treat the hole as a part with NEGATIVE area: $A = A_1 - A_2$. Its first moment is negative too: $-\\tilde{x}_2 A_2$.",
  "A circle's area is $\\pi r^2$ and its centroid is its centre.",
  "$\\bar{x} = \\dfrac{\\tilde{x}_1 A_1 - \\tilde{x}_2 A_2}{A_1 - A_2}$ — the centroid moves AWAY from the hole.",
];

export const plateHole = scenario({
  name: "plate with a hole",
  story: "A 4 m × 2 m steel plate (part 1) has a round hole (part 2) drilled through it.",
  setup: { parts: [rect("1", [0, 0], 4, 2), hole("2", [1, 1], 0.5)] },
  view: { xmin: -1.4, xmax: 5.8, ymin: -1.8, ymax: 2.8 },
  vary: [
    { path: "parts.1.at.0", values: [0.8, 1, 1.2, 2.8, 3, 3.2] },
    { path: "parts.1.r", values: [0.4, 0.5, 0.6, 0.7] },
    { path: "parts.0.w", values: [4, 4.5, 5] },
  ],
  questions: {
    centroid: {
      instruction: "The plate is symmetric top to bottom, so $\\bar{y}$ is on its middle line. Predict $\\bar{x}$, measured from O.",
      ask: [{ quantity: "xbar", precision: 0.01 }],
      hints: HOLE_HINTS,
    },
    area: {
      instruction: "Predict the plate's area $A$ with the hole taken out.",
      ask: [{ quantity: "A", precision: 0.01 }],
      hints: ["The hole is material that isn't there: $A = A_1 - A_2$.", "A circle's area is $\\pi r^2$."],
    },
  },
});

export const cutoutBracket = scenario({
  name: "cut-out bracket",
  story: "An L-shaped bracket is cut from a square plate (part 1) by removing a square from its top-right corner (part 2, the cut-out).",
  setup: { parts: [rect("1", [0, 0], 3, 3), rect("2", [1.5, 1.5], 1.5, 1.5, { hole: true })] },
  view: { xmin: -1.6, xmax: 3.8, ymin: -1.8, ymax: 3.8 },
  vary: [{ path: "parts", values: combos([[2.5, 2.75, 3, 3.25, 3.5], [0.75, 1, 1.25, 1.5, 1.75, 2]], (s, c) => [rect("1", [0, 0], s, s), rect("2", [s - c, s - c], c, c, { hole: true })]) }],
  questions: {
    centroid: {
      instruction: "Predict the bracket's centroid $\\bar{x}$ and $\\bar{y}$, measured from O — by subtracting the cut-out from the square.",
      ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
      hints: [
        "Whole square minus the cut-out: $A = A_1 - A_2$.",
        "The cut-out's centroid is the middle of the missing square, in the top-right corner.",
        "$\\bar{x} = \\dfrac{\\tilde{x}_1 A_1 - \\tilde{x}_2 A_2}{A_1 - A_2}$; the shape is symmetric about its diagonal, so $\\bar{y} = \\bar{x}$.",
      ],
    },
  },
});

const notchParts = (w, r) => [rect("1", [0, 0], w, 2), { id: "2", shape: "semi", at: [w / 2, 2], r, dir: "down", hole: true }];

export const notchedPlate = scenario({
  name: "notched plate",
  story: "A plate (part 1) has a half-circle notch (part 2) cut into the middle of its top edge.",
  setup: { parts: notchParts(4, 0.8) },
  view: { xmin: -1.4, xmax: 5.8, ymin: -1.8, ymax: 2.8 },
  vary: [{ path: "parts", values: combos([[3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5], [0.5, 0.6, 0.7, 0.8, 0.9, 1]], notchParts) }],
  questions: {
    centroid: {
      instruction: "The plate is symmetric left to right. Predict $\\bar{y}$, measured up from O.",
      ask: [{ quantity: "ybar", precision: 0.01 }],
      hints: [
        "The notch is a half circle taken away: area $-\\tfrac{1}{2}\\pi r^2$.",
        "Its centroid is $\\tfrac{4r}{3\\pi}$ from its flat edge — here BELOW the top edge: $\\tilde{y}_2 = 2 - \\tfrac{4r}{3\\pi}$.",
        "$\\bar{y} = \\dfrac{\\tilde{y}_1 A_1 - \\tilde{y}_2 A_2}{A_1 - A_2}$: the notch takes area from the top, so the centroid drops.",
      ],
    },
  },
});

const linkParts = (L, r, a) => [rect("1", [0, 0], L, 2 * r), { id: "2", shape: "semi", at: [L, r], r, dir: "right" }, hole("3", [L, r], a)];

export const linkPlate = scenario({
  name: "link plate",
  story: "A link plate is a rectangle (part 1) with a rounded right end (part 2, a half circle) and a pin hole (part 3) at the centre of the rounded end.",
  setup: { parts: linkParts(3, 1, 0.5) },
  view: { xmin: -1.4, xmax: 5.2, ymin: -1.8, ymax: 2.8 },
  vary: [{ path: "parts", values: combos([[2.5, 2.75, 3, 3.25, 3.5], [0.8, 0.9, 1], [0.3, 0.35, 0.4, 0.45, 0.5]], linkParts) }],
  questions: {
    centroid: {
      instruction: "Predict the plate's centroid $\\bar{x}$, measured from O ($\\bar{y}$ is on its centre line).",
      ask: [{ quantity: "xbar", precision: 0.01 }],
      hints: [
        "Three parts: rectangle + half circle − hole.",
        "The half circle's centroid is $\\tfrac{4r}{3\\pi}$ right of its flat edge; the hole's is at its centre, on that flat edge.",
        "$\\bar{x} = \\dfrac{\\tilde{x}_1 A_1 + \\tilde{x}_2 A_2 - \\tilde{x}_3 A_3}{A_1 + A_2 - A_3}$.",
      ],
    },
  },
});

// notched plate with a hole: 1 = 4 × 2 → 8 m², (2, 1);  2 = half-circle notch r = 0.8 in the top edge at x = 1.2
//   → 1.005 m², (1.2, 2 − 0.340 = 1.660);  3 = hole r = 0.4 at (3, 1) → 0.503 m²
//   A = 8 − 1.005 − 0.503 = 6.492 m²;  Σx̃A = 16 − 1.206 − 1.508 = 13.286 → x̄ = 2.046 m;
//   Σỹ A = 8 − 1.669 − 0.503 = 5.828 → ȳ = 0.898 m
export const notchAndHole = scenario({
  name: "notched plate with a hole",
  story: "A plate (part 1) has a half-circle notch (part 2) cut into its top edge and a round hole (part 3) drilled through it.",
  setup: {
    parts: [
      rect("1", [0, 0], 4, 2),
      { id: "2", shape: "semi", at: [1.2, 2], r: 0.8, dir: "down", hole: true },
      hole("3", [3, 1], 0.4),
    ],
  },
  view: { xmin: -1.4, xmax: 4.8, ymin: -1.8, ymax: 2.8 },
  vary: [
    { path: "parts.2.at.0", values: [2.6, 2.8, 3, 3.2, 3.4] },
    { path: "parts.2.r", values: [0.3, 0.35, 0.4, 0.45] },
    { path: "parts.1.r", values: [0.6, 0.7, 0.8] },
  ],
  questions: {
    centroid: {
      instruction: "Predict the plate's centroid $\\bar{x}$ and $\\bar{y}$, measured from O.",
      ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
      hints: HOLE_HINTS,
    },
  },
});
