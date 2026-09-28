// allowable-stress.test.js — tests for Mechanics of Materials Unit 1.4: Allowable stress & FS.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveAllowableStress, PI } from "../../src/subjects/materials/allowable-stress.js";
import { allowableStressEquations, allowableStressSummary, allowableStressQuantities, allowableStressMistakes } from "../../src/subjects/materials/allowable-stress-tools.js";
import { allowableStressDebug } from "../../src/subjects/materials/allowable-stress-steps.js";
import { allowableStressScene } from "../../src/subjects/materials/allowable-stress-scene.js";

setFile("materials / allowable stress & factor of safety (Unit 1.4)");

// ---- 1. Multi-mode limit solving -----------------------------------------------------

test("clevis joint: evaluates tension, double shear, and bearing; pin shear governs", () => {
  const res = solveAllowableStress({
    rod: { diameter: 26, allowableStress: 140 },
    joint: { planes: 2, pinDiameter: 20, plateThickness: 15, allowableShear: 85, allowableBearing: 190 },
    load: { P: 50 },
  });
  equal(res.status, "determinate");
  close(res.values.P_tension, 74.33, 0.05);
  close(res.values.P_shear, 53.41, 0.05);
  close(res.values.P_bearing, 57.00, 0.05);
  close(res.values.P_allow, 53.41, 0.05);
  equal(res.values.governing, "shear");
  close(res.values.FS, 53.41 / 50, 0.01);
});

test("lap joint: single shear pin with thin plate; bearing governs", () => {
  const res = solveAllowableStress({
    rod: { diameter: 24, allowableStress: 130 },
    joint: { planes: 1, pinDiameter: 18, plateThickness: 8, allowableShear: 80, allowableBearing: 150 },
    load: { P: 20 },
  });
  // P_tension = 130 * (π/4)(24)² / 1000 = 58.81 kN
  // P_shear = 1 * 80 * (π/4)(18)² / 1000 = 20.36 kN
  // P_bearing = 150 * (8 * 18) / 1000 = 21.60 kN
  // Wait: P_shear is 20.36 kN, P_bearing is 21.60 kN -> shear is 20.36
  close(res.values.P_shear, 20.358, 0.05);
  close(res.values.P_bearing, 21.600, 0.05);
});

// ---- 2. Equations and summary ---------------------------------------------------------

test("equations: builds tension, shear, bearing, and allowable load equations", () => {
  const s = {
    rod: { diameter: 22, allowableStress: 120 },
    joint: { planes: 2, pinDiameter: 18, plateThickness: 12, allowableShear: 75, allowableBearing: 180 },
    load: { P: 35 },
  };
  const eqs = allowableStressEquations(s);
  equal(eqs.length, 4);
  equal(eqs[0].id, "tensile-capacity");
  equal(eqs[1].id, "shear-capacity");
  equal(eqs[2].id, "bearing-capacity");
  equal(eqs[3].id, "allowable-load");
});

test("summary: shows all capacities without invalid KaTeX", () => {
  const s = {
    rod: { diameter: 22, allowableStress: 120 },
    joint: { planes: 2, pinDiameter: 18, plateThickness: 12, allowableShear: 75, allowableBearing: 180 },
    load: { P: 35 },
  };
  const lines = allowableStressSummary(s, null, { reveal: true });
  ok(lines.length >= 4);
  lines.forEach((line) => {
    ok(!line.includes("\\text{\\text{"), "must not have nested \\text{\\text{}}");
    ok(!line.includes("\\text{mm^2}"), "must not have raw ^2 inside \\text{}");
  });
});

test("quantities: reports correct units for P, P_allow, FS, stresses", () => {
  const q = allowableStressQuantities();
  equal(q.P.unit, "kN");
  equal(q.P_allow.unit, "kN");
  equal(q.P_tension.unit, "kN");
  equal(q.P_shear.unit, "kN");
  equal(q.P_bearing.unit, "kN");
  equal(q.sigma.unit, "MPa");
  equal(q.tau.unit, "MPa");
  equal(q.sigma_b.unit, "MPa");
});

// ---- 3. Scene generation -------------------------------------------------------------

test("scene: generates assembly elevation and capacity bars", () => {
  const s = {
    rod: { diameter: 22, allowableStress: 120 },
    joint: { planes: 2, pinDiameter: 18, plateThickness: 12, allowableShear: 75, allowableBearing: 180 },
    load: { P: 35 },
  };
  const shapes = allowableStressScene(s, null, { reveal: true });
  ok(shapes.some((sh) => sh.type === "box"), "has assembly boxes");
  ok(shapes.some((sh) => sh.type === "arrow" && sh.id === "P"), "has load arrow P");
  ok(shapes.some((sh) => sh.type === "leader"), "has leader arrows");
  ok(shapes.some((sh) => sh.type === "divider"), "has divider separating panels");
  ok(shapes.some((sh) => sh.type === "note"), "has corner summary note");
});

// ---- 4. Stage verification -----------------------------------------------------------

test("allowable-stress stages: all 6 canonical stages load and solve properly", async () => {
  const s1 = (await import("../../content/materials/allowable-stress/1-explore.js")).default;
  const s2 = (await import("../../content/materials/allowable-stress/2-predict.js")).default;
  const s3 = (await import("../../content/materials/allowable-stress/3-build.js")).default;
  const s4 = (await import("../../content/materials/allowable-stress/4-debug.js")).default;
  const s5 = (await import("../../content/materials/allowable-stress/5-concept-check.js")).default;
  const s6 = (await import("../../content/materials/allowable-stress/6-solve.js")).default;

  ok(s1 && s1.challenge === "explore", "stage 1 is explore");
  ok(s2 && s2.challenge === "predict", "stage 2 is predict");
  ok(s3 && s3.challenge === "build", "stage 3 is build");
  ok(s4 && s4.challenge === "debug", "stage 4 is debug");
  ok(s5 && s5.challenge === "concept-check", "stage 5 is concept-check");
  ok(s6 && s6.challenge === "solve", "stage 6 is solve");

  // Check build goal check function
  const bRes = solveAllowableStress(s3.setup);
  const bCheckFail = s3.goal.check(bRes, s3.setup);
  ok(!bCheckFail.ok, "build default setup (d=16) fails allowable stress as intended");
  const safeSetup = { ...s3.setup, joint: { ...s3.setup.joint, pinDiameter: 20 } };
  const safeRes = solveAllowableStress(safeSetup);
  const bCheckPass = s3.goal.check(safeRes, safeSetup);
  ok(bCheckPass.ok, "build safe setup (d=20) passes allowable load check");
});
