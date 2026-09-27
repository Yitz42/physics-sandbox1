// Unit 4.2, stage 3 — build: place the fulcrum of a diving board.
// The board (4 m, 30 kg → W = 294.3 N at 2 m) is pinned (bolted) at A (x = 0)
// and rests on a roller, the fulcrum B, at x = b. The diver stands at the tip (4 m).
//   ΣM_A: b·B_y − 294.3(2) − W_d(4) = 0 → B_y = (588.6 + 4W_d) / b
//   ΣF_y: A_y = W_d + 294.3 − B_y        (negative: the bolts pull the board DOWN)
// Limits: B_y ≤ 3000 N (fulcrum), |A_y| ≤ 1600 N (bolts), overhang 4 − b ≥ 2 m (spring).
// Hand-worked windows (b in 0.1 m steps):
//   W_d = 750 N: B_y ≤ 3000 → b ≥ 1.20; |A_y| ≤ 1600 → 3588.6/b ≤ 2644.3 → b ≥ 1.36; so b = 1.4 … 2.0 m
//   W_d = 900 N: b ≥ 1.40 and b ≥ 1.499 → b = 1.5 … 2.0 m;  W_d = 600 N: b ≥ 1.00 and b ≥ 1.204 → b = 1.3 … 2.0 m
// The extremes of the random numbers still leave a window:
//   40 kg board, 900 N diver: (784.8 + 3600)/b ≤ 3000 → b ≥ 1.47; B_y − 1292.4 ≤ 1600 → b ≥ 1.52 → b = 1.6 … 2.0 m
//   20 kg board, 600 N diver: b ≥ 0.94 and 2792.4/b ≤ 2396.2 → b ≥ 1.17 → b = 1.2 … 2.0 m

const FULCRUM = 3000; // N
const BOLTS = 1600; // N
const SPRING = 2; // m of board past the fulcrum

export default {
  id: "rigid-body-equilibrium/3-build",
  challenge: "build",
  solver: "statics.rigidBody",
  title: "Place the Fulcrum",
  mission: "Slide the fulcrum so neither support is overloaded and the board still springs.",
  instructions:
    "A diving board is bolted down at A and rests on a fulcrum (a roller) at B. Slide the fulcrum, work out both reactions for YOUR position on paper, then press **Test**. " +
    "($A_y$ is positive up; the bolts may have to pull the board down.)",
  setup: {
    body: { points: [[0, 0], [4, 0]], mass: 30 },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [2.8, 0] }, // starts too far out (only 1.2 m of spring): it must be moved
    ],
    forces: [{ id: "W_d", symbol: "W_d", magnitude: 750, direction: "down", at: [4, 0], push: true }],
    massLabel: { at: [1, 0.5], text: "board" },
  },
  view: { xmin: -1.1, xmax: 5.1, ymin: -3.1, ymax: 1.9 }, // room below for the reactions and the dimensions under them
  vary: [
    { path: "forces.#W_d.magnitude", min: 600, max: 900, step: 25 },
    { path: "body.mass", min: 20, max: 40, step: 5 },
  ],
  editable: [{ path: "supports.#B.at.0", label: "Fulcrum B at x", min: 0.5, max: 3.5, step: 0.1, unit: "m" }],
  goal: {
    text: `The fulcrum carries at most **${FULCRUM} N**, the bolts at A hold at most **${BOLTS} N** (up or down), and at least **${SPRING} m** of board sticks out past the fulcrum so it can spring.`,
    predict: [{ quantity: "B_y", min: 0 }, { quantity: "A_y" }],
    check(result, setup) {
      const b = setup.supports.find((s) => s.id === "B").at[0];
      const v = result.values;
      const problems = [];
      const flagged = [];
      if (v.B_y > FULCRUM + 1e-6) {
        flagged.push("B_y");
        problems.push(`The fulcrum carries ${v.B_y.toFixed(1)} N — over its ${FULCRUM} N rating. Moving it further out gives the board a longer lever against the diver.`);
      }
      if (Math.abs(v.A_y) > BOLTS + 1e-6) {
        flagged.push("A_y");
        problems.push(`The bolts at A must pull with ${Math.abs(v.A_y).toFixed(1)} N — over their ${BOLTS} N limit.`);
      }
      if (4 - b < SPRING - 1e-6) problems.push(`Only ${(4 - b).toFixed(1)} m of board sticks out past the fulcrum: the diver needs at least ${SPRING} m to spring.`);
      if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
      return { ok: true, message: `Fulcrum ${v.B_y.toFixed(1)} N, bolts ${Math.abs(v.A_y).toFixed(1)} N (pulling down), and ${(4 - b).toFixed(1)} m of spring. A safe board!` };
    },
  },
  hints: [
    "Moments about A: $B_y$ (at $b$) balances the board's weight (at 2 m) and the diver (at 4 m). So $B_y = (2W + 4W_d)/b$.",
    "Then $\\Sigma F_y = 0$: $A_y = W + W_d - B_y$. It comes out negative — the bolts hold the back of the board down.",
    "Moving the fulcrum out lowers both reactions, but shortens the springy part. Find the window that satisfies all three limits.",
  ],
  explanation:
    "The diver's weight has a long lever arm about A (4 m), the fulcrum a short one ($b$). So $B_y$ is several times the diver's weight, and the bolts must pull the back of the board down to balance it. " +
    "Moving the fulcrum out lengthens its lever arm and lowers both reactions, but leaves less board to spring. Engineering is finding the design that meets every limit at once.",
};
