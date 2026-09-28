// Tipping versus slipping (Unit 9.2): where N acts (x behind the corner O), the push that tips a
// crate (N at O, ΣM_O = 0) against the push that slips it, and which comes first.
// Answers worked by hand in each test's name.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveFriction } from "../../src/subjects/statics/friction.js";
import { blockEquations, frictionMistakes } from "../../src/subjects/statics/friction-tools.js";
import { tipSteps } from "../../src/subjects/statics/friction-tip-tools.js";
import { solveEquations } from "../../src/core/equations.js";

setFile("statics / tipping versus slipping");

const find = { path: "forces.#P.magnitude", motion: "right", min: 0, max: 5000, symbol: "P", unit: "N" };
const tall = (P, height, extra = {}) => ({ ramp: { angle: 0, length: 4.5 }, block: { w: 0.8, h: 1.6, at: 2.4 }, weight: 600, mus: 0.4,
  forces: [{ id: "P", symbol: "P", magnitude: P, along: "up", height }], tipping: { about: "right" }, ...extra });

test("600 N crate, 0.8 m wide, pushed level with 100 N at 1.2 m: ΣM_O → 600(0.4) − 100(1.2) = 600 x → x = 0.2 m behind O; it holds", () => {
  const r = solveFriction(tall(100, 1.2));
  close(r.values.x, 0.2);
  equal(r.state, "holds");
});

test("no push: N acts under the centre, x = w/2 = 0.4 m", () => close(solveFriction(tall(0, 1.2)).values.x, 0.4));

test("pushed at 1.2 m: slips at μs W = 240 N, tips at W(w/2)/h_P = 240/1.2 = 200 N — it tips first", () => {
  const v = solveFriction(tall(100, 1.2, { find })).values;
  close(v.criticalSlip, 240, 1e-4);
  close(v.criticalTip, 200, 1e-4);
  close(v.critical, 200, 1e-4);
});

test("pushed at 0.5 m: tips at 240/0.5 = 480 N, slips first at 240 N", () => {
  const v = solveFriction(tall(100, 0.5, { find })).values;
  close(v.criticalTip, 480, 1e-4);
  close(v.critical, 240, 1e-4);
});

test("pushed with 220 N at 1.2 m: it would need x = (240 − 264)/600 = −0.04 m — outside the base: it tips (friction alone would hold: 220 < 240)", () => {
  const r = solveFriction(tall(220, 1.2));
  close(r.values.x, -0.04);
  equal(r.state, "tips");
});

test("pushed with 250 N at 0.5 m: friction can't hold (250 > 240) and x = (240 − 125)/600 > 0: it slides", () => {
  equal(solveFriction(tall(250, 0.5)).state, "slides");
});

test("a fridge 0.7 m wide, 1.8 m tall on a tilting bed, μs = 0.5: slips at tan⁻¹ 0.5 = 26.57°, tips at tan⁻¹(0.7/1.8) = 21.25° — tips first", () => {
  const s = { ramp: { angle: 10, length: 6 }, block: { w: 0.7, h: 1.8, at: 3.2 }, weight: 900, mus: 0.5, tipping: { about: "down" },
    find: { path: "ramp.angle", motion: "down", min: 0, max: 70, symbol: "\\theta", unit: "deg" } };
  const v = solveFriction(s).values;
  close(v.criticalSlip, 26.565, 1e-3);
  close(v.criticalTip, 21.250, 1e-3);
  close(v.critical, 21.250, 1e-3);
  // At 10°: x behind the lower corner = w/2 − (h/2) tan 10° = 0.35 − 0.9(0.17633) = 0.1913 m.
  close(solveFriction(s).values.x, 0.35 - 0.9 * Math.tan(Math.PI / 18));
});

test("a 500 N, 1.0 m crate pulled by a rope at its top front corner, 30° up, μs = 0.5: slips at 250/(cos 30° + 0.5 sin 30°) = 224.0 N, tips at 250/cos 30° = 288.7 N", () => {
  const s = { ramp: { angle: 0, length: 4.5 }, block: { w: 1, h: 1, at: 1.7 }, weight: 500, mus: 0.5,
    forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up", tilt: 30, rope: true, height: 1 }], tipping: { about: "right" }, find };
  const v = solveFriction(s).values;
  close(v.criticalSlip, 250 / (Math.cos(Math.PI / 6) + 0.25), 1e-4);
  close(v.criticalTip, 250 / Math.cos(Math.PI / 6), 1e-4);
  close(v.critical, v.criticalSlip, 1e-9);
});

test("the three equations (ΣF_y, ΣF_x, ΣM_O) give N = 600 N, F = −100 N and x = 0.2 m for the 100 N push at 1.2 m", () => {
  const eqs = blockEquations(tall(100, 1.2));
  equal(eqs.map((e) => e.id), ["sumFy", "sumFx", "sumMO"]);
  const sol = solveEquations(eqs, ["N", "F", "x"]);
  close(sol.values.N, 600);
  close(sol.values.F, -100);
  close(sol.values.x, 0.2);
});

test("slips give their own answers: the push's height from the centre, the whole width, the slipping push for the tipping one", () => {
  const s = tall(100, 1.2, { find });
  const vals = frictionMistakes(s, "criticalTip").map((m) => Math.round(m.value * 10) / 10);
  ok(vals.includes(600), "arm measured from the centre: 240/(1.2 − 0.8) = 600 N");
  ok(vals.includes(400), "whole width: 600(0.8)/1.2 = 400 N");
  ok(vals.includes(240), "the slipping push");
  ok(frictionMistakes(s, "critical").some((m) => Math.abs(m.value - 240) < 1e-6), "the larger push, for 'which first'");
});

test("a student's working: 'halfHeight' makes the tipping line wrong (600 N) and the verdict follows it", () => {
  const w = tipSteps(tall(100, 1.2, { find }), { slip: "halfHeight" });
  equal(w.wrong, "tip");
  ok(/600/.test(w.lines[1].tex), w.lines[1].tex);
  ok(w.follows.includes("verdict"), "the verdict changes too");
  equal(w.kind, "momentArm");
  equal(tipSteps(tall(100, 1.2, { find }), { slip: "biggerFirst" }).wrong, "verdict");
});
