// Moments about a point (Unit 3), with answers worked out by hand.
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveMoment, momentEquations } from "../../src/subjects/statics/moment.js";
import { momentMistakes, momentShadow } from "../../src/subjects/statics/moment-tools.js";
import { evaluate } from "../../src/core/equations.js";

setFile("statics / moments");

const one = (F, direction, at, extra = {}) => ({
  analysis: "moment", about: { at: [0, 0] }, ...extra,
  forces: [{ id: "F", symbol: "F", magnitude: F, direction, at }],
});

test("wrench: 100 N straight up at 0.3 m → M_O = +30 N·m (counterclockwise)", () => {
  const r = solveMoment(one(100, "up", [0.3, 0]));
  close(r.values.M, 30);
  close(r.values.d_F, 0.3);
});
test("wrench: pushing down instead → M_O = −30 N·m (clockwise)", () => {
  close(solveMoment(one(100, "down", [0.3, 0])).values.M, -30);
});
test("line of action through O → no moment", () => {
  // Force at (0.3, 0.4) pointing along the 3-4-5 line away from O
  const r = solveMoment(one(200, { slope: [3, 4] }, [0.3, 0.4]));
  close(r.values.M, 0, 1e-9);
});
test("angled force: 250 N at (0.4, 0.3), 30° above −x → M_O = 114.95 N·m, d = 0.4598 m", () => {
  // x F_y − y F_x = 0.4(125) − 0.3(−216.51) = 50 + 64.95
  const r = solveMoment(one(250, { angle: 30, from: "-x", toward: "+y" }, [0.4, 0.3]));
  close(r.values.M, 114.952);
  close(r.values.d_F, 0.45981);
  close(r.values.r_F, 0.5);
});
test("both methods agree: ΣFd equation = Σ(xF_y − yF_x) equation (Varignon)", () => {
  const s = {
    analysis: "moment", about: { at: [0, 0] },
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 200, direction: "right", at: [0, 0.4] },
      { id: "F2", symbol: "F_2", magnitude: 150, direction: "down", at: [0.5, 0.4] },
      { id: "F3", symbol: "F_3", magnitude: 100, direction: { angle: 30, from: "+x", toward: "+y" }, at: [0.3, 0.4] },
    ],
  };
  const [Md, Mxy] = momentEquations(s);
  close(evaluate(Md), -174.641); // −80 − 75 − 19.64
  close(evaluate(Mxy), -174.641);
  close(solveMoment(s).values.M, -174.641);
});
test("seesaw: 30 kg at 1.5 m left; 20 kg must sit 2.25 m right", () => {
  const s = {
    analysis: "balance", about: { at: [0, 0] },
    forces: [
      { id: "W_A", symbol: "W_A", kind: "weight", mass: 30, at: [-1.5, 0] },
      { id: "W_B", symbol: "W_B", kind: "weight", mass: 20, at: null, along: { dir: [1, 0] }, posSymbol: "x_B" },
    ],
  };
  const r = solveMoment(s);
  equal(r.status, "determinate");
  close(r.values["W_B.pos"], 2.25);
  close(r.values.M, 0, 1e-9);
  // Upside-down ratio: 20(1.5)/30 = 1.0 m
  ok(momentMistakes(s, "W_B.pos").some((m) => Math.abs(m.value - 1) < 1e-6 && /upside down/.test(m.message)));
});
test("mistakes: using the distance to O instead of d is recognised", () => {
  const s = one(250, { angle: 30, from: "-x", toward: "+y" }, [0.4, 0.3]);
  // 250 × 0.5 = 125 N·m
  ok(momentMistakes(s, "M").some((m) => Math.abs(m.value - 125) < 1e-6 && /perpendicular/.test(m.message)));
  ok(momentMistakes(s, "M").some((m) => Math.abs(m.value + 114.952) < 0.01 && /sign/.test(m.message)));
});
test("shadow: a wrong seesaw position shows the moment left over", () => {
  const s = {
    analysis: "balance", about: { at: [0, 0] },
    forces: [
      { id: "W_A", symbol: "W_A", kind: "weight", mass: 30, at: [-1.5, 0] },
      { id: "W_B", symbol: "W_B", kind: "weight", mass: 20, at: null, along: { dir: [1, 0] }, posSymbol: "x_B" },
    ],
  };
  const shapes = momentShadow(s, solveMoment(s), { "W_B.pos": 1 }, { k: 0.001, size: 6 });
  const m = shapes.find((x) => x.type === "moment");
  ok(m && m.sense > 0, "with B too close, A wins: it tips counterclockwise");
});
