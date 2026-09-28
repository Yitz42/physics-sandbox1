// axial-stress.test.js — tests for Mechanics of Materials Unit 1.1: Normal stress (σ = P / A).
import { equationTex } from "../../src/core/equations.js";
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveAxialStress, barArea, PI } from "../../src/subjects/materials/axial-stress.js";
import { axialStressEquations, axialStressSummary, axialStressQuantities, axialStressMistakes } from "../../src/subjects/materials/axial-stress-tools.js";
import { axialStressDebug } from "../../src/subjects/materials/axial-stress-steps.js";
import { axialStressScene } from "../../src/subjects/materials/axial-stress-scene.js";

setFile("materials / normal stress (Unit 1.1)");

// ---- 1. Area calculations -------------------------------------------------------------

test("cross-sectional area: circular rod of diameter 20 mm gives A = 314.16 mm²", () => {
  const A = barArea({ shape: "circle", diameter: 20 });
  close(A, (PI / 4) * 400, 1e-5);
});

test("cross-sectional area: rectangular bar 40 mm × 15 mm gives A = 600 mm²", () => {
  const A = barArea({ shape: "rectangle", width: 40, height: 15 });
  equal(A, 600);
});

test("cross-sectional area: hollow tube d_o = 50 mm, d_i = 40 mm gives A = 706.86 mm²", () => {
  const A = barArea({ shape: "tube", dOuter: 50, dInner: 40 });
  close(A, (PI / 4) * (2500 - 1600), 1e-5);
});

// ---- 2. Normal stress solving ---------------------------------------------------------

test("tensile load: P = 30 kN on d = 20 mm rod gives σ = 95.49 MPa (tension)", () => {
  const res = solveAxialStress({
    bar: { shape: "circle", diameter: 20 },
    load: { P: 30 },
  });
  equal(res.status, "determinate");
  close(res.values.P, 30);
  close(res.values.P_N, 30000);
  close(res.values.A, 314.159, 1e-4);
  close(res.values.sigma, 95.493, 1e-3);
  close(res.values.sigma_abs, 95.493, 1e-3);
});

test("compressive load: P = −72 kN on 40 mm × 12 mm strut gives σ = −150.0 MPa (compression)", () => {
  const res = solveAxialStress({
    bar: { shape: "rectangle", width: 40, height: 12 },
    load: { P: -72 },
  });
  close(res.values.P, -72);
  close(res.values.P_N, -72000);
  equal(res.values.A, 480);
  close(res.values.sigma, -150.0);
  close(res.values.sigma_abs, 150.0);
});

test("factor of safety: P = 48 kN, allowable stress = 120 MPa, d = 23 mm gives FS ≥ 1.0", () => {
  const res = solveAxialStress({
    bar: { shape: "circle", diameter: 23, allowableStress: 120 },
    load: { P: 48 },
  });
  // A = (π/4)(23)² = 415.48 mm² → σ = 48000 / 415.48 = 115.53 MPa
  // FS = 120 / 115.53 = 1.039
  close(res.values.sigma, 115.53, 1e-3);
  ok(res.values.FS > 1.0, "factor of safety exceeds 1.0");
  close(res.values.FS, 1.039, 1e-2);
});

test("hanging mass: m = 2000 kg hanging in tension creates P = 19.62 kN", () => {
  const res = solveAxialStress({
    bar: { shape: "circle", diameter: 16 },
    load: { mass: 2000, tension: true },
  });
  close(res.values.P_N, 2000 * 9.81);
  close(res.values.P, 19.62);
  close(res.values.sigma, 97.57, 1e-2);
});

// ---- 3. Equations and summary ---------------------------------------------------------

test("equations: builds area definition and stress definition", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 30 } };
  const eqs = axialStressEquations(s);
  equal(eqs.length, 2);
  equal(eqs[0].id, "area");
  equal(eqs[1].id, "stress");
  ok(/\\sigma/.test(eqs[1].lhs));
});

