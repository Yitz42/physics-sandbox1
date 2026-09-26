// Equivalent force systems (Unit 5), with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveEquivalent } from "../../src/subjects/statics/equivalent.js";
import { equivalentMistakes } from "../../src/subjects/statics/equivalent-tools.js";
import { evaluate } from "../../src/core/equations.js";

setFile("statics / equivalent systems");

// A 6 m beam, O at its left end: 400 N at 1 m, 600 N at 3 m, 200 N at 5 m, all down.
const beam = (F1 = 400, F2 = 600, F3 = 200) => ({
  analysis: "equivalent",
  about: { at: [0, 0], label: "O" },
  forces: [
    { id: "F1", symbol: "F_1", magnitude: F1, direction: "down", at: [1, 0] },
    { id: "F2", symbol: "F_2", magnitude: F2, direction: "down", at: [3, 0] },
    { id: "F3", symbol: "F_3", magnitude: F3, direction: "down", at: [5, 0] },
  ],
});

test("beam: F_R = 1200 N down, (M_R)_O = −3200 N·m, single resultant at x̄ = 2.667 m", () => {
  // ΣM_O = −(400·1 + 600·3 + 200·5) = −3200;  x̄ = ΣM_O / F_Ry = −3200 / −1200
  const r = solveEquivalent(beam());
  close(r.values["R.y"], -1200);
  close(r.values.R, 1200);
  close(r.values.M, -3200);
  close(r.values.pos, 2.66667);
  equal(r.equations.map((e) => e.id), ["Rx", "Ry", "Mp"]);
  close(evaluate(r.equations[2]), -3200);
  equal(r.equations[2].lhs, "(M_R)_{O} = \\Sigma M_{O}");
});

test("mistakes for x̄: plain average of positions (3 m), a force left out of the moments", () => {
  const m = equivalentMistakes(beam(), "pos");
  ok(m.some((x) => Math.abs(x.value - 3) < 1e-9 && /average/.test(x.message)), "average of 1, 3, 5 = 3 m");
  // Without F3 in the moments: −2200 / −1200 = 1.833 m
  ok(m.some((x) => Math.abs(x.value - 1.83333) < 1e-4 && /F3 out of the moment/.test(x.message)));
});

// Solve-stage bracket: F1 = 300 N on a 4-3 slope down-right at A (0.8, 0.6),
// F2 = 250 N down at B (0.4, 0.6), couple M = 60 N·m clockwise.
const bracket = {
  analysis: "equivalent", resultant: "at O",
  about: { at: [0, 0], label: "O" },
  forces: [
    { id: "F1", symbol: "F_1", magnitude: 300, direction: { slope: [4, -3] }, at: [0.8, 0.6] },
    { id: "F2", symbol: "F_2", magnitude: 250, direction: "down", at: [0.4, 0.6] },
  ],
  moments: [{ id: "M1", symbol: "M", magnitude: 60, sense: -1, at: [0.4, 0.3] }],
};

test("bracket: F_Rx = 240 N, F_Ry = −430 N, (M_R)_O = −448 N·m", () => {
  // F1 = (240, −180): M = x F_y − y F_x = 0.8(−180) − 0.6(240) = −288
  // F2: 0.4(−250) = −100;  couple: −60.  Total −448 N·m.
  const r = solveEquivalent(bracket);
  close(r.values["R.x"], 240);
  close(r.values["R.y"], -430);
  close(r.values.M, -448);
  close(r.values.d_F1, 0.96); // perpendicular distance, not |OA| = 1.0 m
  close(r.values.R, Math.hypot(240, 430));
});

test("mistakes for (M_R)_O: distance to A instead of d, a couple moment left out, a sign", () => {
  const m = equivalentMistakes(bracket, "M");
  const has = (v, re) => m.some((x) => Math.abs(x.value - v) < 0.05 && re.test(x.message));
  ok(has(-460, /perpendicular distance/), "300(1.0) instead of 300(0.96): −300 −100 −60 = −460");
  ok(has(-388, /couple moment/), "no couple: −388");
  ok(has(-68, /which way F2 turns|F2 turns/) || has(-248, /F2/), "a sign slip on F2 is recognised");
});

test("F_R = 0 but a moment: no single force can replace a couple", () => {
  const s = {
    analysis: "equivalent", about: { at: [0, 0] },
    forces: [
      { id: "A", symbol: "F", magnitude: 100, direction: "up", at: [1, 0] },
      { id: "B", symbol: "F", magnitude: 100, direction: "down", at: [0, 0] },
    ],
  };
  const r = solveEquivalent(s);
  ok(r.values.pos == null && /just a couple/.test(r.message));
  close(r.values.M, 100);
});
