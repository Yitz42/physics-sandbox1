// Distributed loads (Unit 6), with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveDistributed } from "../../src/subjects/statics/distributed.js";
import { partsOf, integrate, intensityAt } from "../../src/subjects/statics/distributed-loads.js";
import { distributedMistakes } from "../../src/subjects/statics/distributed-tools.js";
import { evaluate, mistakesOf } from "../../src/core/equations.js";

setFile("statics / distributed loads");

const beam = (loads, forces = []) => ({ about: { at: [0, 0], label: "O" }, loads, forces });

test("uniform 400 N/m over 5 m: F_R = 400 × 5 = 2000 N at the middle, x̄ = 2.5 m", () => {
  const r = solveDistributed(beam([{ id: "w", shape: "uniform", from: 0, to: 5, w: 400 }]));
  close(r.values.R, 2000);
  close(r.values.pos, 2.5);
  equal(r.equations.map((e) => e.id), ["A_w"]); // one piece: its area IS F_R
  close(evaluate(r.equations[0]), 2000);
});

test("triangle 0 → 600 N/m over 6 m: F_R = ½(6)(600) = 1800 N, ⅓ of 6 m from the tall end: x̄ = 4 m", () => {
  const r = solveDistributed(beam([{ id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "right" }]));
  close(r.values.R, 1800);
  close(r.values.pos, 4);
  close(evaluate(r.equations[0]), 1800);
  // Tall end on the left instead: x̄ = 2 m.
  close(solveDistributed(beam([{ id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "left" }])).values.pos, 2);
});

test("trapezoid 300 → 900 N/m over 6 m: rectangle 1800 N at 3 m + triangle 1800 N at 4 m → F_R = 3600 N, x̄ = 3.5 m", () => {
  // ΣF x̃ = 1800(3) + 1800(4) = 12600 N·m;  x̄ = 12600 / 3600 = 3.5 m
  // (check: trapezoid centroid L(w₁ + 2w₂) / 3(w₁ + w₂) = 6(2100) / 3600 = 3.5 m)
  const load = { id: "w", shape: "linear", from: 0, to: 6, w: [300, 900] };
  const parts = partsOf(load);
  equal(parts.map((p) => p.kind), ["rect", "tri"]);
  close(parts[0].F, 1800);
  close(parts[1].F, 1800);
  close(parts[1].x, 4);
  const r = solveDistributed(beam([load]));
  close(r.values.R, 3600);
  close(r.values.M, 12600);
  close(r.values.pos, 3.5);
  equal(r.equations.map((e) => e.id), ["A_w_rect", "A_w_tri", "F", "M"]);
  close(evaluate(r.equations[3]), 12600);
});

test("trapezoid plus a 500 N point load at 1 m: F_R = 4100 N, x̄ = 13100 / 4100 = 3.195 m", () => {
  const r = solveDistributed(beam([{ id: "w", shape: "linear", from: 0, to: 6, w: [300, 900] }], [{ id: "P", symbol: "P", magnitude: 500, direction: "down", at: [1, 0] }]));
  close(r.values.R, 4100);
  close(r.values.pos, 13100 / 4100);
});

test("curve w = 600(x/4)² over 4 m: F_R = w₀L/3 = 800 N, x̄ = 3L/4 = 3 m (by integration)", () => {
  // ∫₀⁴ 600(x/4)² dx = 600·4/3 = 800;  ∫₀⁴ x·600(x/4)² dx = 600·16/4 = 2400;  x̄ = 2400/800 = 3
  const load = { id: "w", shape: "power", from: 0, to: 4, w: 600, n: 2 };
  const r = solveDistributed(beam([load]));
  close(r.values.R, 800);
  close(r.values.pos, 3);
  equal(r.equations.map((e) => e.id), ["A_w", "M"]);
  close(evaluate(r.equations[0]), 800);
  close(evaluate(r.equations[1]), 2400);
  // Numerical integration (adding thin slices) agrees with the formulas.
  const num = integrate(load);
  close(num.F, 800, 1e-6);
  close(num.x, 3, 1e-6);
  close(intensityAt(load, 2), 150); // 600 (2/4)² = 150 N/m
});

test("curve w = 900(x/5)³ over 5 m: F_R = w₀L/4 = 1125 N at x̄ = 4L/5 = 4 m", () => {
  const load = { id: "w", shape: "power", from: 0, to: 5, w: 900, n: 3 };
  const r = solveDistributed(beam([load]));
  close(r.values.R, 1125);
  close(r.values.pos, 4);
  close(integrate(load).x, 4, 1e-6);
});

test("a curve's wrong equations: the triangle and rectangle areas, no sign flips offered", () => {
  const r = solveDistributed(beam([{ id: "w", shape: "power", from: 0, to: 4, w: 600, n: 2 }]));
  const wrong = mistakesOf(r.equations[0]);
  equal(wrong.map((m) => m.kind), ["swap", "swap"]);
  close(evaluate(wrong[0].eq), 1200); // ½ w₀ L
  close(evaluate(wrong[1].eq), 2400); // w₀ L
  ok(wrong.every((m) => m.reason), "each wrong version explains itself");
});

test("mistakes: forgetting the ½ (3600 N), the triangle's resultant ⅓ from the SHORT end (2 m)", () => {
  const s = beam([{ id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "right" }]);
  ok(distributedMistakes(s, "R").some((m) => Math.abs(m.value - 3600) < 1e-9 && /½/.test(m.message)));
  const pos = distributedMistakes(s, "pos");
  ok(pos.some((m) => Math.abs(m.value - 2) < 1e-9 && /TALL/.test(m.message)), "⅓ from the wrong end");
  ok(pos.some((m) => Math.abs(m.value - 3) < 1e-9 && /middle/.test(m.message)), "at the middle");
});

test("mistakes for a curve: triangle area (1200 N), rectangle area (2400 N), triangle centroid (2.67 m)", () => {
  const s = beam([{ id: "w", shape: "power", from: 0, to: 4, w: 600, n: 2 }]);
  const R = distributedMistakes(s, "R").map((m) => m.value);
  ok(R.some((x) => Math.abs(x - 1200) < 1e-9) && R.some((x) => Math.abs(x - 2400) < 1e-9));
  ok(distributedMistakes(s, "pos").some((m) => Math.abs(m.value - 8 / 3) < 1e-9));
});

test("wrong versions are shown in lowest terms: a cubic's 'triangle centroid' moment is w₀L²/6, not 2L²/12", () => {
  const r = solveDistributed(beam([{ id: "w", shape: "power", from: 0, to: 5, w: 900, n: 3 }]));
  const texts = mistakesOf(r.equations[1]).map((m) => m.eq.terms[0].factor.tex);
  ok(texts.some((t) => t.includes("\\tfrac{L^{2}}{6}")), texts.join(" | "));
  ok(!texts.some((t) => t.includes("{12}")), "no unsimplified fraction");
});
