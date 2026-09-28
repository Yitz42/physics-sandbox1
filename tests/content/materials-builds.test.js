// materials-builds.test.js — the Mechanics of Materials build stages, checked by hand.
//
// A build stage must be winnable in EVERY version its `vary` rules can make, the
// starting design must fail, and the goal must pass only the smallest safe size:
// one millimetre thinner is over the allowable stress, one thicker is overdesigned.
// (Kept out of stages.test.js, which is already long.)
import { test, ok, equal, close, setFile } from "../harness.js";
import { loadStage } from "../../src/core/content.js";
import { clone, setPath } from "../../src/core/paths.js";
import { solveAxialStress } from "../../src/subjects/materials/axial-stress.js";
import { solveShearStress } from "../../src/subjects/materials/shear-stress.js";
import { solveBearingStress } from "../../src/subjects/materials/bearing-stress.js";
import { solveAllowableStress } from "../../src/subjects/materials/allowable-stress.js";
import { axialStressQuantities } from "../../src/subjects/materials/axial-stress-tools.js";
import { shearStressQuantities } from "../../src/subjects/materials/shear-stress-tools.js";
import { bearingStressQuantities } from "../../src/subjects/materials/bearing-stress-tools.js";
import { allowableStressQuantities } from "../../src/subjects/materials/allowable-stress-tools.js";

setFile("content / materials build stages");

const normal = await loadStage("materials", "normal-stress", "3-build");
const shear = await loadStage("materials", "shear-stress", "3-build");
const bearing = await loadStage("materials", "bearing-stress", "3-build");
const allowable = await loadStage("materials", "allowable-stress", "3-build");


// Every value one vary rule can pick: its list, or min to max in steps.
const valuesOf = (rule) => rule.values ||
  Array.from({ length: Math.floor((rule.max - rule.min) / rule.step + 1e-9) + 1 }, (_, i) => Number((rule.min + i * rule.step).toFixed(10)));

// Every combination of the stage's vary values (each rule is picked on its own,
// so every pairing can happen).
function allVersions(stage) {
  let out = [clone(stage.setup)];
  for (const rule of stage.vary) {
    out = out.flatMap((s) => valuesOf(rule).map((v) => { const c = clone(s); setPath(c, rule.path, v); return c; }));
  }
  return out;
}

// Try diameter d on a version: the goal's verdict and the solver's numbers.
function tryD(stage, solve, setup, path, d) {
  const s = clone(setup);
  setPath(s, path, d);
  const r = solve(s);
  return { r, out: stage.goal.check(r, s) };
}

test("Normal stress build: 48 kN at 120 MPa → A_min = 400 mm², d = 23 mm works (σ = 115.5 MPa); 22 is over, 24 is overdesigned", () => {
  const path = "bar.diameter";
  const at = (d) => tryD(normal, solveAxialStress, normal.setup, path, d);
  ok(!at(18).out.ok, "the start (18 mm) should fail");
  const d23 = at(23);
  ok(d23.out.ok, d23.out.message);
  close(d23.r.values.A, 415.48, 0.01);
  close(d23.r.values.sigma, 115.53, 0.01);
  const d22 = at(22);
  ok(!d22.out.ok && d22.r.values.sigma > 120, "22 mm: σ = 126.3 MPa is over 120");
  ok(/over/.test(at(22).out.message), "too thin: says it's over the limit");
  ok(/thinner rod would be safe/.test(at(24).out.message), "24 mm: safe but overdesigned");
});

test("Shear build: 42 kN at 85 MPa, single shear → A_min = 494.1 mm², d = 26 mm works (τ = 79.1 MPa); 25 is just over (85.6), 27 is overdesigned", () => {
  const path = "joint.pinDiameter";
  const at = (d) => tryD(shear, solveShearStress, shear.setup, path, d);
  ok(!at(22).out.ok, "the start (22 mm) should fail");
  const d26 = at(26);
  ok(d26.out.ok, d26.out.message);
  close(d26.r.values.A, 530.93, 0.01);
  close(d26.r.values.tau, 79.11, 0.01);
  const d25 = at(25);
  ok(!d25.out.ok, "25 mm should fail");
  close(d25.r.values.tau, 85.57, 0.01);
  ok(/thinner bolt would be safe/.test(at(27).out.message), "27 mm: safe but overdesigned");
});

