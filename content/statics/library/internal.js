// library/internal.js — the lesson library's beams for internal forces (Units 7.1–7.3;
// see src/core/library.js). All are straight horizontal beams (solver statics.internal).
// Sign convention: N + tension; V + down on a left piece's cut face; M + concave up (a smile).
// Questions:
//   cut        predict N, V, M at the cut C  (view "cut")
//   diagram    predict the largest bending moment and where it is  (view "diagrams")
//   segments   predict one segment's V(x) or M(x) coefficients  (view "diagrams", 7.3)
// Hand checks:
//   shelf:      pin A (0), roller B (6), P = 1200 N at 2 m → A_y = 800, B_y = 400 N.
//               Cut at 4 m: V = 800 − 1200 = −400 N, M = 800(4) − 1200(2) = 800 N·m.  M_max = 1600 N·m at the load.
//   cantilever: fixed at A (0), 3 m, w = 400 N/m. Cut at 1 m, right piece (no reactions needed):
//               V = 400(2) = 800 N, M = −400(2)(1) = −800 N·m (hogging).  M_max = −1800 N·m at the wall.
//   overhang:   pin A (0), roller B (4), beam to 6 m, w = 300 N/m all along → A_y = 450, B_y = 1350 N.
//               Cut at 2 m: V = 450 − 600 = −150 N, M = 900 − 600 = 300 N·m.
//               M = 0 at x = 3 m (where it changes sign); M_max = −600 N·m over B (+337.5 at x = 1.5 m).
//   ramp load:  pin A (0), roller B (5), P = 1000 N at 3 m along slope 3 right, 4 down
//               → A_x = −600 N, A_y = 320 N, B_y = 480 N. Cut at 1.5 m: N = +600 N (tension), V = 320 N, M = 480 N·m.
//   balcony:    fixed at A (0), 4 m, w = 200 N/m and P = 800 N at the free end. Cut at 1.5 m, right piece:
//               V = 800 + 200(2.5) = 1300 N, M = −(800(2.5) + 200(2.5)²/2) = −2625 N·m.
//   half-loaded: pin A (0), roller B (6), w = 400 N/m on the first 3 m → A_y = 900, B_y = 300 N;
//               V = 0 at x = 900/400 = 2.25 m, M_max = 900(2.25) − 200(2.25)² = 1012.5 N·m.
//   uniform span: pin A (0), roller B (5), w = 400 N/m → M_max = wL²/8 = 1250 N·m at 2.5 m.

import { scenario } from "../../../src/core/library.js";

const pin = (id, x) => ({ id, type: "pin", at: [x, 0] });
const roller = (id, x) => ({ id, type: "roller", at: [x, 0] });
const fixed = (id, x) => ({ id, type: "fixed", at: [x, 0], normal: [1, 0] });
const body = (L) => ({ points: [[0, 0], [L, 0]] });

// The words every "cut" question shares.
const CUT_HINTS = [
  "Find the reactions first (the whole beam), unless the piece you keep has no support on it.",
  "Draw the kept piece with N, V and M on its cut face in their POSITIVE directions: N pulling, V down on a left piece (up on a right piece), M counterclockwise on a left piece.",
  "$\\Sigma F_y = 0$ gives V; $\\Sigma M_C = 0$ about the cut gives M. Only the part of a distributed load ON the piece counts — at its own centroid.",
];

