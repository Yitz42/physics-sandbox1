// Unit 1.2: Direct Shear Stress (τ = V / A).
export default {
  title: "Direct Shear Stress",
  concept: "Shear stress $\\tau = V / A$ acts tangentially across a cross-section. In pinned or bolted joints, single shear carries the full load on one cross-section ($V = P$), while double shear shares the load across two cross-sections ($V = P / 2$).",
  goals: [
    "Distinguish between single shear ($n = 1, V = P$) and double shear ($n = 2, V = P / 2$).",
    "Calculate the cross-sectional shear area of a pin or bolt ($A = \\tfrac{\\pi}{4} d^2$).",
    "Compute average shear stress $\\tau = V / A$ in megapascals.",
    "Size a bolt or pin so shear stress remains safe under allowable limits.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
