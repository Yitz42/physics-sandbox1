// Block diagram reduction (Nise, chapter 5), with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { reduce, exprTex, partialDiagram } from "../../src/subjects/controls/block-diagram.js";
import { solveBlocks, blockMistakes, blockChoices, blockDebug, blockSummary } from "../../src/subjects/controls/block-tools.js";
import { blockScene } from "../../src/subjects/controls/block-layout.js";

setFile("controls / block diagrams");

// An inner loop (G2 with feedback H2) in series with G1, inside an outer loop H1.
const twoLoops = () => ({
  diagram: { loop: { series: [{ block: "G1" }, { loop: { block: "G2" }, back: { block: "H2" }, sign: -1 }] }, back: { block: "H1" }, sign: -1 },
});

test("two loops: 3 steps — inner loop, series, outer loop — giving G₁G₂/(1 + G₂H₂ + G₁G₂H₁)", () => {
  const red = reduce(twoLoops());
  equal(red.steps.map((s) => s.kind), ["loop", "series", "loop"]);
  equal(exprTex(red, red.steps[0].stepSym), "\\dfrac{G_{2}}{1 + G_{2}H_{2}}");
  equal(exprTex(red, red.steps[1].stepSym), "G_{1}G_{e1}");
  equal(red.steps[2].tex, "T(s)");
  equal(exprTex(red, red.T.sym), "\\dfrac{G_{1}G_{2}}{1 + G_{2}H_{2} + G_{1}G_{2}H_{1}}");
});

test("unity feedback: G = 10/(s(s + 1)) → T = 10/(s² + s + 10), T(0) = 1", () => {
  const v = solveBlocks({ diagram: { loop: { block: "G", tf: { num: [10], den: [1, 1, 0] } }, back: null, sign: -1 } }).values;
  equal([v.b0, v.a1, v.a0, v.order], [10, 1, 10, 2]);
  close(v.dc, 1);
});

// Rate (tachometer) feedback K_t·s around K·1/(s(s + 1)), inside unity feedback:
//   inner: K/(s² + s + K K_t s);  outer: K/(s² + (1 + K K_t)s + K)
test("rate feedback: K = 25 and K_t = 0.2 → T = 25/(s² + 6s + 25)", () => {
  const setup = {
    params: { K: 25, Kt: 0.2 },
    diagram: { loop: { loop: { series: [{ block: "K", tf: { num: ["K"] } }, { block: "G", tf: { num: [1], den: [1, 1, 0] } }] }, back: { block: "Kt", tf: { num: ["Kt", 0] } }, sign: -1 }, back: null, sign: -1 },
  };
  const v = solveBlocks(setup).values;
  close(v.a1, 6);
  close(v.a0, 25);
  close(v.b0, 25);
});

test("parallel branches with a minus: (G₁ − G₂)G₃; numbers 5, 2, 3 → T = 9", () => {
  const setup = { diagram: { series: [{ parallel: [{ block: "G1", tf: { num: [5] } }, { block: "G2", tf: { num: [2] } }], signs: [1, -1] }, { block: "G3", tf: { num: [3] } }] } };
  const red = reduce(setup);
  equal(exprTex(red, red.T.sym), "G_{1}G_{3} - G_{2}G_{3}");
  close(solveBlocks(setup).values.dc, 9);
});

test("mistakes: for G = 10/(s(s + 1)), H = 2 the slips give a0 = 20 (right), −20 (sign), 10 (no H)", () => {
  const setup = { diagram: { loop: { block: "G", tf: { num: [10], den: [1, 1, 0] } }, back: { block: "H", tf: { num: [2] } }, sign: -1 } };
  close(solveBlocks(setup).values.a0, 20);
  const m = blockMistakes(setup, "a0");
  ok(m.some((x) => Math.abs(x.value + 20) < 1e-9 && /NEGATIVE feedback/.test(x.message)), "sign slip");
  ok(m.some((x) => Math.abs(x.value - 10) < 1e-9 && /leave out the feedback block H/.test(x.message)), "no H");
});

test("solve choices: one group per step, each with exactly one right option", () => {
  const groups = blockChoices(twoLoops());
  equal(groups.length, 3);
  for (const g of groups) {
    equal(g.options.filter((o) => o.correct).length, 1);
    ok(g.options.length >= 2, "at least one wrong option");
    ok(g.options.filter((o) => !o.correct).every((o) => o.feedback), "every wrong option explains itself");
  }
});

test("debug: a sign slip in the inner loop is the wrong line, and the final answer follows from it", () => {
  const d = blockDebug(twoLoops(), { step: 0, kind: "sign" });
  equal(d.wrong, "step0");
  ok(d.lines[0].tex.includes("1 - G_{2}H_{2}"), d.lines[0].tex);
  ok(d.follows.includes("step2"), "the last line changes too");
  equal(d.fixes.filter((f) => f.correct).length, 1);
});

test("pictures: after 1 step the inner loop is one block G_e1; the next group is outlined", () => {
  const setup = { ...twoLoops(), reduce: 1 };
  const { diagram } = partialDiagram(setup, 1);
  equal(diagram.loop.series[1].block, "Ge1");
  const shapes = blockScene(setup, solveBlocks(setup));
  ok(shapes.some((s) => s.type === "tfblock" && s.label === "G_{e1}" && s.role === "reduced"), "reduced block drawn");
  ok(shapes.some((s) => s.type === "groupbox" && /series/.test(s.label)), "next group outlined");
  equal(blockSummary(setup, solveBlocks(setup)).length, 2); // the step done, and "Next: …"
});
