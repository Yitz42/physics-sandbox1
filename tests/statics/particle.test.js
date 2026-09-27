// Textbook-style particle problems with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { directionVector, componentFactors, describe, fromVector, swapTrig, reverse } from "../../src/subjects/statics/directions.js";
import { solveParticle } from "../../src/subjects/statics/particle.js";
import { particleMistakes } from "../../src/subjects/statics/particle-mistakes.js";
import { particleMutate, particleDrag } from "../../src/subjects/statics/particle-tools.js";
import { particleScene } from "../../src/subjects/statics/particle-scene.js";
import { shadowShapes } from "../../src/subjects/statics/particle-shadow.js";
import { boundsOf } from "../../src/render/canvas.js";

setFile("statics / particle");

const force = (id, magnitude, direction, extra = {}) => ({ id, symbol: id, magnitude, direction, ...extra });

// --- Directions, textbook style ---
test("direction: 30° from +y toward −x points up-left", () => {
  const v = directionVector({ angle: 30, from: "+y", toward: "-x" });
  close(v[0], -0.5);
  close(v[1], 0.8660254);
});
test("direction: component factors use cos along the 'from' axis", () => {
  const c = componentFactors({ angle: 30, from: "+y", toward: "-x" });
  equal(c.y.sign, 1);
  equal(c.y.factor.tex, "\\cos 30^\\circ");
  equal(c.x.sign, -1);
  equal(c.x.factor.tex, "\\sin 30^\\circ");
});
test("direction: 3-4-5 slope gives 4/5 and 3/5", () => {
  const c = componentFactors({ slope: [-4, 3] });
  close(c.x.factor.value, 0.8);
  equal(c.x.sign, -1);
  close(c.y.factor.value, 0.6);
});
test("direction: plain-language descriptions", () => {
  equal(describe({ angle: 30, from: "-x", toward: "-y" }), "30° below the −x axis");
  equal(describe({ angle: 20, from: "+y", toward: "+x" }), "20° to the right of the +y axis");
});
test("direction: dragged vector → angle from nearest x-axis", () => {
  equal(fromVector([-1, 1]), { angle: 45, from: "-x", toward: "+y" });
  equal(fromVector([1.732, -1]), { angle: 30, from: "+x", toward: "-y" });
});
test("direction: reverse and sin/cos swap", () => {
  const d = { angle: 30, from: "+x", toward: "+y" };
  const r = directionVector(reverse(d));
  close(r[0], -0.8660254);
  const s = directionVector(swapTrig(d));
  close(s[0], 0.5);
});

// --- Unit 1: components and resultants ---
test("components: 400 N at 30° from +y toward −x → Fx = −200 N, Fy = 346 N", () => {
  const r = solveParticle({ analysis: "resultant", point: { at: [0, 0] }, forces: [force("F", 400, { angle: 30, from: "+y", toward: "-x" })] });
  close(r.values["F.x"], -200);
  close(r.values["F.y"], 346.410);
});
test("resultant of three forces (600 N @45°, 400 N on 3-4-5 slope, 200 N down)", () => {
  // Hand calc: FRx = 600cos45° − (4/5)400 = 424.26 − 320 = 104.26 N
  //            FRy = 600sin45° + (3/5)400 − 200 = 424.26 + 240 − 200 = 464.26 N
  //            FR = √(104.26² + 464.26²) = 475.8 N,  θ = tan⁻¹(464.26/104.26) = 77.34°
  const r = solveParticle({
    analysis: "resultant", point: { at: [0, 0] },
    forces: [force("F1", 600, { angle: 45, from: "+x", toward: "+y" }), force("F2", 400, { slope: [-4, 3] }), force("F3", 200, "down")],
  });
  equal(r.status, "resultant");
  close(r.values["R.x"], 104.264);
  close(r.values["R.y"], 464.264);
  close(r.values.R, 475.828);
  close(r.values["R.angle"], 77.3426);
});

