// Block diagram reduction, stage 4 — debug: a student reduced a diagram with
// two loops and made one slip. Each new version uses the next mistake:
//   the inner loop's sign; series blocks added; H left out; H put on top.

import { nestedLoops } from "../shared/diagrams.js";

export default {
  id: "block-diagrams/4-debug",
  challenge: "debug",
  solver: "controls.blockDiagram",
  title: "Find the Wrong Step",
  mission: "Find the step in a student's reduction that breaks a rule.",
  instructions:
    "A student reduced this diagram step by step (all feedback is negative). One line of their working breaks a rule. " +
    "Check each line against the rules: series multiply, parallel add, a loop is $\\dfrac{G}{1 + GH}$.",
  setup: nestedLoops(),
  debug: {
    view: "steps",
    intro: "The student's working, one step per line:",
    mutations: [
      { step: 0, kind: "sign" },
      { step: 1, kind: "sum" },
      { step: 2, kind: "noH" },
      { step: 2, kind: "HinNum" },
    ],
  },
  hints: [
    "Line 1 is the inner loop ($G_2$ with $H_2$). Is its sign right for negative feedback?",
    "Line 2 combines three blocks in series. What should they do?",
    "The last line closes the outer loop, whose feedback path is $H_1$.",
  ],
  explanation:
    "Each step uses one rule, and a slip in any step carries through to $T(s)$. Checking step by step is how you find it: " +
    "the right answer is $T = \\dfrac{G_1G_2G_3}{1 + G_2H_2 + G_1G_2G_3H_1}$.",
};
