// Rigid bodies on supports (Unit 7 on), with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveRigidBody, rigidBodyEquations } from "../../src/subjects/statics/rigid-body.js";
import { reactionsOf } from "../../src/subjects/statics/supports.js";
import { evaluate } from "../../src/core/equations.js";

setFile("statics / rigid bodies and supports");

const pin = (id, at, extra = {}) => ({ id, type: "pin", at, ...extra });
const roller = (id, at, extra = {}) => ({ id, type: "roller", at, ...extra });
const beam = (supports, forces = [], extra = {}) => ({ body: { points: [[0, 0], [6, 0]] }, supports, forces, ...extra });
const down = (id, x, F) => ({ id, symbol: id, magnitude: F, direction: "down", at: [x, 0] });

test("each support gives one reaction per motion it stops", () => {
  const n = (type, extra = {}) => reactionsOf({ id: "A", type, at: [0, 0], anchor: [0, 2], ...extra }).map((r) => r.id);
  equal(n("pin"), ["A_x", "A_y"]);
  equal(n("roller"), ["A_y"]);
  equal(n("roller", { normal: [1, 0] }), ["A_x"]); // a roller against a wall pushes sideways
  equal(n("smooth"), ["N_A"]);
  equal(n("cable"), ["T_A"]);
  equal(n("fixed"), ["A_x", "A_y", "M_A"]);
  equal(n("none"), []);
});

test("simply supported beam: pin A, roller B at 6 m, 600 N at 2 m → B_y = 200 N, A_y = 400 N, A_x = 0", () => {
  // ΣM_A: 6 B_y − 600(2) = 0 → B_y = 200;  ΣF_y: A_y + 200 − 600 = 0 → A_y = 400
  const r = solveRigidBody(beam([pin("A", [0, 0]), roller("B", [6, 0])], [down("P", 2, 600)]));
  equal(r.status, "determinate");
  close(r.values.B_y, 200);
  close(r.values.A_y, 400);
  close(r.values.A_x, 0);
  equal(r.values.n, 3);
});

test("slanted load and the beam's weight: A_x = −300 N, B_y = 329.5 N, A_y = 462.9 N", () => {
  // P = 500 N on a 3-4-5 slope down-right at 2 m: (300, −400) N;  W = 40(9.81) = 392.4 N at 3 m
  // ΣF_x: A_x + 300 = 0;  ΣM_A: 6B_y − 400(2) − 392.4(3) = 0 → B_y = 1977.2/6 = 329.53
  // ΣF_y: A_y + 329.53 − 400 − 392.4 = 0 → A_y = 462.87
  const s = beam([pin("A", [0, 0]), roller("B", [6, 0])], [{ id: "P", symbol: "P", magnitude: 500, direction: { slope: [3, -4] }, at: [2, 0] }]);
  s.body.mass = 40;
  const r = solveRigidBody(s);
  close(r.values.A_x, -300);
  close(r.values.B_y, 329.5333);
  close(r.values.A_y, 462.8667);
  // ΣM_A uses P's perpendicular distance: |r × u| = 2(0.8) = 1.6 m, not 2 m.
  const M = rigidBodyEquations(s).find((e) => e.id === "sumM");
  const tP = M.terms.find((t) => t.id === "P");
  close(tP.factor.value, 1.6);
  close(tP.factor.alt.value, 2);
  equal(M.lhs, "\\Sigma M_{A}");
});

test("cantilever: fixed at A, 200 N at 3 m → A_y = 200 N, M_A = +600 N·m (counterclockwise)", () => {
  const r = solveRigidBody(beam([{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }], [down("P", 3, 200)]));
  equal(r.status, "determinate");
  close(r.values.A_y, 200);
  close(r.values.M_A, 600);
  close(r.values.A_x, 0);
});

