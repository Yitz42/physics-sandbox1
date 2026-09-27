// Dry friction (Unit 9.1): |F| ≤ μ_s N; holds, impending, slides (then F = μ_k N);
// where motion starts. Answers worked by hand in each test's name.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveFriction, criticalValue } from "../../src/subjects/statics/friction.js";
import { blockEquations, frictionMistakes, frictionSteps } from "../../src/subjects/statics/friction-tools.js";
import { solveEquations } from "../../src/core/equations.js";
import { reactionsOf } from "../../src/subjects/statics/supports.js";

setFile("statics / friction");

const crate = (angle, extra = {}) => ({ ramp: { angle, length: 6 }, block: { w: 1.2, h: 0.8, at: 3 }, weight: 500, mus: 0.4, muk: 0.3, ...extra });

test("a 500 N crate on a 20° ramp, μs = 0.4: N = 500 cos 20° = 469.8 N, F = 500 sin 20° = 171.0 N up the slope — it holds (μs N = 187.9 N)", () => {
  const r = solveFriction(crate(20));
  close(r.values.N, 469.846);
  close(r.values.F, 171.010);
  close(r.values.Fmax, 187.939);
  equal(r.state, "holds");
});

test("at 25° it would need 211.3 N > μs N = 181.3 N: it slides down, and friction is μk N = 0.3 × 453.2 = 135.9 N", () => {
  const r = solveFriction(crate(25));
  equal(r.state, "slides");
  equal(r.moves, "down");
  close(r.values.F, 135.946);
});

test("the slip angle: tan θ = μs → θ = tan⁻¹ 0.4 = 21.80°", () => {
  const v = solveFriction(crate(10, { find: { path: "ramp.angle", motion: "down", min: 0, max: 60, symbol: "\\theta", unit: "deg" } })).values;
  close(v.critical, 21.801, 1e-4);
});

