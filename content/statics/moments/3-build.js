// Moment of a force, stage 3 — build: place three boxes so the plank balances the adult.
// Hand-worked solution (one of many): 10 kg at 0 m, 20 kg at 1.5 m, 30 kg at 1 m:
//   ΣM_O = 9.81·[60(1) − 10(0) − 20(1.5) − 30(1)] = 0 ✓, boxes 0.5 m or more apart ✓

const G = 9.81;
const LIMIT = 2; // N·m, "balanced" means |ΣM_O| ≤ 2 N·m
const GAP = 0.5; // m, boxes can't share a spot
const BOXES = ["B10", "B20", "B30"];

export default {
  id: "moments/3-build",
  challenge: "build",
  solver: "statics.moment",
  title: "Balance the Plank",
  instructions:
    "A 60 kg adult sits 1 m left of the pivot. Place the three boxes (10, 20 and 30 kg) on the plank so it balances. " +
    "Boxes can go on either side, but need at least 0.5 m between them. Press **Test** to see if it balances.",
  setup: {
    analysis: "moment",
    about: { at: [0, 0], label: "O", pivot: true },
    arrowFraction: 0.22, // weights drawn shorter on this long plank
    boxSize: 0.42, // narrower than the 0.5 m spacing, so boxes never overlap
    hideArms: true,
    body: { points: [[-3, 0], [3, 0]] },
    forces: [
      { id: "W_P", symbol: "W_P", kind: "weight", mass: 60, at: [-1, 0] },
      { id: "B10", symbol: "W_{10}", kind: "weight", mass: 10, at: [0.5, 0] },
      { id: "B20", symbol: "W_{20}", kind: "weight", mass: 20, at: [1, 0] },
      { id: "B30", symbol: "W_{30}", kind: "weight", mass: 30, at: [1.5, 0] },
    ],
    dims: [{ force: "W_P", offset: -0.45 }],
  },
  editable: [
    { path: "forces.#B10.at.0", label: "10 kg box at x", min: -3, max: 3, step: 0.05, unit: "m" },
    { path: "forces.#B20.at.0", label: "20 kg box at x", min: -3, max: 3, step: 0.05, unit: "m" },
    { path: "forces.#B30.at.0", label: "30 kg box at x", min: -3, max: 3, step: 0.05, unit: "m" },
  ],
  goal: {
    text: `Balance the plank: $|\\Sigma M_O| \\le ${LIMIT}$ N·m, with the boxes at least ${GAP} m apart.`,
    check(result, setup) {
      const xs = BOXES.map((id) => setup.forces.find((f) => f.id === id).at[0]);
      for (let i = 0; i < xs.length; i++) {
        for (let j = i + 1; j < xs.length; j++) {
          if (Math.abs(xs[i] - xs[j]) < GAP - 1e-9) return { ok: false, message: "Two boxes are too close together — they need at least 0.5 m between them." };
        }
      }
      const M = result.values.M;
      if (Math.abs(M) <= LIMIT) return { ok: true, message: `$\\Sigma M_O = ${M.toFixed(1)}$ N·m — balanced!` };
      const way = M > 0 ? "counterclockwise: the adult's side goes down" : "clockwise: the boxes' side goes down";
      return { ok: false, message: `$\\Sigma M_O = ${M.toFixed(1)}$ N·m — it tips ${way}. You need ${Math.abs(M / G).toFixed(1)} kg·m ${M > 0 ? "more" : "less"} on the right.` };
    },
  },
  hints: [
    "Each weight's moment about O is $mg \\times$ (its distance from O). Left of O is counterclockwise (+), right is clockwise (−).",
    "The adult gives $60 \\times 1 = 60$ kg·m on the left. The boxes must give 60 kg·m on the right.",
    "Try the 30 kg box at 1 m and the 20 kg box at 1.5 m. Where can the 10 kg box go so it adds nothing?",
  ],
  explanation:
    "Balance means the moments about the pivot add to zero: $\\Sigma M_O = 0$. A box right on the pivot has no moment arm, so it doesn't matter. " +
    "A box on the adult's side helps the adult — its moment has the same sign.",
};
