// Unit 5.4 (the old "Unit 9") — Stability and determinacy.
export default {
  title: "Stability and determinacy",
  concept: "A rigid body in a plane has 3 equilibrium equations. With fewer than 3 unknown reactions it moves (unstable); with more, equilibrium can't find them all (statically indeterminate, to degree $n - 3$). Even 3 unknowns fail if the reactions are all parallel or all meet at one point: the body is improperly supported.",
  goals: [
    "Count the unknown reactions $n$ and compare them with the 3 equations.",
    "Find the degree of indeterminacy, $n - 3$.",
    "Spot improper supports: reactions all parallel, or all through one point.",
    "Choose supports that hold a body with exactly 3 well-placed reactions.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
