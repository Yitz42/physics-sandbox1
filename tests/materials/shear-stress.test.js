// shear-stress.test.js — tests for Mechanics of Materials Unit 1.2: Direct shear stress (τ = V / A).
import { equationTex } from "../../src/core/equations.js";
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveShearStress, pinArea, PI } from "../../src/subjects/materials/shear-stress.js";
import {
  shearStressEquations,
  shearStressSummary,
  shearStressQuantities,
  shearStressMistakes,
  shearStressDebug,
} from "../../src/subjects/materials/shear-stress-tools.js";
import { shearStressScene } from "../../src/subjects/materials/shear-stress-scene.js";

setFile("materials / direct shear stress (Unit 1.2)");

// ---- 1. Pin area calculations ---------------------------------------------------------

test("pin cross-sectional area: d = 20 mm gives A = 314.16 mm²", () => {
  const A = pinArea(20);
  close(A, (PI / 4) * 400, 1e-5);
});

// ---- 2. Direct shear solving ----------------------------------------------------------

test("single shear: P = 20 kN on d = 16 mm bolt gives V = 20 kN, τ = 99.47 MPa", () => {
  const res = solveShearStress({
    joint: { type: "lap", planes: 1, pinDiameter: 16 },
    load: { P: 20 },
  });
  equal(res.status, "determinate");
  close(res.values.P, 20);
  close(res.values.V, 20);
  close(res.values.A, 201.062, 1e-3);
  close(res.values.tau, 99.472, 1e-3);
});

test("double shear: P = 36 kN on d = 18 mm clevis pin gives V = 18 kN, τ = 70.74 MPa", () => {
  const res = solveShearStress({
    joint: { type: "clevis", planes: 2, pinDiameter: 18 },
    load: { P: 36 },
  });
  equal(res.status, "determinate");
  close(res.values.P, 36);
  close(res.values.V, 18);
  close(res.values.A, 254.469, 1e-3);
  close(res.values.tau, 70.735, 1e-3);
});

test("factor of safety: P = 42 kN in single shear, d = 26 mm, τ_allow = 85 MPa gives FS > 1.0", () => {
  const res = solveShearStress({
    joint: { type: "lap", planes: 1, pinDiameter: 26, allowableStress: 85 },
    load: { P: 42 },
  });
  // A = (π/4)(26)² = 530.93 mm² → τ = 42,000 / 530.93 = 79.11 MPa
  // FS = 85 / 79.11 = 1.074
  close(res.values.tau, 79.106, 1e-3);
  ok(res.values.FS > 1.0, "factor of safety exceeds 1.0");
  close(res.values.FS, 1.074, 1e-2);
  close(res.values.d_min, 25.08, 1e-2);
});

// ---- 3. Equations and summary ---------------------------------------------------------

test("equations: builds shear force, pin area, and shear stress", () => {
  const s = { joint: { type: "clevis", planes: 2, pinDiameter: 20 }, load: { P: 30 } };
  const eqs = shearStressEquations(s);
  equal(eqs.length, 3);
  equal(eqs[0].id, "shear-force");
  equal(eqs[1].id, "pin-area");
  equal(eqs[2].id, "shear-stress");
  ok(/\\tau/.test(eqs[2].lhs));
});

test("equations in Numbers: single shear, P = 42 kN, d = 26 mm go in; A = 530.9 and τ = 79.1 stay hidden until Test", () => {
  const s = { joint: { type: "lap", planes: 1, pinDiameter: 26 }, load: { P: 42 } };
  const tex = shearStressEquations(s).map((eq) => equationTex(eq, "numeric", { highlight: false, showResult: false })).join(" ");
  ok(tex.includes("(26\\,\\text{mm})^2") && tex.includes("42000\\,\\text{N}"), tex);
  ok(!/530|79\.1/.test(tex), "no answers before Test");
  const after = shearStressEquations(s).map((eq) => equationTex(eq, "numeric", { highlight: false })).join(" ");
  ok(after.includes("530.9") && after.includes("79.1"), after);
  // Double shear: V = P / 2 in symbols, 36 kN / 2 in numbers.
  const dbl = shearStressEquations({ joint: { planes: 2, pinDiameter: 20 }, load: { P: 36 } })[0];
  equal(equationTex(dbl, "symbolic", { highlight: false }), "V = \\dfrac{P}{2}");
  ok(equationTex(dbl, "numeric", { highlight: false }).endsWith("= 18.0\\,\\text{kN}"), "V = 18 kN after Test");
});