test("boom held by a cable: T = 870.3 N, A_x = 696.2 N, A_y = 372.2 N", () => {
  // Pin A at the wall, cable from C (4, 0) up to (0, 3): T pulls along (−4, 3)/5.
  // W = 30(9.81) = 294.3 N at 2 m, P = 600 N at 2.5 m.
  // ΣM_A: T(3/5)(4) − 600(2.5) − 294.3(2) = 0 → T = 2088.6 / 2.4 = 870.25
  // ΣF_x: A_x − (4/5)T = 0 → 696.2;  ΣF_y: A_y + (3/5)T − 600 − 294.3 = 0 → 372.15
  const s = { body: { points: [[0, 0], [4, 0]], mass: 30 }, supports: [pin("A", [0, 0], { normal: [1, 0] }), { id: "C", type: "cable", at: [4, 0], anchor: [0, 3] }], forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2.5, 0] }] };
  const r = solveRigidBody(s);
  equal(r.status, "determinate");
  close(r.values.T_C, 870.25);
  close(r.values.A_x, 696.2);
  close(r.values.A_y, 372.15);
});

test("a uniform 400 N/m load over the whole 6 m beam: A_y = B_y = 1200 N", () => {
  const r = solveRigidBody(beam([pin("A", [0, 0]), roller("B", [6, 0])], [], { loads: [{ id: "w", shape: "uniform", from: 0, to: 6, w: 400 }] }));
  close(r.values.A_y, 1200);
  close(r.values.B_y, 1200);
});

test("classifying: two rollers are too few, three rollers are all parallel, two pins or fixed + roller are indeterminate", () => {
  const P = [down("P", 2, 600)];
  const two = solveRigidBody(beam([roller("A", [0, 0]), roller("B", [6, 0])], P));
  equal(two.status, "unstable");
  ok(/Only 2 unknown/.test(two.message), two.message);
  const three = solveRigidBody(beam([roller("A", [0, 0]), roller("B", [3, 0]), roller("C", [6, 0])], P));
  equal(three.status, "unstable");
  ok(/parallel/.test(three.message), three.message);
  const pins = solveRigidBody(beam([pin("A", [0, 0]), pin("B", [6, 0])], P));
  equal(pins.status, "indeterminate");
  ok(/4 unknown/.test(pins.message));
  equal(solveRigidBody(beam([{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }, roller("B", [6, 0])], P)).status, "indeterminate");
  const one = solveRigidBody(beam([roller("B", [6, 0])], P));
  equal(one.status, "unstable");
  ok(/Only 1 unknown/.test(one.message));
});

test("improper: pin A plus a roller whose push passes through A → it can turn about A", () => {
  // Roller at B pushes left (a wall on the right), along y = 0, straight through A.
  const r = solveRigidBody(beam([pin("A", [0, 0]), roller("B", [6, 0], { normal: [-1, 0] })], [down("P", 2, 600)]));
  equal(r.status, "unstable");
  ok(/one point/.test(r.message), r.message);
});

test("a roller would have to pull (load on the overhang) → the beam lifts off", () => {
  // Pin A at 2 m, roller B at 6 m, 300 N at the left end: ΣM_A: 4B_y + 300(2) = 0 → B_y = −150 N
  const r = solveRigidBody(beam([pin("A", [2, 0]), roller("B", [6, 0])], [down("P", 0, 300)]));
  equal(r.status, "unstable");
  ok(/lifts off/.test(r.message), r.message);
  close(r.values.B_y, -150);
});

test("counting only: unknowns per support, status 'resultant'", () => {
  const r = solveRigidBody(beam([pin("A", [0, 0]), pin("B", [6, 0])], [down("P", 2, 600)], { analysis: "count" }));
  equal(r.status, "resultant");
  equal([r.values.n_A, r.values.n_B, r.values.n], [2, 2, 4]);
  ok(/indeterminate/.test(r.message));
});

test("a deliberately wrong FBD (debug): an extra B_x at the roller, a missing A_x", () => {
  const s = beam([pin("A", [0, 0]), roller("B", [6, 0])], [down("P", 2, 600)]);
  const extra = solveRigidBody({ ...s, fbdEdits: { extra: [{ id: "B_x", support: "B" }] } });
  equal(extra.unknowns, ["A_x", "A_y", "B_y", "B_x"]);
  const missing = solveRigidBody({ ...s, fbdEdits: { remove: ["A_x"] } });
  equal(missing.unknowns, ["A_y", "B_y"]);
  // Equations still add up with the known loads: ΣF_y = A_y + B_y − 600 with A_y = 400, B_y = 200.
  const fy = rigidBodyEquations(s).find((e) => e.id === "sumFy");
  close(evaluate(fy, { A_y: 400, B_y: 200 }), 0);
});

