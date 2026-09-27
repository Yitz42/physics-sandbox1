// Signal-flow graphs and Mason's rule (Nise, chapter 5), worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { mason, forwardPaths, loops } from "../../src/subjects/controls/signal-flow.js";
import { solveSignalFlow, signalMistakes, signalChoices, signalDebug, masonLines } from "../../src/subjects/controls/signal-flow-tools.js";
import { litParts } from "../../src/subjects/controls/signal-flow-scene.js";

setFile("controls / signal-flow graphs");

// R → A → B → X → D → C along G1, G2, G3; loops: B→A (−H1), D→X (−H2), D→A (−H3);
// a second forward path R → X (G4) → D → C.
//   P1 = G1G2G3 (touches every loop, Δ1 = 1);  P2 = G4G3 (misses L1, so Δ2 = 1 + G1H1)
//   L1 = −G1H1, L2 = −G3H2, L3 = −G1G2G3H3; only L1 and L2 don't touch.
//   Δ = 1 + G1H1 + G3H2 + G1G2G3H3 + G1G3H1H2
// Numbers G1 = 2, G2 = 3, G3 = 1, G4 = 1.5, H1 = 0.5, H2 = 2, H3 = 0.1:
//   Δ = 1 + 1 + 2 + 0.6 + 2 = 6.6;  T = (6·1 + 1.5·2) / 6.6 = 1.3636
const graph = () => ({
  nodes: [{ id: "R", at: [0, 0] }, { id: "A", at: [1, 0] }, { id: "B", at: [2, 0] }, { id: "X", at: [3, 0] }, { id: "D", at: [4, 0] }, { id: "C", at: [5, 0] }],
  branches: [
    { from: "R", to: "A", gain: 1 }, { from: "A", to: "B", gain: "G1" }, { from: "B", to: "X", gain: "G2" },
    { from: "X", to: "D", gain: "G3" }, { from: "D", to: "C", gain: 1 },
    { from: "B", to: "A", gain: "-H1" }, { from: "D", to: "X", gain: "-H2" }, { from: "D", to: "A", gain: "-H3" },
    { from: "R", to: "X", gain: "G4" },
  ],
  input: "R", output: "C",
  symbols: { G1: { value: 2 }, G2: { value: 3 }, G3: { value: 1 }, G4: { value: 1.5 }, H1: { value: 0.5 }, H2: { value: 2 }, H3: { value: 0.1 } },
});

test("Mason: 2 forward paths, 3 loops, 1 non-touching pair", () => {
  const g = graph();
  equal(forwardPaths(g).length, 2);
  equal(loops(g).length, 3);
  const v = solveSignalFlow(g).values;
  equal([v.paths, v.loops, v.pairs], [2, 3, 1]);
});

test("Mason: Δ = 6.6, Δ₂ = 2, T = 9/6.6 = 1.3636", () => {
  const v = solveSignalFlow(graph()).values;
  close(v.Delta, 6.6);
  close(v.Delta1, 1);
  close(v.Delta2, 2);
  close(v.T, 9 / 6.6);
});

test("Mason: the lines in symbols", () => {
  const lines = masonLines(graph());
  const byId = Object.fromEntries(lines.map((l) => [l.id, l.tex]));
  equal(byId.delta, "\\Delta = 1 + G_{1}H_{1} + G_{3}H_{2} + G_{1}G_{2}G_{3}H_{3} + G_{1}G_{3}H_{1}H_{2}");
  equal(byId.delta2, "\\Delta_{2} = 1 + G_{1}H_{1}");
});

test("Mason mistakes: no pair product → Δ = 4.6, T = 1.957; wrong loop sign; Δ₂ = 1", () => {
  const m = signalMistakes(graph(), "T");
  ok(m.some((x) => Math.abs(x.value - 9 / 4.6) < 1e-9 && /non-touching/.test(x.message)), "left out L1L2");
  ok(m.some((x) => Math.abs(x.value - 7.5 / 6.6) < 1e-9 && /keeps the loops/.test(x.message)), "Δ2 taken as 1");
  ok(signalMistakes(graph(), "loops").some((x) => x.value === 2), "a missing loop");
});

test("Mason choices and debug: one right option per group (loops, Δ, each Δ_k); Δ is the wrong line for a missing pair", () => {
  equal(signalChoices(graph()).map((g) => g.title)[0], "The loops");
  for (const g of signalChoices(graph())) equal(g.options.filter((o) => o.correct).length, 1);
  const d = signalDebug(graph(), { kind: "noPairs" });
  equal(d.wrong, "delta");
  // A wrong loop sign also spoils Δ₂ (which is built the same way): that line "follows".
  ok(signalDebug(graph(), { kind: "loopSign" }).follows.includes("delta2"));
});

test("highlight: path 2 lights up R → X → D → C; the non-touching set lights up both loops' branches", () => {
  const g = { ...graph(), show: { kind: "paths", index: 1 } };
  equal(litParts(g).nodes, ["R", "X", "D", "C"]);
  const s = litParts({ ...graph(), show: { kind: "sets", index: 0 } });
  equal(s.branches.length, 4);
  equal(mason(graph()).nonTouching.length, 1);
});