// --- Unit 2: equilibrium ---
const crate = (angleAB, angleAC, mass) => ({
  analysis: "equilibrium", point: { at: [0, 0], label: "A" },
  forces: [
    { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "+y" } },
    { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: angleAC, from: "+x", toward: "+y" } },
    { id: "W", symbol: "W", kind: "weight", mass },
  ],
});
test("equilibrium: 50 kg crate on cables at 30° and 45°", () => {
  // ΣFx: −T_AB cos30° + T_AC cos45° = 0;  ΣFy: T_AB sin30° + T_AC sin45° − 490.5 = 0
  // → T_AB = 490.5/(sin30° + cos30°) = 359.1 N,  T_AC = 359.1·cos30°/cos45° = 439.8 N
  const r = solveParticle(crate(30, 45, 50));
  equal(r.status, "determinate");
  close(r.values.T_AB, 359.071);
  close(r.values.T_AC, 439.770);
  close(r.values.W, 490.5);
});
test("equilibrium: 20 kg lamp, cable AB on a 3-4-5 slope, AC at 45°", () => {
  // ΣFx: −(4/5)T_AB + T_AC cos45° = 0;  ΣFy: (3/5)T_AB + T_AC sin45° − 196.2 = 0
  // Adding: 1.4 T_AB = 196.2 → T_AB = 140.1 N, T_AC = 0.8(140.1)/cos45° = 158.6 N
  const s = crate(0, 45, 20);
  s.forces[0].direction = { slope: [-4, 3] };
  const r = solveParticle(s);
  close(r.values.T_AB, 140.143);
  close(r.values.T_AC, 158.554);
});
test("equilibrium: three unknown cables → statically indeterminate", () => {
  const s = crate(30, 45, 50);
  s.forces.push({ id: "T_AD", symbol: "T_{AD}", kind: "cable", magnitude: null, direction: "up" });
  equal(solveParticle(s).status, "indeterminate");
});
test("equilibrium: horizontal cables can't hold a weight → unstable", () => {
  const r = solveParticle(crate(0, 0, 10));
  equal(r.status, "unstable");
  ok(r.net[1] < 0, "the point should move down");
});
test("equilibrium: cable that would have to push → unstable (slack)", () => {
  const s = crate(30, 45, 50);
  s.forces[1].direction = { angle: 45, from: "+x", toward: "-y" }; // AC now points down-right
  const r = solveParticle(s);
  equal(r.status, "unstable");
  ok(/push/.test(r.message));
});
test("equilibrium: one vertical cable holds a hanging weight (T = W)", () => {
  const s = { analysis: "equilibrium", point: { at: [0, 0] }, forces: [
    { id: "T", symbol: "T", kind: "cable", magnitude: null, direction: "up" },
    { id: "W", symbol: "W", kind: "weight", mass: 10 },
  ] };
  const r = solveParticle(s);
  equal(r.status, "determinate");
  close(r.values.T, 98.1);
});
test("equilibrium: one slanted cable can't hold a weight → unstable", () => {
  const s = { analysis: "equilibrium", point: { at: [0, 0] }, forces: [
    { id: "T", symbol: "T", kind: "cable", magnitude: null, direction: { angle: 60, from: "+x", toward: "+y" } },
    { id: "W", symbol: "W", kind: "weight", mass: 10 },
  ] };
  equal(solveParticle(s).status, "unstable");
});

// --- Mistake detection ---
const has = (list, value, pattern) => list.some((m) => Math.abs(m.value - value) < 0.01 * Math.abs(value) && pattern.test(m.message));
test("mistakes: sin/cos swap on components is recognised", () => {
  const s = { analysis: "resultant", point: { at: [0, 0] }, forces: [force("F", 400, { angle: 30, from: "+y", toward: "-x" })] };
  // Swapped: Fx = −400 cos30° = −346.4 N
  ok(has(particleMistakes(s, "F.x"), -346.41, /sin and cos/), "sin/cos swap not found");
  ok(has(particleMistakes(s, "F.x"), 200, /sign/), "sign flip not found");
});
test("mistakes: mass used instead of weight", () => {
  // With W = 50 "N": T_AB = 50/1.366 = 36.60
  ok(has(particleMistakes(crate(30, 45, 50), "T_AB"), 36.603, /mass/));
});
test("mistakes: calculator in radians", () => {
  const s = { analysis: "resultant", point: { at: [0, 0] }, forces: [force("F", 400, { angle: 30, from: "+x", toward: "+y" })] };
  ok(has(particleMistakes(s, "F.x"), 400 * Math.cos(30), /radian/)); // cos(30 rad) = 0.1543
});