// ---- Unit 4.2: equilibrium of a rigid body, and the smart moment point ----------

test("unknowns in ΣM depend on the moment point: A → 1, B → 1, middle → 2, off the beam → 3", () => {
  const s = (about) => beam([pin("A", [0, 0]), roller("B", [6, 0])], [down("P", 2, 600)], { about });
  equal(solveRigidBody(s("A")).momentUnknowns, ["B_y"]);
  equal(solveRigidBody(s("B")).momentUnknowns, ["A_y"]);
  equal(solveRigidBody(s({ at: [3, 0], label: "C" })).values.nM, 2);
  equal(solveRigidBody(s({ at: [3, 1.5], label: "D" })).values.nM, 3, "A_x's line (y = 0) misses D");
  // The answers don't depend on the point chosen: B_y = 200 N every time.
  for (const about of ["A", "B", { at: [3, 1.5], label: "D" }]) close(solveRigidBody(s(about)).values.B_y, 200);
});

test("load on the overhang: the pin pulls down (A_y = −200 N, B_y = 800 N for 600 N at 8 m)", () => {
  // ΣM_A: 6B_y − 600(8) = 0 → B_y = 800;  ΣF_y: A_y = 600 − 800 = −200
  const r = solveRigidBody({ body: { points: [[0, 0], [8, 0]] }, supports: [pin("A", [0, 0]), roller("B", [6, 0])], forces: [down("P", 8, 600)] });
  close(r.values.B_y, 800);
  close(r.values.A_y, -200);
});

test("overhanging beam with a uniform load: A_y = 400 N, B_y = 1200 N", () => {
  // F_w = 300(4) = 1200 N at 2 m; P = 400 N at 6 m.  ΣM_A: 4B_y − 2400 − 2400 = 0 → 1200;  A_y = 1600 − 1200 = 400
  const r = solveRigidBody({ body: { points: [[0, 0], [6, 0]] }, supports: [pin("A", [0, 0]), roller("B", [4, 0])],
    forces: [down("P", 6, 400)], loads: [{ id: "w", shape: "uniform", from: 0, to: 4, w: 300 }] });
  close(r.values.B_y, 1200);
  close(r.values.A_y, 400);
});

test("cantilever: A_y = 1700 N, M_A = 3300 N·m (counterclockwise)", () => {
  // F_w = 400(3) = 1200 N at 1.5 m; P = 500 N at 3 m.  M_A = 1200(1.5) + 500(3) = 3300
  const r = solveRigidBody({ body: { points: [[0, 0], [3, 0]] }, supports: [{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }],
    forces: [down("P", 3, 500)], loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400 }] });
  equal(r.status, "determinate");
  close(r.values.A_y, 1700);
  close(r.values.M_A, 3300);
  close(r.values.A_x, 0);
});

test("diving board: fulcrum at 1.5 m, 750 N diver → B_y = 2392.4 N, A_y = −1348.1 N", () => {
  // W = 30(9.81) = 294.3 N at 2 m.  ΣM_A: 1.5B_y − 294.3(2) − 750(4) = 0 → B_y = 3588.6/1.5 = 2392.4
  // ΣF_y: A_y = 294.3 + 750 − 2392.4 = −1348.1 (the bolts pull down)
  const r = solveRigidBody({ body: { points: [[0, 0], [4, 0]], mass: 30 }, supports: [pin("A", [0, 0]), roller("B", [1.5, 0])], forces: [down("W_d", 4, 750)] });
  close(r.values.B_y, 2392.4);
  close(r.values.A_y, -1348.1);
});

