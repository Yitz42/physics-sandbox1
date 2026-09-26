// Checks every stage file of every course: it loads, its solver can solve it,
// the answers it asks for exist, "new versions" stay solvable, and the build
// goals can actually be met. This catches typos in content files.
import { test, ok, equal, close, setFile } from "../harness.js";
import { loadCourseList, loadCourse, loadUnit, loadStage, checkStage } from "../../src/core/content.js";
import { getSolver } from "../../src/core/registry.js";
import { makeVariant, clone, setPath } from "../../src/core/paths.js";

setFile("content / every stage");

async function allStages() {
  const out = [];
  for (const c of await loadCourseList()) {
    if (c.comingSoon) continue;
    const course = await loadCourse(c.id);
    for (const unitId of course.units) {
      const unit = await loadUnit(c.id, unitId);
      for (const file of unit.stages) out.push({ course, unit, file, stage: await loadStage(c.id, unitId, file) });
    }
  }
  return out;
}
const stages = await allStages();
const find = (id) => stages.find((s) => s.stage.id === id).stage;

test(`found ${stages.length} stages (6 per unit)`, () => ok(stages.length >= 12));

for (const { unit, file, stage } of stages) {
  test(`${stage.id}: stage file is valid`, () => {
    equal(checkStage(stage), []);
    equal(stage.id, `${unit.id}/${file}`, "id must be <unit folder>/<file name>:");
  });

  if (!stage.setup) continue;
  const solver = getSolver(stage.solver);

  test(`${stage.id}: solves, and every asked quantity has a value`, () => {
    const r = solver.solve(stage.setup);
    ok(["resultant", "determinate"].includes(r.status), `status was ${r.status}: ${r.message}`);
    for (const ask of [].concat(stage.ask || [])) ok(Number.isFinite(r.values[ask.quantity]), `no value for ${ask.quantity}`);
  });

  if (stage.vary) {
    test(`${stage.id}: 25 random new versions all solve with pulling cables`, () => {
      for (let i = 0; i < 25; i++) {
        const s = makeVariant(stage.setup, stage.vary);
        const r = solver.solve(s);
        ok(["resultant", "determinate"].includes(r.status), `version ${JSON.stringify(s)} → ${r.status}`);
        for (const f of s.forces) if (f.kind === "cable") ok(r.values[f.id] > 0, `cable ${f.id} not pulling`);
        for (const ask of [].concat(stage.ask || [])) ok(Number.isFinite(r.values[ask.quantity]));
      }
    });
  }

  if (stage.debug) {
    test(`${stage.id}: every debug mutation names a real force/term`, () => {
      const eqs = solver.equations(stage.setup);
      for (const m of stage.debug.mutations) {
        if (m.force) ok(stage.setup.forces.some((f) => f.id === m.force), `no force ${m.force}`);
        if (m.equation) {
          const eq = eqs.find((e) => e.id === m.equation);
          ok(eq, `no equation ${m.equation}`);
          ok(eq.terms.some((t) => t.id === m.term), `no term ${m.term} in ${m.equation}`);
        }
        if (m.kind === "remove") ok(stage.debug.missingChoices.some((c) => c.id === m.force), "missing force must be one of the choices");
      }
    });
  }

  if (stage.tasks) {
    test(`${stage.id}: no explore task is already done at the start`, () => {
      const r = solver.solve(stage.setup);
      stage.tasks.forEach((t, i) => ok(!t.check(r.values, stage.setup, r), `task ${i + 1} is done before the student does anything`));
    });
  }
}

// ---- Stage answers checked by hand ------------------------------------------

test("Unit 2 predict: 60 kg at 30°/45° → T_AB = 430.9 N, T_AC = 527.7 N", () => {
  const r = getSolver("statics.particle").solve(find("02-particle-equilibrium/2-predict").setup);
  close(r.values.T_AB, 430.88);
  close(r.values.T_AC, 527.73);
});

test("Unit 1 build: the start fails the goal; F2 = 390 N at 53° above −x meets it", () => {
  const st = find("01-force-vectors/3-build");
  const solver = getSolver(st.solver);
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "starting position should not already meet the goal");
  const s = clone(st.setup);
  setPath(s, "forces.#F2.magnitude", 390);
  setPath(s, "forces.#F2.direction", { angle: 53, from: "-x", toward: "+y" });
  ok(st.goal.check(solver.solve(s), s).ok, "hand-worked answer should meet the goal");
});

test("Unit 2 build: start fails; 44°/44° meets it; 40°/45° overloads AC; 50°/50° hits the skylight", () => {
  const st = find("02-particle-equilibrium/3-build");
  const solver = getSolver(st.solver);
  const tryAngles = (ab, ac) => {
    const s = clone(st.setup);
    setPath(s, "forces.#T_AB.direction.angle", ab);
    setPath(s, "forces.#T_AC.direction.angle", ac);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok);
  ok(tryAngles(44, 44).ok, "44/44 should work");
  const over = tryAngles(40, 45);
  ok(!over.ok && over.flagged.includes("T_AC"), "40/45 should overload AC (754 N)");
  ok(!tryAngles(50, 50).ok, "50/50 puts anchors in the skylight");
});

test("Unit 3 seesaw: every new version puts child B on the 3 m half-plank", () => {
  const st = find("03-moments/2-predict");
  const solver = getSolver(st.solver);
  for (let i = 0; i < 40; i++) {
    const x = solver.solve(makeVariant(st.setup, st.vary)).values["W_B.pos"];
    ok(x > 0 && x <= 3, `x_B = ${x}`);
  }
});

test("Unit 3 build: the start tips; 10 kg at 0, 20 kg at 1.5 m, 30 kg at 1 m balances", () => {
  const st = find("03-moments/3-build");
  const solver = getSolver(st.solver);
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok);
  const s = clone(st.setup);
  setPath(s, "forces.#B10.at.0", 0);
  setPath(s, "forces.#B20.at.0", 1.5);
  setPath(s, "forces.#B30.at.0", 1);
  ok(st.goal.check(solver.solve(s), s).ok, "hand-worked answer should balance");
});

test("Unit 3 solve: default numbers give M_O = 114.95 N·m", () => {
  const st = find("03-moments/6-solve");
  close(getSolver(st.solver).solve(st.setup).values.M, 114.952);
});
