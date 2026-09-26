// Tests for the core: vectors, unit formatting, paths, linear systems, equations.
import { test, ok, equal, close, setFile } from "../harness.js";
import { add, mag, unit, fromPolar, angleDeg, cross2, distToSegment } from "../../src/core/vector.js";
import { sigFig, format } from "../../src/core/units.js";
import { getPath, setPath, makeVariant, pickValue } from "../../src/core/paths.js";
import { solveSystem, rank } from "../../src/core/linear.js";
import { solveEquations, equationTex, swapFactor, flipSign, mistakesOf } from "../../src/core/equations.js";

setFile("core");

test("vector: 3-4-5 triangle has length 5", () => close(mag([3, 4]), 5));
test("vector: adding and unit vectors", () => {
  equal(add([1, 2], [3, 4]), [4, 6]);
  close(unit([3, 4])[0], 0.6);
});
test("vector: 30° polar vector and back", () => {
  const v = fromPolar(2, 30);
  close(v[0], 1.7320508);
  close(v[1], 1);
  close(angleDeg(v), 30);
  close(angleDeg([-1, -1]), 225);
});
test("vector: 2D cross product (moment sign, CCW positive)", () => close(cross2([2, 0], [0, 5]), 10));
test("vector: distance from a point to a segment", () => close(distToSegment([1, 1], [0, 0], [2, 0]), 1));

test("units: 3 significant figures like the textbook", () => {
  equal(sigFig(346.4102), "346");
  equal(sigFig(0.86603), "0.866");
  equal(sigFig(-200.0001), "-200");
  equal(sigFig(12345), "12300");
});
test("units: large forces switch to kN", () => {
  equal(format(346.41, "N"), "346 N");
  equal(format(24500, "N"), "24.5 kN");
});

test("paths: read and write by index and by #id", () => {
  const s = { forces: [{ id: "F1", magnitude: 10 }, { id: "T_AB", magnitude: null }] };
  equal(getPath(s, "forces.0.magnitude"), 10);
  setPath(s, "forces.#T_AB.magnitude", 55);
  equal(s.forces[1].magnitude, 55);
});
test("paths: vary rules pick allowed values and avoid repeats", () => {
  const rule = { path: "a", min: 200, max: 600, step: 50 };
  for (let i = 0; i < 50; i++) {
    const v = pickValue(rule);
    ok(v >= 200 && v <= 600 && v % 50 === 0, `bad value ${v}`);
  }
  const base = { a: 200 };
  const v = makeVariant(base, [{ path: "a", values: [200, 300] }], Math.random, { a: 200 });
  equal(v.a, 300);
});

test("linear: unique 2×2 solution", () => {
  const out = solveSystem([[1, 1], [1, -1]], [10, 2]);
  equal(out.status, "unique");
  close(out.x[0], 6);
  close(out.x[1], 4);
});
test("linear: parallel columns can't be separated", () => {
  equal(rank([[1, 2], [2, 4]]), 1);
  equal(solveSystem([[1, 2], [2, 4]], [3, 7]).status, "inconsistent");
  equal(solveSystem([[1, 2], [2, 4]], [3, 6]).status, "indeterminate");
});
test("linear: more equations than unknowns, consistent and not", () => {
  equal(solveSystem([[1], [0]], [5, 0]).status, "unique");
  equal(solveSystem([[1], [0]], [5, 3]).status, "inconsistent");
});

// ΣFx: T cos30° − 100 = 0  →  T = 115.47
const eqX = {
  id: "sumFx", lhs: "\\Sigma F_x", form: "zero",
  terms: [
    { id: "T", sign: 1, symbol: "T", value: null, factor: { tex: "\\cos 30^\\circ", value: Math.cos(Math.PI / 6), alt: { tex: "\\sin 30^\\circ", value: 0.5 } } },
    { id: "P", sign: -1, symbol: "P", value: 100, factor: null },
  ],
};
test("equations: solve T cos30° − 100 = 0", () => {
  const out = solveEquations([eqX], ["T"]);
  equal(out.status, "unique");
  close(out.values.T, 115.470);
});
test("equations: symbolic and numeric KaTeX strings", () => {
  const sym = equationTex(eqX, "symbolic", { highlight: false });
  equal(sym, "\\Sigma F_x = T\\cos 30^\\circ - P = 0");
  const num = equationTex(eqX, "numeric", { highlight: false });
  equal(num, "\\Sigma F_x = T\\cos 30^\\circ - 100 = 0");
});
test("equations: mistakes swap sin/cos, flip signs, drop terms", () => {
  const swapped = swapFactor(eqX, "T");
  equal(swapped.terms[0].factor.tex, "\\sin 30^\\circ");
  equal(flipSign(eqX, "P").terms[1].sign, 1);
  const kinds = mistakesOf(eqX).map((m) => m.kind);
  ok(kinds.includes("swap") && kinds.includes("sign") && kinds.includes("missing"));
  equal(eqX.terms[0].factor.tex, "\\cos 30^\\circ", "original must stay unchanged:");
});