test("L-shaped jib crane: B_x = 1333.3 N, A_x = 1333.3 N, A_y = 800 N", () => {
  // Roller B at (0, 1.5) pushes left. ΣM_A: 1.5B_x − 2.5(800) = 0 → 1333.3;  ΣF_x: A_x = B_x;  ΣF_y: A_y = 800
  const r = solveRigidBody({ body: { points: [[0, 0], [0, 3], [2.5, 3]] },
    supports: [pin("A", [0, 0]), roller("B", [0, 1.5], { normal: [-1, 0] })],
    forces: [{ id: "P", symbol: "P", magnitude: 800, direction: "down", at: [2.5, 3] }] });
  equal(r.status, "determinate");
  close(r.values.B_x, 1333.33);
  close(r.values.A_x, 1333.33);
  close(r.values.A_y, 800);
});

// ---- Units 4.4 and 4.5: stability, determinacy, two- and three-force members ------

import { classifySteps, concurrency } from "../../src/subjects/statics/rigid-body-count.js";

test("degree of indeterminacy = unknowns − 3: fixed + roller 1, pin + 3 rollers 2, fixed + fixed 3", () => {
  const f = (id, x, n) => ({ id, type: "fixed", at: [x, 0], normal: n });
  const deg = (supports) => solveRigidBody(beam(supports, [down("P", 2, 600)])).values.deg;
  equal(deg([f("A", 0, [1, 0]), roller("B", [6, 0])]), 1);
  equal(deg([pin("A", [0, 0]), roller("B", [2, 0]), roller("C", [4, 0]), roller("D", [6, 0])]), 2);
  equal(deg([f("A", 0, [1, 0]), f("B", 6, [-1, 0])]), 3);
});

test("three rollers with a slanted load: 3 unknowns, all parallel → improper (it slides)", () => {
  const r = solveRigidBody(beam([roller("A", [0, 0]), roller("B", [3, 0]), roller("C", [6, 0])], [{ id: "P", symbol: "P", magnitude: 600, direction: { slope: [-3, -4] }, at: [4, 0] }]));
  equal(r.status, "unstable");
  ok(/parallel/.test(r.message));
});

test("ramp rollers whose lines all meet at (3, 3) → improper (it turns)", () => {
  const s2 = Math.SQRT1_2;
  const s = beam([
    roller("A", [0, 0], { normal: [s2, s2], direction: { angle: 45, from: "+x", toward: "+y" } }),
    roller("B", [3, 0]),
    roller("C", [6, 0], { normal: [-s2, s2], direction: { angle: 45, from: "-x", toward: "+y" } }),
  ], [{ id: "P", symbol: "P", magnitude: 600, direction: { slope: [-3, -4] }, at: [4, 0] }]);
  equal(solveRigidBody(s).status, "unstable");
});

test("pin + roller on a 30° incline: N_B = 503.7 N, A_x = 251.8 N, A_y = 556.2 N", () => {
  // ΣM_A: 5 N_B cos30° − 600(2) − 392.4(2.5) = 0 → N_B = 2181/4.3301 = 503.68
  // ΣF_x: A_x − N_B sin30° = 0 → 251.84;  ΣF_y: A_y = 992.4 − 503.68 cos30° = 556.21
  const s = { body: { points: [[0, 0], [5, 0]], mass: 40 },
    supports: [pin("A", [0, 0]), roller("B", [5, 0], { normal: [-0.5, Math.sqrt(3) / 2], direction: { angle: 30, from: "+y", toward: "-x" }, symbol: "N_B" })],
    forces: [down("P", 2, 600)] };
  const r = solveRigidBody(s);
  close(r.values.N_B, 503.68);
  close(r.values.A_x, 251.84);
  close(r.values.A_y, 556.21);
});

