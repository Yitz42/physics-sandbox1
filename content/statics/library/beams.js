// library/beams.js — the lesson library's beams (see src/core/library.js):
// real beams on supports, each with its story, usual numbers and the
// questions it can be asked:
//   reactions  predict the support reactions (a predict stage)
//
// Hand checks (default numbers):
//   overhang:            pin A (0), roller B (4 m), w = 300 N/m on AB → F_w = 1200 N at 2 m; P = 400 N at 6 m.
//                        ΣM_A: 4B_y − 1200(2) − 400(6) = 0 → B_y = 1200 N;  ΣF_y → A_y = 400 N
//   overhang, end load:  the same beam with only P: ΣM_A: 4B_y − 400(6) = 0 → B_y = 600 N;
//                        ΣF_y: A_y + 600 − 400 = 0 → A_y = −200 N (A pulls DOWN: the beam would tip up at A)
//   cantilever:          fixed at A (0), w = 400 N/m over 3 m → F_w = 1200 N at 1.5 m; P = 500 N at 3 m.
//                        ΣF_y → A_y = 1700 N;  ΣM_A: M_A − 1200(1.5) − 500(3) = 0 → M_A = 3300 N·m (counterclockwise)
// (The same numbers as tests/statics/rigid-body.test.js.)

import { scenario, edit } from "../../../src/core/library.js";

// ---- A beam on a pin and a roller, overhanging past the roller ----------------------------
export const overhang = scenario({
  name: "overhang",
  story: "A beam rests on a pin at A and a roller at B, with a uniform load $w$ between them and a point load $P$ on the overhanging end.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [4, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 400, direction: "down", at: [6, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 4, w: 300, partSymbols: ["F_w"] }],
    showReactions: "reveal",
  },
  view: { xmin: -1.2, xmax: 7.2, ymin: -2.2, ymax: 2.6 },
  vary: [
    { path: "loads.#w.w", min: 200, max: 500, step: 50 },
    { path: "forces.#P.magnitude", min: 200, max: 600, step: 50 },
  ],
  questions: {
    reactions: {
      instruction: "Predict the vertical reactions. (Replace the distributed load by its resultant: its area, at its middle.)",
      ask: [{ quantity: "A_y" }, { quantity: "B_y", min: 0 }],
      hints: [
        "The distributed load's resultant is its area, $F_w = w \\times 4$ m, acting at the middle of AB.",
        "Moments about A: $A_x$ and $A_y$ drop out, leaving only $B_y$.",
        "Then $\\Sigma F_y = 0$ gives $A_y$. It could even come out negative — that just means it points down.",
      ],
    },
  },
});

// The same beam with only the load on its overhanging end: A has to hold the
// beam DOWN (a negative A_y), or the beam would tip up about B.
export const overhangEndLoad = edit(overhang, {
  name: "overhang, end load",
  story: "A beam rests on a pin at A and a roller at B. A point load $P$ hangs on its overhanging end, past B.",
  remove: ["loads.#w"],
  vary: [{ path: "forces.#P.at", values: [[5, 0], [5.5, 0], [6, 0]] }], // (and P's size, from the beam above)
  questions: {
    reactions: {
      instruction: "Predict the vertical reactions. (Think first: which way must A push or pull?)",
      hints: [
        "Moments about A: $A_x$ and $A_y$ drop out, leaving $B_y$ and $P$: $B_y(4) - P\\,x_P = 0$.",
        "$B_y$ comes out BIGGER than $P$: the roller carries more than the load, because the load is past it.",
        "Then $\\Sigma F_y = 0$: $A_y + B_y - P = 0$. $A_y$ comes out negative — the pin must hold the beam down, or it tips up about B.",
      ],
    },
  },
});

// ---- A cantilever built into a wall ---------------------------------------------------------
export const cantilever = scenario({
  name: "cantilever",
  story: "A cantilever beam is built into a wall at A. It carries a uniform load $w$ along its length and a load $P$ hangs from its tip.",
  setup: {
    body: { points: [[0, 0], [3, 0]] },
    supports: [{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }],
    // P hangs from the tip (drawn below the beam, clear of the distributed load's arrows).
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: "down", at: [3, 0] }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400, partSymbols: ["F_w"] }],
    showReactions: "reveal",
  },
  view: { xmin: -1.2, xmax: 4.2, ymin: -1.9, ymax: 2.2 },
  vary: [
    { path: "loads.#w.w", min: 200, max: 600, step: 50 },
    { path: "forces.#P.magnitude", min: 300, max: 900, step: 50 },
  ],
  questions: {
    reactions: {
      instruction: "Predict the wall's vertical reaction $A_y$ and its moment $M_A$ (counterclockwise positive).",
      ask: [{ quantity: "A_y" }, { quantity: "M_A" }],
      hints: [
        "A fixed support gives $A_x$, $A_y$ AND a moment $M_A$. With only vertical loads, $A_x = 0$.",
        "$\\Sigma F_y = 0$: $A_y$ holds up the whole load, $F_w + P$.",
        "Moments about A (where $A_x$ and $A_y$ act): $M_A$ must cancel the clockwise moments of $F_w$ (at 1.5 m) and $P$ (at 3 m).",
      ],
    },
  },
});