// --- Debug mutations and dragging ---
test("mutate: removing the weight leaves only the cables", () => {
  const s = particleMutate(crate(30, 45, 50), { kind: "remove", force: "W" });
  equal(s.forces.map((f) => f.id), ["T_AB", "T_AC"]);
});
test("drag: tip at (−1, 1) with 100 N per unit → 140 N at 45° above −x", () => {
  const s = { forceScale: 100, point: { at: [0, 0] }, forces: [force("F", 100, "right")] };
  particleDrag(s, "F", [-1, 1]);
  equal(s.forces[0].magnitude, 140);
  equal(s.forces[0].direction, { angle: 45, from: "-x", toward: "+y" });
});

// --- Picture layout ---
test("scene: FBD is drawn to the right of the space diagram and fits in view", () => {
  const shapes = particleScene(crate(30, 45, 50), null, {});
  const dots = shapes.filter((s) => s.type === "point" && s.style === "dot");
  equal(dots.length, 1);
  ok(Number.isFinite(dots[0].at[0]) && dots[0].at[0] > 2, "FBD point should sit right of the cables");
  const b = boundsOf(shapes);
  ok(b.xmax > dots[0].at[0] && b.xmin < -1, `view ${JSON.stringify(b)} should include both drawings`);
});

// --- Shadow of a wrong answer ---
test("shadow: guessed components draw 'your F' pointing where the guess points", () => {
  const s = { analysis: "components", point: { at: [0, 0] }, forces: [force("F", 400, { angle: 30, from: "+y", toward: "-x" })] };
  const shapes = shadowShapes(s, solveParticle(s), [0, 0], { "F.x": -346.4, "F.y": 200 }, 1 / 400);
  const main = shapes.find((x) => x.id === "shadow-F");
  ok(main.to[0] < 0 && main.to[1] > 0, "should point up-left");
  ok(/400 N/.test(main.label), main.label);
});
test("shadow: tensions that are too small leave ΣF pointing down (the crate would fall)", () => {
  const s = crate(30, 45, 60); // real answer: 430.9 N and 527.7 N
  const shapes = shadowShapes(s, solveParticle(s), [0, 0], { T_AB: 300, T_AC: 300 }, 1 / 600);
  const net = shapes.find((x) => x.id === "shadow-net");
  ok(net, "expected an unbalanced-force arrow");
  ok(net.to[1] < net.from[1], "net force should point down");
  const exact = shadowShapes(s, solveParticle(s), [0, 0], { T_AB: 430.88, T_AC: 527.73 }, 1 / 600);
  ok(!exact.some((x) => x.id === "shadow-net"), "correct tensions should balance");
});

test("picture: space diagram and FBD are centred in their halves of the canvas, with the divider in the middle", async () => {
  const { particleScene } = await import("../../src/subjects/statics/particle-scene.js");
  const { crateSetup } = await import("../../content/statics/shared/crate.js");
  for (const size of [{ width: 750, height: 440 }, { width: 1140, height: 440 }, { width: 520, height: 340 }]) {
    const shapes = particleScene(crateSetup({ angleAB: 30, angleAC: 45, mass: 60 }), null, { canvasSize: size });
    // Fit the view the way the game does: to the divider's frame, inside canvas.js's 36 px border.
    const div = shapes.find((s) => s.type === "divider");
    const b = div.frame;
    const scale = Math.min((size.width - 72) / (b.xmax - b.xmin), (size.height - 72) / (b.ymax - b.ymin));
    const px = (x) => size.width / 2 + (x - (b.xmin + b.xmax) / 2) * scale;
    const ring = shapes.find((s) => s.type === "point" && s.style === "ring"); // A in the space diagram
    const dot = shapes.filter((s) => s.type === "point").pop(); // A in the FBD
    const xs = shapes.filter((s) => s.type !== "divider").flatMap((s) => [s.at, s.from, s.to].filter(Boolean)).map((p) => p[0]).filter((x) => x < div.x);
    close(px(div.x), size.width / 2, 0.01, `${size.width} px: divider`);
    close(px((Math.min(...xs) + Math.max(...xs)) / 2), size.width / 4, 0.01, `${size.width} px: space diagram centre`);
    close(px(dot.at[0]), (3 * size.width) / 4, 0.01, `${size.width} px: FBD point`);
    ok(px(ring.at[0]) > 0 && px(ring.at[0]) < size.width / 2, "ring A is in the left half");
  }
});

// ---- Cartesian vectors and forces along a line (Unit 1) ------------------------

