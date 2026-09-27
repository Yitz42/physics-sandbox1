// Unit 6 — Distributed loads.
export default {
  title: "Distributed loads",
  concept: "A load spread along a beam (sand, snow, water) has an intensity $w$ in N/m. Its effect on the beam is the same as one force: its size is the AREA under the load curve, and it acts at the CENTROID of that area. For a curved load, $F_R = \\int w\\,dx$ and $\\bar{x} = \\int x\\,w\\,dx \\,/ \\int w\\,dx$.",
  goals: [
    "Replace a uniform load with $F = wL$ at the middle.",
    "Replace a triangular load with $F = \\tfrac{1}{2}wL$ at $\\tfrac{1}{3}L$ from its tall end.",
    "Split a trapezoid into a rectangle and a triangle, then combine them: $\\bar{x} = \\Sigma F\\tilde{x} / F_R$.",
    "Find the resultant of a curved load by integration.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
