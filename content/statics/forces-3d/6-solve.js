// Unit 2.3, stage 6 — solve: two cables pull on the top A of a pole; find their resultant.
// A (0, 0, 6), B (2, −3, 0), C (−4.5, 0, 0).  r_AB = {2 i − 3 j − 6 k} m (7 m), r_AC = {−4.5 i − 6 k} m (7.5 m).
// T_AB = 700 N → {200 i − 300 j − 600 k} N;  T_AC = 750 N → {−450 i − 600 k} N.
// F_R = {−250 i − 300 j − 1200 k} N, F_R = 1262.0 N; α = 101.4°, β = 103.8°, γ = 162.0°.
// (Same numbers as tests/statics/force3d.test.js.)

export default {
  id: "forces-3d/6-solve",
  challenge: "solve",
  solver: "statics.force3d",
  title: "Two Cables on a Pole",
  mission: "Find the resultant of two cable forces in space, from coordinates.",
  instructions:
    "Two cables run from the top A of a pole to anchors B and C on the ground, with tensions $T_{AB}$ and $T_{AC}$. " +
    "Write each cable's pull on A as a Cartesian vector, add them, then find the resultant's size and direction angles. (Coordinates in the key, in metres.)",
  setup: {
    points: { O: [0, 0, 0], A: [0, 0, 6], B: [2, -3, 0], C: [-4.5, 0, 0] },
    pole: ["O", "A"],
    cables: [["A", "B"], ["A", "C"]],
    forces: [
      { id: "T_AB", symbol: "T_{AB}", magnitude: 700, dir: { from: "A", to: "B" } },
      { id: "T_AC", symbol: "T_{AC}", magnitude: 750, dir: { from: "A", to: "C" } },
    ],
    resultant: true,
    resultantAt: "A",
  },
  vary: [
    { path: "forces.0.magnitude", min: 400, max: 1000, step: 50 },
    { path: "forces.1.magnitude", min: 400, max: 1000, step: 50 },
  ],
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Write the forces",
  },
  ask: [{ quantity: "R" }, { quantity: "R.alpha" }, { quantity: "R.beta" }, { quantity: "R.gamma" }],
  hints: [
    "For each cable: $\\mathbf{r} = $ END − START (from A), its length, then $\\mathbf{T} = T\\,\\mathbf{r}/r$.",
    "Add the two vectors component by component: $F_{Rx} = T_{ABx} + T_{ACx}$, and so on.",
    "$F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2 + F_{Rz}^2}$, then $\\cos\\alpha = F_{Rx}/F_R$, $\\cos\\beta = F_{Ry}/F_R$, $\\cos\\gamma = F_{Rz}/F_R$.",
  ],
  explanation:
    "Forces in space add like forces in a plane — component by component — once each is written as a Cartesian vector. " +
    "Both cables pull A down and outward, so the resultant points mostly down the pole (γ near 180°): the pole is squeezed, and the sideways parts partly cancel.",
};
