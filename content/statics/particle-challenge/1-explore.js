// Unit 3.5, stage 1 — explore: a 10 kg lamp hangs on cable AB (30° from vertical); the student
// chooses the direction of a pull P that holds it there, and watches P and T_AB.
// W = 98.1 N; u_AB = {−0.5 i + 0.866 j}. With P at φ above +x (hand-worked):
//   φ = 0° (level):     P = W tan 30° = 56.6 N,  T_AB = W / cos 30° = 113.3 N
//   φ = 15°:            T_AB = W = 98.1 N exactly (P = 50.8 N)
//   φ = 30° (P ⟂ AB):   P = W sin 30° = 49.05 N — the smallest — and T_AB = W cos 30° = 85.0 N
//   start φ = 50°:      P = 52.2 N, T_AB = 67.1 N (no task done).

import { angleOptions } from "../shared/angle-options.js";

export default {
  id: "particle-challenge/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Hold the Lamp Aside",
  mission: "Choose which way to pull the lamp aside, and find the pull that needs the least force.",
  instructions:
    "A lamp hangs from ring A on cable AB, held 30° from vertical by your pull $P$. You choose only the **direction** of $P$ (the slider and the dropdown); " +
    "equilibrium, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, then decides how hard you must pull and how hard the cable pulls. Watch both.",
  setup: {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: 30, from: "+y", toward: "-x" }, anchor: { label: "B", length: 2.2 } },
      { id: "P", symbol: "P", magnitude: null, direction: { angle: 50, from: "+x", toward: "+y" } },
      { id: "W", symbol: "W", kind: "weight", mass: 10, object: "lamp" },
    ],
  },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Which direction of P holds the lamp aside with the smallest pull?**",
    options: [
      { text: "At right angles to the cable", correct: true },
      { text: "Level (horizontal)", feedback: "Level works, but part of P then pulls along the cable, which doesn't help: 56.6 N instead of 49.1 N." },
      { text: "Straight up", feedback: "Then P lifts the whole lamp ($P = W$) and the cable goes slack." },
    ],
    explain: "The cable supplies any pull along itself; P only has to supply the part across it.",
  },
  editable: [
    { path: "forces.#P.direction.angle", label: "Angle of P", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.#P", "Angle of P measured", "A"),
  ],
  tasks: [
    { text: "Pull **level** (straight along +x). How hard must you pull?", check: (v) => v.P > 1 && Math.abs(v["P.y"]) < 0.01 && v["P.x"] > 1 },
    { text: "Find the direction that makes the cable pull exactly as hard as the lamp weighs: $T_{AB} = W$ (within 0.5 N).", check: (v) => v.P > 1 && Math.abs(v.T_AB - v.W) < 0.5 },
    { text: "Find the direction that needs the **smallest** pull $P$ (within 0.5 N of the smallest). What angle does it make with the cable?", check: (v) => v.P > 1 && v.P <= 49.05 + 0.5 },
    { text: "Pull a little **downward** (below level). What happens to $P$ and to $T_{AB}$?", check: (v) => v["P.y"] < -1 && v.P > 1 },
  ],
  hints: [
    "Only the part of $P$ ACROSS the cable holds the lamp aside; any part along the cable just changes the cable's tension.",
    "The smallest pull puts all of $P$ across the cable: at right angles to AB. What angle above +x is that?",
    "$T_{AB} = W$: then $\\mathbf{P} = \\mathbf{W}_{up} - T_{AB}\\,\\mathbf{u}_{AB}$ — try angles below 30°.",
  ],
  explanation:
    "It's Chapter 2's smallest-force idea inside an equilibrium problem: the cable can only pull along itself, so $P$ must supply whatever the cable can't. " +
    "The smallest $P$ is **perpendicular to the cable**: $P = W\\sin 30^\\circ$ = 49.05 N. Pulling level needs 56.6 N, and pulling downward needs more still — and loads the cable more, too.",
};
