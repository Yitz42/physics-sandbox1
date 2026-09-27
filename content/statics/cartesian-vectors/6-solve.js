// Cartesian vectors, stage 6 — solve: the resultant of two cables given by coordinates.
// Hand check: r_AB = {−3 i + 4 j} m, r_AC = {4 i + 3 j} m (both 5 m), so
// T_AB = 300(−0.6 i + 0.8 j) = {−180 i + 240 j} N and T_AC = 250(0.8 i + 0.6 j)
// = {200 i + 150 j} N; F_R = {20 i + 390 j} N, F_R = 390.5 N, θ = 87.1°.

export default {
  id: "cartesian-vectors/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "Two Cables, in Cartesian Form",
  mission: "Find the resultant of two cable forces, written in Cartesian form.",
  instructions:
    "Two cables are tied to the ring at A. Their tensions are given, and the coordinates of A, B and C are in the picture (in metres). " +
    "Find the resultant force on the ring as a Cartesian vector $\\mathbf{F}_R = F_{Rx}\\,\\mathbf{i} + F_{Ry}\\,\\mathbf{j}$, then its size $F_R$ and the angle $\\theta$ it makes with the x-axis.",
  setup: {
    analysis: "resultant",
    cartesian: true,
    point: { at: [1, 2], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", magnitude: 300, kind: "cable", direction: { points: [[1, 2], [-2, 6]], names: ["A", "B"] } },
      { id: "T_AC", symbol: "T_{AC}", magnitude: 250, kind: "cable", direction: { points: [[1, 2], [5, 5]], names: ["A", "C"] } },
    ],
  },
  vary: [
    { path: "forces.0.magnitude", min: 150, max: 450, step: 25 },
    { path: "forces.1.magnitude", min: 150, max: 450, step: 25 },
    // C: 4 right and 3 up from A, or 5 right and 12 up (a 5-12-13 triangle).
    { path: "forces.1.direction.points.1", values: [[5, 5], [6, 14]] },
  ],
  solve: { steps: ["equations", "answer"] },
  ask: [
    { quantity: "R.x" },
    { quantity: "R.y" },
    { quantity: "R", min: 0 },
    { quantity: "R.angle", label: "\\theta" },
  ],
  hints: [
    "For each cable: position vector (subtract A's coordinates), its length, then the unit vector $\\mathbf{u} = \\mathbf{r}/r$.",
    "Each force is its tension times its unit vector: $\\mathbf{T}_{AB} = T_{AB}\\,\\mathbf{u}_{AB}$. Add the $\\mathbf{i}$ parts, then the $\\mathbf{j}$ parts.",
    "$F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2}$ and $\\theta = \\tan^{-1}|F_{Ry}/F_{Rx}|$, measured from the x-axis.",
  ],
  explanation:
    "In Cartesian form, adding forces is just adding their $\\mathbf{i}$ parts and their $\\mathbf{j}$ parts: " +
    "$\\mathbf{F}_R = \\Sigma\\mathbf{F} = (\\Sigma F_x)\\,\\mathbf{i} + (\\Sigma F_y)\\,\\mathbf{j}$. Coordinates give each direction without any angles: $\\mathbf{T} = T\\,\\mathbf{r}/r$.",
};
