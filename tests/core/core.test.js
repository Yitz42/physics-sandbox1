// Tests for the core: vectors, unit formatting, paths, linear systems, equations.
import { test, ok, equal, close, setFile } from "../harness.js";
import { add, mag, unit, fromPolar, angleDeg, cross2, distToSegment } from "../../src/core/vector.js";
import { sigFig, format } from "../../src/core/units.js";
import { getPath, setPath, makeVariant, pickValue } from "../../src/core/paths.js";
import { solveSystem, rank } from "../../src/core/linear.js";
import { solveEquations, equationTex, swapFactor, flipSign, mistakesOf } from "../../src/core/equations.js";
import { stageParts, checkStage, stageSituations, nextSituation } from "../../src/core/content.js";

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

// ---- Label placement (render/labels.js) ----
import { placeLabels } from "../../src/render/labels.js";
// A pretend canvas: every character is 7 px wide.
const fakeCtx = { save() {}, restore() {}, font: "", measureText: (t) => ({ width: t.length * 7 }) };
const overlaps = (a, b) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);

test("labels: two labels wanting the same spot end up not overlapping", async () => {
  const { labelBox } = await import("../../src/render/arrows.js");
  const want = [
    { text: "F = 180 N", pos: [100, 100], align: "center", size: 14 },
    { text: "F_y = -106 N", pos: [100, 100], align: "center", size: 14 },
  ];
  const [a, b] = placeLabels(fakeCtx, want, { view: { width: 400, height: 300 } });
  const box = (l) => labelBox(l.pos[0], l.pos[1], l.text.length * 7, 14, l.align);
  ok(!overlaps(box(a), box(b)), "labels still overlap");
  equal(a.pos, [100, 100], "the first label keeps its spot:");
});
test("labels: a label moves off an arrow line that runs through it", () => {
  const [l] = placeLabels(fakeCtx, [{ text: "T = 5 N", pos: [100, 100], align: "center", size: 14 }], {
    segments: [[[60, 100], [140, 100]]], view: { width: 400, height: 300 },
  });
  ok(l.pos[1] !== 100, "label should have moved off the line");
});

// ---- Answer checking (challenges/common/answers.js): must be within ±0.1 ----
import { checkAnswer, precisionText } from "../../src/challenges/common/answers.js";
test("answers: 346.4 is accepted for 346.41 N; 346.2 is 'very close' but wrong", () => {
  ok(checkAnswer("346.4", 346.41).ok);
  ok(checkAnswer("346.5 N", 346.41).ok, "within 0.1");
  const near = checkAnswer("346.2", 346.41, { unit: "N" });
  ok(!near.ok && /±0.1 N/.test(near.message), near.message);
  ok(!checkAnswer("346", 346.41).ok, "3 significant figures is not enough any more");
});
test("answers: a known slip gets its own explanation", () => {
  const out = checkAnswer("-346.4", -200, { mistakes: [{ value: -346.41, message: "sin/cos swapped" }] });
  equal(out.message, "sin/cos swapped");
});
test("answers: the ± label reads '±0.1 N' and '±0.1°'", () => {
  equal(precisionText(0.1, "N"), "±0.1 N");
  equal(precisionText(0.1, "deg"), "±0.1°");
});

test("equations: a couple moment term shows its unit, N·m built so KaTeX can draw it", () => {
  const eq = { id: "Mc", lhs: "M_R", form: "define", result: { value: -40, unit: "N·m" },
    terms: [{ id: "M3", sign: -1, symbol: "M_3", value: 40, unit: "N·m" }] };
  const tex = equationTex(eq, "numeric", { highlight: false });
  ok(tex.includes("-(40\\,\\text{N}\\!\\cdot\\!\\text{m})"), tex);
  ok(!tex.includes("\\text{N·m}"), "no · inside \\text{}");
  equal(equationTex(eq, "symbolic", { highlight: false }), "M_R = -M_3");
});

test("equations: a term's own number form (numTex) is used in Numbers, and the result can stay hidden", () => {
  // A = π/4 d² with d = 18 mm: Numbers shows the given d, not the answer 254.5 mm².
  const eq = { id: "area", lhs: "A", form: "define", result: { value: 254.47, unit: "mm^2" },
    terms: [{ id: "A", sign: 1, symbol: "\\tfrac{\\pi}{4} d^2", value: 254.47, numTex: "\\tfrac{\\pi}{4}(18\\,\\text{mm})^2" }] };
  equal(equationTex(eq, "numeric", { highlight: false, showResult: false }), "A = \\tfrac{\\pi}{4}(18\\,\\text{mm})^2");
  equal(equationTex(eq, "symbolic", { highlight: false }), "A = \\tfrac{\\pi}{4} d^2");
  ok(equationTex(eq, "numeric", { highlight: false }).endsWith("= 254.5\\,\\text{mm}^2"), "after Test the result shows, in mm²");
});

