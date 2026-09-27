// Unit 6.1 (the old "Unit 11") — Trusses: the method of joints.
export default {
  title: "Trusses: method of joints",
  concept: "A truss is built from straight members pinned together at joints, loaded only at the joints. Every member is a two-force member: it either pulls on its joints (**tension**) or pushes on them (**compression**). Each joint is a particle in equilibrium, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, so solve the truss joint by joint, starting where there are only two unknowns.",
  goals: [
    "Tell tension from compression, and use the sign convention: assume tension, a negative answer means compression.",
    "Draw the free-body diagram of a joint and write its two equations.",
    "Find member forces joint by joint, starting at a joint with at most two unknowns.",
    "Check a truss: $m + r = 2j$ for a determinate truss.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
