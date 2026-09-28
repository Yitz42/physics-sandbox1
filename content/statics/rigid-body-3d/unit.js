// Unit 5.6 — Rigid body equilibrium in 3D: six equations; supports in space.
export default {
  title: "Rigid body equilibrium in 3D",
  concept: "A body in space has six ways to move — three slides and three turns — so it needs **six equations**: $\\Sigma F_x = \\Sigma F_y = \\Sigma F_z = 0$ and $\\Sigma M_x = \\Sigma M_y = \\Sigma M_z = 0$, and can find up to six unknowns. Supports in space give the forces that stop those movements: a **ball-and-socket** gives three forces (it lets the body turn every way), a **journal bearing** two forces across its shaft (the shaft can slide and turn along it), a **thrust bearing** three, a **cable** one pull along itself. Take moments about axes that pass through as many unknowns as possible: each equation then has few unknowns.",
  goals: [
    "Replace 3D supports by their reactions: ball-and-socket, journal and thrust bearings, cables.",
    "Write the six equations, with moments as r × F (or force × arm about each axis).",
    "Choose moment axes through the supports so each equation has one unknown.",
    "Find cable tensions and bearing reactions in space.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
