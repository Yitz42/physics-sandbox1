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
