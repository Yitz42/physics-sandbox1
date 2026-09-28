// Mechanics of Materials Chapter 1 — checks added in review: no picture shows an asked answer
// before Test, every asked capacity has explained slips, and a student's working never labels its
// own mistake. Numbers worked by hand in each test's name.
import { test, ok, equal, close, setFile } from "../harness.js";
import { allowableStressScene } from "../../src/subjects/materials/allowable-stress-scene.js";
import { bearingStressScene } from "../../src/subjects/materials/bearing-stress-scene.js";
import { shearStressScene } from "../../src/subjects/materials/shear-stress-scene.js";
import { allowableStressMistakes } from "../../src/subjects/materials/allowable-stress-tools.js";
import { allowableStressDebug } from "../../src/subjects/materials/allowable-stress-steps.js";
import { axialStressMistakes } from "../../src/subjects/materials/axial-stress-tools.js";
import { axialStressDebug } from "../../src/subjects/materials/axial-stress-steps.js";
import { solveAxialStress } from "../../src/subjects/materials/axial-stress.js";

setFile("materials / chapter 1 review");

const words = (shapes) => shapes.flatMap((s) => [s.label, s.text, ...(s.lines || [])]).filter((x) => typeof x === "string").join(" | ");
const connection = { rod: { diameter: 22, allowableStress: 120 }, joint: { planes: 2, pinDiameter: 18, plateThickness: 12, allowableShear: 75, allowableBearing: 180 }, load: { P: 35 } };

test("allowable stress picture: before Test no capacity shows (P_shear = 2(75)(254.5) = 38.2 kN); the allowable stresses always do", () => {
  const before = words(allowableStressScene(connection, null, { reveal: false }));
  ok(!/38\.2|45\.6|38\.9|Tension:|Allowable:/.test(before), before);
  ok(/75 MPa/.test(before) && /120 MPa/.test(before) && /180 MPa/.test(before), "allowables listed");
  ok(/38\.2/.test(words(allowableStressScene(connection, null, { reveal: true }))), "shown after Test");
});

test("bearing picture: A_b = 12 × 20 = 240 mm² only after Test", () => {
  const s = { joint: { plateThickness: 12, pinDiameter: 20 }, load: { P: 36 } };
  ok(!/240/.test(words(bearingStressScene(s, null, { reveal: false }))));
  ok(/240/.test(words(bearingStressScene(s, null, { reveal: true }))));
});

test("direct shear picture: V = 36/2 = 18 kN only after Test", () => {
  const s = { joint: { type: "clevis", planes: 2, pinDiameter: 18 }, load: { P: 36 } };
  ok(!/V = 18/.test(words(shearStressScene(s, null, { reveal: false }))));
  ok(/V = 18/.test(words(shearStressScene(s, null, { reveal: true }))));
});

test("capacity slips: P_tension with πd² = 120π(22²)/1000 = 182.5 kN; P_shear single shear = 19.1 kN; P_bearing with the rod's diameter = 180(12)(22)/1000 = 47.5 kN", () => {
  const val = (name) => allowableStressMistakes(connection, name).map((m) => Math.round(m.value * 10) / 10);
  ok(val("P_tension").includes(182.5), val("P_tension"));
  ok(val("P_shear").includes(19.1), val("P_shear"));
  ok(val("P_bearing").includes(47.5), val("P_bearing"));
});

test("allowable debug 'noKilo': only the rod's line is wrong; the minimum after it is still right", () => {
  const w = allowableStressDebug(connection, { slip: "noKilo" });
  equal(w.wrong, "tensile-capacity");
  equal(w.follows, []);
  equal(w.lines[1].tex, w.corrected[1]);
});

test("normal stress debug 'noKilo': the slipped line doesn't announce itself, and the explanation uses this load (40 kN = 40000 N)", () => {
  const w = axialStressDebug({ bar: { shape: "circle", diameter: 20 }, load: { P: 40 } }, { slip: "noKilo" });
  ok(!/forgot/i.test(w.lines.map((l) => l.tex).join(" ")));
  ok(/40000/.test(w.explain));
});

test("normal stress: σ 4× too big (the radius in (π/4)d²) is explained as that, not as r = 2d", () => {
  const s = { bar: { shape: "circle", diameter: 20 }, load: { P: 30 } };
  const right = solveAxialStress(s).values.sigma;
  const m = axialStressMistakes(s, "sigma").find((x) => Math.abs(x.value - 4 * right) < 1e-6);
  ok(m && /RADIUS/.test(m.message));
});

test("a hanging mass pulls: 100 kg gives P = +981 N (tension)", () => close(solveAxialStress({ bar: { diameter: 20 }, load: { mass: 100 } }).values.P_N, 981));
