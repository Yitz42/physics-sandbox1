// Unit 10.1 — Area moments of inertia: I = ∫y² dA, and the parallel-axis theorem.
export default {
  title: "Area moments of inertia",
  concept: "A beam's stiffness in bending depends on how far its cross-section's area lies from the axis it bends about: $I = \\int y^2\\,dA$ — distance **squared**. A rectangle's own $\\bar{I} = bh^3/12$ about its centroid, so height counts far more than width. To find $I$ about another axis a distance $d$ away, use the **parallel-axis theorem**, $I = \\bar{I} + A d^2$. A composite section adds up its parts: $\\bar{I}_x = \\Sigma(\\bar{I}_i + A_i d_i^2)$, with each $d_i$ measured to the section's centroid. That's why I-beams put most of their steel in flanges far from the middle.",
  goals: [
    "Find a rectangle's Ī = bh³/12, and see why height matters more than width.",
    "Move a moment of inertia to a parallel axis: I = Ī + A d².",
    "Find a composite section's centroid, then its Ī_x = Σ(Ī + A d²).",
    "Design a section that is stiff for its area.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
