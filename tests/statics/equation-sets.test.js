// Alternative equation sets (Unit 4.3): two moment equations and a force
// equation, or three moment equations — and when a set can't do the job.
// The jib crane of Unit 4.2: post from A (0, 0) to (0, 3), arm to C (2.5, 3);
// pin at A, roller B at (0, 1.5) on the wall (pushes left), P = 800 N down at C.
//   ΣM_A: 1.5B_x − 2.5P = 0 → B_x = 1333.3 N   (only B_x: A's two reactions act at A)
//   ΣM_B: 1.5A_x − 2.5P = 0 → A_x = 1333.3 N   (only A_x: A_y's line x = 0 runs through B)
//   ΣF_y: A_y − P = 0      → A_y = 800 N       (only A_y: B_x is level)
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveRigidBody, rigidBodyEquations } from "../../src/subjects/statics/rigid-body.js";
import { checkSet, sumsOf } from "../../src/subjects/statics/rigid-body-sets.js";

setFile("statics / alternative equation sets");

const crane = (sums, points = {}) => ({
  body: { points: [[0, 0], [0, 3], [2.5, 3]] },
  supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [0, 1.5], normal: [-1, 0] }],
  forces: [{ id: "P", symbol: "P", magnitude: 800, direction: "down", at: [2.5, 3] }],
  points: { C: [2.5, 3], D: [0, 3], ...points },
  ...(sums ? { sums } : {}),
});
const unknownsIn = (setup) => solveRigidBody(setup).setUnknowns;

test("ΣM_A, ΣM_B, ΣF_y on the jib crane: one unknown each (B_x, A_x, A_y), and it works", () => {
  const r = solveRigidBody(crane([{ M: "A" }, { M: "B" }, { F: "y" }]));
  equal(r.equations.map((e) => e.id), ["sumM_A", "sumM_B", "sumFy"]);
  equal(r.setUnknowns, [["B_x"], ["A_x"], ["A_y"]]);
  equal(r.values.setOk, 1);
  equal(r.values.setMax, 1);
  equal(r.status, "determinate");
  close(r.values.B_x, 1333.33);
  close(r.values.A_x, 1333.33);
  close(r.values.A_y, 800);
});

test("ΣM_A, ΣM_B, ΣF_x fails: A and B are straight above each other (AB ⟂ x)", () => {
  const r = solveRigidBody(crane([{ M: "A" }, { M: "B" }, { F: "x" }]));
  equal(r.values.setOk, 0);
  ok(/straight above each other/.test(r.message), r.message);
  equal(r.status, "determinate", "the crane itself is fine — only the set is no good");
  close(r.values.A_y, 800, 1e-3, "(the answers still come from the usual set)");
});

test("ΣM_A, ΣM_B, ΣM_C with C at the arm's tip works; with D on the post (A, B, D in line) it doesn't", () => {
  const good = solveRigidBody(crane([{ M: "A" }, { M: "B" }, { M: "C" }]));
  equal(good.values.setOk, 1);
  equal(good.setUnknowns[2], ["A_x", "A_y", "B_x"], "about the tip, all three unknowns have a moment");
  const bad = solveRigidBody(crane([{ M: "A" }, { M: "B" }, { M: "D" }]));
  equal(bad.values.setOk, 0);
  ok(/one line/.test(bad.message), bad.message);
});

test("a set with the same equation twice is refused", () => {
  const sums = sumsOf(crane([{ M: "A" }, { M: "A" }, { F: "y" }]));
  ok(!checkSet(sums).ok);
  ok(/same equation/.test(checkSet(sums).message));
});

test("ΣM_A in the set equals the usual ΣM_A (same terms, same moment arms)", () => {
  const usual = rigidBodyEquations({ ...crane(null), about: "A" }).find((e) => e.id === "sumM");
  const inSet = rigidBodyEquations(crane([{ M: "A" }, { M: "B" }, { F: "y" }])).find((e) => e.id === "sumM_A");
  equal(inSet.terms.map((t) => [t.id, t.sign, t.factor && t.factor.value]), usual.terms.map((t) => [t.id, t.sign, t.factor && t.factor.value]));
});

test("without a set, the usual ΣF_x, ΣF_y, ΣM equations (ids unchanged)", () => {
  equal(rigidBodyEquations(crane(null)).map((e) => e.id), ["sumFx", "sumFy", "sumM"]);
  equal(unknownsIn(crane(null)).length, 3);
});

test("a beam: ΣM_A, ΣM_B and ΣF_x works (AB is level, not ⟂ x); ΣF_y instead fails", () => {
  // pin A (0, 0), roller B (6, 0), 600 N down at 2 m: B_y = 200, A_y = 400, A_x = 0
  const beam = (F) => ({
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0] }],
    sums: [{ M: "A" }, { M: "B" }, { F }],
  });
  const r = solveRigidBody(beam("x"));
  equal(r.values.setOk, 1);
  equal(r.setUnknowns, [["B_y"], ["A_y"], ["A_x"]]);
  close(r.values.B_y, 200);
  close(r.values.A_y, 400);
  const bad = solveRigidBody(beam("y"));
  equal(bad.values.setOk, 0);
  ok(/level with each other/.test(bad.message), bad.message);
});
