// Unit: Varignon's theorem.
export default {
  title: "Varignon's theorem",
  concept: "The moment of a force about a point equals the sum of the moments of its components about that point: $M_O = xF_y - yF_x$. Each component's moment arm is just a coordinate, so no perpendicular distance is needed.",
  goals: [
    "Find the moment of each component: $F_y$ has arm $x$, $F_x$ has arm $y$.",
    "Give each component's moment its own sign, then add: $M_O = xF_y - yF_x$.",
    "Use Varignon's theorem to find a moment arm: $d = |M_O| / F$.",
  ],
  // Stage files in this folder, in order. (A stage may also have several parts.)
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