export const shelf = scenario({
  name: "shelf beam",
  story: "A shelf beam rests on a pin at A and a roller at B and carries a point load $P$.",
  setup: { body: body(6), supports: [pin("A", 0), roller("B", 6)], forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0], push: true }], cut: 4, view: "cut", showReactions: "reveal" },
  vary: [
    { path: "forces.#P.magnitude", min: 900, max: 1500, step: 100 },
    { path: "forces.#P.at.0", values: [1.5, 2, 2.5] },
    { path: "cut", values: [3.5, 4, 4.5] },
  ],
  questions: {
    cut: {
      instruction: "It is cut at C. Predict the shear $V$ and bending moment $M$ at C (use the left piece).",
      ask: [{ quantity: "V" }, { quantity: "M" }],
      hints: CUT_HINTS,
    },
    diagram: {
      instruction: "Predict the largest bending moment in the beam, $M_{max}$.",
      ask: [{ quantity: "Mmax" }],
      hints: [
        "Between point loads V is constant, so M changes in straight lines: its peaks are at the loads and supports.",
        "M at the load = the area under the V diagram from A to the load: $A_y \\times a$.",
      ],
      explanation: "With only point loads, M is made of straight lines, so it peaks under a load: $M_{max} = A_y a$ — the area under V up to the load.",
    },
  },
});

export const cantileverCut = scenario({
  name: "cantilever with a uniform load",
  story: "A cantilever is built into a wall at A and carries a uniform load $w$ along its whole length.",
  setup: { body: body(3), supports: [fixed("A", 0)], loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400 }], cut: 1, keep: "right", view: "cut", showReactions: "reveal" },
  vary: [
    { path: "loads.#w.w", min: 300, max: 600, step: 50 },
    { paths: ["body.points.1.0", "loads.#w.to"], values: [2.5, 3, 3.5] },
    { path: "cut", values: [0.8, 1, 1.2, 1.5] },
  ],
  questions: {
    cut: {
      instruction: "It is cut at C. Predict $V$ and $M$ at C — keep the RIGHT piece: it has no support, so you don't need the wall's reactions.",
      ask: [{ quantity: "V" }, { quantity: "M" }],
      hints: [
        "The right piece carries only the load on it: $w$ times its length, acting at its middle.",
        "On a RIGHT piece's cut face, positive V points UP and positive M is clockwise.",
        "$\\Sigma M_C$: the load's resultant times half the piece's length — it bends the piece into a frown, so M is negative.",
      ],
    },
    diagram: {
      instruction: "Predict the largest bending moment, $M_{max}$ (with its sign).",
      ask: [{ quantity: "Mmax" }],
      hints: ["A cantilever's moment is biggest at the wall.", "The whole load, $wL$, acts at $L/2$ from the wall — and it bends the beam into a frown (negative)."],
    },
  },
});

export const overhangAll = scenario({
  name: "overhanging beam, loaded all along",
  story: "A beam rests on a pin at A and a roller at B and overhangs past B. A uniform load $w$ covers its whole length.",
  setup: { body: body(6), supports: [pin("A", 0), roller("B", 4)], loads: [{ id: "w", shape: "uniform", from: 0, to: 6, w: 300 }], cut: 2, view: "cut", showReactions: "reveal" },
  vary: [
    { path: "loads.#w.w", min: 200, max: 500, step: 25 },
    { path: "cut", values: [1.5, 2, 2.5, 3.5] },
  ],
  questions: {
    cut: {
      instruction: "It is cut at C. Predict $V$ and $M$ at C (use the left piece).",
      ask: [{ quantity: "V" }, { quantity: "M" }],
      hints: CUT_HINTS,
    },
    diagram: {
      instruction: "Predict the largest bending moment (the biggest in size, with its sign), $M_{max}$.",
      ask: [{ quantity: "Mmax" }],
      hints: [
        "There are two candidates: the positive peak in the span (where V = 0) and the negative moment over B.",
        "Over B, the overhang alone bends the beam into a frown: $M_B = -w\\,\\dfrac{c^2}{2}$ for an overhang of length c.",
        "Compare their sizes — the bigger one is $M_{max}$.",
      ],
    },
  },
});

