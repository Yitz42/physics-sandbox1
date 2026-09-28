// Unit 4.7 — Moments in 3D: the moment of a force about a point as a cross product.
export default {
  title: "Moments in 3D",
  concept: "In space, a force's moment about a point O is a **vector**: $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$, with $\\mathbf{r}$ from O to any point on the force's line. It points along the axis the force tends to turn the body about (right-hand rule), and its size is how hard it turns.",
  goals: [
    "Find a moment as a cross product: $M_x = r_y F_z - r_z F_y$, $M_y = r_z F_x - r_x F_z$, $M_z = r_x F_y - r_y F_x$.",
    "Choose $\\mathbf{r}$ from the moment point to a point on the force's line, and keep the order: $\\mathbf{r} \\times \\mathbf{F}$.",
    "Add several forces' moments, part by part, and find the size of the total.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
