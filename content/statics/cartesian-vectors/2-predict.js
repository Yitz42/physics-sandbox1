// Cartesian vectors, stage 2 — predict, in two parts:
//   1. the unit vector u_F of an angled force (F = F u_F);
//   2. a force along a cable from A to B: r_AB, then F_x and F_y.

export default {
  id: "cartesian-vectors/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Unit Vectors and Cables",
  mission: "Predict unit vectors, and the components of a force along a cable.",
  parts: [
    {
      title: "The unit vector",
      instructions:
        "Any force can be written as its size times a **unit vector** — an arrow of length 1 pointing the same way: $\\mathbf{F} = F\\,\\mathbf{u}_F$, " +
        "with $\\mathbf{u}_F = u_x\\,\\mathbf{i} + u_y\\,\\mathbf{j}$. Find the two parts of $\\mathbf{u}_F$ for the force in the picture (to ±0.01), then press **Test**.",
      setup: {
        analysis: "components",
        cartesian: true,
        point: { at: [0, 0], label: "", object: "eyebolt" },
        forces: [{ id: "F", symbol: "F", magnitude: 250, direction: { angle: 40, from: "+x", toward: "+y" } }],
      },
      vary: [
        { path: "forces.0.magnitude", min: 100, max: 500, step: 50 },
        // Any of the 8 ways to measure an angle (from one axis toward the other) …
        { path: "forces.0.direction", values: [["+x", "+y"], ["+x", "-y"], ["-x", "+y"], ["-x", "-y"], ["+y", "+x"], ["+y", "-x"], ["-y", "+x"], ["-y", "-x"]].map(([from, toward]) => ({ from, toward })) },
        // … then the angle itself.
        { path: "forces.0.direction.angle", values: [15, 20, 25, 35, 40, 50, 55, 65, 70, 75] },
      ],
      ask: [
        { quantity: "F.ux", precision: 0.01, min: -1, max: 1 },
        { quantity: "F.uy", precision: 0.01, min: -1, max: 1 },
      ],
      hints: [
        "A unit vector has length 1, so its parts are just the components of a 1 N force: $\\pm\\cos\\theta$ and $\\pm\\sin\\theta$.",
        "The part along the axis the angle is measured from gets $\\cos\\theta$; the other gets $\\sin\\theta$.",
        "Signs come from the picture: left or down is negative. Check: $u_x^2 + u_y^2 = 1$.",
      ],
      explanation:
        "$\\mathbf{u}_F$ is the direction on its own: $\\mathbf{u}_F = \\mathbf{F}/F$. Its parts are the components divided by $F$, so they are always between −1 and 1 and have no unit, " +
        "and $u_x^2 + u_y^2 = 1$. Multiply by the size to get the force back: $\\mathbf{F} = F\\,\\mathbf{u}_F = \\{F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}\\}$ N.",
    },
    {
      title: "A force along a cable",
      instructions:
        "The cable pulls on the ring at A with force $F$, toward the anchor B. The coordinates of A and B are in the picture (in metres). " +
        "Find the length $r_{AB}$ of the cable, then the components $F_x$ and $F_y$, and press **Test**.",
      setup: {
        analysis: "components",
        cartesian: true,
        point: { at: [1.5, 0.5], label: "A" },
        forces: [{ id: "F", symbol: "F", magnitude: 300, kind: "cable", direction: { points: [[1.5, 0.5], [-1, 6.5]], names: ["A", "B"] } }],
      },
      // A is at half-metres and B at whole metres, so B can never land on A.
      vary: [
        { path: "forces.0.magnitude", min: 150, max: 600, step: 50 },
        // The ring and the start of the cable are the same point A.
        { paths: ["point.at", "forces.0.direction.points.0"], values: [[1.5, 0.5], [0.5, 1.5], [-0.5, 0.5], [2.5, 1.5]] },
        { path: "forces.0.direction.points.1.0", min: -3, max: 5, step: 1 },
        { path: "forces.0.direction.points.1.1", values: [-2, 3, 4, 5, 6, 7] },
      ],
      ask: [
        { quantity: "F.r", min: 0, precision: 0.01 },
        { quantity: "F.x" },
        { quantity: "F.y" },
      ],
      hints: [
        "First the position vector from A to B: subtract A's coordinates from B's. $\\mathbf{r}_{AB} = (x_B - x_A)\\,\\mathbf{i} + (y_B - y_A)\\,\\mathbf{j}$.",
        "Its length is $r_{AB} = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.",
        "Then $F_x = F\\,\\dfrac{x_B - x_A}{r_{AB}}$ and $F_y = F\\,\\dfrac{y_B - y_A}{r_{AB}}$ — the signs come out by themselves.",
      ],
      explanation:
        "A cable pulls along itself, from A toward B. $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$ gives that direction, and dividing by its length gives the unit vector " +
        "$\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$. Then $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$: no angle needed, and the signs come straight from the coordinates.",
    },
  ],
  explanation:
    "A force is its size times a unit vector, $\\mathbf{F} = F\\,\\mathbf{u}$. The unit vector comes from an angle (cos and sin) or from coordinates ($\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$).",
};
