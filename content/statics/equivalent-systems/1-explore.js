// Equivalent systems, stage 1 — explore: two loads on a beam and the single force that replaces them.
// Hand check (default numbers): F_R = 200 + 400 = 600 N down,
//   (M_R)_O = −(200·1 + 400·5) = −2200 N·m,  x̄ = 2200 / 600 = 3.67 m.

export default {
  id: "equivalent-systems/1-explore",
  challenge: "explore",
  solver: "statics.equivalent",
  title: "Slide the Loads",
  instructions:
    "Two loads push down on a beam. The dashed purple arrow is the **single force** that has exactly the same effect: the same total push $F_R$ and the same moment about O. " +
    "Change the loads and watch where it has to act.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [6, 0]] },
    forceScale: 1000, // arrows drawn 1 m per 1000 N
    hideArms: true,
    showResultant: true, // the single resultant force is shown all the time
    resultant: "single",
    resultantDimOffset: -0.45,
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 200, direction: "down", at: [1, 0], push: true },
      { id: "F2", symbol: "F_2", magnitude: 400, direction: "down", at: [5, 0], push: true },
    ],
  },
  view: { xmin: -0.6, xmax: 6.6, ymin: -1.0, ymax: 1.1 },
  editable: [
    { path: "forces.#F1.magnitude", label: "Size of F₁", min: 50, max: 800, step: 50, unit: "N" },
    { path: "forces.#F1.at.0", label: "F₁ at x", min: 0, max: 6, step: 0.25, unit: "m" },
    { path: "forces.#F2.magnitude", label: "Size of F₂", min: 50, max: 800, step: 50, unit: "N" },
    { path: "forces.#F2.at.0", label: "F₂ at x", min: 0, max: 6, step: 0.25, unit: "m" },
  ],
  tasks: [
    { text: "Make the resultant act at the middle of the beam: $\\bar{x} = 3$ m.", check: (v) => Math.abs(v.pos - 3) <= 0.02 },
    { text: "Make the resultant act closer to $F_1$ than to $F_2$.", check: (v, s) => Math.abs(v.pos - s.forces[0].at[0]) < Math.abs(v.pos - s.forces[1].at[0]) - 1e-9 },
    { text: "Make $F_R = 1000$ N.", check: (v) => Math.abs(v.R - 1000) <= 0.1 },
    { text: "Make the resultant act at the right-hand end: $\\bar{x} = 6$ m.", check: (v) => Math.abs(v.pos - 6) <= 0.02 },
  ],
  hints: [
    "The resultant sits closer to the bigger load: it's a weighted average of the positions.",
    "For two loads at the same spot, the resultant is right there too.",
    "$\\bar{x} = (F_1 x_1 + F_2 x_2) / (F_1 + F_2)$ for loads that all point the same way.",
  ],
  explanation:
    "The single equivalent force has the same size as all the loads together, $F_R = \\Sigma F$, and it acts where its own moment about O equals theirs: " +
    "$F_R\\,\\bar{x} = \\Sigma F x$. That's why it's drawn toward the heavier load, like a see-saw balancing point.",
};