import { cleanNumberText, roundToPrecision, answerRange } from "../../src/challenges/common/answers.js";
test("answer boxes: no leading zeros, only digits, one point and a leading minus", () => {
  equal(cleanNumberText("090"), "90");
  equal(cleanNumberText("09"), "9");
  equal(cleanNumberText("-007"), "-7");
  equal(cleanNumberText("0.5"), "0.5");
  equal(cleanNumberText("-0.5"), "-0.5");
  equal(cleanNumberText("00.25"), "0.25");
  equal(cleanNumberText("0"), "0");
  equal(cleanNumberText("12a.3.4"), "12.34");
  equal(cleanNumberText("5-3"), "53");
  equal(cleanNumberText("−68.0"), "-68.0");
});
test("answer boxes: extra digits are rounded to the precision before checking", () => {
  equal(roundToPrecision(346.4102, 0.1), 346.4);
  equal(roundToPrecision(2.2549, 0.01), 2.25);
  equal(roundToPrecision(7.6, 1), 8);
  ok(checkAnswer("346.4102", 346.41).ok);
  ok(checkAnswer("2.2549", 2.25, { precision: 0.01 }).ok);
});
test("answer boxes: range comes from the ask, else from the unit", () => {
  equal(answerRange({}, "N"), [-100000, 100000]);
  equal(answerRange({}, "deg"), [0, 360]);
  equal(answerRange({ min: 0, max: 3 }, "m"), [0, 3]);
});

import { tidyNumberText } from "../../src/challenges/common/answers.js";
test("answer boxes: extra digits are rounded in the box, text that fits is left alone", () => {
  equal(tidyNumberText("430.8812", 0.1), "430.9");
  equal(tidyNumberText("2.2549", 0.01), "2.25");
  equal(tidyNumberText("430.9", 0.1), "430.9");
  equal(tidyNumberText("430", 0.1), "430");
  equal(tidyNumberText("-0.04", 0.1), "0.0");
  equal(tidyNumberText("-68.04", 0.1), "-68.0");
  equal(tidyNumberText("-", 0.1), "-");
});
test("answers: the general 'doesn't match' note no longer mentions arithmetic", () => {
  ok(!/arithmetic/.test(checkAnswer("5", 346.41).message));
});

test("vary: a rule with several paths puts the same value at each; later rules change parts of earlier ones", () => {
  const base = { at: [0, 0], line: { points: [[0, 0], [1, 1]] }, dir: { angle: 30, from: "+x", toward: "+y" } };
  for (let i = 0; i < 10; i++) {
    const v = makeVariant(base, [
      { paths: ["at", "line.points.0"], values: [[1, 2], [3, 4]] },
      { path: "dir", values: [{ from: "-y", toward: "+x" }] },
      { path: "dir.angle", values: [50] },
    ]);
    equal(v.at, v.line.points[0]);
    v.at[0] = 99; // separate copies, not one shared array
    ok(v.line.points[0][0] !== 99);
    equal(v.dir, { from: "-y", toward: "+x", angle: 50 });
  }
});

// ---- Stages with several parts -----------------------------------------------

const twoParts = {
  id: "u/2-predict", challenge: "predict", title: "Two Things", solver: "statics.particle",
  parts: [
    { title: "First", instructions: "Do one.", setup: { forces: [] }, ask: { quantity: "R" } },
    { title: "Second", instructions: "Do two.", solver: "statics.moment", setup: { forces: [] }, ask: { quantity: "M" } },
  ],
};

test("parts: each part keeps the stage's id, type and title, and takes its solver unless it names one", () => {
  const [a, b] = stageParts(twoParts);
  equal([a.id, a.challenge, a.title, a.partTitle, a.solver], ["u/2-predict", "predict", "Two Things", "First", "statics.particle"]);
  equal([b.partTitle, b.solver, b.instructions], ["Second", "statics.moment", "Do two."]);
  equal([a.part, b.part], [{ index: 0, count: 2 }, { index: 1, count: 2 }]);
});

test("parts: a stage without parts is one part; checkStage names the part with a problem", () => {
  const one = stageParts({ id: "x", challenge: "explore", title: "t" });
  equal(one.length, 1);
  equal(one[0].part, { index: 0, count: 1 });
  equal(checkStage(twoParts), []);
  const broken = { ...twoParts, parts: [twoParts.parts[0], { title: "No ask", instructions: "x", setup: {} }] };
  equal(checkStage(broken), ["part 2: predict stages need \"ask\""]);
});

// ---- Situations: a different picture each version ------------------------------

const threeSituations = {
  id: "u/2-predict", challenge: "predict", title: "Hang It", solver: "statics.particle",
  instructions: "Find the tensions.", ask: { quantity: "T" }, hints: ["shared hint"],
  situations: [
    { name: "crate", setup: { forces: [1] } },
    { name: "light", setup: { forces: [2] }, instructions: "The traffic light…", hints: ["own hint"] },
    { name: "balloon", setup: { forces: [3] } },
  ],
};

