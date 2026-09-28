// Unit 4.8 — Moment about an axis: how hard a force turns a body about a given line.
export default {
  title: "Moment about an axis",
  concept: "A door can only turn about its hinges, a shaft only about its own axis. How hard a force turns a body about an AXIS is the part of its moment along that axis: $M_a = \\mathbf{u}_a \\cdot (\\mathbf{r} \\times \\mathbf{F})$, with $\\mathbf{r}$ from any point on the axis, and $\\mathbf{u}_a$ a unit vector along it.",
  goals: [
    "Find a moment about an axis: first $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$ about a point O on the axis, then $M_a = \\mathbf{u}_a \\cdot \\mathbf{M}_O$.",
    "Read the sign of $M_a$: positive turns the body the right-hand way about $\\mathbf{u}_a$.",
    "Spot the forces that can't turn a body about an axis: parallel to it, or through it.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
