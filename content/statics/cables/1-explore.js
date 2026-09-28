// Cables, stage 1 — explore: change cable angles and the crate's mass; watch the tensions.

import { crateSetup } from "../shared/crate.js";

export default {
  id: "cables/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Hang a Crate",
  mission: "Change the cable angles and see how the tensions keep ring A in balance.",
  instructions:
    "A crate hangs from ring A, held by two cables. On the left is the real setup (the **space diagram**); on the right is the **free-body diagram** of ring A. " +
    "Move the sliders and watch the tensions — the equations $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ are solved live.",
  setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 50 }),
  // Predict first (owner's choice, 2026-09-27): one quick guess before the numbers show.
  // (50 kg: T_AB = 359.1 N, T_AC = 439.8 N — the steeper cable pulls harder.)
  guess: {
    prompt: "AB is at 30° and AC at 45°. **Which cable pulls harder?**",
    options: [
      { text: "AB, the flatter one", feedback: "The steeper cable has the smaller cosine, so it must pull harder for the sideways pulls to cancel." },
      { text: "AC, the steeper one", correct: true },
      { text: "They pull equally", feedback: "Only when both cables make the same angle." },
      { text: "Each carries half the weight", feedback: "Slanted cables also pull against each other sideways, so each carries more than half." },
    ],
    explain: "$\\Sigma F_x = 0$: $T_{AB}\\cos 30^\\circ = T_{AC}\\cos 45^\\circ$ — the steeper cable pulls harder.",
  },
  editable: [
    { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 10, max: 80, step: 1, unit: "deg" },
    { path: "forces.#T_AC.direction.angle", label: "Angle of AC", min: 10, max: 80, step: 1, unit: "deg" },
    { path: "forces.#W.mass", label: "Crate mass", min: 10, max: 100, step: 5, unit: "kg" },
  ],
  tasks: [
    { text: "Make the two tensions equal.", check: (v) => Math.abs(v.T_AB - v.T_AC) < 0.5 },
    { text: "Make one cable pull harder than the whole weight $W$ of the crate.", check: (v) => Math.max(v.T_AB, v.T_AC) > v.W },
    { text: "Make $T_{AC}$ at least twice as big as $T_{AB}$.", check: (v) => v.T_AC >= 2 * v.T_AB },
  ],
  hints: [
    "Equal tensions happen when the picture is symmetric.",
    "Try making both cables nearly flat. What happens to the tensions?",
    "The steeper cable takes more of the load if the other one is flatter.",
  ],
  explanation:
    "Only the **vertical** parts of the tensions hold the crate up: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} = W$. " +
    "Flat cables have small $\\sin\\theta$, so the tensions must be huge — they can even exceed the weight. The horizontal parts just cancel each other.",
};
