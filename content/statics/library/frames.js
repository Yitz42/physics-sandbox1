// library/frames.js — the lesson library's frames (see src/core/library.js).
// Questions:
//   crossbar   predict the floor reaction B_y and the crossbar's force F_DE
//
// The A-frame (a stepladder): legs AC (A (0, 0), on a pin) and BC (B (4, 0), on a roller)
// pinned together at the top C (2, 4); a crossbar DE (a two-force member) joins the legs
// at height h (h = 2: D (1, 2), E (3, 2)). 2 bodies × 3 = 6 equations; unknowns A_x, A_y,
// B_y, C_x, C_y (on AC; reversed on BC) and F_DE: 6.
// Hand checks — leg BC, moments about C: B_y (2 m out, 4 m down), the crossbar's pull
// at E (4 − h m below C, pulling toward D):
//   Load P hanging from the top (on AC, at C): B_y = P/2 (whole frame, ΣM_A: 4B_y − 2P = 0).
//     BC, ΣM_C: 2B_y − (4 − h)F_DE = 0 → F_DE = P/(4 − h)   (h = 2: P/2; P = 1000: 500 N)
//     BC, ΣF_x: −C_x − F_DE = 0 → C_x = −F_DE;  ΣF_y: B_y − C_y = 0 → C_y = P/2
//   Load P hanging from leg AC at F (1.5, 3): ΣM_A: 4B_y − 1.5P = 0 → B_y = 0.375P;
//     BC, ΣM_C (h = 2): 2B_y − 2F_DE = 0 → F_DE = B_y = 0.375P   (P = 800: 300 N)
//     C_x = −0.375P, C_y = B_y = 0.375P

import { scenario } from "../../../src/core/library.js";

export function aFrame({ load = "top", P = 1000, h = 2 } = {}) {
  const force = load === "top"
    ? { id: "P", symbol: "P", magnitude: P, direction: "down", at: [2, 4], body: "AC" } // hanging from the top pin
    : { id: "P", symbol: "P", magnitude: P, direction: "down", at: [1.5, 3], body: "AC" };
  return {
    bodies: [{ id: "AC", points: [[0, 0], [2, 4]] }, { id: "BC", points: [[4, 0], [2, 4]] }],
    pins: [{ id: "C", at: [2, 4], bodies: ["AC", "BC"] }],
    links: [{ id: "DE", from: "D", to: "E", height: h, bodies: ["AC", "BC"] }],
    supports: [{ id: "A", type: "pin", at: [0, 0], body: "AC" }, { id: "B", type: "roller", at: [4, 0], body: "BC" }],
    forces: [force],
    apart: { AC: [-2.6, 0], BC: [2.6, 0] }, // (far enough that each leg's labels stay by it)
    showReactions: "reveal",
    showTwoForce: true,
    dims: [{ from: [0, -1], to: [4, -1] }, { from: [5, 0], to: [5, 4] }],
  };
}
export const A_FRAME_VIEW = { xmin: -4.4, xmax: 8.4, ymin: -2, ymax: 5.4 };

export const ladderTop = scenario({
  name: "load at the top",
  story: "A stepladder (an A-frame) stands with leg AC on a pin at A and leg BC on a roller at B; the legs are pinned together at the top C, and a crossbar DE joins them halfway up. A load $P$ hangs from the top, C.",
  setup: aFrame({ load: "top" }),
  view: A_FRAME_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 500, max: 1500, step: 20 }],
  questions: {
    crossbar: {
      instruction: "Predict the floor's push $B_y$ and the crossbar's force $F_{DE}$ (tension positive).",
      ask: [{ quantity: "B_y", min: 0 }, { quantity: "F_DE" }],
      hints: [
        "The whole ladder first: moments about A give $B_y$.",
        "Then take leg BC apart and take moments about C: the pin's two forces drop out, leaving $B_y$ and the crossbar's pull at E.",
        "The crossbar is a two-force member: its pull on BC is along DE, level, 2 m below C.",
      ],
    },
  },
});

export const ladderLeg = scenario({
  name: "load on a leg",
  story: "The same stepladder: legs AC and BC pinned together at C, on a pin at A and a roller at B, with a crossbar DE halfway up. This time a load $P$ hangs from leg AC at F, three-quarters of the way up.",
  setup: aFrame({ load: "leg", P: 800 }),
  view: A_FRAME_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 400, max: 1200, step: 10 }],
  questions: {
    crossbar: {
      instruction: "Predict the floor's push $B_y$ and the crossbar's force $F_{DE}$ (tension positive).",
      ask: [{ quantity: "B_y", min: 0 }, { quantity: "F_DE" }],
      hints: [
        "The whole ladder first: moments about A. $P$ acts 1.5 m from A, $B_y$ 4 m.",
        "Leg BC carries no load of its own: moments about C hold only $B_y$ and the crossbar's pull.",
        "$B_y$ is 2 m out from C, the crossbar 2 m below it: so here $F_{DE} = B_y$.",
      ],
    },
  },
});
