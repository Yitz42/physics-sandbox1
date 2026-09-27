// Pulleys, stage 6 — solve, from FBD to answer.
// Hand check (default numbers): W = 294.3 N; T(sin60° + sin30°) = 294.3
// → T = 215.4 N; T_AD = T(cos30° − cos60°) = 78.9 N (tests/statics/particle.test.js).

import { pulleySetup } from "../shared/crate.js";

export default {
  id: "pulleys/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "The Pulley",
  mission: "Find the forces holding the pulley: FBD, equations, answers.",
  instructions:
    "A crate hangs from pulley A, which rides on cable BAC; rope AD holds the pulley in place. Work through the full problem: FBD of the pulley, equations, answers.",
  setup: pulleySetup({ angleAB: 60, angleAC: 30, mass: 30 }),
  vary: [
    { path: "forces.#T_AB.direction.angle", values: [50, 55, 60, 65, 70] },
    { path: "forces.#T_AC.direction.angle", values: [20, 25, 30, 35, 40] },
    { path: "forces.#W.mass", min: 10, max: 60, step: 1 },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    candidates: [
      { id: "T_AB", missing: "The cable pulls the pulley toward B as well as toward C: a cable over a pulley pulls on it twice." },
      { id: "T_AC", missing: "The cable pulls the pulley toward C as well as toward B: a cable over a pulley pulls on it twice." },
      { id: "T_AD", missing: "A force is missing. What is rope AD doing to the pulley?" },
      { id: "W", missing: "A force is missing. What does gravity do to the crate hanging from A?" },
      { id: "N", symbol: "N", feedback: "There's no normal force from a surface here. The pulley is only touched by the cable, the rope and the crate's hanger." },
    ],
  },
  ask: [{ quantity: "T", min: 0 }, { quantity: "T_AD", min: 0 }],
  hints: [
    "The pulley feels the cable on BOTH sides, each with tension $T$, plus rope AD and the crate's weight.",
    "$\\Sigma F_y = 0$ only has $T$ and $W$: $T(\\sin\\theta_{AB} + \\sin\\theta_{AC}) = W$.",
    "Then $\\Sigma F_x = 0$: $T_{AD} = T\\cos\\theta_{AC} - T\\cos\\theta_{AB}$.",
  ],
  explanation:
    "The pulley's FBD has four forces but only two unknowns, because both sides of the cable carry the same tension $T$. " +
    "$\\Sigma F_y = 0$ gives $T$ at once; $\\Sigma F_x = 0$ then gives the rope's pull $T_{AD}$.",
};