test("summary: nothing before Test (it would give A and τ away), the full working after", () => {
  const s = { joint: { type: "lap", planes: 1, pinDiameter: 26, allowableStress: 85 }, load: { P: 42 } };
  equal(shearStressSummary(s, null, { reveal: false }), []);
  const lines = shearStressSummary(s, null, { reveal: true });
  ok(lines.some((l) => l.startsWith("FS")), "factor of safety shown when τ_allow is given");
});

test("summary: shows V, A, and tau without invalid KaTeX", () => {
  const s = { joint: { type: "clevis", planes: 2, pinDiameter: 20 }, load: { P: 30 } };
  const lines = shearStressSummary(s, null, { reveal: true });
  ok(lines.length >= 3);
  lines.forEach((line) => {
    ok(!line.includes("\\text{\\text{"), "must not have nested \\text{\\text{}}");
    ok(!line.includes("\\text{mm^2}"), "must not have raw ^2 inside \\text{}");
  });
});

test("quantities: reports correct units for P, V, d, A, tau, FS", () => {
  const q = shearStressQuantities();
  equal(q.P.unit, "kN");
  equal(q.V.unit, "kN");
  equal(q.d.unit, "mm");
  equal(q.A.unit, "mm^2");
  equal(q.tau.unit, "MPa");
});

// ---- 4. Scene generation -------------------------------------------------------------

test("scene: generates single shear joint with plates, pin, leader, and divider", () => {
  const s = { joint: { type: "lap", planes: 1, pinDiameter: 20 }, load: { P: 30 } };
  const shapes = shearStressScene(s, null, { reveal: true });
  ok(shapes.some((sh) => sh.type === "box"), "has plates and pin boxes");
  ok(shapes.some((sh) => sh.type === "circle" && sh.hatched), "has hatched pin cross-section");
  ok(shapes.some((sh) => sh.type === "leader"), "has leader arrow for pin diameter");
  ok(shapes.some((sh) => sh.type === "arrow" && sh.id === "P"), "has load arrow P");
  ok(shapes.some((sh) => sh.type === "arrow" && sh.id === "V"), "has shear force arrow V");
  ok(shapes.some((sh) => sh.type === "divider"), "has divider separating panels");
});

test("scene: generates double shear clevis joint with 3 plates and reaction arrows", () => {
  const s = { joint: { type: "clevis", planes: 2, pinDiameter: 22 }, load: { P: 50 } };
  const shapes = shearStressScene(s, null, { reveal: true });
  ok(shapes.some((sh) => sh.type === "arrow" && sh.label && sh.label.includes("P/2")), "has reaction load arrows P/2");
  ok(shapes.some((sh) => sh.type === "line" && sh.style === "reference"), "has shear plane cut lines");
});

// ---- 5. Stage verification -----------------------------------------------------------

test("shear-stress stages: all 6 canonical stages load and solve properly", async () => {
  const s1 = (await import("../../content/materials/shear-stress/1-explore.js")).default;
  const s2 = (await import("../../content/materials/shear-stress/2-predict.js")).default;
  const s3 = (await import("../../content/materials/shear-stress/3-build.js")).default;
  const s4 = (await import("../../content/materials/shear-stress/4-debug.js")).default;
  const s5 = (await import("../../content/materials/shear-stress/5-concept-check.js")).default;
  const s6 = (await import("../../content/materials/shear-stress/6-solve.js")).default;

  ok(s1 && s1.challenge === "explore", "stage 1 is explore");
  ok(s2 && s2.challenge === "predict", "stage 2 is predict");
  ok(s3 && s3.challenge === "build", "stage 3 is build");
  ok(s4 && s4.challenge === "debug", "stage 4 is debug");
  ok(s5 && s5.challenge === "concept-check", "stage 5 is concept-check");
  ok(s6 && s6.challenge === "solve", "stage 6 is solve");

  // Check build goal check function
  const bRes = solveShearStress(s3.setup);
  const bCheckFail = s3.goal.check(bRes, s3.setup);
  ok(!bCheckFail.ok, "build default setup (d=22) fails allowable stress as intended");
  const safeSetup = { ...s3.setup, joint: { ...s3.setup.joint, pinDiameter: 26 } };
  const safeRes = solveShearStress(safeSetup);
  const bCheckPass = s3.goal.check(safeRes, safeSetup);
  ok(bCheckPass.ok, "build safe setup (d=26) passes allowable shear stress");
});