test("a link (two-force member) gives one force along itself: tie in tension, prop in compression", () => {
  equal(reactionsOf({ id: "B", type: "link", at: [4, 0], anchor: [0, 3], symbol: "F_{BD}" }).map((r) => [r.id, r.kind, r.either]), [["F_BD", "link", true]]);
  // Tie from B (4, 0) to D (0, 3), load 600 N at 2 m: ΣM_A: 4(3/5)F − 600(2) = 0 → F = 500 (tension)
  const tie = solveRigidBody({ body: { points: [[0, 0], [4, 0]] }, supports: [pin("A", [0, 0], { normal: [1, 0] }), { id: "B", type: "link", at: [4, 0], anchor: [0, 3], symbol: "F_{BD}" }], forces: [down("P", 2, 600)] });
  close(tie.values.F_BD, 500);
  // The pin's force points at O = (2, 1.5), where the load's line meets the tie's: θ = tan⁻¹(1.5/2) = 36.87°
  close(tie.values.theta_A, 36.87);
  close(tie.values.R_A, 500);
  const c = concurrency({ body: { points: [[0, 0], [4, 0]] }, supports: [pin("A", [0, 0]), { id: "B", type: "link", at: [4, 0], anchor: [0, 3] }], forces: [down("P", 2, 600)] });
  close(c.at[0], 2);
  close(c.at[1], 1.5);
});

test("boom and strut: F_BD = −1796.0 N (compression), A_x = −1494.3 N, A_y = −101.9 N", () => {
  // Strut B (3, 0) → D (0, −2). ΣM_A: −6F/√13 − 294.3(2) − 600(4) = 0 → F = −2988.6√13/6 = −1795.9
  // ΣF_x: A_x = 3F/√13 = −1494.3;  ΣF_y: A_y = 894.3 + 2F/√13 = −101.9
  const r = solveRigidBody({ body: { points: [[0, 0], [4, 0]], mass: 30 },
    supports: [pin("A", [0, 0], { normal: [1, 0] }), { id: "B", type: "link", at: [3, 0], anchor: [0, -2], symbol: "F_{BD}" }],
    forces: [down("P", 4, 600)] });
  close(r.values.F_BD, -1795.93);
  close(r.values.A_x, -1494.3);
  close(r.values.A_y, -101.9, 2e-3);
});

test("a student's classification with one wrong line: miscount, arrangement, degree", () => {
  const propped = { analysis: "count", body: { points: [[0, 0], [6, 0]] }, supports: [{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }, roller("B", [6, 0])], forces: [down("P", 2, 600)] };
  const a = classifySteps(propped, { kind: "miscount", support: "A", as: 2 });
  equal(a.wrong, "s_A");
  ok(a.follows.includes("total") && a.follows.includes("verdict"));
  ok(/degree/.test(a.corrected.join(" ")), "the corrected working says indeterminate");
  const three = { ...propped, supports: [roller("A", [0, 0]), roller("B", [3, 0]), roller("C", [6, 0])] };
  const b = classifySteps(three, { kind: "arrangement" });
  equal(b.wrong, "arrangement");
  ok(/Improperly/.test(b.corrected[b.corrected.length - 1]));
  const c = classifySteps({ ...propped, supports: [pin("A", [0, 0]), roller("B", [3, 0]), roller("C", [6, 0])] }, { kind: "degree" });
  equal(c.wrong, "compare");
  ok(c.fixes.some((f) => f.correct));
});

test("three rollers only: two ramps pushing right hold the beam; one ramp and two floor rollers can't", () => {
  // P = 600 N on a 3-4-5 slope down-left at 4 m: (−360, −480) N. See content/statics/stability/3-build.js.
  const s2 = Math.SQRT1_2;
  const floor = (id, x) => roller(id, [x, 0], { symbol: `N_${id}` });
  const ramp = (id, x) => roller(id, [x, 0], { normal: [s2, s2], direction: { angle: 45, from: "+x", toward: "+y" }, symbol: `N_${id}` });
  const P = [{ id: "P", symbol: "P", magnitude: 600, direction: { slope: [-3, -4] }, at: [4, 0] }];
  const r1 = solveRigidBody(beam([floor("A", 0), ramp("B", 3), ramp("C", 6)], P));
  equal(r1.status, "determinate");
  close(r1.values.N_C * s2, 0.4667 * 600, 2e-3); // c = 0.467P
  equal(solveRigidBody(beam([ramp("A", 0), floor("B", 3), ramp("C", 6)], P)).status, "determinate");
  const r3 = solveRigidBody(beam([ramp("A", 0), floor("B", 3), floor("C", 6)], P));
  equal(r3.status, "unstable");
  ok(/lifts off/.test(r3.message));
});
