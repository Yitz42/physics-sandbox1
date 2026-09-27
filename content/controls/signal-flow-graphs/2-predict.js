// Signal-flow graphs, stage 2 — predict, in two parts:
//   1. count the forward paths, loops and non-touching pairs;
//   2. with numbers for every gain: Δ and T by Mason's rule.
// Part 2 hand check (default numbers): Δ = 6.6, T = 9/6.6 = 1.364 (see shared/graphs.js).

import { twoPaths } from "../shared/graphs.js";

export default {
  id: "signal-flow-graphs/2-predict",
  challenge: "predict",
  solver: "controls.signalFlow",
  title: "Count, Then Compute",
  parts: [
    {
      title: "Count them",
      instructions:
        "Before using Mason's rule, find its pieces. How many **forward paths** does this graph have? How many **loops**? " +
        "And how many **pairs of loops that don't touch** (share no node)? Then press **Test**.",
      setup: twoPaths(),
      ask: [{ quantity: "paths", min: 0 }, { quantity: "loops", min: 0 }, { quantity: "pairs", min: 0 }],
      hints: [
        "A forward path goes from $R$ to $C$ following the arrows, never visiting a node twice. There's a shortcut branch, $G_4$.",
        "A loop follows the arrows back to where it started. Each backward branch ($-H_1$, $-H_2$, $-H_3$) closes one.",
        "Two loops touch if they share even one node.",
      ],
      explanation:
        "2 forward paths (the main line, and the $G_4$ shortcut), 3 loops (one for each feedback branch), and 1 non-touching pair: " +
        "the small loops at each end. The big loop touches both.",
    },
    {
      title: "Mason's rule with numbers",
      instructions:
        "Now every gain has a number (see the key on the picture). " +
        "Use Mason's rule to find $\\Delta$ and the transfer function $T = C/R$ (to ±0.01), then press **Test**.",
      setup: { ...twoPaths(), showValues: true },
      vary: [
        { path: "symbols.G1.value", values: [1, 2, 4] },
        { path: "symbols.G2.value", values: [1, 2, 3] },
        { path: "symbols.G4.value", values: [0.5, 1, 1.5, 2] },
        { path: "symbols.H1.value", values: [0.25, 0.5, 1] },
        { path: "symbols.H2.value", values: [0.5, 1, 2] },
      ],
      ask: [{ quantity: "Delta", precision: 0.01 }, { quantity: "T", precision: 0.01 }],
      hints: [
        "Loop gains: $L_1 = -G_1H_1$, $L_2 = -G_3H_2$, $L_3 = -G_1G_2G_3H_3$. Only $L_1$ and $L_2$ don't touch.",
        "$\\Delta = 1 - (L_1 + L_2 + L_3) + L_1L_2$.",
        "$P_1 = G_1G_2G_3$ touches every loop ($\\Delta_1 = 1$); $P_2 = G_4G_3$ misses $L_1$ ($\\Delta_2 = 1 - L_1$). Then $T = (P_1\\Delta_1 + P_2\\Delta_2)/\\Delta$.",
      ],
      explanation:
        "Mason's rule in three moves: the loop gains and which don't touch give $\\Delta$; each path's $\\Delta_k$ keeps only the loops it misses; " +
        "then $T = \\dfrac{\\Sigma P_k\\Delta_k}{\\Delta}$.",
    },
  ],
  explanation:
    "Mason's rule is bookkeeping: list the forward paths, the loops and the non-touching sets, then $T = \\dfrac{\\Sigma P_k\\Delta_k}{\\Delta}$.",
};
