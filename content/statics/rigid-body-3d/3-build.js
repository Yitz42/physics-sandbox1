// Unit 5.6, stage 3 — build: choose the windlass's crank length so a worker can hold the load pushing
// no more than 150 N — with the shortest crank that does (within 0.05 m). Before Test: the push P for
// their crank (goal.predict). ΣM_y: W r = P a → P = W r / a (r: the drum's radius, a: the crank's length).
// Default 500 N, r = 0.1 m: a = 0.35 m → P = 142.9 N (0.30 m: 166.7 N — too hard).
// Every version (300–600 N, r 0.08–0.1 m): W r ≤ 60 N·m, so a = 0.4 m always works (the slider reaches 0.5).
// Start: a = 0.1 m — P ≥ 240 N in every version.

import { windlass } from "../library/rigid3d.js";

export default {
  id: "rigid-body-3d/3-build",
  challenge: "build",
  solver: "statics.force3d",
  title: "Size the Crank",
  mission: "Choose the shortest crank that lets a worker hold the load with at most 150 N.",
  instructions:
    "A worker holds a load on this windlass by pushing its crank handle level (along −x). They can push at most **150 N**. " +
    "Choose the crank's length — as short as possible (to within 0.05 m) — then work out the push it needs and press **Test**.",
  setup: { ...windlass.setup, points: { ...windlass.setup.points, C: [0, 1.3, 0.1] }, keepInView: [[0, 1.3, 0.55]] },
  vary: [
    { path: "forces.#W.magnitude", min: 300, max: 600, step: 15 },
    { path: "points.H.0", values: [0.08, 0.09, 0.1] },
  ],
  editable: [{ path: "points.C.2", label: "Crank length", min: 0.1, max: 0.5, step: 0.05, unit: "m" }],
  goal: {
    text: "The push is at most 150 N — with the shortest crank that manages it.",
    predict: [{ quantity: "P" }],
    check(result, setup) {
      const P = result.values.P, a = setup.points.C[2];
      if (P > 150 + 1e-9) return { ok: false, message: `Too hard: ${P.toFixed(1)} N. A longer crank gives the push a longer arm about the shaft.` };
      const shorter = (P * a) / (a - 0.05);
      if (a - 0.05 > 1e-9 && shorter <= 150 + 1e-9) return { ok: false, message: `That works, but a crank 0.05 m shorter would too (${shorter.toFixed(1)} N). Keep the windlass compact.` };
      return { ok: true, message: `A ${a.toFixed(2)} m crank needs ${P.toFixed(1)} N — the shortest that stays within 150 N.` };
    },
  },
  hints: [
    "Only moments about the shaft (the y axis) involve P: the bearings' reactions all pass through the shaft.",
    "The load's arm about the shaft is the drum's radius; the push's arm is the crank's length.",
    "$W r = P a$, so $P = W r / a$. Try lengths until P just drops below 150 N.",
  ],
  explanation:
    "About the shaft's axis every bearing reaction drops out: the load's moment $W r$ must equal the push's $P a$. " +
    "A longer crank means less push — the same trade every lever makes, in 3D.",
};
