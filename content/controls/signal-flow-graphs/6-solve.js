// Signal-flow graphs, stage 6 — solve: Mason's rule step by step (choose the
// loops, Δ and each Δ_k), then find Δ and T with numbers.
// Hand check (default numbers): Δ = 1 + 1 + 1 + 0.6 + 0.6 = 4.2;
// P1 = 6 (Δ1 = 1), P2 = G4 = 0.5 (touches no loop: Δ2 = Δ); T = (6 + 0.5·4.2)/4.2 = 1.929.

import { loopChain } from "../shared/graphs.js";

export default {
  id: "signal-flow-graphs/6-solve",
  challenge: "solve",
  solver: "controls.signalFlow",
  title: "Mason Step by Step",
  mission: "Find the transfer function of the graph with Mason's rule, step by step.",
  instructions:
    "Find the transfer function $C/R$ of this graph with Mason's rule. First choose the correct line for the loops, $\\Delta$, and each $\\Delta_k$ (in symbols); " +
    "then use the numbers in the key to find $\\Delta$ and $T$.",
  setup: { ...loopChain(), showValues: true },
  vary: [
    { path: "symbols.G1.value", values: [1, 2, 4] },
    { path: "symbols.G3.value", values: [1, 2, 3] },
    { path: "symbols.G4.value", values: [0.5, 1, 2] },
    { path: "symbols.H1.value", values: [0.25, 0.5, 1] },
    { path: "symbols.H3.value", values: [0.1, 0.2, 0.5] },
  ],
  solve: { steps: ["choices", "answer"], choicesName: "Apply Mason's rule" },
  ask: [{ quantity: "Delta", precision: 0.01 }, { quantity: "T", precision: 0.01 }],
  hints: [
    "Three loops: $-G_1H_1$, $-G_2H_2$, $-G_3H_3$. Neighbours share a node; only the first and the last don't touch.",
    "$P_1 = G_1G_2G_3$ touches every loop: $\\Delta_1 = 1$. $P_2 = G_4$ goes straight from $R$ to $C$ and touches none: $\\Delta_2 = \\Delta$.",
    "$T = \\dfrac{P_1 + P_2\\Delta}{\\Delta}$.",
  ],
  explanation:
    "$\\Delta = 1 + G_1H_1 + G_2H_2 + G_3H_3 + G_1G_3H_1H_3$. The main path touches every loop, so it comes with $\\Delta_1 = 1$; " +
    "the feedforward path touches none, so it keeps the whole $\\Delta$. That's why $T = \\dfrac{G_1G_2G_3}{\\Delta} + G_4$: the shortcut adds straight on.",
};
