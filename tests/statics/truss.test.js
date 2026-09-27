// Plane trusses by the method of joints (Unit 5.1), with answers worked by hand.
// Tension is positive, compression negative.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveTruss, trussEquations } from "../../src/subjects/statics/truss.js";
import { trussFbd } from "../../src/subjects/statics/truss-scene.js";

setFile("statics / trusses (method of joints)");

// A (0, 0) pin, B (8, 0) roller, apex C (4, 3): members AC and BC on 4-3-5 slopes.
const triangle = (loads) => ({
  joints: { A: [0, 0], B: [8, 0], C: [4, 3] },
  members: ["AB", "AC", "BC"],
  supports: [{ id: "A", type: "pin" }, { id: "B", type: "roller" }],
  forces: loads,
});
const down = (id, joint, F) => ({ id, symbol: id, magnitude: F, direction: "down", joint });

test("triangle truss, 1200 N at the apex: F_AC = F_BC = −1000 N (C), F_AB = +800 N (T)", () => {
  // By symmetry A_y = B_y = 600.  Joint C: ΣF_y: −(3/5)F_AC − (3/5)F_BC − 1200 = 0, ΣF_x: F_AC = F_BC
  //   → F = −1000 (compression).  Joint A: ΣF_x: F_AB + (4/5)F_AC = 0 → F_AB = 800 (tension)
  const r = solveTruss(triangle([down("P", "C", 1200)]));
  equal(r.status, "determinate");
  close(r.values.F_AC, -1000);
  close(r.values.F_BC, -1000);
  close(r.values.F_AB, 800);
  close(r.values.A_y, 600);
  close(r.values.B_y, 600);
  equal(r.states, { F_AB: "tension", F_AC: "compression", F_BC: "compression" });
});

test("apex load with a sideways push: P = 1200 N down, H = 400 N right → F_AC = −750 N, F_BC = −1250 N", () => {
  // Joint C: ΣF_x: −(4/5)F_AC + (4/5)F_BC + 400 = 0;  ΣF_y: −(3/5)(F_AC + F_BC) − 1200 = 0
  //   → F_AC + F_BC = −2000, F_BC − F_AC = −500 → F_BC = −1250, F_AC = −750
  const r = solveTruss(triangle([down("P", "C", 1200), { id: "H", symbol: "H", magnitude: 400, direction: "right", joint: "C" }]));
  close(r.values.F_AC, -750);
  close(r.values.F_BC, -1250);
});

test("a joint's own two equations: at C, only F_AC, F_BC and the load", () => {
  const eqs = trussEquations({ ...triangle([down("P", "C", 1200)]), joint: "C" });
  equal(eqs.length, 2);
  equal(eqs[1].terms.map((t) => t.id).sort(), ["F_AC", "F_BC", "P"]);
});

test("wall truss: roller A and pin B on the wall, 900 N at C → F_BC = +1500 N, F_AC = −1200 N, F_AB = 0", () => {
  // Joint C (4, 0): ΣF_y: (3/5)F_BC − 900 = 0 → 1500 (T);  ΣF_x: −F_AC − (4/5)(1500) = 0 → −1200 (C)
  // Joint A: nothing else pulls A up or down, so F_AB = 0 — a zero-force member.
  const r = solveTruss({
    joints: { A: [0, 0], B: [0, 3], C: [4, 0] },
    members: ["AB", "AC", "BC"],
    supports: [{ id: "A", type: "roller", normal: [1, 0] }, { id: "B", type: "pin", normal: [1, 0] }],
    forces: [down("P", "C", 900)],
  });
  equal(r.status, "determinate");
  close(r.values.F_BC, 1500);
  close(r.values.F_AC, -1200);
  ok(Math.abs(r.values.F_AB) < 1e-9, "zero-force member");
  equal(r.states.F_AB, "zero");
  close(r.values.A_x, 1200);
});

test("counting: a missing member collapses it, an extra one makes it indeterminate", () => {
  const s = triangle([down("P", "C", 1200)]);
  equal(solveTruss({ ...s, members: ["AC", "BC"] }).status, "unstable", "2 + 3 = 5 < 6");
  equal(solveTruss({ ...s, supports: [{ id: "A", type: "pin" }, { id: "B", type: "pin" }] }).status, "indeterminate", "3 + 4 = 7 > 6");
});

test("a roller that would have to pull: the truss lifts off", () => {
  // Load pulling C up and away: B's roller would have to hold the truss down.
  const r = solveTruss(triangle([{ id: "Q", symbol: "Q", magnitude: 1000, direction: "up", joint: "C" }]));
  equal(r.status, "unstable");
  ok(/lifts off/.test(r.message));
});

test("the joint FBD: members at C pull away from it (tension assumed), either way allowed", () => {
  const f = trussFbd({ ...triangle([down("P", "C", 1200)]), joint: "C" });
  equal(f.forces.map((x) => x.id).sort(), ["F_AC", "F_BC"]);
  ok(f.forces.every((x) => x.either));
  close(f.forces.find((x) => x.id === "F_AC").dir[0], -0.8);
});
