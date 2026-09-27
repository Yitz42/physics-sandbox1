// library/shapes.js — the lesson library's composite shapes (Unit 6.1; see src/core/library.js).
// Questions:
//   centroid   predict x̄ and/or ȳ
// Hand checks (A_i, x̃_i, ỹ_i;  x̄ = Σx̃A/ΣA,  ȳ = Σỹ A/ΣA):
//   L-plate: 1 = 3 × 1 at (0, 0) → 3 m², (1.5, 0.5);  2 = 1 × 2 on top at (0, 1) → 2 m², (0.5, 2).
//            x̄ = (4.5 + 1)/5 = 1.1 m,  ȳ = (1.5 + 4)/5 = 1.1 m — outside the plate (in the L's corner).
//   tee:     flange 4 × 1 at (0, 3) → 4 m², (2, 3.5);  web 1 × 3 at (1.5, 0) → 3 m², (2, 1.5).
//            x̄ = 2 m (symmetric),  ȳ = (14 + 4.5)/7 = 2.643 m
//   ramp block: 1 = 2 × 2 at (0, 0) → 4 m², (1, 1);  2 = triangle, right angle at (2, 0), legs 3 (x) and 2 (y)
//            → 3 m², (2 + 3/3, 2/3) = (3, 0.667).  x̄ = (4 + 9)/7 = 1.857 m,  ȳ = (4 + 2)/7 = 0.857 m
//   arch:    1 = 2 × 3 at (0, 0) → 6 m², (1, 1.5);  2 = half circle r = 1 on top, centred (1, 3)
//            → π/2 = 1.571 m², ỹ = 3 + 4/(3π) = 3.424 m.  x̄ = 1 m,  ȳ = (9 + 5.379)/7.571 = 1.899 m
//   bracket (centre of gravity): 1 = 2 × 0.5 steel plate, 30 kg, (1, 0.25);  2 = 0.5 × 1.5 upright, 10 kg, (0.25, 1.25)
//            x̄ = (30 + 2.5)/40 = 0.8125 m,  ȳ = (7.5 + 12.5)/40 = 0.5 m
//            (by AREA it would be x̄ = 1.1875/1.75 = 0.679 m — the tempting wrong answer)
//   sign:    1 = 3 × 2 at (0, 0) → 6 m², (1.5, 1);  2 = triangle, right angle at (3, 0), legs 1.5 (x), 2 (y)
//            → 1.5 m², (3.5, 0.667);  3 = half circle r = 1 on top, centred (1.5, 2) → 1.571 m², (1.5, 2.424)
//            ΣA = 9.071 m²;  Σx̃A = 9 + 5.25 + 2.356 = 16.606 → x̄ = 1.831 m;  Σỹ A = 6 + 1 + 3.808 = 10.808 → ȳ = 1.192 m

import { scenario } from "../../../src/core/library.js";

const rect = (id, at, w, h, extra = {}) => ({ id, shape: "rect", at, w, h, ...extra });
// Every combination of some sizes (for shapes whose sizes are tied together).
const combos = (lists, make) => lists.reduce((acc, list) => acc.flatMap((a) => list.map((x) => [...a, x])), [[]]).map((c) => make(...c));
const archParts = (h, r) => [rect("1", [0, 0], 2 * r, h), { id: "2", shape: "semi", at: [r, h], r, dir: "up" }];
const signParts = (w, h, t, r) => [rect("1", [0, 0], w, h), { id: "2", shape: "tri", at: [w, 0], w: t, h }, { id: "3", shape: "semi", at: [w / 2, h], r, dir: "up" }];

export const lPlate = scenario({
  name: "L-plate",
  story: "A flat L-shaped plate is made of two rectangles: part 1 along the bottom and part 2 standing on its left end.",
  setup: { parts: [rect("1", [0, 0], 3, 1), rect("2", [0, 1], 1, 2)] },
  view: { xmin: -1.6, xmax: 4.4, ymin: -1.8, ymax: 3.6 },
  vary: [
    { path: "parts.0.w", values: [2.5, 3, 3.5, 4] },
    { path: "parts.1.h", values: [1.5, 2, 2.5, 3] },
    { path: "parts.0.h", values: [0.5, 1] },
    { path: "parts.1.w", values: [0.5, 1] },
  ],
  questions: {
    centroid: {
      instruction: "Predict the centroid's coordinates $\\bar{x}$ and $\\bar{y}$, measured from O.",
      ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
      hints: [
        "Each rectangle's centroid is at its middle. Find each part's area and centroid first.",
        "$\\bar{x} = \\dfrac{\\Sigma \\tilde{x} A}{\\Sigma A}$: each part's centroid counts in proportion to its area.",
        "Part 2 sits on top of part 1, so its $\\tilde{y}$ is part 1's height plus half its own.",
      ],
    },
  },
});