export const rampLoad = scenario({
  name: "beam with a slanted load",
  story: "A beam on a pin at A and a roller at B is pushed by a slanted load $P$ — it pushes along the beam as well as down.",
  setup: { body: body(5), supports: [pin("A", 0), roller("B", 5)], forces: [{ id: "P", symbol: "P", magnitude: 1000, direction: { slope: [3, -4] }, at: [3, 0], push: true }], cut: 1.5, view: "cut", showReactions: "reveal" },
  vary: [
    { path: "forces.#P.magnitude", min: 600, max: 1400, step: 50 },
    { path: "cut", values: [1, 1.5, 2] },
  ],
  questions: {
    cut: {
      instruction: "It is cut at C. Predict the normal force $N$, the shear $V$ and the bending moment $M$ at C (use the left piece).",
      ask: [{ quantity: "N" }, { quantity: "V" }, { quantity: "M" }],
      hints: [
        "The pin at A holds the beam against the load's push along it: $A_x$ is found from $\\Sigma F_x = 0$ for the whole beam.",
        "On the left piece, N (pulling, to the right) balances $A_x$: $N + A_x = 0$.",
        "V and M come from $A_y$ as usual.",
      ],
    },
  },
});

export const balcony = scenario({
  name: "balcony beam",
  story: "A balcony beam is built into a wall at A. It carries a uniform load $w$ and a point load $P$ at its free end.",
  setup: {
    body: body(4), supports: [fixed("A", 0)],
    forces: [{ id: "P", symbol: "P", magnitude: 800, direction: "down", at: [4, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 4, w: 200 }],
    cut: 1.5, keep: "right", view: "cut", showReactions: "reveal",
  },
  vary: [
    { path: "forces.#P.magnitude", min: 500, max: 1100, step: 50 },
    { path: "loads.#w.w", values: [150, 200, 250, 300] },
    { path: "cut", values: [1, 1.5, 2] },
  ],
  questions: {},
});

export const halfLoaded = scenario({
  name: "half-loaded beam",
  story: "A beam on a pin at A and a roller at B carries a uniform load $w$ over its left half only.",
  setup: { body: body(6), supports: [pin("A", 0), roller("B", 6)], loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400 }], view: "diagrams", showReactions: "reveal" },
  vary: [
    { path: "loads.#w.w", min: 200, max: 600, step: 25 },
    { paths: ["loads.#w.to"], values: [2, 2.5, 3, 3.5] },
  ],
  questions: {
    diagram: {
      instruction: "Predict the largest bending moment $M_{max}$ and where it is, $x$ from A.",
      ask: [{ quantity: "Mmax" }, { quantity: "xM", precision: 0.01 }],
      hints: [
        "M peaks where V = 0 (dM/dx = V). Under the load, V falls steadily from $A_y$: $V = A_y - wx$.",
        "So V = 0 at $x = A_y / w$.",
        "$M_{max}$ = the area under V from A to there: a triangle, $\\tfrac{1}{2} A_y x$.",
      ],
    },
    segments: {
      instruction: "Write $M(x)$ for the loaded part, $0 < x < a$, as $M = c_1 x + c_2 x^2$: predict $c_1$ and $c_2$.",
      ask: [{ quantity: "M1_1", precision: 0.1 }, { quantity: "M2_1", precision: 0.1 }],
      hints: [
        "Cut at x inside the load and keep the left piece: $A_y$ up at A, and the load on the piece, $wx$, at $x/2$.",
        "$\\Sigma M$ about the cut: $M = A_y x - wx\\,\\dfrac{x}{2}$.",
        "So $c_1 = A_y$ and $c_2 = -w/2$.",
      ],
    },
  },
});

