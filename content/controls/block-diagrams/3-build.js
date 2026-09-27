// Block diagram reduction, stage 3 — build, in two parts.
//   1. Tune the loop: choose a gain K and a rate (tachometer) feedback gain K_t
//      so the closed loop is T = 25/(s² + 6s + 25).
//      Hand check: the inner loop K·1/(s(s+1)) with feedback K_t·s gives
//      K/(s² + (1 + K K_t)s); unity feedback then gives K/(s² + (1 + K K_t)s + K).
//      So K = 25 and 1 + 25 K_t = 6 → K_t = 0.2.
//   2. Build it yourself (the workbench, challenges/workbench.js): put the blocks
//      of a motor loop in by hand, then combine them one rule at a time, writing
//      each formula. Hand check: G1 = 10, G2 = 1/(s(s + 2)), H1 = 0.5s around G2,
//      unity feedback outside:
//        inner loop: G2/(1 + G2H1) = 1/(s² + 2s + 0.5s) = 1/(s² + 2.5s)
//        series: 10/(s² + 2.5s);  unity loop: T = 10/(s² + 2.5s + 10).

const TARGET = { a1: 6, a0: 25 };

// Part 2's target, as the workbench reports it: lowest power first, bottom monic.
const WANT = { num: [10], den: [10, 2.5, 1] };
const same = (a, b) => a.length === b.length && a.every((c, i) => Math.abs(c - b[i]) < 1e-6);

export default {
  id: "block-diagrams/3-build",
  challenge: "build",
  solver: "controls.blockDiagram",
  title: "Tune the Loop",
  mission: "Build and tune feedback loops made of blocks.",
  parts: [
    {
      title: "Tune the loop",
      mission: "Choose $K$ and $K_t$ so the whole system has the target transfer function.",
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
    },
    {
      title: "Build it yourself",
      mission: "Build the motor loop block by block, then combine it into one block, $T(s)$.",
      instructions:
        "Make each block, choose how it connects, and put it in: drag it onto the picture, or click it and then click a spot (a preview shows what will happen). " +
        "Build this system: an amplifier $G_1 = 10$, then a motor $G_2 = \\dfrac{1}{s(s + 2)}$ with a tachometer $H_1 = 0.5s$ as negative feedback around the motor, " +
        "and unity negative feedback around everything. Then combine it: click the blocks of one group, choose its rule, and write the combined block's formula.",
      workbench: true,
      setup: { diagram: null },
      goal: {
        text: "Build the motor loop and combine it all the way down to ONE block, writing each formula. Its transfer function must be the motor loop's $T(s)$.",
        check({ T, oneBlock }) {
          if (!T) return { ok: false, message: "Put the blocks in first." };
          if (!T.numeric) return { ok: false, message: "Give every block its transfer function (10, 1/(s(s + 2)), 0.5s) so the numbers can be checked." };
          const got = T.numeric;
          if (!same(got.num, WANT.num) || !same(got.den, WANT.den)) {
            return { ok: false, message: "Your diagram isn't the motor loop yet: its $T(s)$ comes out different. Check each block's transfer function and how it connects — the tachometer goes around the motor only, and the unity loop around everything." };
          }
          if (!oneBlock) return { ok: false, message: "That's the right system! Now combine it, one group at a time, until only one block is left." };
          return { ok: true, message: "Built and reduced by hand: $T(s) = \\dfrac{10}{s^2 + 2.5s + 10}$." };
        },
      },
      hints: [
        "Start with $G_1$ (the first block just goes in). Then put $G_2$ in series after it, then $H_1$ as negative feedback around $G_2$ — drop it on $G_2$, not on the whole row.",
        "Last, choose \"Close a unity feedback loop around it\" and drop it on the whole row (hover between the blocks so the outline covers both).",
        "Combine inside out: the inner loop ($G_2$ with $H_1$) first, then the two blocks in series, then the unity loop.",
      ],
      explanation:
        "Building a diagram and reducing it are the same rules run backwards and forwards: a block after a block is series (multiply), a feedback block wraps a loop ($\\dfrac{G}{1 + GH}$). " +
        "Reducing from the inside out: $\\dfrac{1}{s^2 + 2.5s}$, then $\\dfrac{10}{s^2 + 2.5s}$, then $T = \\dfrac{10}{s^2 + 2.5s + 10}$.",
    },
  ],
};
