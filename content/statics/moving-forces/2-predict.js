// Moving a force, stage 2 — predict: one force on a bracket moved to the bolt O.
// Hand check (default numbers): F = 250 N at 40° below +x at A (0.8, 0.6):
//   F_x = 191.5 N, F_y = −160.7 N; (M_R)_O = 0.8(−160.7) − 0.6(191.5) = −243.5 N·m.

export default {
  id: "moving-forces/2-predict",
  challenge: "predict",
  solver: "statics.equivalent",
  title: "Move a Force to the Bolt",
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
};
