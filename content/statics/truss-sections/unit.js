// Unit 5.3 — Trusses: the method of sections.
export default {
  title: "Trusses: method of sections",
  concept: "To find the force in one member without solving the whole truss, **cut** the truss through that member (and usually two more), so it falls into two parts. Either part is a rigid body in equilibrium: $\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma M = 0$, with the cut members' forces (assumed tension) as the unknowns. Take moments about the point where two cut members' lines **cross**: they drop out, and the third member's force comes from one equation.",
  goals: [
    "Choose a cut through at most three members that splits the truss in two.",
    "Draw the free-body diagram of one part, with each cut member pulling (tension assumed).",
    "Take moments about the point where two cut members cross, to get the third directly.",
    "Use $\\Sigma F_y$ (or $\\Sigma F_x$) for the member that crosses the others.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
