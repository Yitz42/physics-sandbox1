// Newton's laws and units (Unit 1.1): W = mg, ΣF = 0 at rest, ΣF = ma. Answers worked by hand in each test's name.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveNewton, newtonEquations, newtonMistakes } from "../../src/subjects/statics/newton.js";
import { newtonSteps } from "../../src/subjects/statics/newton-steps.js";
import { solveEquations } from "../../src/core/equations.js";

setFile("statics / Newton's laws and units");

const hang = (extra) => ({ mass: 45, look: "hanging", forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }], ...extra });

test("75 kg on a floor: W = 75(9.81) = 735.75 N, and at rest N = W", () => {
  const v = solveNewton({ mass: 75, forces: [{ id: "N", symbol: "N", magnitude: null, direction: "up" }] }).values;
  close(v.W, 735.75);
  close(v.N, 735.75);
});

test("a crate weighing 2.5 kN has mass 2500/9.81 = 254.84 kg", () => close(solveNewton(hang({ mass: undefined, weight: 2500 })).values.m, 254.842, 1e-3));

test("a 1200 kg rover on the Moon (g = 1.62) weighs 1944 N", () => close(solveNewton({ mass: 1200, g: 1.62, forces: [] }).values.W, 1944));

test("20 kg pushed with 100 N on frictionless ice: a = 5 m/s², N = 196.2 N", () => {
  const v = solveNewton({ mass: 20, forces: [{ id: "P", symbol: "P", magnitude: 100, direction: "right" }, { id: "N", symbol: "N", magnitude: null, direction: "up" }] }).values;
  close(v.a, 5);
  close(v.N, 196.2);
});

test("an 800 kg elevator speeding up at 1.5 m/s²: T = 800(9.81 + 1.5) = 9048 N", () => close(solveNewton(hang({ mass: 800, accel: [0, 1.5] })).values.T, 9048));

test("the equations: W = mg, then ΣF_y − m a_y = T − W − m a = 0 gives T", () => {
  const eqs = newtonEquations(hang({ mass: 800, accel: [0, 1.5] }));
  const y = eqs.find((e) => e.id === "sumFy");
  close(solveEquations([y], ["T"]).values.T, 9048);
});

test("a stack of 23 crates of 35 kg: T = 23(35)(9.81) = 7897.05 N", () => close(solveNewton(hang({ mass: undefined, count: 23, each: 35 })).values.T, 7897.05));

test("slips: W = m (45 N), W = m/g, g = 10; the elevator's T with a = 0 (7848 N)", () => {
  const w = newtonMistakes(hang(), "W").map((m) => Math.round(m.value * 100) / 100);
  ok(w.includes(45) && w.includes(4.59) && w.includes(450));
  ok(newtonMistakes(hang({ mass: 800, accel: [0, 1.5] }), "T").some((m) => Math.abs(m.value - 7848) < 1e-6));
});

test("a student's working: 'noG' is wrong at W and the tension follows; 'thirdLaw' at the pair", () => {
  const s = newtonSteps(hang(), { slip: "noG" });
  equal(s.wrong, "W");
  ok(s.follows.includes("T"));
  equal(newtonSteps(hang(), { slip: "thirdLaw" }).wrong, "pair");
});
