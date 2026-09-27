// Unit: Cartesian vectors.
export default {
  title: "Cartesian vectors",
  concept: "A force can be written as a Cartesian vector, $\\mathbf{F} = F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}$, or as its size times a unit vector, $\\mathbf{F} = F\\,\\mathbf{u}$. For a force along a cable, the unit vector comes straight from coordinates.",
  goals: [
    "Write a force in Cartesian form, $\\mathbf{F} = F\\,\\mathbf{u}$, using its unit vector $\\mathbf{u}$.",
    "Find the position vector from A to B: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$, and its length $r_{AB}$.",
    "Find a force along a cable from coordinates: $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$, then $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$.",
  ],
  // Stage files in this folder, in order. (A stage may also have several parts.)
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
