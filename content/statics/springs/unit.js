// Unit: Springs.
export default {
  title: "Springs",
  concept: "A spring pulls with a force that grows with its stretch: $F = k\\,s$, where $k$ is its stiffness (N/m) and $s$ how far it is stretched beyond its unstretched length. Equilibrium decides the force; the spring law decides the stretch.",
  goals: [
    "Treat a spring as a force on the FBD, found from $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$.",
    "Use $F = k\\,s$ to find how far a spring stretches, and its length $l = l_0 + s$.",
    "Choose a spring's stiffness so it stretches just the right amount.",
  ],
  // Stage files in this folder, in order. (A stage may also have several parts.)
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
