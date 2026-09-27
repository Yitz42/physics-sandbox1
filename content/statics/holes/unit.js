// Unit 6.2 — Composite shapes with holes: a hole is a part with NEGATIVE area.
export default {
  title: "Composite shapes with holes",
  concept: "A hole (or a cut-out) is material that isn't there, so it counts as a part with **negative area**: $A = \\Sigma A_\\text{solid} - A_\\text{hole}$, and its first moment is subtracted too: $\\bar{x} = \\dfrac{\\Sigma \\tilde{x} A_\\text{solid} - \\tilde{x}_\\text{hole} A_\\text{hole}}{\\Sigma A_\\text{solid} - A_\\text{hole}}$. Taking material away moves the centroid **away from the hole**. The same trick finds odd shapes the easy way: an L is a square minus a square.",
  goals: [
    "Treat a hole or cut-out as a part with negative area.",
    "Subtract the hole's first moment, $\\tilde{x} A$, as well as its area.",
    "Know which way a hole moves the centroid: away from itself.",
    "Find an awkward shape as a simple shape minus a simple shape.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
