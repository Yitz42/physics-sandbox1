// Unit 1, stage 6 — solve, in two parts: full textbook resultant problems.
//   1. three forces given by an angle, a slope and a word;
//   2. two cables given by coordinates, in Cartesian vector form.
// Part 1 hand check (default numbers): F_Rx = 600cos45° − (4/5)400 = 104.3 N,
// F_Ry = 600sin45° + (3/5)400 − 200 = 464.3 N, F_R = 475.8 N, θ = 77.3°.
// (Same numbers as the test in tests/statics/particle.test.js.)
// Part 2 hand check: r_AB = {−3 i + 4 j} m, r_AC = {4 i + 3 j} m (both 5 m), so
// T_AB = 300(−0.6 i + 0.8 j) = {−180 i + 240 j} N and T_AC = 250(0.8 i + 0.6 j)
// = {200 i + 150 j} N; F_R = {20 i + 390 j} N, F_R = 390.5 N, θ = 87.1°.

export default {
  id: "01-force-vectors/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "Find the Resultant",
  parts: [
    {
      title: "Three forces",
      instructions:
        "Three forces act on the eyebolt. Find their resultant: its components, its magnitude $F_R$, and the angle $\\theta$ it makes with the x-axis.",
      setup: {
        analysis: "resultant",
        point: { at: [0, 0], label: "", object: "eyebolt" }, // screwed in where no force points
        forces: [
          { id: "F1", symbol: "F_1", magnitude: 600, direction: { angle: 45, from: "+x", toward: "+y" } },
          { id: "F2", symbol: "F_2", magnitude: 400, direction: { slope: [-4, 3] } },
          { id: "F3", symbol: "F_3", magnitude: 200, direction: "down" },
        ],
      },
      vary: [
        { path: "forces.0.magnitude", min: 400, max: 800, step: 50 },
        { path: "forces.0.direction.angle", min: 25, max: 65, step: 5 },
        { path: "forces.1.magnitude", min: 200, max: 500, step: 50 },
        { path: "forces.2.magnitude", min: 100, max: 300, step: 50 },
      ],
      solve: { steps: ["equations", "answer"] },
      ask: [
        { quantity: "R.x" },
        { quantity: "R.y" },
        { quantity: "R", min: 0 }, // a size is never negative
        { quantity: "R.angle", label: "\\theta" },
      ],
      hints: [
        "The 3-4-5 triangle means $F_2$'s components are $\\tfrac{4}{5}F_2$ and $\\tfrac{3}{5}F_2$ — no angle needed.",
        "Add all x-components (with signs) for $F_{Rx}$, all y-components for $F_{Ry}$.",
        "$\\theta = \\tan^{-1}|F_{Ry}/F_{Rx}|$ is measured from the x-axis; the signs of $F_{Rx}$ and $F_{Ry}$ tell you which quadrant.",
      ],
      explanation:
        "The method never changes: (1) resolve every force into components, (2) add them, $F_{Rx} = \\Sigma F_x$ and $F_{Ry} = \\Sigma F_y$, " +
        "(3) combine: $F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2}$, $\\theta = \\tan^{-1}|F_{Ry}/F_{Rx}|$. Slope triangles give the components directly as fractions.",
    },
    {
      title: "Two cables, in Cartesian form",
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
    },
  ],
  explanation:
    "The method never changes: resolve every force into components (from an angle, a slope or coordinates), add them, " +
    "then combine: $F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2}$, $\\theta = \\tan^{-1}|F_{Ry}/F_{Rx}|$.",
};
