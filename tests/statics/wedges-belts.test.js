// Belt friction and wedges (Unit 9.3). Answers worked by hand in each test's name.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveBelt, beltMistakes, beltEquations } from "../../src/subjects/statics/belt.js";
import { beltSteps } from "../../src/subjects/statics/belt-steps.js";
import { solveWedge, wedgeEquations, wedgeMistakes } from "../../src/subjects/statics/wedge.js";

setFile("statics / wedges and belt friction");

const rope = (extra) => ({ drum: { r: 0.3 }, beta: 180, mus: 0.3, load: 1000, hand: 100, tight: "load", find: "hand", ...extra });

test("a 6000 N boat held with 2.5 turns (900° = 15.708 rad), μs = 0.3: T₁ = 6000 / e^{4.7124} = 6000 / 111.32 = 53.90 N", () => {
  close(solveBelt(rope({ load: 6000, beta: 900 })).values.hand, 6000 / Math.exp(0.3 * 5 * Math.PI));
  close(solveBelt(rope({ load: 6000, beta: 900 })).values.hand, 53.899, 1e-3);
});

test("hoisting 500 N over a pipe (180°, μs = 0.25): the hand is tight, 500 e^{0.25π} = 1096.6 N", () => {
  const v = solveBelt(rope({ load: 500, mus: 0.25, tight: "hand" })).values;
  close(v.hand, 1096.64, 1e-2);
  close(v.T2, v.hand);
  close(v.T1, 500);
});

test("turns to hold 2000 N with 100 N, μs = 0.35: β = ln 20 / 0.35 = 8.5594 rad = 490.4°, 1.3623 turns", () => {
  const v = solveBelt(rope({ load: 2000, hand: 100, mus: 0.35, find: "beta" })).values;
  close(v.betaRad, Math.log(20) / 0.35);
  close(v.turns, 1.36227, 1e-4);
});

test("200 N with 1.5 turns (9.4248 rad), μs = 0.3 holds 200 e^{2.8274} = 3380.3 N", () => {
  close(solveBelt(rope({ hand: 200, beta: 540, find: "load" })).values.load, 3380.3, 0.05);
});

test("belt slips: β in degrees, the sides swapped, 1 + μβ", () => {
  const vals = beltMistakes(rope({ load: 1000 }), "hand").map((m) => Math.round(m.value * 10) / 10);
  ok(vals.includes(Math.round((1000 / Math.exp(0.3 * 180)) * 10) / 10), "degrees");
  ok(vals.includes(Math.round(1000 * Math.exp(0.3 * Math.PI) * 10) / 10), "swapped sides");
  ok(vals.includes(Math.round((1000 / (1 + 0.3 * Math.PI)) * 10) / 10), "linear");
});

test("the equation line T₂ = T₁ e^{μβ} carries e^{μβ} as its factor", () => {
  const [eq] = beltEquations(rope({}));
  close(eq.terms[0].factor.value, Math.exp(0.3 * Math.PI));
});

test("a student's belt working: 'degrees' is wrong at the factor line and the answer follows; 'turns' drops the half turn", () => {
  const w = beltSteps(rope({ load: 6000, beta: 900 }), { slip: "degrees" });
  equal(w.wrong, "factor");
  ok(w.follows.includes("answer"));
  equal(beltSteps(rope({ load: 6000, beta: 900 }), { slip: "turns" }).wrong, "beta");
  ok(/720/.test(beltSteps(rope({ load: 6000, beta: 900 }), { slip: "turns" }).lines[0].tex), "counts only 720°");
});

const machine = (extra = {}) => ({ wedge: { angle: 10, length: 1.6, tip: -0.3 }, block: { w: 1, h: 0.7 }, weight: 4000, mus: 0.3, motion: "in", ...extra });

test("machine on a 10° wedge, μs = 0.3 everywhere: N₁ = 4000/0.79199 = 5050.6 N, N₂ = 2369.2 N, N₃ = 4710.8 N, P = 3782.5 N", () => {
  const v = solveWedge(machine()).values;
  close(v.N1, 5050.6, 0.1);
  close(v.N2, 2369.2, 0.1);
  close(v.N3, 4710.8, 0.1);
  close(v.P, 3782.5, 0.1);
});

test("the four equations (block and wedge, ΣF_x and ΣF_y) are satisfied by those forces", () => {
  const v = solveWedge(machine()).values;
  // Friction terms are written μN (their own ids): put them in as the known values F = μN.
  for (const eq of wedgeEquations(machine())) {
    const sum = eq.terms.reduce((s, t) => {
      const f = t.factor ? t.factor.value : 1;
      const val = t.value != null ? t.value : t.id.startsWith("F") ? v[t.id] : v[t.id];
      return s + t.sign * f * val;
    }, 0);
    close(sum, 0, 1e-6, eq.id);
  }
});

test("an 18° wedge pulled back out, every friction reversed: N₁ = 3806.3 N, P = −1101.7 N — it must be pulled out with 1101.7 N (self-locking)", () => {
  const v = solveWedge(machine({ motion: "out", wedge: { angle: 18, length: 1.6, tip: -0.3 } })).values;
  close(v.N1, 3806.3, 0.1);
  close(v.Pout, 1101.7, 0.1);
  equal(v.selfLocking, 1);
});

test("a 10° wedge (tan 10° = 0.176 < μs = 0.3) can't slide out from under the block: it rides out with it, P_out = μs W = 1200 N", () => {
  const v = solveWedge(machine()).values;
  equal(v.ridesOut, 1);
  close(v.Pout, 1200);
  equal(solveWedge(machine({ motion: "out" })).status, "unstable");
});

test("a door on a roller guide (no wall friction), 12°, μs = 0.25 on the wedge: N₁ = 3239.2 N, N₂ = 1465.6 N, P = 2215.6 N", () => {
  const v = solveWedge({ ...machine(), wedge: { angle: 12, length: 1.6, tip: -0.3 }, weight: 3000, mus: undefined, mu: { wedge: 0.25, wall: 0, floor: 0.25 } }).values;
  close(v.N1, 3239.2, 0.1);
  close(v.N2, 1465.6, 0.1);
  close(v.N3, 3000, 1e-6);
  close(v.P, 2215.6, 0.1);
});

test("a steep 35° wedge (μs = 0.3) is NOT self-locking: it would slide out by itself", () => {
  equal(solveWedge(machine({ wedge: { angle: 35, length: 1.6, tip: -0.3 } })).values.selfLocking, 0);
});

test("the build stage's window: for μs = 0.25–0.35, every angle from 12° to 25° is self-locking (and tan 12° > 0.2)", () => {
  for (const mus of [0.25, 0.3, 0.35]) for (let a = 12; a <= 25; a++) equal(solveWedge(machine({ mus, wedge: { angle: a, length: 1.6, tip: -0.3 } })).values.selfLocking, 1, `${a}° μs ${mus}`);
  ok(Math.tan((12 * Math.PI) / 180) > 0.2);
});

test("wedge slips: sin/cos swapped, a friction force left out, frictions reversed", () => {
  const ms = wedgeMistakes(machine(), "P");
  ok(ms.some((m) => m.kind === "trig"));
  ok(ms.filter((m) => m.kind === "missing").length === 3);
  ok(ms.some((m) => m.kind === "direction"));
});
