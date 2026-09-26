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
  const { crateSetup } = await import("../../content/statics/02-particle-equilibrium/crate.js");
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
