// Block diagram reduction, stage 6 — solve: reduce a two-loop diagram step by
// step (choosing each line), then find the closed-loop T(s) with numbers.
// Hand check (default numbers): G1 = 10, G2 = 1/(s + 1), H2 = 2, H1 = 1/(s + 5):
//   inner loop: 1/(s + 1 + 2) = 1/(s + 3);  series: 10/(s + 3);
//   outer loop: 10(s + 5) / ((s + 3)(s + 5) + 10) = (10s + 50)/(s² + 8s + 25).

export default {
  id: "block-diagrams/6-solve",
  challenge: "solve",
  solver: "controls.blockDiagram",
  title: "Reduce It",
  instructions:
    "Find the closed-loop transfer function of this system. First choose the correct line for each reduction step (in symbols), " +
    "then work out $T(s) = \\dfrac{b_1 s + b_0}{s^2 + a_1 s + a_0}$ with the numbers in the picture.",
  setup: {
    diagram: {
      loop: { series: [{ block: "G1", tf: { num: [10] } }, { loop: { block: "G2", tf: { num: [1], den: [1, 1] } }, back: { block: "H2", tf: { num: [2] } }, sign: -1 }] },
      back: { block: "H1", tf: { num: [1], den: [1, 5] } },
      sign: -1,
    },
  },
  vary: [
    { path: "diagram.loop.series.0.tf.num.0", values: [5, 10, 15, 20] },
    { path: "diagram.loop.series.1.loop.tf.den.1", values: [1, 2] },
    { path: "diagram.loop.series.1.back.tf.num.0", values: [1, 2, 3] },
    { path: "diagram.back.tf.den.1", values: [4, 5, 6] },
  ],
  solve: { steps: ["choices", "answer"], choicesName: "Reduce the diagram" },
  ask: [{ quantity: "b1", precision: 0.01 }, { quantity: "b0", precision: 0.01 }, { quantity: "a1", precision: 0.01 }, { quantity: "a0", precision: 0.01 }],
  hints: [
    "Innermost first: the loop around $G_2$ with $H_2$. Then $G_1$ and that block are in series. Then the outer loop with $H_1$.",
    "With numbers, if $G_2 = \\dfrac{1}{s + a}$: the inner loop is $\\dfrac{1/(s + a)}{1 + H_2/(s + a)} = \\dfrac{1}{s + a + H_2}$ (multiply top and bottom by $s + a$).",
    "Outer loop: $\\dfrac{G}{1 + GH}$ with $G = \\dfrac{G_1}{s + a + H_2}$ and $H = \\dfrac{1}{s + p}$. Multiply top and bottom by both small bottoms, then expand.",
  ],
  explanation:
    "Symbols first, then numbers: $T = \\dfrac{G_1G_2}{1 + G_2H_2 + G_1G_2H_1}$. With transfer functions, clear the small fractions: " +
    "the bottom of the feedback block $H_1$ ends up on TOP of $T(s)$ — which is why $T$ has a zero where $H_1$ has a pole.",
};
