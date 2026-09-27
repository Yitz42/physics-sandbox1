// Block diagram reduction, stage 3 — build: choose a gain K and a rate
// (tachometer) feedback gain K_t so the closed loop is T = 25/(s² + 6s + 25).
// Hand check: the inner loop K·1/(s(s+1)) with feedback K_t·s gives
// K/(s² + (1 + K K_t)s); unity feedback then gives K/(s² + (1 + K K_t)s + K).
// So K = 25 and 1 + 25 K_t = 6 → K_t = 0.2.

const TARGET = { a1: 6, a0: 25 };

export default {
  id: "block-diagrams/3-build",
  challenge: "build",
  solver: "controls.blockDiagram",
  title: "Tune the Loop",
  instructions:
    "A motor position loop: gain $K$, the motor $\\dfrac{1}{s(s + 1)}$, and an inner loop that feeds back the motor's speed through a tachometer, $K_t s$. " +
    `Choose $K$ and $K_t$ so the whole system is $T(s) = \\dfrac{25}{s^2 + ${TARGET.a1}s + ${TARGET.a0}}$, then press **Test**.`,
  setup: {
    params: { K: 10, Kt: 0.1 },
    diagram: {
      loop: {
        loop: { series: [{ block: "K", tf: { num: ["K"] } }, { block: "G", tf: { num: [1], den: [1, 1, 0] }, show: ["1", "s(s + 1)"] }] },
        back: { block: "Kt", tex: "K_t", tf: { num: ["Kt", 0] }, show: ["Kt s"] },
        sign: -1,
      },
      back: null,
      sign: -1,
    },
  },
  editable: [
    { path: "params.K", label: "Gain K", min: 1, max: 50, step: 1, unit: "" },
    { path: "params.Kt", label: "Tachometer Kₜ", min: 0, max: 0.5, step: 0.01, unit: "" },
  ],
  goal: {
    text: `Make $T(s) = \\dfrac{25}{s^2 + ${TARGET.a1}s + ${TARGET.a0}}$.`,
    check(result) {
      const v = result.values;
      const f = (x) => Number(x.toFixed(3));
      const now = `Your system is $T(s) = \\dfrac{${f(v.b0)}}{s^2 + ${f(v.a1)}s + ${f(v.a0)}}$.`;
      if (Math.abs(v.a1 - TARGET.a1) < 0.01 && Math.abs(v.a0 - TARGET.a0) < 0.01) return { ok: true, message: `${now} Exactly on target.` };
      const tips = [];
      if (Math.abs(v.a0 - TARGET.a0) >= 0.01) tips.push("The last number in the bottom is set by $K$ alone.");
      if (Math.abs(v.a1 - TARGET.a1) >= 0.01) tips.push("The middle number is $1 + KK_t$: once $K$ is right, choose $K_t$.");
      return { ok: false, message: `${now} ${tips.join(" ")}` };
    },
  },
  hints: [
    "Reduce it in symbols first. The inner loop: $\\dfrac{K/(s(s + 1))}{1 + K K_t s/(s(s + 1))} = \\dfrac{K}{s^2 + (1 + KK_t)s}$.",
    "Unity feedback around that: $T = \\dfrac{K}{s^2 + (1 + KK_t)s + K}$.",
    "Match $s^2 + 6s + 25$: $K = 25$, then $1 + 25K_t = 6$.",
  ],
  explanation:
    "With rate feedback, $T(s) = \\dfrac{K}{s^2 + (1 + KK_t)s + K}$: $K$ sets the last coefficient and $K_t$ adds damping to the middle one — two knobs for two coefficients. " +
    "Without the tachometer ($K_t = 0$) the middle coefficient would be stuck at 1, and the response would oscillate much more.",
};
