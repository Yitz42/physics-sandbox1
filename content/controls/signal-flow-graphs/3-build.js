// Signal-flow graphs, stage 3 — build: choose the gain k of an outer feedback
// branch so the whole graph's gain is T = 2.
// Hand check: P = G1G2 = 10 (touches both loops); L1 = −G1H1 = −1, L2 = −G1G2k = −10k,
// touching (both pass through A): Δ = 1 + 1 + 10k, T = 10/(2 + 10k). T = 2 → k = 0.3.

const TARGET = 2;

export default {
  id: "signal-flow-graphs/3-build",
  challenge: "build",
  solver: "controls.signalFlow",
  title: "Set the Feedback Gain",
  instructions:
    `This system has an inner loop ($-H_1$) and an outer feedback branch with an adjustable gain $k$. Choose $k$ so the overall gain is exactly $T = ${TARGET}$, then press **Test**. ` +
    "Gains: $G_1 = 5$, $G_2 = 2$, $H_1 = 0.2$.",
  setup: {
    input: "R",
    output: "C",
    nodes: [
      { id: "R", at: [0, 0], label: "R(s)" },
      { id: "A", at: [1.8, 0], label: "V_1" },
      { id: "B", at: [3.6, 0], label: "V_2" },
      { id: "Y", at: [5.4, 0], label: "V_3" },
      { id: "C", at: [7.2, 0], label: "C(s)" },
    ],
    branches: [
      { from: "R", to: "A", gain: 1 },
      { from: "A", to: "B", gain: "G1" },
      { from: "B", to: "Y", gain: "G2" },
      { from: "Y", to: "C", gain: 1 },
      { from: "B", to: "A", gain: "-H1", bend: -0.75 },
      { from: "Y", to: "A", gain: "-k", bend: 1.3 },
    ],
    symbols: { G1: { value: 5 }, G2: { value: 2 }, H1: { value: 0.2 }, k: { tex: "k", label: "k", value: 0.1 } },
  },
  editable: [{ path: "symbols.k.value", label: "Gain k", min: 0, max: 1, step: 0.01, unit: "" }],
  goal: {
    text: `Make the overall gain $T = ${TARGET}$ (within 0.01).`,
    check(result, setup) {
      const v = result.values;
      const k = setup.symbols.k.value;
      const now = `With $k = ${k}$: $\\Delta = ${Number(v.Delta.toFixed(3))}$ and $T = ${Number(v.T.toFixed(3))}$.`;
      if (Math.abs(v.T - TARGET) <= 0.01) return { ok: true, message: `${now} On target.` };
      return { ok: false, message: `${now} ${v.T > TARGET ? "Too big: more feedback (bigger $k$) makes $\\Delta$ bigger and $T$ smaller." : "Too small: less feedback (smaller $k$)."} Write $T$ with Mason's rule in terms of $k$, then solve.` };
    },
  },
  hints: [
    "One forward path, $P = G_1G_2 = 10$, and it touches both loops, so $\\Delta_1 = 1$.",
    "The loops: $L_1 = -G_1H_1 = -1$ and $L_2 = -G_1G_2k = -10k$. They both pass through $V_1$, so they touch.",
    "$T = \\dfrac{10}{1 + 1 + 10k}$. Set that to 2 and solve for $k$.",
  ],
  explanation:
    "Mason's rule turns a design question into algebra: $T = \\dfrac{10}{2 + 10k}$, so $T = 2$ needs $k = 0.3$. " +
    "More feedback gain makes $\\Delta$ larger and the closed-loop gain smaller.",
};
