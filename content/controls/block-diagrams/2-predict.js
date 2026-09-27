// Block diagram reduction, stage 2 — predict the closed-loop transfer function,
// in three parts:
//   1. constant gains: T = K1K2 / (1 + K1K2H), one number;
//   2. G = K/(s(s + a)) with feedback H = h: T = K/(s² + as + Kh);
//   3. an inner loop inside unity feedback: K/(s + a + k + K).

export default {
  id: "block-diagrams/2-predict",
  challenge: "predict",
  solver: "controls.blockDiagram",
  title: "Close the Loop",
  mission: "Predict the closed-loop gain of each block diagram.",
  parts: [
    {
      title: "Constant gains",
      instructions:
        "Every block here is just a number (a gain). Find the closed-loop gain $T = C/R$ of the whole diagram, then press **Test**.",
      setup: {
        diagram: { loop: { series: [{ block: "K1", tf: { num: [8] } }, { block: "K2", tf: { num: [2] } }] }, back: { block: "H", tf: { num: [0.25] } }, sign: -1 },
      },
      vary: [
        { path: "diagram.loop.series.0.tf.num.0", values: [2, 4, 5, 6, 8, 10] },
        { path: "diagram.loop.series.1.tf.num.0", values: [1, 2, 3, 5] },
        { path: "diagram.back.tf.num.0", values: [0.1, 0.2, 0.25, 0.5, 1] },
      ],
      ask: [{ quantity: "dc", label: "T", precision: 0.01 }],
      hints: [
        "First combine the two blocks in series: they multiply.",
        "Then the loop: $T = \\dfrac{G}{1 + GH}$ with $G = K_1K_2$.",
      ],
      explanation:
        "Series gains multiply ($G = K_1K_2$), and the negative-feedback loop gives $T = \\dfrac{G}{1 + GH}$. " +
        "Notice that when $GH$ is large, $T \\approx 1/H$: the feedback path, not the forward gain, sets the closed-loop gain.",
    },
    {
      title: "A transfer function in the loop",
      instructions:
        "Now $G(s) = \\dfrac{K}{s(s + a)}$ and the feedback is a constant $H$. Write the closed loop as " +
        "$T(s) = \\dfrac{b_0}{s^2 + a_1 s + a_0}$ and find $b_0$, $a_1$ and $a_0$ (to ±0.01), then press **Test**.",
      setup: {
        params: { K: 20, a: 3, h: 1 },
        diagram: { loop: { block: "G", tf: { num: ["K"], den: [1, "a", 0] }, show: ["K", "s(s + a)"] }, back: { block: "H", tf: { num: ["h"] } }, sign: -1 },
      },
      vary: [
        { path: "params.K", min: 4, max: 40, step: 2 },
        { path: "params.a", values: [1, 2, 3, 4, 5, 6] },
        { path: "params.h", values: [0.5, 1, 2] },
      ],
      ask: [{ quantity: "b0", precision: 0.01 }, { quantity: "a1", precision: 0.01 }, { quantity: "a0", precision: 0.01 }],
      hints: [
        "$T = \\dfrac{G}{1 + GH}$. Multiply top and bottom by $s(s + a)$ to clear the small fractions.",
        "$T = \\dfrac{K}{s(s + a) + KH}$.",
        "Expand: $s(s + a) = s^2 + as$. So $a_1 = a$ and $a_0 = KH$.",
      ],
      explanation:
        "$T(s) = \\dfrac{K}{s^2 + as + KH}$. The feedback puts $KH$ into the bottom: raising $K$ changes the closed loop's dynamics, " +
        "which is how a controller's gain shapes the response (chapter 4 turns these coefficients into $\\zeta$ and $\\omega_n$).",
    },
    {
      title: "A loop inside a loop",
      instructions:
        "An inner loop (block $\\dfrac{1}{s + a}$ with feedback gain $k$) sits after a gain $K$, inside unity feedback. " +
        "Write $T(s) = \\dfrac{b_0}{s + a_0}$ and find $b_0$ and $a_0$, then press **Test**.",
      setup: {
        params: { K: 6, a: 2, k: 3 },
        diagram: {
          loop: { series: [{ block: "K", tf: { num: ["K"] } }, { loop: { block: "G", tf: { num: [1], den: [1, "a"] }, show: ["1", "s + a"] }, back: { block: "k", tex: "k", tf: { num: ["k"] } }, sign: -1 }] },
          back: null,
          sign: -1,
        },
      },
      vary: [
        { path: "params.K", min: 2, max: 20, step: 1 },
        { path: "params.a", values: [1, 2, 3, 4, 5] },
        { path: "params.k", values: [1, 2, 3, 4] },
      ],
      ask: [{ quantity: "b0", precision: 0.01 }, { quantity: "a0", precision: 0.01 }],
      hints: [
        "Inner loop first: $\\dfrac{1/(s + a)}{1 + k/(s + a)} = \\dfrac{1}{s + a + k}$.",
        "In series with $K$: $\\dfrac{K}{s + a + k}$. Then the unity loop.",
        "$T = \\dfrac{K}{s + a + k + K}$.",
      ],
      explanation:
        "Inside out: the inner loop gives $\\dfrac{1}{s + a + k}$, the gain makes it $\\dfrac{K}{s + a + k}$, and unity feedback gives $T = \\dfrac{K}{s + a + k + K}$. " +
        "Each loop adds its loop gain to the bottom.",
    },
  ],
  explanation:
    "Close each loop with $\\dfrac{G}{1 + GH}$, from the inside out, and clear the small fractions: the loop gains end up in the bottom of $T(s)$.",
};
