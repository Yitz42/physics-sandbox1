// library/backwards.js — the lesson library's "working backwards" situations in the
// plane (Unit 2.4, Chapter 2 challenge): the resultant is KNOWN (setup.target, drawn
// green and named) and the sizes of two forces are not. Two equations,
//   F_Rx = ΣF_x   and   F_Ry = ΣF_y,
// find the two unknown sizes (src/subjects/statics/particle.js).
// Questions:
//   sizes      find the two unknown sizes
// Hand checks (default numbers):
//   hook, u and v: F = 500 N at 40° above +x; u is 20° below +x, v is 30° left of +y
//            (120° from +x). Law of sines in the parallelogram: the angle between u and v
//            is 140°, between F and v 80°, between F and u 60°, so
//            F_u = 500 sin 80° / sin 140° = 766.0 N,  F_v = 500 sin 60° / sin 140° = 673.6 N
//            (both BIGGER than F). The projections would be 500 cos 60° = 250 N and
//            500 cos 80° = 86.8 N — the classic wrong answer.
//            Every version (F 300–700 N, F at 30°–50°, u 10°–25° below +x, v 20°–35° left
//            of +y) keeps F between u and v, so both sizes are positive (smallest 222.7 N).
//   boat ropes: A (1, 2), B (3, 3.5), C (7, −0.5): r_AB = {2 i + 1.5 j} m (2.5 m),
//            r_AC = {6 i − 2.5 j} m (6.5 m); F_R = 600 N along +x:
//            0.8 T_AB + (12/13) T_AC = 600 and 0.6 T_AB − (5/13) T_AC = 0
//            → T_AB = 267.9 N, T_AC = 417.9 N.  (B (2.5, 4): T_AB = 238.1 N, T_AC = 495.2 N;
//            B (4, 4): T_AB = 277.4 N, T_AC = 400.0 N — all pull, at every F_R.)
//   sign hook: A (3, 1); F_1 = 400 N at 20° left of +y: {−136.8 i + 375.9 j} N; rope to
//            B (−1, 4): u_AB = {−0.8 i + 0.6 j}; chain F_3 along a 12-5 slope:
//            {(12/13) i + (5/13) j}; F_R = 900 N straight up:
//            −136.8 − 0.8 T_AB + (12/13) F_3 = 0 and 375.9 + 0.6 T_AB + (5/13) F_3 = 900
//            → T_AB = 500.5 N, F_3 = 582.0 N. Every version (F_1 300–500 N at 15°–30°,
//            F_R 800–950 N) keeps both positive (smallest 277.3 N).
// (The same numbers are tested in tests/statics/particle.test.js.)

import { scenario } from "../../../src/core/library.js";

export const hookUV = scenario({
  name: "hook, components along u and v",
  story: "The green force $F$ on the hook is to be replaced by two forces along the lines u and v (the orange arrows) — its **components along u and v**. The lines u and v are NOT at right angles.",
  setup: {
    analysis: "resultant",
    point: { at: [0, 0], label: "", object: "eyebolt" },
    forces: [
      { id: "F_u", symbol: "F_u", magnitude: null, direction: { angle: 20, from: "+x", toward: "-y" } },
      { id: "F_v", symbol: "F_v", magnitude: null, direction: { angle: 30, from: "+y", toward: "-x" } },
    ],
    target: { symbol: "F", magnitude: 500, direction: { angle: 40, from: "+x", toward: "+y" } },
  },
  vary: [
    { path: "target.magnitude", min: 300, max: 700, step: 50 },
    { path: "target.direction.angle", values: [30, 35, 40, 45, 50] },
    { path: "forces.#F_u.direction.angle", values: [10, 15, 20, 25] },
    { path: "forces.#F_v.direction.angle", values: [20, 25, 30, 35] },
  ],
  questions: {
    sizes: {
      instruction: "Find the sizes of $F_u$ and $F_v$, so that together they make exactly $F$.",
      ask: [{ quantity: "F_u", min: 0 }, { quantity: "F_v", min: 0 }],
      hints: [
        "The two components must ADD UP to $F$: $F_{Rx} = F_u(\\ldots) + F_v(\\ldots) = F_x$, and the same in y.",
        "Write $F$'s own components first. Then each unknown's components, with $\\cos$ along the axis its angle is measured from.",
        "Two equations, two unknowns: solve them together (or use the law of sines on the parallelogram). A component along a slanted axis CAN be bigger than $F$.",
      ],
    },
  },
});