test("a 400 N crate on a floor (μs = 0.5), pushed 30° below the level: P = μs W / (cos 30° − μs sin 30°) = 324.7 N to start it moving", () => {
  const s = { ramp: { angle: 0, length: 6 }, block: { w: 1.2, h: 0.8, at: 3 }, weight: 400, mus: 0.5,
    forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up", tilt: -30 }], find: { path: "forces.#P.magnitude", motion: "right", min: 0, max: 2000 } };
  close(solveFriction(s).values.critical, 324.662, 1e-4);
  // Pulled by a rope 30° ABOVE the level, it presses less on the floor: 200 / (cos 30° + 0.5 sin 30°) = 179.2 N.
  const pulled = { ...s, forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up", tilt: 30, rope: true }] };
  close(criticalValue(pulled), 179.207, 1e-4);
});

test("a 600 N crate on a 30° ramp (μs = 0.3), pushed up the slope: it starts up at P = 600(sin 30° + 0.3 cos 30°) = 455.9 N, and needs 144.1 N not to slide down", () => {
  const s = { ramp: { angle: 30, length: 6 }, block: { w: 1.2, h: 0.8, at: 3 }, weight: 600, mus: 0.3,
    forces: [{ id: "P", symbol: "P", magnitude: 400, along: "up" }] };
  close(criticalValue({ ...s, find: { path: "forces.#P.magnitude", motion: "up", min: 0, max: 2000 } }), 455.885, 1e-4);
  close(criticalValue({ ...s, find: { path: "forces.#P.magnitude", motion: "down", min: 0, max: 2000 } }), 144.115, 1e-4);
  // With P = 400 N: F = 600 sin 30° − 400 = −100 N — friction acts DOWN the slope, and it holds (μs N = 155.9 N).
  const r = solveFriction(s);
  close(r.values.F, -100);
  equal(r.state, "holds");
});

test("the block's equations: ΣF_y' = N − W cos θ = 0 and ΣF_x' = F + P − W sin θ = 0 give N and F", () => {
  const s = { ...crate(30), forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up" }] };
  const sol = solveEquations(blockEquations(s), ["N", "F"]);
  close(sol.values.N, 500 * Math.cos(Math.PI / 6));
  close(sol.values.F, 250 - 100);
});

test("slips give their own answers: μs N for F while it holds, W for N on a ramp", () => {
  const Fs = frictionMistakes(crate(20), "F").map((m) => m.value);
  ok(Fs.some((x) => Math.abs(x - 187.939) < 0.01), "μs N offered as a mistake for F");
  const Ns = frictionMistakes(crate(20), "N").map((m) => m.value);
  ok(Ns.some((x) => Math.abs(x - 500) < 1e-6), "W offered as a mistake for N");
});

test("a student's working: each slip makes its own line wrong, and later lines follow it", () => {
  const s = { ...crate(20), forces: [{ id: "P", symbol: "P", magnitude: 50, along: "up" }] };
  for (const [slip, line] of [["noCos", "N"], ["swap", "F"], ["limit", "verdict"], ["weight", "max"], ["direction", "verdict"]]) {
    const w = frictionSteps(s, { slip });
    equal(w.wrong, line, `${slip}:`);
    equal(w.lines.length, w.corrected.length);
    ok(w.fixes.filter((f) => f.correct).length === 1, "one right fix");
  }
  ok(frictionSteps(s, { slip: "noCos" }).follows.includes("max"), "μs N is wrong only because N was");
});

test("a rough surface gives a push N and friction F along it", () => {
  const r = reactionsOf({ id: "A", type: "rough", at: [0, 0], friction: "left" });
  equal(r.map((x) => x.id), ["N_A", "F_A"]);
  equal(r[1].direction, "left");
  ok(r[1].either && !r[0].either);
});

// A 5 m ladder at 60° to a rough floor (μs = 0.35), against a smooth wall: its 20 kg
// (196.2 N) at the middle, a 700 N painter d up it. Foot A (2.5, 0), top B (0, 4.330).
//   ΣF_y: N_A = 196.2 + 700 = 896.2 N;  ΣM_A: 4.330 N_B = 1.25(196.2) + 0.5d(700);  ΣF_x: F_A = N_B (toward the wall).
//   d = 3 m: N_B = 1295.25 / 4.3301 = 299.13 N; needs μs ≥ 299.13 / 896.2 = 0.3338 — it holds.
//   It slips when N_B = 0.35(896.2) = 313.67 N: d = (4.3301 × 313.67 − 245.25) / 350 = 3.180 m.
const ladder = (d) => ({
  body: { points: [[2.5, 0], [0, 5 * Math.sin(Math.PI / 3)]], mass: 20 },
  supports: [
    { id: "A", type: "rough", at: [2.5, 0], normal: [0, 1], friction: "left", mus: 0.35 },
    { id: "B", type: "smooth", at: [0, 5 * Math.sin(Math.PI / 3)], normal: [1, 0] },
  ],
  forces: [{ id: "P", symbol: "P", magnitude: 700, direction: "down", along: d }],
});

test("the painter's ladder, 3 m up: N_A = 896.2 N, F_A = N_B = 299.1 N toward the wall, μs needed 0.334 < 0.35 — it holds", () => {
  const r = solveFriction(ladder(3));
  equal(r.status, "determinate");
  close(r.values.N_A, 896.2);
  close(r.values.N_B, 299.126);
  close(r.values.F_A, 299.126);
  close(r.values.mu_A, 0.33377);
  equal(r.contacts.A.state, "holds");
});

test("how far up the painter can climb: d = 3.180 m, where F_A reaches μs N_A", () => {
  const s = { ...ladder(1), find: { path: "forces.#P.along", min: 0, max: 5, symbol: "d", unit: "m" } };
  const d = (5 * Math.sin(Math.PI / 3) * 0.35 * 896.2 - 1.25 * 196.2) / 350;
  close(solveFriction(s).values.critical, d, 1e-5);
});
