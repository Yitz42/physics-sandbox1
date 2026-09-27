// Signal-flow graphs, stage 4 — debug: a student's Mason's rule has one wrong
// line. Each new version uses the next mistake: the non-touching product left
// out; Δ₂ taken as 1; the loops added instead of subtracted; Δ₂ taken as Δ.

import { twoPaths } from "../shared/graphs.js";

export default {
  id: "signal-flow-graphs/4-debug",
  challenge: "debug",
  solver: "controls.signalFlow",
  title: "Check the Working",
  mission: "Find the wrong line in a student's use of Mason's rule.",
  instructions:
    "A student applied Mason's rule to this graph. One line of their working is wrong. " +
    "Check each line: the paths and loops, which loops don't touch, $\\Delta$, each $\\Delta_k$, and $T$.",
  setup: twoPaths(),
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [
      { kind: "noPairs" },
      { kind: "deltaOne", path: 1 },
      { kind: "loopSign" },
      { kind: "deltaFull", path: 1 },
    ],
  },
  hints: [
    "Build $\\Delta$ yourself: $1 - \\Sigma L + \\Sigma(\\text{non-touching pairs})$. Does the student's match?",
    "$\\Delta_2$ keeps the loops that path $P_2$ does NOT touch. Which loop does $P_2$ miss?",
    "If a line is wrong only because an earlier line is wrong, the mistake is in the earlier line.",
  ],
  explanation:
    "Mason's rule has three places to slip: the signs in $\\Delta$ (loops subtract, non-touching pairs add), the non-touching products, " +
    "and each $\\Delta_k$ (only the loops that path $k$ misses). Here $\\Delta_1 = 1$ and $\\Delta_2 = 1 + G_1H_1$.",
};
