// Cartesian vectors, stage 1 — explore: a cable from A to B. Move B and watch the
// position vector r_AB, the unit vector u_AB and the force F = {F_x i + F_y j} N.

export default {
  id: "cartesian-vectors/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "A Cable from A to B",
  instructions:
    "A cable pulls on the ring at A toward the anchor B. Its direction comes from the **coordinates** of A and B, not from an angle. " +
    "Move B with the sliders and watch the lines under the equations:\n\n" +
    "• the **position vector** $\\mathbf{r}_{AB} = (x_B - x_A)\\,\\mathbf{i} + (y_B - y_A)\\,\\mathbf{j}$, from A to B;\n\n" +
    "• its length $r_{AB}$, and the **unit vector** $\\mathbf{u}_{AB} = \\mathbf{r}_{AB} / r_{AB}$ (length 1, same direction);\n\n" +
    "• the force $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$, written as $\\{F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}\\}$ N.\n\n" +
    "Press **Numbers** above the equations to see them substituted.",
  setup: {
    analysis: "components",
    cartesian: true,
    point: { at: [1, 1], label: "A" },
    forces: [{ id: "F", symbol: "F", magnitude: 200, kind: "cable", direction: { points: [[1, 1], [5, 3]], names: ["A", "B"] } }],
  },
  editable: [
    { path: "forces.0.direction.points.1.0", label: "x of B", min: -3, max: 5, step: 0.5, unit: "m" },
    { path: "forces.0.direction.points.1.1", label: "y of B", min: -3, max: 5, step: 0.5, unit: "m" },
    { path: "forces.0.magnitude", label: "Size F", min: 50, max: 400, step: 10, unit: "N" },
  ],
  tasks: [
    { text: "Move B so that $\\mathbf{u}_{AB} = 0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$.", check: (v) => Math.abs(v["F.ux"] - 0.6) < 0.005 && Math.abs(v["F.uy"] - 0.8) < 0.005 },
    { text: "Make the cable pull straight up: $F_x = 0$.", check: (v) => Math.abs(v["F.rx"]) < 1e-9 && v["F.ry"] > 0 },
    { text: "Make the cable pull down and to the left (both parts of $\\mathbf{u}_{AB}$ negative).", check: (v) => v["F.ux"] < -0.01 && v["F.uy"] < -0.01 },
    { text: "Put B **4 m left** of A and **3 m above** it. What is $r_{AB}$?", check: (v) => Math.abs(v["F.rx"] + 4) < 1e-9 && Math.abs(v["F.ry"] - 3) < 1e-9 },
  ],
  hints: [
    "$\\mathbf{u}_{AB} = 0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$ means B is 3 across for every 4 up from A (a 3-4-5 triangle).",
    "A is at (1, 1). Going 3 m right and 4 m up from A lands on (4, 5); going 1.5 m right and 2 m up lands on (2.5, 3). Both work!",
    "B is below and to the left of A when $x_B < x_A$ and $y_B < y_A$.",
  ],
  explanation:
    "When a force acts along a cable, its direction is the direction from A to B: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$ (B's coordinates minus A's). " +
    "Dividing by the length makes the unit vector $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$, and then $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$. " +
    "Moving B further along the same line changes $\\mathbf{r}_{AB}$ but not $\\mathbf{u}_{AB}$, so the force stays the same.",
};