test("unit vector: 300 N at 30° above +x → u = 0.866 i + 0.5 j; F = {259.8 i + 150 j} N", () => {
  const r = solveParticle({ analysis: "components", forces: [{ id: "F", symbol: "F", magnitude: 300, direction: { angle: 30, from: "+x", toward: "+y" } }] });
  close(r.values["F.ux"], 0.86603);
  close(r.values["F.uy"], 0.5);
  close(r.values["F.x"], 259.808);
  close(r.values["F.y"], 150);
});

test("force along a line: A(1, 2) → B(−2, 6), 250 N → r_AB = {−3 i + 4 j} m, r = 5 m, u = −0.6 i + 0.8 j, F = {−150 i + 200 j} N", () => {
  const f = { id: "F", symbol: "F", magnitude: 250, kind: "cable", direction: { points: [[1, 2], [-2, 6]], names: ["A", "B"] } };
  const r = solveParticle({ analysis: "components", point: { at: [1, 2], label: "A" }, forces: [f] });
  close(r.values["F.rx"], -3);
  close(r.values["F.ry"], 4);
  close(r.values["F.r"], 5);
  close(r.values["F.ux"], -0.6);
  close(r.values["F.uy"], 0.8);
  close(r.values["F.x"], -150);
  close(r.values["F.y"], 200);
  equal(describe(f.direction), "along the line from A to B");
  equal(reverse(f.direction).points, [[-2, 6], [1, 2]]);
});

test("force along a line: equation factors are the fractions (x_B − x_A)/r and (y_B − y_A)/r, with signs", () => {
  const c = componentFactors({ points: [[1, 2], [-2, 6]] });
  equal([c.x.sign, c.y.sign], [-1, 1]);
  close(c.x.factor.value, 0.6);
  close(c.y.factor.value, 0.8);
});

test("force along a line: mistakes caught — B's coordinates alone, B→A, not dividing by r", () => {
  const setup = { analysis: "components", point: { at: [1, 2], label: "A" }, forces: [{ id: "F", symbol: "F", magnitude: 250, kind: "cable", direction: { points: [[1, 2], [-2, 6]] } }] };
  const has = (name, value, re) => ok(particleMistakes(setup, name).some((m) => Math.abs(m.value - value) < 0.05 && re.test(m.message)), `${name} = ${value} should be explained (${re})`);
  // Used B = (−2, 6) alone: u = (−2, 6)/√40 → u_x = −0.316, F_x = −79.1 N
  has("F.ux", -0.3162, /subtract/);
  has("F.x", -79.06, /subtract/);
  has("F.x", 150, /order|sign/);         // B→A reverses it
  has("F.ux", -3, /Divide/);             // forgot to divide by r = 5
  has("F.x", -750, /divide/);            // 250 × (−3)
  has("F.r", Math.hypot(2, 6), /subtract/);
});

test("force along a line: a cable to B ends exactly at B in the space diagram, with coordinates labelled", () => {
  const setup = { analysis: "resultant", point: { at: [1, 2], label: "A" }, forces: [{ id: "T", symbol: "T", magnitude: 100, kind: "cable", direction: { points: [[1, 2], [4, 6]], names: ["A", "B"] } }] };
  const shapes = particleScene(setup, solveParticle(setup), {});
  ok(shapes.some((s) => s.type === "point" && s.label === "B (4, 6)"), "B should be labelled with its coordinates");
  ok(shapes.some((s) => s.type === "point" && s.label === "A (1, 2)"), "A should be labelled with its coordinates");
  ok(shapes.some((s) => s.type === "point" && s.label === "O (0, 0)"), "the origin should be shown");
});

// ---- Springs and pulleys (Unit 2) ---------------------------------------------

// Ring A: cable AB up-left at 30°, spring AC horizontal to the right (k = 800 N/m,
// unstretched 0.5 m), crate 20 kg. ΣFy: T sin30° = 196.2 → T = 392.4 N;
// ΣFx: −392.4 cos30° + F_AC = 0 → F_AC = 339.83 N; s = 339.83/800 = 0.4248 m; l = 0.9248 m.
const springSetup = () => ({
  analysis: "equilibrium",
  point: { at: [0, 0], label: "A" },
  forces: [
    { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: 30, from: "-x", toward: "+y" }, anchor: { label: "B" } },
    { id: "F_AC", symbol: "F_{AC}", kind: "spring", k: 800, unstretched: 0.5, magnitude: null, direction: "right", anchor: { label: "C", length: 1.5 } },
    { id: "W", symbol: "W", kind: "weight", mass: 20 },
  ],
});

