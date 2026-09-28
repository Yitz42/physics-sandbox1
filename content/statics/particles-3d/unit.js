// Unit 3.4 — Particle equilibrium in 3D: a point held by three cables (or springs) in space.
export default {
  title: "Particle equilibrium in 3D",
  concept: "A particle in space is at rest when $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma F_z = 0$: **three** equations, so up to three unknown forces. Each cable's pull is its tension times its unit vector, $\\mathbf{T} = T\\,\\mathbf{r}/r$, straight from the coordinates.",
  goals: [
    "Write each force on a point as a Cartesian vector — cables from coordinates, the weight as $-W\\,\\mathbf{k}$, other forces from their angles.",
    "Write $\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma F_z = 0$ and solve them for three unknowns.",
    "Explain why three cables can hold a point only if, seen from above, it lies inside the triangle of their anchors.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
