// Unit 6.1 — Centroids and centre of gravity: where a shape's area — or a body's weight — acts.
export default {
  title: "Centroids and center of gravity",
  concept: "A shape's **centroid** is its balance point: the average position of its area. Split a composite shape into simple parts whose area $A_i$ and centroid $(\\tilde{x}_i, \\tilde{y}_i)$ you know — rectangles (the middle), right triangles (⅓ of each leg from the right angle), half circles ($\\tfrac{4r}{3\\pi}$ from the flat edge) — then $\\bar{x} = \\dfrac{\\Sigma \\tilde{x} A}{\\Sigma A}$ and $\\bar{y} = \\dfrac{\\Sigma \\tilde{y} A}{\\Sigma A}$. A body's **centre of gravity**, where its weight acts, is the same with weights: $\\bar{x} = \\dfrac{\\Sigma \\tilde{x} W}{\\Sigma W}$.",
  goals: [
    "Split a composite shape into rectangles, triangles and half circles.",
    "Know each simple part's area and centroid.",
    "Find $\\bar{x}$ and $\\bar{y}$ with $\\Sigma \\tilde{x} A / \\Sigma A$ (and with weights, for a centre of gravity).",
    "Use symmetry: a shape's centroid lies on any line of symmetry.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