test("spring: F_AC = 339.8 N, so it stretches s = F/k = 0.425 m to l = 0.925 m", () => {
  const r = solveParticle(springSetup());
  equal(r.status, "determinate");
  close(r.values.T_AB, 392.4);
  close(r.values.F_AC, 339.829, 1e-3);
  close(r.values["F_AC.s"], 0.424786, 1e-5);
  close(r.values["F_AC.l"], 0.924786, 1e-5);
});

test("spring: a known stretch makes a known force (F = k s)", () => {
  const s = springSetup();
  s.forces[1] = { ...s.forces[1], magnitude: undefined, stretch: 0.25 }; // 800 × 0.25 = 200 N
  s.forces[2] = { id: "P", symbol: "P", magnitude: null, direction: "down" }; // what load does that hold?
  const r = solveParticle(s);
  close(r.values.F_AC, 200);
  // ΣFx: −T cos30° + 200 = 0 → T = 230.94 N; ΣFy: T sin30° − P = 0 → P = 115.47 N
  close(r.values.P, 115.470, 1e-3);
});

test("spring mistakes: multiplying by k, F/k upside down, and giving s when l was asked", () => {
  const setup = springSetup();
  const has = (name, value, re) => ok(particleMistakes(setup, name).some((m) => Math.abs(m.value - value) < 1e-3 * Math.max(1, Math.abs(value)) && re.test(m.message)), `${name} = ${value} should be explained`);
  has("F_AC.s", 339.829 * 800, /Divide/);
  has("F_AC.s", 800 / 339.829, /Upside/);
  has("F_AC.l", 0.424786, /only the stretch/);
  has("F_AC.s", 0.924786, /stretched length/);
});

// Pulley A rides on cable BAC (same tension T both sides): AB up-left at 60°,
// AC up-right at 30°; a rope AD pulls A to the left; crate 30 kg (W = 294.3 N).
// ΣFy: T sin60° + T sin30° = 294.3 → T = 215.44 N
// ΣFx: −T cos60° + T cos30° − T_AD = 0 → T_AD = 215.44(0.8660 − 0.5) = 78.86 N
const pulleySetup = () => ({
  analysis: "equilibrium",
  point: { at: [0, 0], label: "A", object: "pulley" },
  forces: [
    { id: "T_AB", symbol: "T", shared: "T", kind: "cable", magnitude: null, direction: { angle: 60, from: "-x", toward: "+y" }, anchor: { label: "B" } },
    { id: "T_AC", symbol: "T", shared: "T", kind: "cable", magnitude: null, direction: { angle: 30, from: "+x", toward: "+y" }, anchor: { label: "C" } },
    { id: "T_AD", symbol: "T_{AD}", kind: "cable", magnitude: null, direction: "left", anchor: { label: "D", length: 1.5 } },
    { id: "W", symbol: "W", kind: "weight", mass: 30 },
  ],
});

test("pulley: both sides of the cable are ONE unknown T = 215.4 N; the rope pulls 78.9 N", () => {
  const r = solveParticle(pulleySetup());
  equal(r.status, "determinate");
  equal(r.unknowns, ["T", "T_AD"]);
  close(r.values.T, 215.436, 1e-3);
  close(r.values.T_AB, 215.436, 1e-3);
  close(r.values.T_AC, 215.436, 1e-3);
  close(r.values.T_AD, 78.857, 1e-3);
});

test("pulley: leaving out one side of the cable is explained", () => {
  // Only T sin30° holds the crate: T = 588.6 N.
  ok(particleMistakes(pulleySetup(), "T").some((m) => Math.abs(m.value - 588.6) < 0.1 && /TWICE/.test(m.message)));
});

test("spring and pulley: drawn as a zig-zag spring and a pulley wheel", () => {
  const sp = particleScene(springSetup(), solveParticle(springSetup()), {});
  ok(sp.some((s) => s.type === "spring" && s.id === "F_AC"), "spring shape");
  ok(sp.some((s) => s.type === "text" && /k = 800 N\/m, l₀ = 0.5 m/.test(s.text)), "stiffness written under the picture");
  const pu = particleScene(pulleySetup(), solveParticle(pulleySetup()), {});
  ok(pu.some((s) => s.type === "pulley"), "pulley wheel");
});
