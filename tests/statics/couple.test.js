// Couples (Unit 4), with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveCouple, coupleEquations } from "../../src/subjects/statics/couple.js";
import { coupleMistakes, coupleShadow, coupleDrag, phiOf } from "../../src/subjects/statics/couple-tools.js";
import { evaluate } from "../../src/core/equations.js";

setFile("statics / couples");

// 100 N up at B (0.5, 0) and 100 N down at A (0, 0): M = +100(0.5) = +50 N·m.
const bar = (P) => ({
  analysis: "couple",
  about: { at: P, label: "P" },
  couples: [{ id: "C", symbol: "F", magnitude: 100, direction: "up", at: [0.5, 0], opposite: [0, 0], pointLabels: ["B", "A"] }],
});

test("couple: 100 N forces 0.5 m apart → M = F·d = +50 N·m (counterclockwise)", () => {
  const r = solveCouple(bar([0.25, 0.3]));
  close(r.values.M_C, 50);
  close(r.values.d_C, 0.5);
  close(r.values.M, 50);
  close(r.values.R, 0, 1e-9); // a couple adds up to zero force
});

test("same moment about ANY point: P between, left of, on a line of action, far away", () => {
  // P = (0.25, 0.3): both forces turn CCW about P: 100(0.25) + 100(0.25) = 50
  // P = (−0.4, 0):   100(0.9) − 100(0.4) = 50
  // P = (0, 0.2):    on A's line, so only B counts: 100(0.5) = 50
  for (const P of [[0.25, 0.3], [-0.4, 0], [0, 0.2], [3, -7]]) close(solveCouple(bar(P)).values.M, 50, 1e-9, `P = ${P}:`);
  const r = solveCouple(bar([-0.4, 0]));
  close(r.values["M_C.a"], 90);
  close(r.values["M_C.b"], -40);
});

test("equations: M_P = ΣFd and M = Fd give the same number", () => {
  const s = bar([-0.4, 0.1]);
  const r = solveCouple(s);
  const [Mp, Mc] = r.equations;
  equal([Mp.id, Mc.id], ["Mp", "Mc"]);
  close(evaluate(Mp), 50);
  close(evaluate(Mc), 50);
});

// Debug stage bracket: 150 N right at A (0, 0.5), 150 N left at B (0.3, 0.1), P = (0.6, −0.1).
const bracket = {
  analysis: "couple",
  about: { at: [0.6, -0.1], label: "P" },
  forces: [
    { id: "F_A", symbol: "F_A", magnitude: 150, direction: "right", at: [0, 0.5], pointLabel: "A" },
    { id: "F_B", symbol: "F_B", magnitude: 150, direction: "left", at: [0.3, 0.1], pointLabel: "B" },
  ],
  couples: [{ id: "C", symbol: "F", forces: ["F_A", "F_B"] }],
};

test("couple from two named forces: M_P = −150(0.6) + 150(0.2) = −60 = −F·d with d = 0.4 m", () => {
  const r = solveCouple(bracket);
  close(r.values.M_F_A, -90);
  close(r.values.M_F_B, 30);
  close(r.values.M, -60);
  close(r.values.M_C, -60);
  close(r.values.d_C, 0.4); // vertical distance between the two horizontal lines
  close(r.values.r_C, 0.5); // straight distance A to B (a 3-4-5 triangle) — NOT the moment arm
});

test("replacement couple: 120 N at 0.5 m (60 N·m) → forces 0.3 m apart need 200 N", () => {
  const s = {
    analysis: "couple",
    couples: [
      { id: "C1", symbol: "F", magnitude: 120, direction: "up", at: [0.5, 0.15], opposite: [0, 0.15] },
      { id: "C2", symbol: "P", magnitude: null, equivalentTo: "C1", dSymbol: "d'", direction: "left", at: [1.15, 0.3], opposite: [1.15, 0] },
    ],
  };
  const r = solveCouple(s);
  close(r.values.C2, 200);
  close(r.values.M_C2, 60);
  close(r.values.M, 60, 1e-9, "the replacement is not added on top:");
  ok(!r.message, "same turning sense, so no warning");
  const m = coupleMistakes(s, "C2");
  ok(m.some((x) => Math.abs(x.value - 72) < 1e-6 && /upside down/.test(x.message)), "120(0.3)/0.5 = 72 N is the upside-down ratio");
  ok(m.some((x) => Math.abs(x.value - 60) < 1e-6 && /not the force/.test(x.message)), "60 is the moment, not the force");
  // Shadow: 150 N would only make 45 N·m.
  const sh = coupleShadow(s, r, { C2: 150 }, { k: 0.001, size: 1.2, center: [0, 0] });
  ok(sh.some((x) => x.type === "moment" && /45\.0 N·m/.test(x.label)), "shadow shows the moment their force makes");
});

