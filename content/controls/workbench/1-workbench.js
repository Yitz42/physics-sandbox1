// The free block diagram workbench: no goal, no grade — build and combine
// anything (see src/challenges/workbench.js).

export default {
  id: "workbench/1-workbench",
  challenge: "build",
  solver: "controls.blockDiagram",
  title: "Block Diagram Workbench",
  mission: "Build any block diagram, then combine its blocks one rule at a time.",
  instructions:
    "**Build:** make a block — a name like $G_1$ and, if you like, a transfer function like $\\dfrac{10}{s + 2}$ — choose how it connects, then drag it onto a block or group in the picture " +
    "(or click it, hover to preview, and click to put it in). The first block starts the diagram.\n\n" +
    "**Combine:** click the blocks of one group, choose its rule, and write the combined block's formula. Keep going until one block, $T(s)$, is left.",
  workbench: true,
  setup: { diagram: null },
  hints: [
    "Series: a block after a block multiplies, $G_1G_2$. Parallel: branches add (or subtract), $G_1 \\pm G_2$.",
    "A feedback loop with forward block $G$ and feedback block $H$: $\\dfrac{G}{1 + GH}$ for negative feedback, $\\dfrac{G}{1 - GH}$ for positive.",
    "Type names as they look without the small print: $G_1$ is G1, $G_{e1}$ is Ge1. For example: G1 G2/(1 + G1 G2 H1).",
  ],
  explanation: "",
};