export const tee = scenario({
  name: "tee",
  story: "A T-shaped cross-section is a flange (part 1) on top of a web (part 2).",
  setup: { parts: [rect("1", [0, 3], 4, 1), rect("2", [1.5, 0], 1, 3)] },
  view: { xmin: -1.6, xmax: 5.4, ymin: -1.8, ymax: 4.8 },
  vary: [
    { paths: ["parts.1.h", "parts.0.at.1"], values: [2, 2.5, 3, 3.5, 4] },
    { path: "parts.0.h", values: [0.5, 0.75, 1] },
    { path: "parts.0.w", values: [3, 4, 5] },
  ],
  questions: {
    centroid: {
      instruction: "The tee is symmetric, so $\\bar{x}$ is on its centre line. Predict $\\bar{y}$, measured up from O.",
      ask: [{ quantity: "ybar", precision: 0.01 }],
      hints: [
        "The flange's centroid is half its thickness above the web's top; the web's is half its height above O.",
        "$\\bar{y} = \\dfrac{\\tilde{y}_1 A_1 + \\tilde{y}_2 A_2}{A_1 + A_2}$.",
        "Check: $\\bar{y}$ must lie between the two parts' centroids — nearer the bigger one.",
      ],
    },
  },
});

export const rampBlock = scenario({
  name: "ramp block",
  story: "A block's side is a square (part 1) with a triangular ramp (part 2) against it; the ramp's right angle is at its foot, against the square.",
  setup: { parts: [rect("1", [0, 0], 2, 2), { id: "2", shape: "tri", at: [2, 0], w: 3, h: 2 }] },
  view: { xmin: -1.6, xmax: 5.8, ymin: -1.8, ymax: 3 },
  vary: [
    { path: "parts.1.w", values: [2, 2.5, 3, 3.5, 4, 4.5] },
    { paths: ["parts.0.h", "parts.1.h"], values: [1.5, 2, 2.5] },
    { paths: ["parts.0.w", "parts.1.at.0"], values: [1.5, 2, 2.5] },
  ],
  questions: {
    centroid: {
      instruction: "Predict the centroid's coordinates $\\bar{x}$ and $\\bar{y}$, measured from O.",
      ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
      hints: [
        "A right triangle's area is $\\tfrac{1}{2}bh$; its centroid is ⅓ of each leg from its RIGHT ANGLE.",
        "Here the right angle is at the ramp's foot, against the square: $\\tilde{x}_2$ = the square's width + ⅓ of the ramp's length.",
        "Then $\\bar{x} = \\Sigma \\tilde{x} A / \\Sigma A$, and the same for $\\bar{y}$.",
      ],
    },
  },
});

export const arch = scenario({
  name: "arch",
  story: "A window is a rectangle (part 1) topped by a half circle (part 2).",
  setup: { parts: archParts(3, 1) },
  view: { xmin: -1.6, xmax: 4.4, ymin: -1.8, ymax: 5.8 },
  vary: [{ path: "parts", values: combos([[2, 2.5, 3, 3.5, 4], [0.8, 1, 1.2, 1.5]], archParts) }],
  questions: {
    centroid: {
      instruction: "The window is symmetric, so $\\bar{x}$ is on its centre line. Predict $\\bar{y}$, measured up from O.",
      ask: [{ quantity: "ybar", precision: 0.01 }],
      hints: [
        "A half circle's area is $\\tfrac{1}{2}\\pi r^2$; its centroid is $\\tfrac{4r}{3\\pi}$ from its flat edge (not halfway out).",
        "The half circle sits on the rectangle: $\\tilde{y}_2$ = the rectangle's height + $\\tfrac{4r}{3\\pi}$.",
        "$\\bar{y} = \\Sigma \\tilde{y} A / \\Sigma A$.",
      ],
    },
  },
});

export const bracket = scenario({
  name: "bracket",
  story: "A bracket is made of a heavy steel base plate (part 1) and a lighter upright (part 2) welded to its left end. Their masses are marked.",
  setup: { weigh: true, parts: [rect("1", [0, 0], 2, 0.5, { mass: 30 }), rect("2", [0, 0.5], 0.5, 1.5, { mass: 10 })] },
  view: { xmin: -1.2, xmax: 2.8, ymin: -1.2, ymax: 2.4 },
  vary: [
    { path: "parts.0.mass", min: 20, max: 40, step: 2 },
    { path: "parts.1.mass", min: 6, max: 16, step: 2 },
  ],
  questions: {
    centroid: {
      instruction: "Predict the centre of gravity $G$: its coordinates $\\bar{x}$ and $\\bar{y}$, measured from O.",
      ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
      hints: [
        "Each part's weight $W = mg$ acts at its own centre (the middle of each rectangle).",
        "The weight acts at $\\bar{x} = \\dfrac{\\Sigma \\tilde{x} W}{\\Sigma W}$ — weigh each part by its WEIGHT, not its area.",
        "(The $g$ cancels: you can use the masses directly.)",
      ],
    },
  },
});

export const sign = scenario({
  name: "sign",
  story: "A shop sign is a rectangular board (part 1) with a triangular point on its right (part 2, its right angle at the board's corner) and a half circle on top (part 3).",
  setup: { parts: signParts(3, 2, 1.5, 1) },
  view: { xmin: -1.6, xmax: 6, ymin: -1.8, ymax: 3.8 },
  vary: [{ path: "parts", values: combos([[2.5, 3, 3.5], [1.5, 2], [1, 1.5, 2], [0.6, 0.8, 1]], signParts) }],
  questions: {},
});
