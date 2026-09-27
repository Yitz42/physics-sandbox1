// The method of sections (Unit 5.3): the kept part's three equations, checked
// against the joint-by-joint solution.
// The Pratt bridge (library/trusses.js), P = 1200 N at C: A_y = E_y = 600 N.
//   Cut FG, CF, BC, keep the left part {A, B, F}:
//     ΣM_C: −6(600) − 3F_FG = 0 → F_FG = −1200 N   (only F_FG: CF and BC pass through C)
//     ΣM_F: −3(600) + 3F_BC = 0 → F_BC = +600 N    (only F_BC: FG and CF pass through F)
//     ΣF_y: 600 − (1/√2)F_CF = 0 → F_CF = +848.5 N
// Two loads, 600 N at B and 1200 N at C: E_y = (600·3 + 1200·6)/12 = 750 N, A_y = 1050 N.
//   Cut GH, CH, CD, keep the right part {D, E, H}:
//     ΣM_C: 6(750) + 3F_GH = 0 → F_GH = −1500 N;  ΣM_H: 3(750) − 3F_CD = 0 → F_CD = +750 N;
//     ΣF_y: 750 − (1/√2)F_CH = 0 → F_CH = +1060.7 N
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveTrussZero } from "../../src/subjects/statics/truss-zero.js";
import { solveEquations } from "../../src/core/equations.js";
import { sectionParts } from "../../src/subjects/statics/truss-section.js";
import { bridgeSetup } from "../../content/statics/library/trusses.js";

setFile("statics / method of sections");

const cut = (setup, members, keep, extra = {}) => ({ ...setup, section: { members, keep, ...extra } });
const solveSection = (setup) => {
  const r = solveTrussZero(setup);
  return { r, sol: solveEquations(r.sectionEquations, r.sectionParts.cut.map((c) => c.id)) };
};

test("left part of the bridge: ΣM_C holds only F_FG; the three equations give −1200, +600, +848.5 N", () => {
  const s = cut(bridgeSetup("C"), ["FG", "CF", "BC"], "A", { about: "C" });
  const { r, sol } = solveSection(s);
  equal(r.values.secOk, 1);
  equal(r.values.secM, 1);
  equal(r.sectionParts.kept.slice().sort(), ["A", "B", "F"]);
  close(sol.values.F_FG, -1200);
  close(sol.values.F_BC, 600);
  close(sol.values.F_CF, 848.53);
  close(r.values.F_FG, sol.values.F_FG, 1e-6, "the section agrees with the joints");
});

test("two moments and a force: ΣM_C, ΣM_F, ΣF_y — one member each", () => {
  const s = cut(bridgeSetup("C"), ["FG", "CF", "BC"], "A", { sums: [{ M: "C" }, { M: "F" }, { F: "y" }] });
  const r = solveTrussZero(s);
  equal(r.sectionUnknowns, [["F_FG"], ["F_BC"], ["F_CF"]]);
});

test("right part, two loads: F_GH = −1500, F_CD = +750, F_CH = +1060.7 N (with E_y = 750 N found first)", () => {
  const two = bridgeSetup("B", 600);
  two.forces.push({ id: "Q", symbol: "Q", magnitude: 1200, direction: "down", joint: "C" });
  const s = cut(two, ["GH", "CH", "CD"], "E", { about: "C" });
  const { r, sol } = solveSection(s);
  equal(r.sectionParts.kept.slice().sort(), ["D", "E", "H"]);
  close(r.values.E_y, 750);
  close(sol.values.F_GH, -1500);
  close(sol.values.F_CD, 750);
  close(sol.values.F_CH, 1060.66);
});

test("a cut that misses a member joining the parts is not a section", () => {
  const s = cut(bridgeSetup("C"), ["GH", "DH", "DE"], "E");
  const p = sectionParts(s);
  ok(!p.ok);
  ok(/doesn't split/.test(p.message), p.message);
  equal(solveTrussZero({ ...s, section: { ...s.section, about: "C" } }).values.secOk, 0);
});

test("a moment point where the cut members don't meet keeps more than one unknown", () => {
  const s = cut(bridgeSetup("C"), ["FG", "CF", "BC"], "A", { about: "B" });
  equal(solveTrussZero(s).values.secM, 2, "about B: F_FG and F_CF (F_BC runs through B)");
});
