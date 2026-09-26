// Unit 2, stage 6 — solve: the hanging lamp, from FBD to answer.
// Hand check (default numbers): W = 20(9.81) = 196.2 N.
// ΣFx: −(4/5)T_AB + T_AC cos45° = 0;  ΣFy: (3/5)T_AB + T_AC sin45° − 196.2 = 0
// Adding (cos45° = sin45°): 1.4 T_AB = 196.2 → T_AB = 140.1 N, T_AC = 158.6 N.
// (Same numbers as the test in tests/statics/particle.test.js.)

export default {
  id: "02-particle-equilibrium/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "The Hanging Lamp",
  instructions:
    "A lamp hangs from ring A. Cable AB rises on a 3-4-5 slope; cable AC is at an angle. Work through the full problem: FBD, equations, answers.",
  setup: {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { slope: [-4, 3] }, anchor: { label: "B", length: 2.2 } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 45, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2 } },
      { id: "W", symbol: "W", kind: "weight", mass: 20 },
    ],
  },
  vary: [
    { path: "forces.#T_AC.direction.angle", values: [30, 35, 40, 45, 50, 55, 60] },
    { path: "forces.#W.mass", min: 10, max: 40, step: 2 },
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
  ask: [{ quantity: "T_AB" }, { quantity: "T_AC" }],
  hints: [
    "Isolate ring A. What is attached to it? Two cables and the lamp.",
    "Cable AB's slope gives its components directly: $-\\tfrac{4}{5}T_{AB}$ in x, $+\\tfrac{3}{5}T_{AB}$ in y.",
    "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
  ],
  explanation:
    "The full method: (1) isolate the point and draw every force on it, (2) write $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ using components, " +
    "(3) solve the two equations for the two unknowns. A positive tension confirms the cable really is pulling.",
};
