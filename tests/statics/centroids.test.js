// Centroids and centres of gravity (Unit 7.1), with the hand checks of
// content/statics/library/shapes.js.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveCentroid, partInfo, centroidMistakes, centroidEquations } from "../../src/subjects/statics/centroid.js";
import { lPlate, tee, rampBlock, arch, bracket, sign } from "../../content/statics/library/shapes.js";

setFile("statics / centroids and centres of gravity");

test("the parts: a right triangle's centroid is ⅓ of each leg from its right angle; a half circle's 4r/3π from its edge", () => {
  const t = partInfo({ shape: "tri", at: [2, 0], w: 3, h: 2 });
  close(t.A, 3);
  close(t.x, 3);
  close(t.y, 2 / 3);
  const s = partInfo({ shape: "semi", at: [1, 3], r: 1, dir: "up" });
  close(s.A, Math.PI / 2);
  close(s.y, 3 + 4 / (3 * Math.PI));
  close(s.x, 1, 1e-9);
});

test("L-plate: x̄ = ȳ = 1.1 m — and the centroid is OUTSIDE the plate", () => {
  const v = solveCentroid(lPlate.setup).values;
  close(v.A, 5);
  close(v.xbar, 1.1);
  close(v.ybar, 1.1);
  equal(v.inside, 0);
});

test("tee: x̄ = 2 m, ȳ = 18.5/7 = 2.643 m", () => {
  const v = solveCentroid(tee.setup).values;
  close(v.xbar, 2);
  close(v.ybar, 18.5 / 7);
});

test("ramp block: x̄ = 13/7 = 1.857 m, ȳ = 6/7 = 0.857 m", () => {
  const v = solveCentroid(rampBlock.setup).values;
  close(v.xbar, 13 / 7);
  close(v.ybar, 6 / 7);
});

test("arch: ȳ = (9 + (π/2)(3 + 4/3π))/(6 + π/2) = 1.899 m", () => {
  const v = solveCentroid(arch.setup).values;
  close(v.ybar, (9 + (Math.PI / 2) * (3 + 4 / (3 * Math.PI))) / (6 + Math.PI / 2));
  close(v.ybar, 1.8993, 1e-3);
});

test("bracket (centre of gravity, by weight): x̄ = 0.8125 m, ȳ = 0.5 m; by area would be 0.679 m", () => {
  const v = solveCentroid(bracket.setup).values;
  close(v.xbar, 0.8125);
  close(v.ybar, 0.5);
  close(v.W, 40 * 9.81);
  const m = centroidMistakes(bracket.setup, "xbar");
  ok(m.some((x) => x.kind === "weight" && Math.abs(x.value - 1.1875 / 1.75) < 1e-6), "the by-area answer is recognised");
});

test("sign: ΣA = 9.071 m², x̄ = 1.831 m, ȳ = 1.192 m", () => {
  const v = solveCentroid(sign.setup).values;
  close(v.A, 6 + 1.5 + Math.PI / 2);
  close(v.xbar, (9 + 5.25 + (Math.PI / 2) * 1.5) / (7.5 + Math.PI / 2));
  close(v.ybar, (6 + 1 + (Math.PI / 2) * (2 + 4 / (3 * Math.PI))) / (7.5 + Math.PI / 2));
  close(v.xbar, 1.8307, 1e-3);
  close(v.ybar, 1.1916, 1e-3);
});

test("mistakes: the plain average, the triangle's ⅓ from the wrong end, and a missing ½", () => {
  const m = centroidMistakes(rampBlock.setup, "xbar");
  const kinds = m.map((x) => x.kind);
  ok(kinds.includes("concept") && kinds.includes("centroid") && kinds.includes("loadArea"), kinds.join(", "));
  close(m.find((x) => x.kind === "concept").value, 2, 1e-9, "(1 + 3)/2");
  close(m.find((x) => x.kind === "centroid").value, (4 + 3 * 4) / 7, 1e-9, "triangle at 2 + ⅔·3 = 4");
});

test("equations: A = ΣA_i, A x̄ = Σx̃A, A ȳ = Σỹ A — their results match x̄, ȳ", () => {
  const [A, Qy, Qx] = centroidEquations(rampBlock.setup);
  close(A.result.value, 7);
  close(Qy.result.value / A.result.value, 13 / 7);
  close(Qx.result.value / A.result.value, 6 / 7);
  ok(Qy.terms.find((t) => t.id === "2").factor.alt, "the triangle's arm has its tempting wrong version");
});
