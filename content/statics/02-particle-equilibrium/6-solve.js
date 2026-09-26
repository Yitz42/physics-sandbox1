// Unit 2, stage 6 — solve, in two parts, from FBD to answer: the hanging lamp,
// and a pulley on a cable.
// Part 2 hand check (default numbers): W = 294.3 N; T(sin60° + sin30°) = 294.3
// → T = 215.4 N; T_AD = T(cos30° − cos60°) = 78.9 N (tests/statics/particle.test.js).
// Part 1 hand check (default numbers): W = 20(9.81) = 196.2 N.
// ΣFx: −(4/5)T_AB + T_AC cos45° = 0;  ΣFy: (3/5)T_AB + T_AC sin45° − 196.2 = 0
// Adding (cos45° = sin45°): 1.4 T_AB = 196.2 → T_AB = 140.1 N, T_AC = 158.6 N.
// (Same numbers as the test in tests/statics/particle.test.js.)

import { pulleySetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "Hang It Up",
  parts: [
    {
      title: "The hanging lamp",
      instructions:
        "A lamp hangs from ring A. Cable AB rises on a 3-4-5 slope; cable AC is at an angle. Work through the full problem: FBD, equations, answers.",
      setup: {
        analysis: "equilibrium",
        point: { at: [0, 0], label: "A" },
        forces: [
          { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { slope: [-4, 3] }, anchor: { label: "B", length: 2.2 } },
          { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 45, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2 } },
          { id: "W", symbol: "W", kind: "weight", mass: 20, object: "lamp" },
        ],
      },
      vary: [
        { path: "forces.#T_AC.direction.angle", min: 30, max: 60, step: 1 },
        { path: "forces.#W.mass", min: 10, max: 40, step: 1 },
      ],
      solve: {
        steps: ["fbd", "equations", "answer"],
        // Forces offered in the palette. The last two don't act on A.
        candidates: [
          { id: "T_AB" },
          { id: "T_AC" },
          { id: "W", missing: "A force is missing. What does gravity do to the lamp hanging from A?" },
          { id: "N", symbol: "N", feedback: "There's no normal force: nothing is pressed against ring A. Normal forces come from surfaces in contact." },
          { id: "F_ceiling", symbol: "F_{ceiling}", feedback: "The ceiling doesn't touch A. Its effect reaches A only through the cables — that IS the tension." },
        ],
      },
      ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
      hints: [
        "Isolate ring A. What is attached to it? Two cables and the lamp.",
        "Cable AB's slope gives its components directly: $-\\tfrac{4}{5}T_{AB}$ in x, $+\\tfrac{3}{5}T_{AB}$ in y.",
        "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
      ],
      explanation:
        "The full method: (1) isolate the point and draw every force on it, (2) write $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ using components, " +
        "(3) solve the two equations for the two unknowns. A positive tension confirms the cable really is pulling.",
    },
    {
      title: "The pulley",
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
    },
  ],
  explanation:
    "The full method: (1) isolate the point and draw every force on it, (2) write $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ using components, (3) solve for the unknowns. A cable over a pulley counts twice, with one tension.",
};
