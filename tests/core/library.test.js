// The lesson library (src/core/library.js): scenarios written once, used by
// any stage with use(), and changed for a question with edit(). Plus hand
// checks of library scenarios that no older test covers.
import { test, ok, equal, close, setFile } from "../harness.js";
import { scenario, use, edit } from "../../src/core/library.js";
import { solveRigidBody } from "../../src/subjects/statics/rigid-body.js";
import { overhang, overhangEndLoad, cantilever } from "../../content/statics/library/beams.js";
import { trafficLight, trafficLightOnSlope } from "../../content/statics/library/hanging.js";

setFile("core / lesson library");

const box = scenario({
  name: "box",
  story: "A box sits on a shelf.",
  setup: { forces: [{ id: "W", magnitude: 10 }, { id: "P", magnitude: 5, at: [1, 0] }], loads: [] },
  vary: [{ path: "forces.#W.magnitude", min: 5, max: 20, step: 1 }, { path: "forces.#P.magnitude", min: 1, max: 9, step: 1 }],
  questions: { weight: { instruction: "Find the weight.", ask: [{ quantity: "W" }], hints: ["Look down."] } },
});

test("a scenario needs a name, a story and a setup", () => {
  let threw = false;
  try {
    scenario({ name: "x", setup: {} });
  } catch (e) {
    threw = /story/.test(e.message);
  }
  ok(threw, "a scenario without a story is refused, naming what's missing");
});

test("use: the story then the question's instruction; the question's fields; the stage's own fields win", () => {
  const s = use(box, "weight");
  equal(s.name, "box");
  equal(s.instructions, "A box sits on a shelf. Find the weight.");
  equal(s.ask, [{ quantity: "W" }]);
  equal(s.hints, ["Look down."]);
  equal(s.vary.length, 2);
  equal(use(box, "weight", { hints: ["Mine."] }).hints, ["Mine."]);
  equal(use(box).instructions, "A box sits on a shelf.", "no question: just the picture");
});

test("use: each stage gets its own copy (changing one never changes the library)", () => {
  const s = use(box, "weight");
  s.setup.forces[0].magnitude = 99;
  equal(box.setup.forces[0].magnitude, 10);
});

test("use: an unknown question is refused, listing the ones there are", () => {
  let msg = "";
  try {
    use(box, "height");
  } catch (e) {
    msg = e.message;
  }
  ok(/height/.test(msg) && /weight/.test(msg), msg);
});

test("edit: remove takes an item out by id, and its number changes with it", () => {
  const e = edit(box, { remove: ["forces.#P"] });
  equal(e.setup.forces.map((f) => f.id), ["W"]);
  equal(e.vary.map((r) => r.path), ["forces.#W.magnitude"]);
  equal(box.setup.forces.length, 2, "the original is unchanged");
});

test("edit: set changes a number, fix stops it varying, add puts in more, vary adds rules", () => {
  const e = edit(box, {
    set: { "forces.#W.magnitude": 12 },
    fix: ["forces.#W.magnitude"],
    add: { forces: [{ id: "Q", magnitude: 3 }] },
    vary: [{ path: "forces.#Q.magnitude", min: 1, max: 4, step: 1 }],
  });
  equal(e.setup.forces.map((f) => [f.id, f.magnitude]), [["W", 12], ["P", 5], ["Q", 3]]);
  equal(e.vary.map((r) => r.path), ["forces.#P.magnitude", "forces.#Q.magnitude"]);
});

test("edit: questions are merged, and null drops one that no longer fits", () => {
  const e = edit(box, { questions: { weight: { hints: ["Changed."] }, push: { instruction: "Find P.", ask: [{ quantity: "P" }] } } });
  equal(e.questions.weight.ask, [{ quantity: "W" }], "the rest of the old question stays");
  equal(e.questions.weight.hints, ["Changed."]);
  equal(Object.keys(e.questions), ["weight", "push"]);
  equal(Object.keys(edit(box, { questions: { weight: null } }).questions), []);
});

test("edit: removing something that isn't there is refused (a typo shows at once)", () => {
  let threw = false;
  try {
    edit(box, { remove: ["forces.#Z"] });
  } catch {
    threw = true;
  }
  ok(threw);
});

// ---- Library scenarios --------------------------------------------------------------

test("beams: overhang A_y = 400 N, B_y = 1200 N; cantilever A_y = 1700 N, M_A = 3300 N·m", () => {
  const o = solveRigidBody(overhang.setup);
  close(o.values.A_y, 400);
  close(o.values.B_y, 1200);
  const c = solveRigidBody(cantilever.setup);
  close(c.values.A_y, 1700);
  close(c.values.M_A, 3300);
});

test("beams: the overhang with only its end load: B_y = 600 N, A_y = −200 N (the pin holds it down)", () => {
  equal(overhangEndLoad.setup.loads, [], "the uniform load is gone");
  ok(!overhangEndLoad.vary.some((r) => r.path.startsWith("loads.#w")), "…and its number change");
  const r = solveRigidBody(overhangEndLoad.setup);
  // ΣM_A: 4B_y − 400(6) = 0 → B_y = 600;  ΣF_y: A_y + 600 − 400 = 0 → A_y = −200
  close(r.values.B_y, 600);
  close(r.values.A_y, -200);
});

test("hanging: the traffic light on a slope is the library's light with AB on 5-12-13, AC at 20°, 20 kg", () => {
  const ab = trafficLightOnSlope.setup.forces.find((f) => f.id === "T_AB");
  equal(ab.direction, { slope: [-12, 5] });
  equal(trafficLightOnSlope.setup.forces.find((f) => f.id === "T_AC").direction.angle, 20);
  ok(!("tensions" in trafficLightOnSlope.questions), "the angle-based tensions question is dropped");
  equal(trafficLight.setup.forces.find((f) => f.id === "T_AB").direction.angle, 10, "the library's own light is unchanged");
});
