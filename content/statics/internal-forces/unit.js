// Unit 8.1 — Internal forces at a point: cut a beam, and the cut face carries N, V and M.
export default {
  title: "Internal forces at a point",
  concept: "Cut a beam at a point C: each piece must still be in equilibrium, so the cut face carries three **internal forces** — the normal force $N$ (along the beam), the shear force $V$ (across it) and the bending moment $M$. Keep one piece and write its three equations: $\\Sigma F_x = 0$ gives N, $\\Sigma F_y = 0$ gives V, $\\Sigma M_C = 0$ gives M. Sign convention: $N$ is positive in **tension**; $V$ is positive **down on a left piece's face** (up on a right piece's); $M$ is positive when it bends the beam into a **smile** (counterclockwise on a left piece's face).",
  goals: [
    "Cut a beam and draw one piece's free-body diagram with N, V and M on the cut face.",
    "Use the sign convention: tension, V down on a left face, M making a smile.",
    "Find N, V and M from the piece's three equations — counting only the part of a distributed load on the piece.",
    "Choose the easier piece (often the one without supports).",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