test("replacement turning the wrong way is flagged", () => {
  const s = {
    analysis: "couple",
    couples: [
      { id: "C1", symbol: "F", magnitude: 120, direction: "up", at: [0.5, 0], opposite: [0, 0] },
      { id: "C2", symbol: "P", magnitude: null, equivalentTo: "C1", direction: "right", at: [0, 0.3], opposite: [0, 0] },
    ],
  };
  ok(/other way/.test(solveCouple(s).message));
});

// Solve stage plate: F_1 = 200 N couple (d = 0.4 m, clockwise), F_2 = 150 N at 60°
// between points 0.4 m apart (d = 0.4 sin 60° = 0.3464 m, counterclockwise), M_3 = 40 N·m clockwise.
const plate = {
  analysis: "couple",
  couples: [
    { id: "C1", symbol: "F_1", magnitude: 200, direction: "right", at: [0.2, 0.4], opposite: [0.2, 0] },
    { id: "C2", symbol: "F_2", magnitude: 150, direction: { angle: 60, from: "+x", toward: "+y" }, at: [0.8, 0], opposite: [0.4, 0] },
  ],
  moments: [{ id: "M3", symbol: "M_3", magnitude: 40, sense: -1, at: [0.6, 0.25] }],
};

test("resultant couple moment: M_R = −200(0.4) + 150(0.3464) − 40 = −68.04 N·m", () => {
  const r = solveCouple(plate);
  close(r.values.M_C1, -80);
  close(r.values.M_C2, 51.9615);
  close(r.values.d_C2, 0.34641);
  close(r.values.M, -68.0385);
  const [Mc] = coupleEquations(plate, r.values);
  equal(Mc.lhs, "M_R = \\Sigma M");
  close(Mc.result.value, -68.0385);
  close(phiOf(plate, plate.couples[1]), 60);
});

test("mistakes: distance between the points, sin/cos swap, a couple left out", () => {
  const m = coupleMistakes(plate, "M");
  const has = (v, re) => m.some((x) => Math.abs(x.value - v) < 0.01 && re.test(x.message));
  ok(has(-60, /perpendicular distance/), "0.4 m instead of 0.346 m → −60");
  ok(has(-90, /sin and cos/), "150(0.4)cos 60° = 30 → −90");
  ok(has(-120, /leave out/), "forgot F_2's couple: −68.04 − 51.96 = −120");
  ok(has(68.04, /wrong sign/), "right size, wrong sign");
});

test("net force: a true couple has ΣF = 0; two forces the same way don't", () => {
  const s = {
    analysis: "couple", netForce: true, about: { at: [0.2, 0.15], label: "O" },
    forces: [
      { id: "F_1", symbol: "F_1", magnitude: 150, direction: "down", at: [0, 0] },
      { id: "F_2", symbol: "F_2", magnitude: 150, direction: "up", at: [0.4, 0.3] },
    ],
  };
  const r = solveCouple(s);
  close(r.values.R, 0, 1e-9);
  close(r.values.M, 60); // 150 × 0.4
  equal(r.equations.map((e) => e.id), ["Mp", "Rx", "Ry"]);
  s.forces[0].direction = "up";
  close(solveCouple(s).values.R, 300);
});

test("dragging P snaps to 0.05 m and stays inside its bounds", () => {
  const s = bar([0, 0]);
  s.about.bounds = { xmin: -0.4, xmax: 1, ymin: -0.3, ymax: 0.4 };
  coupleDrag(s, "P", [0.337, 0.9]);
  equal(s.about.at, [0.35, 0.4]);
});

test("picture offsets use a fixed 'up' along the lines, so flipping a couple doesn't move its d", async () => {
  const { upAlong } = await import("../../src/subjects/statics/couple-geometry.js");
  equal(upAlong([0, -1]), [0, 1]); // a downward force: "up" is still up
  equal(upAlong([0, 1]), [0, 1]);
  equal(upAlong([-1, 0]), [1, 0]); // a horizontal line: "up" means right
  const u = [-Math.SQRT1_2, -Math.SQRT1_2];
  close(upAlong(u)[1], Math.SQRT1_2);
});