export const boatRopes = scenario({
  name: "boat pulled by two ropes",
  story: "Two ropes tied to the ring A on a boat's bow run to posts B and C on the dock (coordinates in m). To glide into its berth, the boat must be pulled **straight along +x** by a resultant $F_R$ (green).",
  setup: {
    analysis: "resultant",
    point: { at: [1, 2], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", magnitude: null, kind: "cable", direction: { points: [[1, 2], [3, 3.5]], names: ["A", "B"] } },
      { id: "T_AC", symbol: "T_{AC}", magnitude: null, kind: "cable", direction: { points: [[1, 2], [7, -0.5]], names: ["A", "C"] } },
    ],
    target: { symbol: "F_R", magnitude: 600, direction: "right" },
  },
  vary: [
    { path: "target.magnitude", min: 400, max: 900, step: 25 },
    { path: "forces.#T_AB.direction.points.1", values: [[3, 3.5], [2.5, 4], [4, 4]] },
  ],
  questions: {
    sizes: {
      instruction: "Find the rope tensions $T_{AB}$ and $T_{AC}$.",
      ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }],
      hints: [
        "Each rope's direction comes from coordinates: $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$ with $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$.",
        "The resultant is along +x, so $F_{Rx} = F_R$ and $F_{Ry} = 0$: the ropes' y-parts must cancel.",
        "Solve $F_{Ry} = 0$ for one tension in terms of the other, then put it into $F_{Rx} = F_R$.",
      ],
    },
  },
});

export const signHook = scenario({
  name: "sign lifted by three lines",
  story: "Three lines lift a heavy sign by its hook A: a crane rope pulls with $F_1$ (angle in the picture), a rope runs to the winch at B (coordinates in m), and a chain pulls along the 12-5 slope with $F_3$. The sign must rise **straight up**, so the resultant is $F_R$ (green), straight up.",
  setup: {
    analysis: "resultant",
    point: { at: [3, 1], label: "A" },
    forces: [
      { id: "F_1", symbol: "F_1", magnitude: 400, direction: { angle: 20, from: "+y", toward: "-x" } },
      { id: "T_AB", symbol: "T_{AB}", magnitude: null, kind: "cable", direction: { points: [[3, 1], [-1, 4]], names: ["A", "B"] } },
      { id: "F_3", symbol: "F_3", magnitude: null, direction: { slope: [12, 5] } },
    ],
    target: { symbol: "F_R", magnitude: 900, direction: "up" },
  },
  vary: [
    { path: "forces.#F_1.magnitude", min: 300, max: 500, step: 50 },
    { path: "forces.#F_1.direction.angle", values: [15, 20, 25, 30] },
    { path: "target.magnitude", min: 800, max: 950, step: 50 },
  ],
  questions: {
    sizes: {
      instruction: "Find the rope tension $T_{AB}$ and the chain force $F_3$.",
      ask: [{ quantity: "T_AB", min: 0 }, { quantity: "F_3", min: 0 }],
      hints: [
        "Three different ways of giving a direction: an angle (from which axis?), coordinates ($\\mathbf{r}_{AB}/r_{AB}$) and a slope triangle ($\\tfrac{12}{13}$, $\\tfrac{5}{13}$).",
        "The resultant is straight up: $F_{Rx} = 0$ and $F_{Ry} = F_R$.",
        "$F_{Rx} = 0$ ties $F_3$ to $T_{AB}$; put that into the y equation.",
      ],
    },
  },
});
