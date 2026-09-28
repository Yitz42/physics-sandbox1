// bearing-stress.test.js — tests for Mechanics of Materials Unit 1.3: Bearing stress (σ_b = P / A_b).
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveBearingStress, bearingArea } from "../../src/subjects/materials/bearing-stress.js";
import {
  bearingStressEquations,
  bearingStressSummary,
  bearingStressQuantities,
  bearingStressMistakes,
  bearingStressDebug,
} from "../../src/subjects/materials/bearing-stress-tools.js";
import { bearingStressScene } from "../../src/subjects/materials/bearing-stress-scene.js";

setFile("materials / bearing stress (Unit 1.3)");

// ---- 1. Bearing area calculations -----------------------------------------------------

test("projected bearing area: t = 12 mm, d = 20 mm gives A_b = 240 mm²", () => {
  const Ab = bearingArea(12, 20);
  equal(Ab, 240);
});

// ---- 2. Bearing stress solving --------------------------------------------------------

test("bearing stress: P = 36 kN on t = 12 mm plate with d = 20 mm pin gives σ_b = 150.0 MPa", () => {
  const res = solveBearingStress({
    joint: { plateThickness: 12, pinDiameter: 20 },
    load: { P: 36 },
  });
  equal(res.status, "determinate");
  close(res.values.P, 36);
  close(res.values.A_b, 240);
  close(res.values.sigma_b, 150.0, 1e-3);
});

test("factor of safety & sizing: P = 45 kN, d = 20 mm, σ_allow = 150 MPa gives t_min = 15 mm", () => {
  const res = solveBearingStress({
    joint: { plateThickness: 15, pinDiameter: 20, allowableStress: 150 },
    load: { P: 45 },
  });
  close(res.values.sigma_b, 150.0, 1e-3);
  close(res.values.FS, 1.0, 1e-3);
  close(res.values.t_min, 15.0, 1e-3);
  close(res.values.P_max, 45.0, 1e-3);
});

// ---- 3. Equations and summary ---------------------------------------------------------

test("equations: builds bearing area and bearing stress", () => {
  const s = { joint: { plateThickness: 10, pinDiameter: 18 }, load: { P: 25 } };
  const eqs = bearingStressEquations(s);
  equal(eqs.length, 2);
  equal(eqs[0].id, "bearing-area");
  equal(eqs[1].id, "bearing-stress");
  ok(/\\sigma_b/.test(eqs[1].lhs));
});

test("summary: shows A_b and sigma_b without invalid KaTeX", () => {
  const s = { joint: { plateThickness: 10, pinDiameter: 18, allowableStress: 120 }, load: { P: 25 } };
  const lines = bearingStressSummary(s, null, { reveal: true });
  ok(lines.length >= 2);
  lines.forEach((line) => {
    ok(!line.includes("\\text{\\text{"), "must not have nested \\text{\\text{}}");
    ok(!line.includes("\\text{mm^2}"), "must not have raw ^2 inside \\text{}");
  });
});

test("quantities: reports correct units for P, t, d, A_b, sigma_b, FS", () => {
  const q = bearingStressQuantities();
  equal(q.P.unit, "kN");
  equal(q.t.unit, "mm");
  equal(q.d.unit, "mm");
  equal(q.A_b.unit, "mm^2");
  equal(q.sigma_b.unit, "MPa");
});

// ---- 4. Scene generation -------------------------------------------------------------

test("scene: generates pinned connection with plate, pin, leader, dimensions, and divider", () => {
  const s = { joint: { plateThickness: 14, pinDiameter: 22 }, load: { P: 40 } };
  const shapes = bearingStressScene(s, null, { reveal: true });
  ok(shapes.some((sh) => sh.type === "box"), "has plate box");
  ok(shapes.some((sh) => sh.type === "box" && sh.fill), "has steel pin");
  ok(shapes.some((sh) => sh.type === "leader"), "has leader arrow for pin diameter");
  ok(shapes.some((sh) => sh.type === "dim"), "has dimension lines for width and thickness");
  ok(shapes.some((sh) => sh.type === "arrow" && sh.id === "P"), "has load arrow P");
  ok(shapes.some((sh) => sh.type === "divider"), "has divider separating panels");
});

// ---- 5. Stage verification -----------------------------------------------------------

test("bearing-stress stages: all 6 canonical stages load and solve properly", async () => {
  const s1 = (await import("../../content/materials/bearing-stress/1-explore.js")).default;
  const s2 = (await import("../../content/materials/bearing-stress/2-predict.js")).default;
  const s3 = (await import("../../content/materials/bearing-stress/3-build.js")).default;
  const s4 = (await import("../../content/materials/bearing-stress/4-debug.js")).default;
  const s5 = (await import("../../content/materials/bearing-stress/5-concept-check.js")).default;
  const s6 = (await import("../../content/materials/bearing-stress/6-solve.js")).default;

  ok(s1 && s1.challenge === "explore", "stage 1 is explore");
  ok(s2 && s2.challenge === "predict", "stage 2 is predict");
  ok(s3 && s3.challenge === "build", "stage 3 is build");
  ok(s4 && s4.challenge === "debug", "stage 4 is debug");
  ok(s5 && s5.challenge === "concept-check", "stage 5 is concept-check");
  ok(s6 && s6.challenge === "solve", "stage 6 is solve");

  // Check build goal check function
  const bRes = solveBearingStress(s3.setup);
  const bCheckFail = s3.goal.check(bRes, s3.setup);
  ok(!bCheckFail.ok, "build default setup (t=10) fails allowable stress as intended");
  const safeSetup = { ...s3.setup, joint: { ...s3.setup.joint, plateThickness: 15 } };
  const safeRes = solveBearingStress(safeSetup);
  const bCheckPass = s3.goal.check(safeRes, safeSetup);
  ok(bCheckPass.ok, "build safe setup (t=15) passes allowable bearing stress");
});
