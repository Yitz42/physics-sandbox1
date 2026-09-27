// Unit: Signal-flow graphs and Mason's rule (Nise 5.5–5.7).
export default {
  title: "Signal-flow graphs and Mason's rule",
  concept: "A signal-flow graph shows a system as nodes (signals) and branches (gains). Mason's rule gives its transfer function in one go: $T = \\dfrac{\\sum_k P_k \\Delta_k}{\\Delta}$, from the forward paths $P_k$, the loops, and which loops don't touch.",
  goals: [
    "Find every forward path and every loop in a signal-flow graph, and their gains.",
    "Spot loops that don't touch (share no node).",
    "Build $\\Delta = 1 - \\Sigma L + \\Sigma(\\text{non-touching pairs}) - \\dots$ and each $\\Delta_k$.",
    "Use Mason's rule to find $T$, and choose a gain to meet a target.",
  ],
  // Stage files in this folder, in order. (A stage may also have several parts.)
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