test("situations: each takes the stage's fields and replaces the ones it sets", () => {
  const [a, b, c] = stageSituations(threeSituations);
  equal([a.instructions, a.hints, a.setup, a.ask], ["Find the tensions.", ["shared hint"], { forces: [1] }, { quantity: "T" }]);
  equal([b.instructions, b.hints], ["The traffic light…", ["own hint"]]);
  equal([a.situation, c.situation], [{ index: 0, count: 3, name: "crate" }, { index: 2, count: 3, name: "balloon" }]);
  equal(a.situations, undefined, "a situation doesn't carry the list");
  equal(stageSituations({ id: "x" }).length, 1, "a stage without situations is its own one situation");
});

test("situations: every one is played before any repeats, never the same twice in a row", () => {
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const memory = {};
  const seen = [];
  for (let i = 0; i < 30; i++) seen.push(nextSituation(memory, 3, random));
  for (let k = 0; k < 30; k += 3) equal([...seen.slice(k, k + 3)].sort(), [0, 1, 2], `versions ${k + 1}–${k + 3}:`);
  for (let i = 1; i < 30; i++) ok(seen[i] !== seen[i - 1], `version ${i + 1} repeats`);
  equal(nextSituation({}, 1), 0);
});

test("situations: checkStage names the situation with a problem", () => {
  equal(checkStage(threeSituations), []);
  const broken = { ...threeSituations, situations: [...threeSituations.situations, { name: "kite", setup: { forces: [] }, ask: null }] };
  equal(checkStage(broken), ["situation 4 (kite): predict stages need \"ask\""]);
});

// ---- Polynomials, transfer functions, symbolic algebra ------------------------

import * as P from "../../src/core/poly.js";
import * as S from "../../src/core/symbolic.js";

test("poly: (s + 1)(s + 2) = s² + 3s + 2; its value at s = 1 is 6; TeX and text forms", () => {
  const p = P.mul(P.fromDescending([1, 1]), P.fromDescending([1, 2]));
  equal(P.toDescending(p), [1, 3, 2]);
  equal(P.evaluate(p, 1), 6);
  equal(P.polyTex(p), "s^{2} + 3s + 2");
  equal(P.polyText(P.fromDescending([1, -4, 0])), "s² − 4s");
});

test("poly: division and gcd — (s² + 3s + 2) ÷ (s + 1) = s + 2; gcd with (s + 1)(s + 5) is s + 1", () => {
  const { q, r } = P.divmod(P.fromDescending([1, 3, 2]), P.fromDescending([1, 1]));
  equal(P.toDescending(q), [1, 2]);
  ok(P.isZero(r));
  const g = P.gcd(P.fromDescending([1, 3, 2]), P.fromDescending([1, 6, 5]));
  equal(P.toDescending(g).map((c) => +c.toFixed(9)), [1, 1]);
});

test("transfer functions: 1/(s+1) + 2/(s+1) = 3/(s+1) (common factor cancelled, monic bottom)", () => {
  const a = P.tf.of([1], P.fromDescending([1, 1]));
  const b = P.tf.of([2], P.fromDescending([1, 1]));
  const sum = P.tf.add(a, b);
  equal(P.toDescending(sum.num).map((c) => +c.toFixed(9)), [3]);
  equal(P.toDescending(sum.den).map((c) => +c.toFixed(9)), [1, 1]);
});

test("transfer functions: G = 10/(s(s + 1)) with unity negative feedback → T = 10/(s² + s + 10)", () => {
  const G = P.tf.of([10], P.fromDescending([1, 1, 0]));
  const T = P.tf.feedback(G, P.tf.one(), -1);
  equal(P.toDescending(T.num), [10]);
  equal(P.toDescending(T.den), [1, 1, 10]);
  // Positive feedback: 10/(s² + s − 10)
  equal(P.toDescending(P.tf.feedback(G, P.tf.one(), +1).den), [1, 1, -10]);
});

test("symbolic: an inner loop inside an outer loop → G₁G₂ / (1 + G₂H₂ + G₁G₂H₁)", () => {
  const F = P.fractionOps(S.symRing);
  const sym = (id) => F.of(S.symbol(id));
  const inner = F.feedback(sym("G2"), sym("H2"), -1);
  const T = F.feedback(F.mul(sym("G1"), inner), sym("H1"), -1);
  const tex = (id) => id.replace(/(\d+)/, "_$1");
  const order = ["G1", "G2", "H1", "H2"];
  equal(S.fracTex(T, tex, order), "\\dfrac{G_1G_2}{1 + G_2H_2 + G_1G_2H_1}");
  // Substituting G1 = 2, G2 = 3, H1 = 1, H2 = 0.5: 6 / (1 + 1.5 + 6) = 0.70588
  const vals = { G1: 2, G2: 3, H1: 1, H2: 0.5 };
  const num = S.substitute(T.num, { zero: 0, add: (a, b) => a + b, mul: (a, b) => a * b }, (id) => vals[id], (c) => c);
  const den = S.substitute(T.den, { zero: 0, add: (a, b) => a + b, mul: (a, b) => a * b }, (id) => vals[id], (c) => c);
  close(num / den, 6 / 8.5);
});
