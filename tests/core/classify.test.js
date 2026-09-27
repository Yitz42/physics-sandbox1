// The general mistake rules (classify.js), one test per rule, with numbers
// worked out by hand.
import { test, ok, equal, setFile } from "../harness.js";
import { classifyNumber, anglesIn, isFastGuess, FAST_GUESS_MS } from "../../src/core/classify.js";
import { checkAnswer } from "../../src/challenges/common/answers.js";

setFile("core / mistake classifier");

test("weight: the mass used where the weight belongs (416 N ÷ 9.81 = 42.4), or the reverse", () => {
  equal(classifyNumber({ submitted: 42.4, expected: 416.0, tolerance: 0.1 }), "weight");
  equal(classifyNumber({ submitted: 196.2, expected: 20, tolerance: 0.1 }), "weight", "20 × 9.81 = 196.2");
});

test("sign: right size, wrong sign", () => {
  equal(classifyNumber({ submitted: -346.4, expected: 346.41, tolerance: 0.1 }), "sign");
});

test("trig: sin and cos swapped (100 cos 30° = 86.6 expected; 100 sin 30° = 50 typed)", () => {
  equal(classifyNumber({ submitted: 50, expected: 86.6, tolerance: 0.1, angles: [30] }), "trig");
  equal(classifyNumber({ submitted: 86.6, expected: 50, tolerance: 0.1, angles: [30] }), "trig", "and the other way");
  equal(classifyNumber({ submitted: 50, expected: 86.6, tolerance: 0.1, angles: [] }), null, "no angle in the round: can't tell");
});

test("calculator: angles in radians (100 cos(30 rad) = 15.4 instead of 86.6)", () => {
  equal(classifyNumber({ submitted: 15.4, expected: 86.6, tolerance: 0.1, angles: [30] }), "calculator");
  equal(classifyNumber({ submitted: 0.52, expected: 30, tolerance: 0.1, angles: [], unit: "deg" }), "calculator", "an angle given in radians (30° = 0.52 rad)");
});

test("rounding: within 2% but outside the tolerance (345.0 for 346.41)", () => {
  equal(classifyNumber({ submitted: 345.0, expected: 346.41, tolerance: 0.1 }), "rounding");
  equal(classifyNumber({ submitted: 300, expected: 346.41, tolerance: 0.1 }), null, "13% off is not rounding");
});

test("a right answer, or one that fits no rule, gets none", () => {
  equal(classifyNumber({ submitted: 346.4, expected: 346.41, tolerance: 0.1 }), null);
  equal(classifyNumber({ submitted: 1000, expected: 346.41, tolerance: 0.1, angles: [30] }), null);
});

test("the round's angles are found in its numbers (angles and slope triangles)", () => {
  const got = anglesIn({ forces: [{ direction: { angle: 30, from: "+x" } }, { direction: { slope: [3, 4] } }, { direction: "down" }] });
  equal(got.length, 2);
  ok(got.includes(30));
  ok(Math.abs(got[1] - 53.13) < 0.01, "3-4-5 slope: 53.13°");
});

test("fast guess: the first check within FAST_GUESS_MS of the round starting", () => {
  ok(isFastGuess(5000));
  ok(!isFastGuess(FAST_GUESS_MS + 1));
  ok(!isFastGuess(null));
});

test("checking an answer uses the rules when the solver's own slips don't match", () => {
  const out = checkAnswer("42.4", 416.0, { unit: "N" });
  equal(out.kinds, ["weight"]);
  ok(/9\.81/.test(out.message), "explains the factor of g");
  equal(checkAnswer("15.4", 86.6, { unit: "N", angles: [30] }).kinds, ["calculator"]);
  // The solver's own slip wins over a general rule.
  equal(checkAnswer("-86.6", 86.6, { mistakes: [{ value: -86.6, kind: "direction", message: "x" }] }).kinds, ["direction"]);
});
