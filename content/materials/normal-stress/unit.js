// Unit 1.1: Normal Stress (σ = P / A).
export default {
  title: "Normal Stress",
  concept: "An internal axial force $P$ distributed over cross-sectional area $A$ creates average normal stress $\\sigma = P / A$. Tension stretches the member ($\\sigma > 0$); compression squashes it ($\\sigma < 0$).",
  goals: [
    "Calculate cross-sectional area $A$ for circular rods ($A = \\tfrac{\\pi}{4} d^2$) and rectangular bars ($A = b \\cdot h$).",
    "Compute the normal stress $\\sigma = P / A$ in megapascals ($1\\text{ MPa} = 1\\text{ N/mm}^2$).",
    "Size an axial member so its stress stays within an allowable safety limit.",
  ],
  // The six standard challenge types, in order:
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
