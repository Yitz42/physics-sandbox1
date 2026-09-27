// Unit 5, stage 2 — predict, in two parts:
//   1. the single resultant of three loads on a beam;
//   2. one force on a bracket moved to the bolt O: the force-couple system.
// Part 2 hand check (default numbers): F = 250 N at 40° below +x at A (0.8, 0.6):
//   F_x = 191.5 N, F_y = −160.7 N; (M_R)_O = 0.8(−160.7) − 0.6(191.5) = −243.5 N·m.
// Part 1 hand check (default numbers): F_R = 400 + 600 + 200 = 1200 N down,
//   (M_R)_O = −(400·1 + 600·3 + 200·5) = −3200 N·m,  x̄ = 3200 / 1200 = 2.67 m.

export default {
  id: "05-equivalent-systems/2-predict",
  challenge: "predict",
  solver: "statics.equivalent",
  title: "Replace the Loads",
  parts: [
    {
      title: "Where does the resultant act?",
      instructions:
        "Replace the three loads with **one** force that has the same effect on the beam. How big is it, and how far from O must it act? Predict both, then press **Test**.",
      setup: {
        analysis: "equivalent",
        about: { at: [0, 0], label: "O" },
        body: { points: [[0, 0], [6, 0]] },
        arrowFraction: 0.15,
        hideArms: true,
        resultant: "single",
        resultantDimOffset: -0.65,
        forces: [
          { id: "F1", symbol: "F_1", magnitude: 400, direction: "down", at: [1, 0], push: true },
          { id: "F2", symbol: "F_2", magnitude: 600, direction: "down", at: [3, 0], push: true },
          { id: "F3", symbol: "F_3", magnitude: 200, direction: "down", at: [5, 0], push: true },
        ],
        dims: [
          { from: [0, -0.3], to: [1, -0.3] },
          { from: [1, -0.3], to: [3, -0.3] },
          { from: [3, -0.3], to: [5, -0.3] },
          { from: [5, -0.3], to: [6, -0.3] },
        ],
      },
      view: { xmin: -0.6, xmax: 6.6, ymin: -1.1, ymax: 1.3 },
      vary: [
        { path: "forces.#F1.magnitude", min: 100, max: 800, step: 50 },
        { path: "forces.#F2.magnitude", min: 100, max: 800, step: 50 },
        { path: "forces.#F3.magnitude", min: 100, max: 800, step: 50 },
      ],
      ask: [{ quantity: "R", min: 0 }, { quantity: "pos", precision: 0.01, min: 0, max: 6 }],
      hints: [
        "The single force must push as hard as all three together: $F_R = \\Sigma F$.",
        "It must also turn the beam about O as much as they do: add up each load's moment $F x$ about O.",
        "Then $F_R\\,\\bar{x} = \\Sigma F x$, so $\\bar{x} = \\Sigma F x \\,/\\, F_R$.",
      ],
      explanation:
        "Two systems are equivalent when they push the same (same $F_R$) and turn the same about any point (same moment). " +
        "So $F_R = \\Sigma F$, and its moment about O, $F_R\\,\\bar{x}$, must equal the loads' total moment $\\Sigma F x$. " +
        "The resultant ends up nearer the heavier loads.",
    },
    {
      title: "Move a force to the bolt",
      instructions:
        "The bracket is bolted to the floor at O. Replace the force $F$ at A by an equivalent **force-couple system at O**: a force $F_R$ at O plus a couple moment $(M_R)_O$. " +
        "Predict both (counterclockwise positive), then press **Test**.",
      setup: {
        analysis: "equivalent",
        about: { at: [0, 0], label: "O" },
        body: { points: [[0, 0], [0, 0.6], [0.8, 0.6]] }, // an L-shaped bracket
        arrowFraction: 0.3,
        resultant: "at O",
        line: false, // a force-couple system at O: no single-force position x̄
        forces: [{ id: "F", symbol: "F", magnitude: 250, direction: { angle: 40, from: "+x", toward: "-y" }, at: [0.8, 0.6], pointLabel: "A" }],
        dims: [
          { from: [0, -0.12], to: [0.8, -0.12] },
          { from: [-0.32, 0], to: [-0.32, 0.6], side: -1 },
        ],
      },
      view: { xmin: -0.5, xmax: 1.4, ymin: -0.45, ymax: 1.05 },
      vary: [
        { path: "forces.0.magnitude", min: 100, max: 400, step: 10 },
        { path: "forces.0.direction", values: [{ from: "+x", toward: "-y" }, { from: "-y", toward: "+x" }, { from: "+x", toward: "+y" }] },
        { path: "forces.0.direction.angle", values: [20, 30, 40, 50, 60] },
      ],
      ask: [{ quantity: "R", min: 0 }, { quantity: "M" }],
      hints: [
        "Moving a force doesn't change the force itself: $F_R = F$, same size, same direction.",
        "The couple is the moment $F$ had about O: $(M_R)_O = xF_y - yF_x$ with A's coordinates (Varignon), or $Fd$.",
        "Signs: counterclockwise positive. A force pushing down on the right of O turns clockwise; one pushing right above O does too.",
      ],
      explanation:
        "The force-couple system at O is the same force, $F_R = F$, plus a couple equal to $F$'s moment about O: $(M_R)_O = M_O(F)$. " +
        "This is what the bolt at O actually has to resist — a push AND a twist.",
    },
  ],
  explanation:
    "Equivalent systems push the same and turn the same. Moving a force to a new point needs a couple equal to its moment about that point; several loads can become one force placed at $\\bar{x} = \\Sigma F x / F_R$.",
};
