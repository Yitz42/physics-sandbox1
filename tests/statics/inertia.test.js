// Area moments of inertia (Unit 10.1): Ī = bh³/12, the parallel-axis theorem I = Ī + A d²,
// composite sections. Lengths in mm, I in 10⁶ mm⁴. Answers worked by hand in each test's name.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveInertia, partsOf } from "../../src/subjects/statics/inertia.js";
import { inertiaEquations, inertiaMistakes, inertiaSteps } from "../../src/subjects/statics/inertia-tools.js";
import { evaluate } from "../../src/core/equations.js";

setFile("statics / moments of inertia");

const v = (section, extra = {}) => solveInertia({ section, ...extra }).values;

test("a 100 × 60 mm plank: Ī = 100(60)³/12 = 1.8 ×10⁶ mm⁴; Ī_y = 60(100)³/12 = 5.0 ×10⁶", () => {
  close(v({ kind: "plank", b: 100, h: 60, cy: 30 }).Ix6, 1.8);
  close(v({ kind: "plank", b: 100, h: 60, cy: 30 }).Iy6, 5.0);
});

test("stood on edge (50 × 120, same area): Ī = 50(120)³/12 = 7.2 ×10⁶ — 4 times as much", () => close(v({ kind: "plank", b: 50, h: 120, cy: 60 }).Ix6, 7.2));

test("parallel axis: that 100 × 60 plank 20 mm above the x axis: 1.8 + 6000(20)² = 4.2 ×10⁶", () => close(v({ kind: "plank", b: 100, h: 60, cy: 20 }, { axis: { y: 0 } }).Ia6, 4.2));

test("a 60 × 150 plank about its base: bh³/3 = 60(150)³/3 = 67.5 ×10⁶", () => close(v({ kind: "plank", b: 60, h: 150, y0: 0 }, { axis: { y: 0 } }).Ia6, 67.5));

test("I-beam, flanges 200 × 20, web 20 × 260: 29.293 + 2(0.1333 + 4000·140²) = 186.36 ×10⁶, ȳ = 150", () => {
  const r = v({ kind: "I", b: 200, tf: 20, hw: 260, tw: 20 });
  close(r.ybar, 150);
  close(r.Ix6, 186.36, 0.005);
});

test("T-beam, flange 150 × 20 on a web 20 × 180: ȳ = 894 000/6600 = 135.45 mm, Ī_x = 26.18 ×10⁶", () => {
  const r = v({ kind: "T", b: 150, tf: 20, hw: 180, tw: 20 });
  close(r.ybar, 135.4545, 1e-3);
  close(r.Ix6, 26.1836, 1e-3);
});

test("unequal I (250 × 20 bottom, 10 × 200 web, 150 × 20 top): ȳ = 98.0 mm, Ī_x = 98.89 ×10⁶", () => {
  const r = v({ kind: "I", b: 150, b2: 250, tf: 20, hw: 200, tw: 10 });
  close(r.ybar, 98);
  close(r.Ix6, 98.8933, 1e-3);
});

test("hollow box 120 × 120, walls 20: (120⁴ − 80⁴)/12 = 13.867 ×10⁶", () => close(v({ kind: "box", B: 120, H: 120, t: 20 }).Ix6, 13.8667, 1e-3));

test("a circle r = 50 mm: πr⁴/4 = 4.909 ×10⁶ mm⁴", () => close(solveInertia({ parts: [{ id: "1", shape: "circle", at: [0, 0], r: 50 }] }).values.Ix6, (Math.PI * 50 ** 4) / 4 / 1e6));

test("the Ī_x equation adds up to the answer; A and Aȳ give ȳ", () => {
  const s = { section: { kind: "T", b: 150, tf: 20, hw: 180, tw: 20 } };
  const [A, Q, I] = inertiaEquations(s);
  close(evaluate(A), 6600);
  close(evaluate(Q) / evaluate(A), 135.4545, 1e-3);
  close(evaluate(I), 26.1836, 1e-3);
  equal(partsOf(s).length, 2);
});

test("slips: no A d² (9.82), d from the bottom, bh³/3, b and h swapped", () => {
  const s = { section: { kind: "T", b: 150, tf: 20, hw: 180, tw: 20 } };
  const ms = inertiaMistakes(s, "Ix6");
  ok(ms.some((m) => Math.abs(m.value - 9.82) < 1e-6 && m.kind === "missing"), "Ī only: 9.72 + 0.1");
  ok(ms.some((m) => m.kind === "momentArm"));
  ok(ms.some((m) => m.kind === "centroid"));
  // b and h swapped in every rectangle: web 180(20)³/12 = 0.12, flange 20(150)³/12 = 5.625 → 0.12 + 7.438 + 5.625 + 8.926 = 22.109
  ok(ms.some((m) => Math.abs(m.value - 22.109) < 0.01), "b and h swapped");
});

test("a student's working: 'noTransfer' is wrong at the total; 'baseD' at the flange's line, and the total follows", () => {
  const s = { section: { kind: "T", b: 150, tf: 20, hw: 180, tw: 20 } };
  equal(inertiaSteps(s, { slip: "noTransfer" }).wrong, "total");
  const b = inertiaSteps(s, { slip: "baseD" });
  equal(b.wrong, "p2");
  ok(b.follows.includes("total"));
});
