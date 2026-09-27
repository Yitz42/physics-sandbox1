// Forces in 3D (Unit 2.3): components from direction angles, from an azimuth and
// elevation, and along a line between two points; size, direction angles, resultants.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveForce3d } from "../../src/subjects/statics/force3d.js";
import { force3dEquations, force3dSteps, force3dChoices, force3dMistakes } from "../../src/subjects/statics/force3d-tools.js";
import { projector } from "../../src/render/projection.js";

setFile("statics / forces in 3D");

test("F = 500 N at α = 60°, β = 45°, γ = 120°: F = {250 i + 353.6 j − 250 k} N", () => {
  const v = solveForce3d({ forces: [{ id: "F", symbol: "F", magnitude: 500, dir: { angles: [60, 45, 120] } }] }).values;
  close(v["F.x"], 250);
  close(v["F.y"], 353.553);
  close(v["F.z"], -250);
});

test("γ from α and β: cos²60° + cos²60° + cos²γ = 1 → cos γ = ±0.7071, γ = 45° (up) or 135° (down)", () => {
  const up = solveForce3d({ forces: [{ id: "F", symbol: "F", magnitude: 200, dir: { angles: [60, 60, null], gamma: "acute" } }] }).values;
  close(up["F.gamma"], 45);
  close(up["F.z"], 141.421);
  const down = solveForce3d({ forces: [{ id: "F", symbol: "F", magnitude: 200, dir: { angles: [60, 60, null], gamma: "obtuse" } }] }).values;
  close(down["F.gamma"], 135);
});

test("angles that don't make a direction are refused: α = β = 30° (cos² sum 1.5 > 1)", () => {
  const r = solveForce3d({ forces: [{ id: "F", symbol: "F", magnitude: 100, dir: { angles: [30, 30, null] } }] });
  equal(r.status, "unstable");
});

test("azimuth 30°, elevation 40°, F = 600 N: F_z = 600 sin 40° = 385.7 N; F′ = 459.6 N → F_x = 398.0 N, F_y = 229.8 N", () => {
  const v = solveForce3d({ forces: [{ id: "F", symbol: "F", magnitude: 600, dir: { azimuth: 30, elevation: 40 } }] }).values;
  close(v["F.z"], 385.673);
  close(v["F.x"], 398.048);
  close(v["F.y"], 229.813);
});

// A cable from A (0, 0, 6) to B (2, −3, 0): r_AB = {2 i − 3 j − 6 k} m, r = 7 m; T = 700 N → {200 i − 300 j − 600 k} N.
const cable = { points: { A: [0, 0, 6], B: [2, -3, 0] }, forces: [{ id: "T", symbol: "T", magnitude: 700, dir: { from: "A", to: "B" } }] };

test("a force along a line: r_AB = {2 i − 3 j − 6 k} m, r_AB = 7 m, T = 700 u_AB = {200 i − 300 j − 600 k} N", () => {
  const v = solveForce3d(cable).values;
  close(v["T.r"], 7);
  close(v["T.x"], 200);
  close(v["T.y"], -300);
  close(v["T.z"], -600);
  close(v["T.alpha"], 73.398, 1e-4); // cos⁻¹(2/7)
});

test("the size and angles of F = {3 i + 4 j + 12 k} N: F = 13 N, α = 76.7°, β = 72.1°, γ = 22.6°", () => {
  const v = solveForce3d({ forces: [{ id: "F", symbol: "F", dir: { components: [3, 4, 12] } }] }).values;
  close(v.F, 13);
  close(v["F.alpha"], 76.658, 1e-4);
  close(v["F.gamma"], 22.620, 1e-4);
});

test("a resultant of two cables from A (0, 0, 6): to B (2, −3, 0) 700 N and to C (−3, 0, −4)… F_R adds the components", () => {
  const s = { ...cable, points: { ...cable.points, C: [-4.5, 0, 0] }, forces: [...cable.forces, { id: "P", symbol: "P", magnitude: 750, dir: { from: "A", to: "C" } }], resultant: true };
  // r_AC = {−4.5 i − 6 k}, r = 7.5 → P = {−450 i − 600 k} N.  F_R = {−250 i − 300 j − 1200 k} N, F_R = 1262.0 N.
  const v = solveForce3d(s).values;
  close(v["R.x"], -250);
  close(v["R.z"], -1200);
  close(v.R, Math.hypot(250, 300, 1200));
  const eqs = force3dEquations(s);
  ok(eqs.some((e) => e.id === "R.z"), "a ΣF_z line");
  ok(force3dChoices(s).every((g) => g.options.filter((o) => o.correct).length === 1), "one right line per group");
});

test("a student's cable working: each slip spoils its own line, and later lines follow", () => {
  for (const [slip, line] of [["backwards", "r"], ["sign", "r"], ["noRoot", "len"], ["noUnit", "F"]]) {
    const w = force3dSteps(cable, { slip });
    equal(w.wrong, line, `${slip}:`);
    equal(w.corrected.length, 4);
  }
  ok(force3dSteps(cable, { slip: "noRoot" }).follows.includes("F"), "F follows the wrong length");
});

test("slips give their own answers: not dividing by r gives T times the difference", () => {
  const xs = force3dMistakes(cable, "T.x").map((m) => m.value);
  ok(xs.includes(1400), "700 × 2");
});

test("the textbook view: x comes toward the viewer down-left, y goes right, z straight up", () => {
  const P = projector();
  const [x, y, z] = [P.at([1, 0, 0]), P.at([0, 1, 0]), P.at([0, 0, 1])];
  ok(x[0] < 0 && x[1] < 0, "x down-left");
  ok(y[0] > 0.8, "y to the right");
  close(z[0], 0, 1e-9);
  ok(z[1] > 0.9, "z up");
});

test("Guy-wire build: the start fails, and every version (T 1200–1800 N, h 5–7 m) has an anchor on the 0.5 m grid that works", async () => {
  const st = (await import("../../content/statics/forces-3d/3-build.js")).default;
  const at = (T, h, x, y) => {
    const s = JSON.parse(JSON.stringify(st.setup));
    s.forces[0].magnitude = T;
    s.points.A[2] = h;
    s.points.B = [x, y, 0];
    return st.goal.check(solveForce3d(s), s).ok;
  };
  ok(!st.goal.check(solveForce3d(st.setup), st.setup).ok, "the start already works");
  ok(at(1500, 6, 0, -3) && at(1500, 6, 0, -3.5), "hand-worked anchors (0, −3) and (0, −3.5)");
  for (let T = 1200; T <= 1800; T += 50) {
    for (const h of [5, 5.5, 6, 6.5, 7]) {
      let found = false;
      for (let y = -6; y <= 6 && !found; y += 0.5) found = at(T, h, 0, y);
      ok(found, `no working anchor for T = ${T}, h = ${h}`);
    }
  }
});
