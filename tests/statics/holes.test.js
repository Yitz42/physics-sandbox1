// Composite shapes with holes (Unit 6.2): a hole is a part with negative area.
// Hand checks from content/statics/library/holes.js.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveCentroid, partInfo, centroidMistakes, centroidEquations } from "../../src/subjects/statics/centroid.js";
import { plateHole, cutoutBracket, notchedPlate, linkPlate, notchAndHole } from "../../content/statics/library/holes.js";

setFile("statics / shapes with holes");

test("the parts: a circle's centroid is its centre; a quarter circle's is 4r/3π from both straight edges", () => {
  const c = partInfo({ shape: "circle", at: [1, 2], r: 0.5 });
  close(c.A, Math.PI * 0.25);
  close(c.x, 1);
  close(c.y, 2);
  const q = partInfo({ shape: "quarter", at: [2, 2], r: 1, dir: "sw" });
  close(q.A, Math.PI / 4);
  close(q.x, 2 - 4 / (3 * Math.PI));
  close(q.y, 2 - 4 / (3 * Math.PI));
});

test("plate with a hole: A = 8 − π/4 = 7.215 m², x̄ = (16 − π/4)/A = 2.109 m (away from the hole), ȳ = 1 m", () => {
  const v = solveCentroid(plateHole.setup).values;
  close(v.A, 8 - Math.PI / 4);
  close(v.xbar, (16 - Math.PI / 4) / (8 - Math.PI / 4));
  close(v.ybar, 1);
  equal(v.inside, 1);
});

test("cut-out bracket: a square minus a square is the L — x̄ = ȳ = 1.25 m", () => {
  const v = solveCentroid(cutoutBracket.setup).values;
  close(v.A, 6.75);
  close(v.xbar, 1.25);
  close(v.ybar, 1.25);
});

test("notched plate: the notch's centroid is 4r/3π BELOW the top edge — ȳ = 0.905 m", () => {
  const Ah = (Math.PI * 0.64) / 2, yh = 2 - (4 * 0.8) / (3 * Math.PI);
  const v = solveCentroid(notchedPlate.setup).values;
  close(v.ybar, (8 - Ah * yh) / (8 - Ah));
  close(v.xbar, 2);
});

test("link plate: x̄ = (9 + 1.571·3.424 − 0.785·3)/6.785 = 1.772 m", () => {
  const S = 4 / (3 * Math.PI);
  const A = 6 + Math.PI / 2 - Math.PI / 4;
  const v = solveCentroid(linkPlate.setup).values;
  close(v.A, A);
  close(v.xbar, (9 + (Math.PI / 2) * (3 + S) - (Math.PI / 4) * 3) / A);
  close(v.ybar, 1);
});

test("a hole's terms are SUBTRACTED in all three sums", () => {
  const eqs = centroidEquations(notchAndHole.setup);
  for (const e of eqs) {
    for (const id of ["2", "3"]) {
      const t = e.terms.find((x) => x.id === id);
      ok(t.sign < 0, `${e.id}: part ${id} should be subtracted`);
    }
    ok(e.terms.find((x) => x.id === "1").sign > 0, `${e.id}: the plate is added`);
  }
  const v = solveCentroid(notchAndHole.setup).values;
  close(eqs[0].result.value, v.A);
  close(eqs[1].result.value, v.Qy);
  close(eqs[2].result.value, v.Qx);
  close(v.xbar, 13.2857 / 6.4920, 1e-3);
  close(v.ybar, 5.8281 / 6.4920, 1e-3);
});

test("mistakes: the hole added, or left out, each with its own message", () => {
  const m = centroidMistakes(plateHole.setup, "xbar");
  const added = (16 + Math.PI / 4) / (8 + Math.PI / 4);
  ok(m.some((x) => Math.abs(x.value - added) < 1e-9 && /ADDED/.test(x.message)), "hole added");
  ok(m.some((x) => Math.abs(x.value - 2) < 1e-9 && /left out/.test(x.message)), "hole left out (x̄ = 2)");
  const a = centroidMistakes(plateHole.setup, "A");
  ok(a.some((x) => Math.abs(x.value - (8 + Math.PI / 4)) < 1e-9), "area with the hole added");
  ok(a.some((x) => Math.abs(x.value - 8) < 1e-9), "area without the hole");
});

test("a centroid inside a hole is not on the material", () => {
  const v = solveCentroid({ parts: [{ id: "1", shape: "rect", at: [0, 0], w: 2, h: 2 }, { id: "2", shape: "circle", at: [1, 1], r: 0.5, hole: true }] }).values;
  close(v.xbar, 1);
  equal(v.inside, 0);
});
