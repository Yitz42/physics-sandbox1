// Unit 1.2, stage 3 — build: place the roller under a beam with two loads so neither support carries
// more than 700 N. Before Test the student works out both reactions for their design (goal.predict).
// B_y = (2P₁ + 5P₂)/x_B, A_y = P₁ + P₂ − B_y (library/method.js). Default P₁ = 600, P₂ = 400:
//   x_B = 5 m: B_y = 640, A_y = 360 ✓;  6 m: 533.3 / 466.7 ✓;  4.5 m: 711 ✗.
// Every version: at 6 m, B_y = (2P₁ + 5P₂)/6 ≤ (1400 + 2250)/6 = 608 N and A_y = (4P₁ + P₂)/6 ≤ (2800 + 450)/6
// = 542 N — a design always exists.
// Start: B at 2.5 m — B_y ≥ (800 + 1250)/2.5 = 820 N: over the limit in every version.

import { twoLoadBeam } from "../library/method.js";

export default {
  id: "solving-problems/3-build",
  challenge: "build",
  solver: "statics.rigidBody",
  title: "Place the Roller",
  mission: "Put the roller where neither support is overloaded — and prove it on paper.",
  instructions:
    "A beam pinned at A carries two loads. Each support can safely take at most **700 N**. Slide the roller B to a safe place, " +
    "then work out both reactions for your design (sketch, FBD, equations, solve) and press **Test**.",
  setup: { ...twoLoadBeam.setup, showReactions: "reveal" },
  view: twoLoadBeam.view,
  vary: twoLoadBeam.vary,
  editable: [{ path: "supports.#B.at.0", label: "Roller B at", min: 1, max: 6, step: 0.5, unit: "m" }],
  goal: {
    text: "Neither support carries more than 700 N (and neither pulls).",
    predict: [{ quantity: "A_y" }, { quantity: "B_y" }],
    check(result) {
      const { A_y, B_y } = result.values;
      if (B_y > 700 + 1e-9) return { ok: false, message: `B carries ${B_y.toFixed(1)} N — too much. Move B further out, so its push has a longer arm about A.` };
      if (A_y > 700 + 1e-9) return { ok: false, message: `A carries ${A_y.toFixed(1)} N — too much. Move B closer to the loads' middle.` };
      if (A_y < -1e-9) return { ok: false, message: "A would have to pull the beam down — the beam tips about B. Move B further out." };
      return { ok: true, message: `Safe: A carries ${A_y.toFixed(1)} N and B ${B_y.toFixed(1)} N — and they add up to the loads, as they must.` };
    },
  },
  hints: [
    "FBD: $A_x$, $A_y$ at the pin, $B_y$ at the roller, $P_1$ and $P_2$ down.",
    "$\\Sigma M_A$: $B_y\\,x_B = 2P_1 + 5P_2$. The further out B is, the less it carries.",
    "Check: $A_y + B_y = P_1 + P_2$.",
  ],
  explanation:
    "Moving the roller changes how the beam shares its loads: a longer arm about A means B needs less force. " +
    "The check — the reactions add up to the loads — catches most slips.",
};