test("equations in Numbers: d = 18 mm and P = 48 000 N go in; A = 254.5 and σ = 188.6 stay hidden until Test", () => {
  const s = { bar: { shape: "circle", diameter: 18 }, load: { P: 48 } };
  const [area, stress] = axialStressEquations(s).map((eq) => equationTex(eq, "numeric", { highlight: false, showResult: false }));
  ok(area.includes("(18\\,\\text{mm})^2"), area);
  ok(stress.includes("48000\\,\\text{N}") && stress.includes("{A}"), stress);
  ok(!/254|188/.test(area + stress), "no answers before Test");
  // After Test the results show: A = (π/4)(18)² = 254.5 mm², σ = 48 000 / 254.5 = 188.6 MPa.
  const after = axialStressEquations(s).map((eq) => equationTex(eq, "numeric", { highlight: false })).join(" ");
  ok(after.includes("254.5") && after.includes("188.6"), after);
});

test("summary lines: shows area formula and stress calculation", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 30 } };
  const lines = axialStressSummary(s, null, { reveal: true });
  ok(lines.length >= 2);
  ok(/\\sigma = \\dfrac\{P\}\{A\}/.test(lines[1]));
});

test("quantities: reports correct units for P, A, sigma, and d", () => {
  const q = axialStressQuantities();
  equal(q.P.unit, "kN");
  equal(q.A.unit, "mm^2");
  equal(q.sigma.unit, "MPa");
  equal(q.d.unit, "mm");
});

// ---- 4. Mistakes diagnosis ------------------------------------------------------------

test("mistakes: spots forgetting to convert kN to N (giving answer 1000x too small)", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 30 } };
  const mistakes = axialStressMistakes(s, "sigma");
  ok(mistakes.some((m) => m.kind === "units"), "recognises units mistake");
});

test("mistakes: spots using A = π d² instead of π d² / 4", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 30 } };
  const mistakes = axialStressMistakes(s, "sigma");
  ok(mistakes.some((m) => m.kind === "algebra"), "recognises πd² algebra mistake");
});

test("mistakes: spots circumference π d used instead of area", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 30 } };
  const mistakes = axialStressMistakes(s, "A");
  ok(mistakes.some((m) => Math.abs(m.value - PI * 20) < 1e-4), "recognises perimeter slip");
});

// ---- 5. Debug steps -------------------------------------------------------------------

test("debug: spots diameterAsRadius slip in step 1", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 40 } };
  const dbg = axialStressDebug(s, { slip: "diameterAsRadius" });
  equal(dbg.wrong, "area");
  equal(dbg.lines.length, 4);
  ok(dbg.fixes.some((f) => f.correct && /\\frac\{\\pi\}\{4\}/.test(f.label)));
});

test("debug: spots noKilo slip in step 2", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 40 } };
  const dbg = axialStressDebug(s, { slip: "noKilo" });
  equal(dbg.wrong, "load");
  ok(dbg.fixes.some((f) => f.correct && /1000/.test(f.label)));
});

// ---- 6. Scene generation --------------------------------------------------------------

test("scene: generates fixed support, bar beam, dimension line, and load arrow", () => {
  const s = { bar: { shape: "circle", diameter: 25, length: 2.0 }, load: { P: 50 } };
  const shapes = axialStressScene(s, null, { reveal: true });
  const support = shapes.find((sh) => sh.type === "support");
  ok(support, "has fixed wall support");
  const barBody = shapes.find((sh) => (sh.type === "box" && !sh.hatched) || sh.type === "beam");
  ok(barBody, "has bar body in elevation matching cross-section height");
  ok(shapes.some((sh) => sh.type === "arrow" && sh.id === "P"), "has load arrow P");
  const dim = shapes.find((sh) => sh.type === "dim");
  ok(dim, "has length dimension line");
  ok(dim.label === "2 m", "dimension has label (not value)");
  ok(shapes.some((sh) => sh.type === "circle" && sh.hatched), "has side profile cross-section circle");
  ok(shapes.some((sh) => sh.type === "divider"), "has divider separating elevation and side profile");
  const note = shapes.find((sh) => sh.type === "note");
  ok(note, "has note with material and stress");
  note.lines.forEach((line) => {
    ok(!line.includes("$"), "note lines must not contain math delimiters ($) for canvas text");
    ok(!line.includes("\\text"), "note lines must not contain LaTeX macros (\\text) for canvas text");
    ok(!line.includes("\\varnothing"), "note lines must use unicode ⌀ instead of \\varnothing");
  });
});

