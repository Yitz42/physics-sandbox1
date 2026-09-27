// Unit 6.2, stage 1 — explore: move and resize a hole in a plate and watch the centroid
// run away from it.
// Plate 4 × 3 (12 m², (2, 1.5)) with a round hole, radius r at (x_h, y_h):
//   A = 12 − πr²,  x̄ = (24 − πr² x_h)/A,  ȳ = (18 − πr² y_h)/A.
// Start: hole r = 0.5 at (1.2, 1.5): A = 11.215, x̄ = 2.056 m, ȳ = 1.5 m (no task done yet).
// Checks: hole at (3.1, 1.5), r = 0.8 → A = 9.989, x̄ = 1.779 m (< 1.85);
//         hole at (2, 2.1), r = 0.8 → ȳ = 1.379 m (< 1.4);  r ≥ 0.7 → A ≤ 10.46 m² (< 10.5);
//         hole at (2, 1.5), any r → C at the plate's middle (2, 1.5).
// Slider limits keep the hole inside the plate: x_h ± r within 0.1…3.9, y_h ± r within 0.1…2.9.

export default {
  id: "holes/1-explore",
  challenge: "explore",
  solver: "statics.centroid",
  title: "Drill a Hole",
  mission: "Move and resize a hole in a plate, and watch which way the centroid runs.",
  instructions:
    "A 4 m × 3 m plate (part 1) has a round hole (part 2) drilled through it. The ring is the plate's centroid C. " +
    "A hole is material taken away — so its area counts as **negative**. Move the hole around and watch C.",
  setup: {
    parts: [{ id: "1", shape: "rect", at: [0, 0], w: 4, h: 3 }, { id: "2", shape: "circle", at: [1.2, 1.5], r: 0.5, hole: true }],
    alwaysShowCentroid: true,
  },
  view: { xmin: -1.2, xmax: 4.6, ymin: -1.4, ymax: 3.6 },
  editable: [
    { path: "parts.1.at.0", label: "Hole across (x)", min: 0.9, max: 3.1, step: 0.1, unit: "m" },
    { path: "parts.1.at.1", label: "Hole up (y)", min: 0.9, max: 2.1, step: 0.1, unit: "m" },
    { path: "parts.1.r", label: "Hole radius", min: 0.2, max: 0.8, step: 0.05, unit: "m" },
  ],
  tasks: [
    { text: "Push C left of **x = 1.85 m**.", check: (v) => v.xbar < 1.85 },
    { text: "Lower C below **y = 1.4 m**.", check: (v) => v.ybar < 1.4 },
    { text: "Cut the plate's area below **10.5 m²**.", check: (v) => v.A < 10.5 },
    { text: "Put C back at the plate's middle, **(2 m, 1.5 m)**.", check: (v) => Math.abs(v.xbar - 2) < 0.005 && Math.abs(v.ybar - 1.5) < 0.005 },
  ],
  hints: [
    "C always moves AWAY from the hole: the material left behind is on the other side.",
    "A bigger hole moves C further: its negative area counts for more.",
    "A hole right in the middle takes away equal material on every side, so C stays in the middle.",
  ],
  explanation:
    "The hole is a part with negative area: $A = A_1 - A_2$ and $\\bar{x} = (\\tilde{x}_1 A_1 - \\tilde{x}_2 A_2)/(A_1 - A_2)$. " +
    "Taking material away from one side leaves more on the other, so the centroid moves away from the hole — further for a bigger hole, and not at all for a hole on a line of symmetry.",
};