export const uniformSpan = scenario({
  name: "uniformly loaded span",
  story: "A beam on a pin at A and a roller at B carries a uniform load $w$ over its whole span.",
  setup: { body: body(5), supports: [pin("A", 0), roller("B", 5)], loads: [{ id: "w", shape: "uniform", from: 0, to: 5, w: 400 }], view: "diagrams", showReactions: "reveal" },
  vary: [
    { path: "loads.#w.w", min: 200, max: 700, step: 25 },
    { paths: ["body.points.1.0", "supports.#B.at.0", "loads.#w.to"], values: [4, 5, 6] },
  ],
  questions: {
    diagram: {
      instruction: "Predict the largest bending moment, $M_{max}$.",
      ask: [{ quantity: "Mmax" }],
      hints: ["By symmetry, V = 0 at the middle — that's where M peaks.", "$M_{max}$ = the area under V from A to the middle: $\\tfrac{1}{2}(\\tfrac{wL}{2})(\\tfrac{L}{2}) = \\tfrac{wL^2}{8}$."],
    },
    segments: {
      instruction: "Write $V(x) = c_0 + c_1 x$ for the whole span: predict $c_0$ and $c_1$.",
      ask: [{ quantity: "V0_1", precision: 0.1 }, { quantity: "V1_1", precision: 0.1 }],
      hints: ["Keep the left piece: $A_y$ up, and the load on it, $wx$, down.", "$V = A_y - wx$: $c_0 = A_y = wL/2$ and $c_1 = -w$."],
    },
  },
});

export const shelfSegments = scenario({
  name: "shelf beam, two segments",
  story: "A beam on a pin at A and a roller at B carries a point load $P$. V and M need a different equation on each side of the load.",
  setup: { body: body(6), supports: [pin("A", 0), roller("B", 6)], forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0], push: true }], view: "diagrams", showReactions: "reveal", showSegments: true },
  vary: [
    { path: "forces.#P.magnitude", min: 600, max: 1800, step: 100 },
    { path: "forces.#P.at.0", values: [1.5, 2, 2.5, 3, 4] },
  ],
  questions: {
    segments: {
      instruction: "Write $M(x) = c_0 + c_1 x$ for segment 2 (right of the load): predict $c_0$ and $c_1$.",
      ask: [{ quantity: "M0_2", precision: 0.1 }, { quantity: "M1_2", precision: 0.1 }],
      hints: [
        "Cut at x right of the load and keep the left piece: $A_y$ at A, and P at $x = a$.",
        "$M = A_y x - P(x - a)$ — P's arm is measured from where P acts.",
        "Multiply out: $c_0 = Pa$, $c_1 = A_y - P$.",
      ],
    },
  },
});

// triangle span: pin A (0), roller B (6), load rising from 0 at A to w₀ = 600 N/m at B
//   → 1800 N at 4 m: A_y = 600, B_y = 1200 N.  V = 600 − 50x² (w = 100x, its area 50x²),
//   M = 600x − 50x³/3;  V = 0 at x = √12 = 3.464 m, M_max = 1385.6 N·m.
export const triangleSpan = scenario({
  name: "triangle-loaded span",
  story: "A tank wall's support beam, on a pin at A and a roller at B, carries a load that grows steadily from zero at A to $w_0$ at B.",
  setup: { body: body(6), supports: [pin("A", 0), roller("B", 6)], loads: [{ id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "right" }], view: "diagrams", showReactions: "reveal" },
  vary: [
    { path: "loads.#w.w", min: 300, max: 900, step: 25 },
    { paths: ["body.points.1.0", "supports.#B.at.0", "loads.#w.to"], values: [5, 6] },
  ],
  questions: {
    segments: {
      instruction: "Write $V(x) = c_0 + c_2 x^2$: predict $c_0$ and $c_2$.",
      ask: [{ quantity: "V0_1", precision: 0.1 }, { quantity: "V2_1", precision: 0.01 }],
      hints: [
        "At x the load is $w = w_0 x / L$. The load on the left piece is a triangle: area $\\tfrac{1}{2} x \\cdot w_0 x / L$.",
        "$V = A_y - \\dfrac{w_0}{2L} x^2$.",
        "So $c_0 = A_y = w_0 L / 6$ and $c_2 = -w_0/(2L)$.",
      ],
    },
  },
});
