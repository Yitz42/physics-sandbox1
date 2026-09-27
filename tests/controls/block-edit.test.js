// The block diagram workbench (block-edit.js, block-combine.js): putting blocks
// in, finding groups, checking rules and formulas, combining — worked by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { makeBlock, insertBlock, nodeAt } from "../../src/subjects/controls/block-edit.js";
import { groupsOf, checkRule, checkFormula, groupNode, combineGroup } from "../../src/subjects/controls/block-combine.js";
import { reduce } from "../../src/subjects/controls/block-diagram.js";
import { checkStage } from "../../src/core/content.js";
import workbenchPage from "../../content/controls/workbench/1-workbench.js";
import buildStage from "../../content/controls/block-diagrams/3-build.js";

setFile("controls / block diagram workbench");

const mk = (name, tf, tree = null) => makeBlock(name, tf, tree).block;

// The motor loop: G1 = 10 → G2 = 1/(s(s + 2)) with H1 = 0.5s around G2 → unity loop around all.
function motorLoop() {
  let t = insertBlock(null, [], mk("G1", "10"), "after");
  t = insertBlock(t, [], mk("G2", "1/(s(s + 2))", t), "after"); // after the whole (one block)
  t = insertBlock(t, [["series", 1]], mk("H1", "0.5s", t), "feedback"); // around G2 only
  return insertBlock(t, [], null, "unity"); // around everything
}

test("making blocks: names and transfer functions are checked", () => {
  equal(makeBlock("G1", "10/(s + 2)", null).block.tf, { num: [10], den: [1, 2] });
  ok(/capital letter/.test(makeBlock("g1", "", null).error));
  ok(/already/.test(makeBlock("G1", "", { block: "G1" }).error));
  ok(/Transfer function/.test(makeBlock("G2", "10/(s + ", null).error));
});

test("putting blocks in: series joins a series, feedback wraps, unity closes a loop", () => {
  const t = motorLoop();
  equal(t.sign, -1);
  equal(t.back, null, "unity feedback outside");
  equal(t.loop.series.map((n) => n.block || "loop"), ["G1", "loop"]);
  equal(nodeAt(t, [["loop"], ["series", 1], ["back"]]).block, "H1");
  // Another block after G1 joins the same series (no series inside a series).
  const t2 = insertBlock(t, [["loop"], ["series", 0]], mk("G3", "", t), "after");
  equal(t2.loop.series.length, 3);
  // Parallel, subtracted:
  const p = insertBlock({ block: "G1" }, [], { block: "G2" }, "parallelMinus");
  equal(p, { parallel: [{ block: "G1" }, { block: "G2" }], signs: [1, -1] });
});

test("the whole built motor loop is T = 10/(s² + 2.5s + 10)", () => {
  // Inner: G2/(1 + G2H1) = 1/(s² + 2.5s); series: 10/(s² + 2.5s); unity: 10/(s² + 2.5s + 10)
  const T = reduce({ diagram: motorLoop() }).T.numeric;
  equal(T.num, [10]);
  equal(T.den, [10, 2.5, 1]);
});

test("groups and rules: the right rule passes, a wrong one is named", () => {
  const t = motorLoop();
  equal(groupsOf(t, ["G2", "H1"]).map((g) => g.kind), ["loop"]);
  ok(checkRule(t, ["G2", "H1"], "loop").ok);
  const wrong = checkRule(t, ["G2", "H1"], "series");
  ok(!wrong.ok && /feedback loop/.test(wrong.message));
  ok(!checkRule(t, ["G1", "G2"], "series").ok, "G2 is still inside its loop: combine that first");
});

test("formulas: right, a classic slip explained, or unreadable", () => {
  const t = motorLoop();
  const node = groupNode(t, checkRule(t, ["G2", "H1"], "loop").group);
  ok(checkFormula("G2/(1 + G2 H1)", node).ok);
  ok(checkFormula("G2/(H1G2 + 1)", node).ok, "any order");
  ok(/leave out the feedback block/.test(checkFormula("G2/(1 + G2)", node).message));
  const sign = checkFormula("G2/(1 - G2 H1)", node);
  ok(!sign.ok && /sign/.test(sign.message) && sign.kinds.includes("sign"));
  ok(checkFormula("G2/(1 + ", node).parseError);
});

test("combining all the way: G_e1, G_e2, G_e3 — and the numbers follow", () => {
  let t = motorLoop();
  const syms = {};
  const step = (names, rule, name) => {
    const r = combineGroup(t, checkRule(t, names, rule).group, name, syms);
    syms[name] = r.sym;
    t = r.tree;
    return r;
  };
  const a = step(["G2", "H1"], "loop", "Ge1");
  equal(a.numeric.den, [0, 2.5, 1]); // 1/(s² + 2.5s)
  step(["G1", "Ge1"], "series", "Ge2");
  const c = step(["Ge2"], "loop", "Ge3");
  equal(t.block, "Ge3", "one block left");
  equal(c.numeric.num, [10]);
  equal(c.numeric.den, [10, 2.5, 1]);
});

test("the workbench stage files are valid, and part 2's goal accepts the motor loop", () => {
  equal(checkStage(workbenchPage), []);
  equal(checkStage(buildStage), []);
  const goal = buildStage.parts[1].goal;
  const T = reduce({ diagram: motorLoop() }).T;
  ok(!goal.check({ T, oneBlock: false }).ok, "built but not combined");
  ok(goal.check({ T, oneBlock: true }).ok);
});