test("scene: rectangular bar generates rectangular side profile box", () => {
  const s = { bar: { shape: "rectangle", width: 40, height: 12, length: 1.6 }, load: { P: -72 } };
  const shapes = axialStressScene(s, null, { reveal: true });
  ok(shapes.some((sh) => sh.type === "box" && sh.hatched), "has hatched box for rectangular side profile");
  ok(shapes.some((sh) => sh.type === "divider"), "has divider for rectangular setup");
});

test("scene: zero axial load does not render a directional load arrow", () => {
  const s = { bar: { shape: "circle", diameter: 25, length: 2.0 }, load: { P: 0 } };
  const shapes = axialStressScene(s, null, { reveal: true });
  ok(!shapes.some((sh) => sh.type === "arrow" && sh.id === "P"), "no directional force arrow when P = 0");
});

test("scene: generates 3D perspective view when viewMode is 3d", () => {
  const s = { bar: { shape: "circle", diameter: 25, length: 2.0 }, load: { P: 50 }, view3d: { yaw: 34, pitch: 20 } };
  const shapes = axialStressScene(s, null, { viewMode: "3d", reveal: true });
  ok(shapes.some((sh) => sh.type === "axes"), "has 3D coordinate axes");
  ok(shapes.some((sh) => sh.type === "polygon" && sh.hatched), "has 3D hatched wall / front cross-section");
  ok(shapes.some((sh) => sh.type === "arrow" && sh.id === "P"), "has 3D axial load arrow");
  ok(shapes.some((sh) => sh.type === "dim"), "has 3D length dimension line");
});

test("summary: does not contain nested \\text{\\text{}} or invalid KaTeX", () => {
  const s = { bar: { shape: "circle", diameter: 25 }, load: { P: 40 } };
  const lines = axialStressSummary(s);
  lines.forEach((line) => {
    ok(!line.includes("\\text{\\text{"), "summary must not have nested \\text{\\text{}}");
    ok(!line.includes("\\text{mm^2}"), "summary must not have raw ^2 inside \\text{}");
  });
});

// ---- 7. Stage verification -----------------------------------------------------------

test("normal-stress stages: all 6 canonical stages load and solve properly", async () => {
  const s1 = (await import("../../content/materials/normal-stress/1-explore.js")).default;
  const s2 = (await import("../../content/materials/normal-stress/2-predict.js")).default;
  const s3 = (await import("../../content/materials/normal-stress/3-build.js")).default;
  const s4 = (await import("../../content/materials/normal-stress/4-debug.js")).default;
  const s5 = (await import("../../content/materials/normal-stress/5-concept-check.js")).default;
  const s6 = (await import("../../content/materials/normal-stress/6-solve.js")).default;

  ok(s1 && s1.challenge === "explore", "stage 1 is explore");
  ok(s2 && s2.challenge === "predict", "stage 2 is predict");
  ok(s3 && s3.challenge === "build", "stage 3 is build");
  ok(s4 && s4.challenge === "debug", "stage 4 is debug");
  ok(s5 && s5.challenge === "concept-check", "stage 5 is concept-check");
  ok(s6 && s6.challenge === "solve", "stage 6 is solve");

  // Check build goal check function
  const bRes = solveAxialStress(s3.setup);
  const bCheckFail = s3.goal.check(bRes, s3.setup);
  ok(!bCheckFail.ok, "build default setup (d=18) fails allowable stress as intended");
  const safeSetup = { ...s3.setup, bar: { ...s3.setup.bar, diameter: 23 } };
  const safeRes = solveAxialStress(safeSetup);
  const bCheckPass = s3.goal.check(safeRes, safeSetup);
  ok(bCheckPass.ok, "build safe setup (d=23) passes allowable stress");
});
