// Unit 2.3 — Forces in 3D: a force in space as a Cartesian vector.
export default {
  title: "Forces in 3D",
  concept: "In space a force has three components: $\\mathbf{F} = F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j} + F_z\\,\\mathbf{k}$, with size $F = \\sqrt{F_x^2 + F_y^2 + F_z^2}$. Its direction can be given by its **coordinate direction angles** α, β, γ (from the +x, +y and +z axes; $F_x = F\\cos\\alpha$ …, and $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$), by an **azimuth and elevation**, or by a **line** between two points: $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$ with $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$.",
  goals: [
    "Find a force's components from its direction angles — including the third angle from the other two.",
    "Find a force's components from an azimuth and an elevation.",
    "Find a force along a cable from coordinates: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$, $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$, $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$.",
    "Find a force's size and direction angles from its components, and add forces in space.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
