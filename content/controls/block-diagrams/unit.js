// Unit: Block diagram reduction (Nise 5.2–5.3).
export default {
  title: "Block diagram reduction",
  concept: "A block diagram of many subsystems reduces to one block, $T(s) = C(s)/R(s)$, with three rules used from the inside out: blocks in series multiply, parallel branches add, and a feedback loop becomes $\\dfrac{G}{1 \\pm GH}$.",
  goals: [
    "Recognise series, parallel and feedback groups in a block diagram.",
    "Reduce a feedback loop: $\\dfrac{G}{1 + GH}$ for negative feedback, $\\dfrac{G}{1 - GH}$ for positive.",
    "Reduce a diagram with loops inside loops, from the inside out.",
    "Find the closed-loop transfer function with numbers, and design a gain to meet a target.",
  ],
  // Stage files in this folder, in order. (A stage may also have several parts.)
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
