// Springs, stage 6 — solve: a lamp held by a spring and a cable, from FBD to answer.
// Hand check (default numbers): W = 15(9.81) = 147.15 N; spring AB on a 4-3 slope, cable AC at 45°.
//   ΣFx: −(4/5)F_AB + T_AC cos45° = 0;  ΣFy: (3/5)F_AB + T_AC sin45° − 147.15 = 0
//   Adding (cos45° = sin45°): 1.4 F_AB = 147.15 → F_AB = 105.11 N, T_AC = 118.92 N.
//   s = 105.11 / 500 = 0.2102 m, so the spring is l = 0.4 + 0.2102 = 0.610 m long.

export default {
  id: "springs/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "The Spring-Hung Lamp",
  mission: "Find the spring's force and length holding the lamp: FBD, equations, answers.",
  instructions:
    "A lamp hangs from ring A, held by spring AB (on a 3-4-5 slope; its stiffness and unstretched length are under the picture) and cable AC. " +
    "Work through the full problem: FBD, equations, then the cable tension and the spring's stretched length.",
  setup: {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      { id: "F_AB", symbol: "F_{AB}", kind: "spring", k: 500, unstretched: 0.4, magnitude: null, direction: { slope: [-4, 3] }, anchor: { label: "B", length: 2.2 } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 45, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2 } },
      { id: "W", symbol: "W", kind: "weight", mass: 15, object: "lamp" },
    ],
  },
  vary: [
    { path: "forces.#W.mass", min: 10, max: 30, step: 1 },
    { path: "forces.#F_AB.k", values: [400, 500, 600, 800, 1000] },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    candidates: [
      { id: "F_AB", missing: "A force is missing: the stretched spring pulls ring A toward B." },
      { id: "T_AC" },
      { id: "W", missing: "A force is missing. What does gravity do to the lamp hanging from A?" },
      { id: "k", symbol: "k", feedback: "$k$ is the spring's stiffness (N/m), not a force. The spring's force is $F_{AB}$." },
      { id: "N", symbol: "N", feedback: "There's no normal force: nothing is pressed against ring A." },
    ],
  },
  ask: [{ quantity: "T_AC", min: 0 }, { quantity: "F_AB.l", min: 0, precision: 0.01 }],
  hints: [
    "Isolate ring A: the spring pulls toward B, the cable toward C, and the lamp's weight pulls down.",
    "Spring AB's slope gives its components: $-\\tfrac{4}{5}F_{AB}$ in x, $+\\tfrac{3}{5}F_{AB}$ in y. Solve $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ for $F_{AB}$ and $T_{AC}$.",
    "Then the spring law: $s = F_{AB}/k$, and the spring's length is $l = l_0 + s$.",
  ],
  explanation:
    "Two steps, two ideas: equilibrium finds the spring's FORCE (it's just another unknown force on the FBD); the spring law then finds its STRETCH, $s = F/k$. " +
    "Its length is the unstretched length plus the stretch, $l = l_0 + s$.",
};
