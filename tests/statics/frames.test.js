// Frames (Unit 5.4): each body's three equations, equal and opposite pin forces,
// two-force links. The A-frame of content/statics/library/frames.js (hand checks there):
//   load P at the top, crossbar at h: B_y = P/2, F_DE = P/(4 − h), C_x = −F_DE, C_y = P/2
//   load P on leg AC at (1.5, 3), h = 2: B_y = F_DE = 0.375P, C_x = −0.375P, C_y = 0.375P
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveFrame, forcesOn, linkEnds, frameMistakes } from "../../src/subjects/statics/frame.js";
import { aFrame } from "../../content/statics/library/frames.js";

setFile("statics / frames and machines");

test("A-frame, P = 1000 N at the top, crossbar halfway: B_y = 500, F_DE = +500 (tension), C_x = −500, C_y = +500 N", () => {
  const r = solveFrame(aFrame({ P: 1000 }));
  equal(r.status, "determinate");
  equal([r.values.n, r.values.eqs], [6, 6]);
  close(r.values.B_y, 500);
  close(r.values.A_y, 500);
  close(r.values.A_x, 0, 1e-3);
  close(r.values.F_DE, 500);
  close(r.values.C_x, -500);
  close(r.values.C_y, 500);
});

test("the crossbar pulls harder as it's raised: F_DE = P/(4 − h)", () => {
  for (const h of [1, 2, 3]) close(solveFrame(aFrame({ P: 1200, h })).values.F_DE, 1200 / (4 - h), 1e-6, `h = ${h}:`);
  equal(linkEnds(aFrame({ h: 3 }), aFrame({ h: 3 }).links[0]), { D: [1.5, 3], E: [2.5, 3] });
});

test("A-frame, P = 800 N hanging from leg AC at (1.5, 3): B_y = F_DE = 300 N, C_x = −300, C_y = +300 N", () => {
  const v = solveFrame(aFrame({ load: "leg", P: 800 })).values;
  close(v.B_y, 300);
  close(v.F_DE, 300);
  close(v.C_x, -300);
  close(v.C_y, 300);
  close(v.A_y, 500);
});

test("the pin at C pushes equally and oppositely on the two legs", () => {
  const s = aFrame();
  const onAC = forcesOn(s, "AC").filter((f) => f.pin), onBC = forcesOn(s, "BC").filter((f) => f.pin);
  equal(onAC.map((f) => f.direction), ["right", "up"]);
  equal(onBC.map((f) => f.direction), ["left", "down"]);
});

test("one body's equations only (setup.body), with the reactions known", () => {
  const r = solveFrame({ ...aFrame(), body: "BC", knownReactions: true });
  equal(r.equations.map((e) => e.id), ["BC_x", "BC_y", "BC_M"]);
  const unknown = [...new Set(r.equations.flatMap((e) => e.terms.filter((t) => t.value == null).map((t) => t.id)))].sort();
  equal(unknown, ["C_x", "C_y", "F_DE"]);
});

test("without the crossbar the ladder folds: a mechanism", () => {
  const s = aFrame();
  s.links = [];
  equal(solveFrame(s).status, "unstable");
});

test("a sign slip on a pin force is explained", () => {
  const m = frameMistakes(aFrame(), "C_x");
  equal(m.length, 1);
  close(m[0].value, 500);
  equal(m[0].kind, "sign");
});
