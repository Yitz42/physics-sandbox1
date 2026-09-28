// Forces in 3D (Unit 2.3): components from direction angles, from an azimuth and
// elevation, and along a line between two points; size, direction angles, resultants.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveForce3d } from "../../src/subjects/statics/force3d.js";
import { force3dEquations, force3dSteps, force3dMistakes } from "../../src/subjects/statics/force3d-tools.js";
import { force3dChoices } from "../../src/subjects/statics/force3d-choices.js";
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

test("three ways in space (Unit 2.4): α 60°, β 135° 400 N + θ 150°, φ 30° 500 N + 700 N to B → F_R = {25.0 i − 366.3 j − 150.0 k} N, 396.6 N", () => {
  const s = {
    points: { O: [0, 0, 0], A: [0, 0, 6], B: [2, -3, 0] },
    forces: [
      { id: "F_1", symbol: "F_1", magnitude: 400, at: "A", dir: { angles: [60, 135, null], gamma: "acute" } },
      { id: "F_2", symbol: "F_2", magnitude: 500, at: "A", dir: { azimuth: 150, elevation: 30 } },
      { id: "T_AB", symbol: "T_{AB}", magnitude: 700, dir: { from: "A", to: "B" } },
    ],
    resultant: true,
  };
  // F_1 = {200 i − 282.8 j + 200 k}; F_2: F' = 500 cos 30° = 433.0 → {−375.0 i + 216.5 j + 250 k};
  // T_AB = {200 i − 300 j − 600 k}.
  const v = solveForce3d(s).values;
  close(v["R.x"], 25, 1e-9);
  close(v["R.y"], -200 * Math.SQRT2 + 250 * Math.sqrt(3) / 2 - 300, 1e-9);
  close(v["R.z"], -150, 1e-9);
  close(v.R, 396.645, 1e-5);
  close(v["R.alpha"], 86.386, 1e-4);
  close(v["R.beta"], 157.456, 1e-4);
  close(v["R.gamma"], 112.220, 1e-4);
  // Solve lines: one group per angled force, two for the wire, one for F_R; one right line in each.
  const g = force3dChoices(s);
  equal(g.length, 5);
  ok(g.every((x) => x.options.filter((o) => o.correct).length === 1), "one right line per group");
  ok(g.every((x) => x.options.every((o) => o.correct || o.kind)), "every wrong line names its mistake");
  ok(/azimuth/.test(g[1].title), "F_2's group says how it's given");
});

// --- Unit 3.4: a particle in equilibrium in 3D (force3d-balance.js; hand checks as in
// content/statics/library/particles3d.js) ---
const room = (D = [2, 3, 9], mass = 50) => ({
  analysis: "equilibrium",
  points: { A: [0, 0, 3], B: [-3, -2, 9], C: [2, -3, 9], D },
  forces: [
    { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, dir: { from: "A", to: "B" } },
    { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, dir: { from: "A", to: "C" } },
    { id: "T_AD", symbol: "T_{AD}", kind: "cable", magnitude: null, dir: { from: "A", to: "D" } },
    { id: "W", symbol: "W", kind: "weight", mass, at: "A" },
  ],
});

test("3D equilibrium: 50 kg crate on cables 7 m to B (−3, −2, 9), C (2, −3, 9), D (2, 3, 9) from A (0, 0, 3) → 228.9, 95.4, 248.0 N", () => {
  // ΣFx: −3T_AB + 2T_AC + 2T_AD = 0; ΣFy: −2T_AB − 3T_AC + 3T_AD = 0 → T_AD = 2.6T_AC, T_AB = 2.4T_AC;
  // ΣFz: (6/7)(6T_AC) = 490.5 → T_AC = 95.375 N.
  const r = solveForce3d(room());
  equal(r.status, "determinate");
  close(r.values.T_AC, 95.375, 1e-6);
  close(r.values.T_AB, 228.9, 1e-6);
  close(r.values.T_AD, 247.975, 1e-6);
  close(r.values.W, 490.5, 1e-9);
  const eqs = force3dEquations(room());
  equal(eqs.map((e) => e.id), ["sumFx", "sumFy", "sumFz"]);
  ok(!eqs[0].terms.some((t) => t.id === "W") && eqs[2].terms.some((t) => t.id === "W" && t.sign === -1), "W only in ΣFz, negative");
});

test("3D equilibrium: D straight above A holds it all; D outside the triangle makes a cable push; a 4th unknown is indeterminate", () => {
  const above = solveForce3d(room([0, 0, 9]));
  close(above.values.T_AD, 490.5, 1e-9);
  close(above.values.T_AB, 0, 1e-9);
  const outside = solveForce3d(room([-2, -3, 9]));
  equal(outside.status, "unstable");
  ok(/PUSH/.test(outside.message), outside.message);
  const four = room();
  four.points.E = [0, 5, 9];
  four.forces.push({ id: "T_AE", symbol: "T_{AE}", kind: "cable", magnitude: null, dir: { from: "A", to: "E" } });
  equal(solveForce3d(four).status, "indeterminate");
  // All three anchors level with A: nothing holds the crate up.
  const flat = room();
  for (const p of ["B", "C", "D"]) flat.points[p] = [flat.points[p][0], flat.points[p][1], 3];
  equal(solveForce3d(flat).status, "unstable");
});

test("3D equilibrium: a spring AD (k = 800 N/m) stretches 248.0 / 800 = 0.310 m; a known pull P changes the tensions", () => {
  const s = room();
  s.forces[2] = { id: "F_AD", symbol: "F_{AD}", kind: "spring", k: 800, magnitude: null, dir: { from: "A", to: "D" } };
  const v = solveForce3d(s).values;
  close(v.F_AD, 247.975, 1e-6);
  close(v["F_AD.s"], 0.30997, 1e-4);
  // P = 150 N, θ = 120°, φ = 10°: {−73.86 i + 127.93 j + 26.05 k} N → 113.34, 325.73, 102.79 N.
  const p = room();
  p.forces.push({ id: "P", symbol: "P", magnitude: 150, at: "A", dir: { azimuth: 120, elevation: 10 } });
  const w = solveForce3d(p).values;
  close(w.T_AB, 113.34, 1e-4);
  close(w.T_AC, 325.73, 1e-4);
  close(w.T_AD, 102.79, 1e-4);
});

test("3D equilibrium: hall lamp, A (1, 1, 3), 60 kg → 114.4, 274.7, 297.6 N; slips are explained", () => {
  const s = {
    analysis: "equilibrium",
    points: { A: [1, 1, 3], B: [-1, -2, 9], C: [4, -1, 9], D: [-1, 4, 9] },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, dir: { from: "A", to: "B" } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, dir: { from: "A", to: "C" } },
      { id: "T_AD", symbol: "T_{AD}", kind: "cable", magnitude: null, dir: { from: "A", to: "D" } },
      { id: "W", symbol: "W", kind: "weight", mass: 60, at: "A" },
    ],
  };
  const v = solveForce3d(s).values;
  close(v.T_AB, 114.45, 1e-4);
  close(v.T_AC, 274.68, 1e-4);
  close(v.T_AD, 297.57, 1e-4);
  const m = force3dMistakes(s, "T_AB");
  ok(m.some((x) => x.kind === "weight" && Math.abs(x.value - 114.45 / 9.81) < 0.01), "mass used as the weight");
  ok(m.some((x) => x.kind === "vector" && Math.abs(x.value - 114.45 / 7) < 0.01), "forgot to divide by r = 7 m");
  ok(m.every((x) => x.kind), "every slip names its kind");
});