// ---- Bodies for choosing the three equations (Unit 4.3) ---------------------------------
// Slanted pushes, down and to the right, in every textbook form: slope triangles
// (3-4-5, 4-3-5, 5-12-13, 12-5-13, 1-1) and angles from either axis. A new version
// may use any of them. With c_x, c_y its right and down fractions (3-4-5: 3/5, 4/5):
export const DOWN_RIGHT = [
  { slope: [3, -4] }, { slope: [4, -3] }, { slope: [5, -12] }, { slope: [12, -5] }, { slope: [1, -1] },
  { angle: 60, from: "+x", toward: "-y" }, { angle: 30, from: "+x", toward: "-y" }, { angle: 20, from: "-y", toward: "+x" },
];
// Each has the set that gives ONE unknown per equation (withSet adds it to the setup).
export const withSet = (sc, sums, extra = {}) => edit(sc, { set: { sums, showSetUnknowns: true, ...extra } });

// A jib crane: a post from A (0, 0) up to (0, 3), an arm to its tip C (2.5, 3); a pin at A
// and a roller B on the wall at (0, 1.5), pushing the post left; the hoist's load P at C.
//   ΣM_A: 1.5B_x − 2.5P = 0 → B_x = 5P/3   (P = 800: 1333.3 N)   only B_x
//   ΣM_B: 1.5A_x − 2.5P = 0 → A_x = 5P/3   (1333.3 N, right)     only A_x (A_y's line runs through B)
//   ΣF_y: A_y − P = 0      → A_y = P       (800 N)               only A_y
// (ΣF_x instead of ΣF_y fails: A and B are straight above each other.)
export const jibCrane = scenario({
  name: "jib crane",
  story: "A jib crane's post stands on a pin at A and leans against a roller at B, 1.5 m up the wall. The hoist hangs a load $P$ from the arm's tip C.",
  setup: {
    body: { points: [[0, 0], [0, 3], [2.5, 3]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [0, 1.5], normal: [-1, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 800, direction: "down", at: [2.5, 3] }],
    points: { C: [2.5, 3], D: [0, 3] },
    dims: [
      { from: [-0.9, 0], to: [-0.9, 1.5], label: "1.5 m" },
      { from: [0, 3.6], to: [2.5, 3.6] },
    ],
    showReactions: "reveal",
  },
  view: { xmin: -2, xmax: 4.4, ymin: -1, ymax: 4.3 },
  vary: [{ path: "forces.#P.magnitude", min: 500, max: 1200, step: 25 }],
  questions: {
    reactions: {
      instruction: "Take moments about A, then about B, then add up the vertical forces: predict $B_x$, $A_x$ and $A_y$ ($A_x$, $A_y$ positive right and up).",
      ask: [{ quantity: "B_x", min: 0 }, { quantity: "A_x" }, { quantity: "A_y" }],
      hints: [
        "About A, both of the pin's reactions drop out: $\\Sigma M_A$ holds only $B_x$ (1.5 m up) and $P$ (2.5 m out).",
        "About B, $B_x$ drops out — and so does $A_y$, whose line (straight up through A) passes through B. Only $A_x$ is left, 1.5 m below B.",
        "$\\Sigma F_y = 0$: only $A_y$ and $P$ are vertical.",
      ],
    },
  },
});

// A beam on a pin A (0) and a roller B (5 m), pushed at C (x = 3 m) by a slanted P, down and to the right
// (c_x P right, c_y P down; the default 3-4-5 slope: c_x = 3/5, c_y = 4/5).
//   ΣM_A: 5B_y − x c_y P = 0      → B_y = x c_y P/5        (3-4-5, P = 500: 240 N)        only B_y
//   ΣM_B: −5A_y + (5 − x) c_y P = 0 → A_y = (5 − x) c_y P/5 (160 N)                        only A_y
//   ΣF_x: A_x + c_x P = 0          → A_x = −c_x P           (−300 N: A pulls LEFT)         only A_x
// (ΣF_y instead of ΣF_x fails: A and B are level with each other.)
export const slantedBeam = scenario({
  name: "slanted push",
  story: "A beam rests on a pin at A and a roller at B. A slanted push $P$, down and to the right, acts at C.",
  setup: {
    body: { points: [[0, 0], [5, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [5, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: { slope: [3, -4] }, at: [3, 0], push: true }],
    showReactions: "reveal",
  },
  view: { xmin: -1.4, xmax: 6.4, ymin: -2.6, ymax: 2.8 },
  vary: [
    { path: "forces.#P.magnitude", min: 200, max: 900, step: 25 },
    { path: "forces.#P.at.0", values: [1, 1.5, 2, 2.5, 3, 3.5, 4] },
    { path: "forces.#P.direction", values: DOWN_RIGHT },
  ],
  questions: {
    reactions: {
      instruction: "Use $\\Sigma M_A$, $\\Sigma M_B$ and $\\Sigma F_x$ — one unknown each — to predict $B_y$, $A_y$ and $A_x$ (positive up and right).",
      ask: [{ quantity: "B_y", min: 0 }, { quantity: "A_y" }, { quantity: "A_x" }],
      hints: [
        "Split $P$ first, using its slope triangle or angle: a part to the right and a part down. Only the down part has a moment about A or B (the sideways part runs along the beam).",
        "$\\Sigma M_A$: $B_y$ times 5 m against the down part times C's distance from A. $\\Sigma M_B$: the same idea from the other end gives $A_y$.",
        "$\\Sigma F_x$: only $A_x$ and $P$'s sideways part. $A_x$ comes out negative — the pin pulls left.",
      ],
    },
  },
});

// A beam on a pin A (0, 0) and a roller B (4, 0) against a 60° ramp: the roller pushes along
// n = (−sin 60°, cos 60°), up and to the left. The load P hangs at x (2 m).
// The roller's line crosses the vertical through A at E = (0, 4 tan 30°) = (0, 2.309).
//   ΣM_A: 4(½N_B) − xP = 0      → N_B = xP/2        (x = 2, P = 1000: 1000 N)   only N_B
//   ΣM_B: −4A_y + (4 − x)P = 0  → A_y = (4 − x)P/4  (500 N)                    only A_y (A_x runs along AB)
//   ΣM_E: 2.309A_x − xP = 0     → A_x = xP/2.309    (866.0 N)                  only A_x (A_y and N_B pass through E)
export const rampBeam = scenario({
  name: "ramp roller",
  story: "A beam is pinned at A. Its other end rests on a roller B against a 60° ramp, so the roller pushes up and to the left. A load $P$ hangs from the beam.",
  setup: {
    body: { points: [[0, 0], [4, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      // (its push: 60° from straight up, toward −x — a textbook angle, so its parts read sin 60° and cos 60°)
      { id: "B", type: "roller", at: [4, 0], normal: [-Math.sin(Math.PI / 3), Math.cos(Math.PI / 3)], direction: { angle: 60, from: "+y", toward: "-x" } },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 1000, direction: "down", at: [2, 0] }],
    points: { C: [2, 0], D: [0, 2], E: [0, 4 * Math.tan(Math.PI / 6)] },
    showReactions: "reveal",
  },
  view: { xmin: -1.8, xmax: 5.6, ymin: -2.4, ymax: 3.4 },
  vary: [
    { path: "forces.#P.magnitude", min: 600, max: 1400, step: 20 },
    { path: "forces.#P.at.0", values: [1, 1.5, 2, 2.5, 3] },
  ],
  questions: {},
});

// A loading ramp: a beam on a pin A (0) and a roller B (4 m), a uniform load w on AB,
// and a slanted push P (down and to the right: c_x P right, c_y P down) at its overhanging end C (6 m).
//   F_w = 4w at 2 m (w = 200: 800 N).  The default 3-4-5 slope, P = 500: 300 N right, 400 N down.
//   ΣM_A: 4B_y − 2F_w − 6 c_y P = 0  → B_y = (2F_w + 6c_yP)/4  (1600 + 2400)/4 = 1000 N   only B_y
//   ΣM_B: −4A_y + 2F_w − 2 c_y P = 0 → A_y = (2F_w − 2c_yP)/4  (1600 − 800)/4 = 200 N     only A_y
//   ΣF_x: A_x + c_x P = 0            → A_x = −c_x P            −300 N (the pin pulls left) only A_x
//   check ΣF_y: 200 + 1000 − 800 − 400 = 0 ✓
export const loadingRamp = scenario({
  name: "loading ramp",
  story: "A loading ramp rests on a pin at A and a roller at B. It carries a uniform load $w$ between them, and a cart pushes on its overhanging end C with a slanted force $P$.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [4, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: { slope: [3, -4] }, at: [6, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 4, w: 200, partSymbols: ["F_w"] }],
    points: { C: [6, 0] },
    showReactions: "reveal",
  },
  view: { xmin: -1.4, xmax: 7.6, ymin: -2.6, ymax: 2.8 },
  vary: [
    { path: "forces.#P.magnitude", min: 200, max: 800, step: 25 },
    { path: "loads.#w.w", min: 100, max: 400, step: 25 },
    { path: "forces.#P.direction", values: DOWN_RIGHT },
  ],
  questions: {},
});
