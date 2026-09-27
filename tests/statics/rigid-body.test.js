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
