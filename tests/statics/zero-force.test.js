// Zero-force members by inspection (Unit 5.2), checked against the full solution.
// The Pratt bridge: bottom A (0, 0) pin, B (3, 0), C (6, 0), D (9, 0), E (12, 0) roller;
// top F (3, 3), G (6, 3), H (9, 3); diagonals FC and HC slope down to the middle.
//   P at C: B has AB, BC in line (BF off it) → F_BF = 0; D likewise → F_DH = 0;
//           G has FG, GH in line and no load → F_CG = 0.   (3 members)
//   P at G: the load at G acts across FG–GH's line, so CG carries it: F_CG = −P.  (2 members)
// The wall bracket of Unit 5.1 (roller at A pushing along AC): A has A's push and AC
// in line, AB off it → F_AB = 0.
import { test, ok, equal, close, setFile } from "../harness.js";
import { zeroByInspection, zeroSteps, zeroMistakes, solveTrussZero } from "../../src/subjects/statics/truss-zero.js";

setFile("statics / zero-force members");

const bridge = (joint) => ({
  joints: { A: [0, 0], B: [3, 0], C: [6, 0], D: [9, 0], E: [12, 0], F: [3, 3], G: [6, 3], H: [9, 3] },
  members: ["AB", "BC", "CD", "DE", "FG", "GH", "AF", "EH", "BF", "CG", "DH", "CF", "CH"],
  supports: [{ id: "A", type: "pin" }, { id: "E", type: "roller" }],
  forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", joint }],
});
const solvedZeros = (setup) => Object.entries(solveTrussZero(setup).states).filter(([, s]) => s === "zero").map(([id]) => id).sort();

test("bridge, P at C: BF, DH and CG are zero by inspection — and the full solution agrees", () => {
  const z = zeroByInspection(bridge("C"));
  equal(z.zero.slice().sort(), ["F_BF", "F_CG", "F_DH"]);
  equal(solvedZeros(bridge("C")), ["F_BF", "F_CG", "F_DH"]);
  equal(solveTrussZero(bridge("C")).values.zeroCount, 3);
  const atB = z.steps.find((s) => s.joint === "B");
  equal(atB.rule, "line");
  equal(atB.line.slice().sort(), ["F_AB", "F_BC"]);
});

test("bridge, P at G: the load stops the rule at G — only BF and DH, and CG pushes with P", () => {
  const s = bridge("G");
  equal(zeroByInspection(s).zero.slice().sort(), ["F_BF", "F_DH"]);
  equal(solvedZeros(s), ["F_BF", "F_DH"]);
  close(solveTrussZero(s).values.F_CG, -1200);
});

test("bridge, P at C: F_FC = +0.7071P (tension), F_FG = −P, F_AB = F_BC = +P/2", () => {
  const v = solveTrussZero(bridge("C")).values;
  close(v.F_CF, 848.53);
  close(v.F_FG, -1200);
  close(v.F_AB, 600);
  close(v.F_BC, 600);
});

test("a support push along a member counts: the wall bracket's AB is zero", () => {
  const wall = {
    joints: { A: [0, 0], B: [0, 3], C: [4, 0] },
    members: ["AB", "AC", "BC"],
    supports: [{ id: "A", type: "roller", normal: [1, 0] }, { id: "B", type: "pin", normal: [1, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 900, direction: "down", joint: "C" }],
  };
  equal(zeroByInspection(wall).zero, ["F_AB"]);
  equal(solvedZeros(wall), ["F_AB"]);
});

test("two members at an unloaded joint, not in line: both zero", () => {
  // A triangle A-B-C carrying P at C, with an extra joint D tied to A and B only.
  const s = {
    joints: { A: [0, 0], B: [4, 0], C: [2, 2], D: [2, -2] },
    members: ["AB", "AC", "BC", "AD", "BD"],
    supports: [{ id: "A", type: "pin" }, { id: "B", type: "roller" }],
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: "down", joint: "C" }],
  };
  const z = zeroByInspection(s);
  equal(z.zero.slice().sort(), ["F_AD", "F_BD"]);
  equal(z.steps[0].rule, "two");
  equal(solvedZeros(s), ["F_AD", "F_BD"]);
});

test("debug working: a rule used at a loaded joint is the wrong line; the count follows from it", () => {
  const w = zeroSteps(bridge("G"), { kind: "loaded", joint: "G", line: ["FG", "GH"], member: "CG" });
  equal(w.lines.length, 4, "B, D, the wrong G line, the count");
  equal(w.lines.map((l) => l.id).filter((id) => id === "wrong").length, 1);
  equal(w.follows, ["total"]);
  equal(w.fixes.filter((f) => f.correct).length, 1);
  ok(/\(3\)/.test(w.lines[3].tex), "the student counts 3");
  ok(/\(2\)/.test(w.corrected[w.corrected.length - 1]), "the right count is 2");
});

test("debug working: the wrong member named at a real rule joint", () => {
  const w = zeroSteps(bridge("C"), { kind: "wrongOne", joint: "B", line: ["AB", "BF"], member: "BC" });
  equal(w.lines.length, 4);
  ok(w.lines.some((l) => l.id === "wrong" && /F_\{BC\} = 0/.test(l.tex)));
});

test("miscounts get their own explanations", () => {
  const m = zeroMistakes(bridge("C"));
  equal(m.map((x) => x.value), [4, 2, 0]);
  ok(m.every((x) => x.kind === "concept"));
});