test("Bearing build: 45 kN at 150 MPa, d = 20 mm → A_b,min = 300 mm², t = 15 mm works (σ_b = 150.0 MPa); 14 is over, 16 is overdesigned", () => {
  const path = "joint.plateThickness";
  const at = (t) => tryD(bearing, solveBearingStress, bearing.setup, path, t);
  ok(!at(10).out.ok, "the start (10 mm) should fail");
  const t15 = at(15);
  ok(t15.out.ok, t15.out.message);
  close(t15.r.values.A_b, 300.0, 0.01);
  close(t15.r.values.sigma_b, 150.0, 0.01);
  const t14 = at(14);
  ok(!t14.out.ok && t14.r.values.sigma_b > 150, "14 mm: σ_b = 160.7 MPa is over 150");
  ok(/over/.test(t14.out.message), "too thin: says it's over the limit");
  ok(/thinner plate would be safe/.test(at(16).out.message), "16 mm: safe but overdesigned");
});

test("Allowable build: 48 kN, double shear at 80 MPa, bearing at 180 MPa → d = 20 mm works (P_allow = 50.3 kN ≥ 48); 19 fails (45.4 kN), 21 is overdesigned", () => {
  const path = "joint.pinDiameter";
  const at = (d) => tryD(allowable, solveAllowableStress, allowable.setup, path, d);
  ok(!at(16).out.ok, "the start (16 mm) should fail");
  const d20 = at(20);
  ok(d20.out.ok, d20.out.message);
  close(d20.r.values.P_allow, 50.27, 0.05);
  const d19 = at(19);
  ok(!d19.out.ok && d19.r.values.P_allow < 48, "19 mm: P_allow = 45.4 kN is under 48");
  ok(/thinner pin would be safe/.test(at(21).out.message), "21 mm: safe but overdesigned");
});


for (const [name, stage, solve, path] of [
  ["Normal stress", normal, solveAxialStress, "bar.diameter"],
  ["Shear", shear, solveShearStress, "joint.pinDiameter"],
  ["Bearing", bearing, solveBearingStress, "joint.plateThickness"],
  ["Allowable", allowable, solveAllowableStress, "joint.pinDiameter"],
]) {
  test(`${name} build: every version has exactly one winning dimension on the slider, and the start fails`, () => {
    const slider = stage.editable.find((e) => e.path === path);
    const versions = allVersions(stage);
    ok(versions.length >= 50, `only ${versions.length} versions`);
    const startVal = stage.setup.bar
      ? stage.setup.bar.diameter
      : path.endsWith("plateThickness")
      ? stage.setup.joint.plateThickness
      : stage.setup.joint.pinDiameter;
    for (const v of versions) {
      const label = JSON.stringify(v.load) + " " + JSON.stringify(v.bar || v.joint);
      ok(!tryD(stage, solve, v, path, startVal).out.ok, `start passes: ${label}`);
      const wins = [];
      for (let d = slider.min; d <= slider.max; d += slider.step) if (tryD(stage, solve, v, path, d).out.ok) wins.push(d);
      equal(wins.length, 1, `${label}: winning sizes ${wins}`);
    }
  });

  test(`${name} build: the numbers checked on paper (goal.predict) exist, with units`, () => {
    const q = stage.solver === "materials.axialStress"
      ? axialStressQuantities(stage.setup)
      : stage.solver === "materials.shearStress"
      ? shearStressQuantities(stage.setup)
      : stage.solver === "materials.bearingStress"
      ? bearingStressQuantities(stage.setup)
      : allowableStressQuantities(stage.setup);
    const r = solve(stage.setup);
    for (const p of stage.goal.predict) {
      ok(Number.isFinite(r.values[p.quantity]), `no value for ${p.quantity}`);
      ok(q[p.quantity] && q[p.quantity].unit, `no unit for ${p.quantity}`);
    }
  });
}


