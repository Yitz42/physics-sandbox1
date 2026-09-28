// Rigid bodies in equilibrium in 3D (Unit 5.6): six equations, supports in space.
// Answers worked by hand in each test's name (and in content/statics/library/rigid3d.js).
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveForce3d } from "../../src/subjects/statics/force3d.js";
import { rigid3dEquations, rigid3dMistakes, reactionsOf3 } from "../../src/subjects/statics/force3d-rigid.js";
import { rigid3dSteps } from "../../src/subjects/statics/force3d-rigid-tools.js";
import { shelfPlate, windlass, boom3d } from "../../content/statics/library/rigid3d.js";

setFile("statics / rigid bodies in 3D");

test("supports: a ball-and-socket gives 3 forces, a journal bearing on an x shaft gives y and z, a thrust bearing 3", () => {
  const r = reactionsOf3({ supports: [{ id: "A", type: "ball", at: "A" }, { id: "B", type: "bearing", at: "B", axis: "x" }, { id: "C", type: "thrust", at: "C" }] });
  equal(r.map((f) => f.id), ["A_x", "A_y", "A_z", "B_y", "B_z", "C_x", "C_y", "C_z"]);
});

test("shelf plate: T = 470.25 √17/2 = 969.45 N, B_z = 25.0 N, B_y = 0, A_x = 705.4 N, A_y = 470.25 N, A_z = 295.25 N", () => {
  const r = solveForce3d(shelfPlate.setup);
  equal(r.status, "determinate");
  const v = r.values;
  close(v.T, (470.25 * Math.sqrt(17)) / 2, 1e-6);
  close(v.B_z, 25, 1e-6);
  close(v.B_y, 0, 1e-6);
  close(v.A_x, 705.375, 1e-6);
  close(v.A_y, 470.25, 1e-6);
  close(v.A_z, 295.25, 1e-6);
});

test("windlass: P = 0.1(500)/0.25 = 200 N, B_z = 200 N, B_x = 1.3(200) = 260 N, A_x = −60 N, A_z = 300 N, A_y = 0", () => {
  const v = solveForce3d(windlass.setup).values;
  close(v.P, 200, 1e-6);
  close(v.B_z, 200, 1e-6);
  close(v.B_x, 260, 1e-6);
  close(v.A_x, -60, 1e-6);
  close(v.A_z, 300, 1e-6);
  close(v.A_y, 0, 1e-6);
});

test("boom on two cables: T_BC = T_BD = 600·√24/4 = 734.85 N, A_x = 1200 N (five unknowns, five independent equations)", () => {
  const r = solveForce3d(boom3d.setup);
  equal(r.status, "determinate");
  close(r.values.T_BC, (600 * Math.sqrt(24)) / 4, 1e-6);
  close(r.values.T_BD, r.values.T_BC, 1e-6);
  close(r.values.A_x, 1200, 1e-6);
});

test("six equations; about A the ball-and-socket's reactions don't appear in any moment equation", () => {
  const eqs = rigid3dEquations(shelfPlate.setup);
  equal(eqs.length, 6);
  for (const e of eqs.filter((x) => x.id.startsWith("sumM"))) ok(!e.terms.some((t) => t.id.startsWith("A_")), e.id);
});

test("a ball-and-socket alone can't hold the plate (it would swing): unstable or improper", () => {
  const s = { ...shelfPlate.setup, supports: [{ id: "A", type: "ball", at: "A" }] };
  ok(solveForce3d(s).status !== "determinate");
});

test("slips: the cable's r used as u; the weight left out", () => {
  const ms = rigid3dMistakes(shelfPlate.setup, "T");
  ok(ms.some((m) => m.kind === "vector" && Math.abs(m.value - 940.5 / 4) < 1e-6), "r_z = 2 used as u_z: T = 940.5/4");
  ok(ms.some((m) => m.kind === "missing"));
});

test("a student's working: 'arm' is wrong at ΣM_x and B_z follows (A_z doesn't: T u_z and B_z change by equal and opposite amounts); 'drop' at ΣF_z", () => {
  const a = rigid3dSteps(shelfPlate.setup, { slip: "arm", force: "W" });
  equal(a.wrong, "sumMx");
  ok(a.follows.includes("sumMy"));
  ok(!a.follows.includes("sumFz"));
  equal(rigid3dSteps(shelfPlate.setup, { slip: "drop", reaction: "B_z" }).wrong, "sumFz");
  equal(rigid3dSteps(shelfPlate.setup, { slip: "noUnit" }).wrong, "cable");
});
