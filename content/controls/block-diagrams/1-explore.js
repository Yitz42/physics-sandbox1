// Block diagram reduction, stage 1 — explore, in two parts:
//   1. collapse a diagram with two loops one step at a time, and watch each
//      rule (loop, series) in the equations;
//   2. a loop with numbers: change the gain K and watch T(s).

import { nestedLoops } from "../shared/diagrams.js";

export default {
  id: "block-diagrams/1-explore",
  challenge: "explore",
  solver: "controls.blockDiagram",
  title: "Collapse the Diagram",
  parts: [
    {
      title: "Step by step",
      instructions:
        "A block diagram can be reduced to ONE block, $T(s) = C(s)/R(s)$, by using three rules again and again: " +
        "blocks in **series** multiply, **parallel** branches add, and a **feedback loop** becomes $\\dfrac{G}{1 + GH}$ (negative feedback). " +
        "Move the slider to reduce this diagram one step at a time. The dashed outline shows the next group, and the equations show each step.",
      setup: { ...nestedLoops(), reduce: 0 },
      editable: [{ path: "reduce", label: "Steps done", min: 0, max: 3, step: 1, unit: "" }],
      tasks: [
        { text: "Collapse the inner loop ($G_2$ with $H_2$) into one block.", check: (v, s) => s.reduce >= 1 },
        { text: "Reduce the whole diagram to one block, $T(s)$.", check: (v, s) => s.reduce === 3 },
      ],
      hints: [
        "Always start with the innermost group: here, the loop around $G_2$.",
        "Once the inner loop is one block, $G_1$, that block and $G_3$ are in series.",
        "The last step is the outer loop, with $H_1$ in its feedback path.",
      ],
      explanation:
        "Reduction works from the inside out. The inner loop becomes $\\dfrac{G_2}{1 + G_2H_2}$; then three blocks in series multiply; " +
        "then the outer loop gives $T = \\dfrac{G_1G_2G_3}{1 + G_2H_2 + G_1G_2G_3H_1}$. Every loop adds its loop gain to the bottom.",
    },
    {
      title: "With numbers",
      instructions:
        "Now the blocks have transfer functions: $G(s) = \\dfrac{K}{s + 1}$ with feedback $H(s) = \\dfrac{1}{s + 4}$. " +
        "Change the gain $K$ and watch the closed loop $T(s)$ — press **Numbers** above the equations to see it. " +
        "$T(0)$ is its value at $s = 0$: the steady output for a steady input.",
      setup: {
        params: { K: 5 },
        diagram: { loop: { block: "G", tf: { num: ["K"], den: [1, 1] }, show: ["K", "s + 1"] }, back: { block: "H", tf: { num: [1], den: [1, 4] } }, sign: -1 },
      },
      editable: [{ path: "params.K", label: "Gain K", min: 0.5, max: 40, step: 0.5, unit: "" }],
      tasks: [
        { text: "Make $T(0) = 0.8$.", check: (v) => Math.abs(v.dc - 0.8) < 0.005 },
        { text: "Make $T(0)$ bigger than 3.", check: (v) => v.dc > 3 },
        { text: "Make the bottom of $T(s)$ equal $s^2 + 5s + 20$.", check: (v) => Math.abs(v.a1 - 5) < 1e-9 && Math.abs(v.a0 - 20) < 1e-9 },
      ],
      hints: [
        "Work it out: $T = \\dfrac{G}{1 + GH} = \\dfrac{K(s + 4)}{(s + 1)(s + 4) + K} = \\dfrac{K(s + 4)}{s^2 + 5s + 4 + K}$.",
        "At $s = 0$: $T(0) = \\dfrac{4K}{4 + K}$. Which $K$ gives 0.8?",
        "The bottom is $s^2 + 5s + (4 + K)$: for $+20$ you need $K = 16$.",
      ],
      explanation:
        "With transfer functions, the loop rule still applies — the fractions just combine: $T = \\dfrac{K(s + 4)}{s^2 + 5s + 4 + K}$. " +
        "The gain $K$ moves the closed-loop bottom (and so, later, its poles), and $T(0) = \\dfrac{4K}{4 + K}$ approaches 4 but never reaches it.",
    },
  ],
  explanation:
    "Any diagram built from series, parallel and feedback groups reduces to one block, from the inside out: series multiply, parallel add, a loop becomes $G/(1 + GH)$.",
};
