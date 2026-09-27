// Unit 4.2 (the old "Unit 8") — Equilibrium of a rigid body: ΣF_x = 0,
// ΣF_y = 0, ΣM = 0, and choosing a smart point for moments.
export default {
  title: "Equilibrium of a rigid body",
  concept: "A body at rest has no net force AND no net turning: $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma M_P = 0$ — about ANY point P. Pick P where the most unknowns act: their moments about it are zero, so the moment equation has just one unknown and gives it straight away.",
  goals: [
    "Write $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma M_P = 0$ for a beam, a cantilever or a bracket.",
    "Choose a moment point that leaves one unknown in $\\Sigma M_P = 0$.",
    "Replace a distributed load by its resultant for the equilibrium equations.",
    "Read a negative answer as a reaction that points the other way.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
