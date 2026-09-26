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
        for (const f of s.forces || []) if (f.kind === "cable") ok(r.values[f.id] > 0, `cable ${f.id} not pulling`);
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

test("Unit 4 explore: M_P = 50 N·m wherever P is dragged", () => {
  const st = find("04-couples/1-explore");
  const solver = getSolver(st.solver);
  for (const P of [[0.25, 0.3], [-0.45, -0.35], [1.2, 0.45], [0, 0.1], [0.5, -0.2]]) {
    const s = clone(st.setup);
    solver.drag(s, "P", P);
    close(solver.solve(s).values.M, 50, 1e-9, `P = ${P}:`);
  }
});

test("Unit 4 predict: F' = 200 N; every new version turns the same way as the original", () => {
  const st = find("04-couples/2-predict");
  const solver = getSolver(st.solver);
  close(solver.solve(st.setup).values.C2, 200);
  for (let i = 0; i < 25; i++) {
    const r = solver.solve(makeVariant(st.setup, st.vary));
    ok(!r.message, r.message);
    close(r.values.M_C2, r.values.M_C1);
  }
});

test("Unit 4 build: start fails; 150 N down/up and 200 N right/left both work; same-way or wrong-sense forces fail", () => {
  const st = find("04-couples/3-build");
  const solver = getSolver(st.solver);
  const tryForces = (F, d1, d2) => {
    const s = clone(st.setup);
    setPath(s, "forces.#F_1.magnitude", F);
    setPath(s, "forces.#F_1.direction", d1);
    setPath(s, "forces.#F_2.magnitude", F);
    setPath(s, "forces.#F_2.direction", d2);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "starting forces should not already work");
  ok(tryForces(150, "down", "up").ok, "150 N down at A, up at B: 150(0.4) = 60");
  ok(tryForces(200, "right", "left").ok, "200 N right at A, left at B: 200(0.3) = 60");
  ok(/not a couple/.test(tryForces(150, "up", "up").message), "both up is not a couple");
  ok(/clockwise/.test(tryForces(150, "up", "down").message), "reversed pair turns the wrong way");
});

test("Unit 4 debug: every version's first line (M_P) agrees with M = Fd = +60 N·m", () => {
  const st = find("04-couples/4-debug");
  const solver = getSolver(st.solver);
  for (let i = 0; i < 20; i++) {
    const s = makeVariant(st.setup, st.vary);
    const [Mp, Mc] = solver.equations(s);
    close(Mp.result.value, 60);
    close(Mc.result.value, 60);
  }
});

test("Unit 4 solve: M_R = −68.04 N·m; every version stays clearly clockwise", () => {
  const st = find("04-couples/6-solve");
  const solver = getSolver(st.solver);
  close(solver.solve(st.setup).values.M, -68.0385);
  for (let i = 0; i < 40; i++) {
    const M = solver.solve(makeVariant(st.setup, st.vary)).values.M;
    ok(M <= -30, `M_R = ${M}`);
  }
});

test("every stage with random numbers has at least 50 different versions (so neighbours rarely match)", () => {
  const count = (rule) => (rule.values ? rule.values.length : Math.floor((rule.max - rule.min) / rule.step + 1e-9) + 1);
  for (const { stage } of stages) {
    if (!stage.vary) continue;
    const versions = stage.vary.reduce((n, r) => n * count(r), 1);
    ok(versions >= 50, `${stage.id} has only ${versions} versions`);
  }
});

test("Unit 5 predict: F_R = 1200 N at x̄ = 2.67 m; every version's resultant lands on the beam", () => {
  const st = find("05-equivalent-systems/2-predict");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.R, 1200);
  close(r.values.pos, 2.66667);
  for (let i = 0; i < 30; i++) {
    const x = solver.solve(makeVariant(st.setup, st.vary)).values.pos;
    ok(x > 1 && x < 5, `x̄ = ${x}`);
  }
});

test("Unit 5 build: start tilts; 10 kg at 2.5, 20 kg at 1.0, 30 kg at 1.5 hangs level; crates too close fail", () => {
  const st = find("05-equivalent-systems/3-build");
  const solver = getSolver(st.solver);
  const place = (a, b, c) => {
    const s = clone(st.setup);
    setPath(s, "forces.#B10.at.0", a);
    setPath(s, "forces.#B20.at.0", b);
    setPath(s, "forces.#B30.at.0", c);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the start should not hang level");
  ok(place(2.5, 1.0, 1.5).ok, "(25 + 20 + 45) / 60 = 1.5 m");
  ok(/too close/.test(place(1.5, 1.5, 1.5).message), "all at the hook is level but crates overlap");
});

test("Unit 5 debug: (M_R)_O = −630.4 N·m; F2's arm is 3 sin 60° = 2.598 m", () => {
  const st = find("05-equivalent-systems/4-debug");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values.M, -630.385);
  close(r.values.d_F2, 2.59808);
  close(r.values["R.y"], -376.795);
});

test("Unit 5 solve: F_Rx = 240 N, F_Ry = −430 N, (M_R)_O = −448 N·m", () => {
  const st = find("05-equivalent-systems/6-solve");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values["R.x"], 240);
  close(r.values["R.y"], -430);
  close(r.values.M, -448);
});

test("Unit 6 explore: 200 → 600 N/m over 6 m gives F_R = 2400 N at x̄ = 3.5 m", () => {
  const st = find("06-distributed-loads/1-explore");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values.R, 2400);
  close(r.values.pos, 3.5);
});

test("Unit 6 predict: F_R = ½(600)(6) = 1800 N at x̄ = 4 m; every version's resultant is on the load", () => {
  const st = find("06-distributed-loads/2-predict");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.R, 1800);
  close(r.values.pos, 4);
  for (let i = 0; i < 30; i++) {
    const s = makeVariant(st.setup, st.vary);
    const v = solver.solve(s).values, L = s.loads[0].to;
    close(v.pos, s.loads[0].peak === "right" ? (2 * L) / 3 : L / 3, 1e-9, JSON.stringify(s.loads[0]));
  }
});

test("Unit 6 build: the start fails; w_F = 2400, w_B = 600 N/m puts 6000 N over the axle; 3000/0 is too far forward", () => {
  const st = find("06-distributed-loads/3-build");
  const solver = getSolver(st.solver);
  const tryLoad = (front, back) => {
    const s = clone(st.setup);
    setPath(s, "loads.#g.w.0", front);
    setPath(s, "loads.#g.w.1", back);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "starting load should not meet the goal");
  ok(tryLoad(2400, 600).ok, "hand-worked answer should meet the goal");
  ok(/in front of/.test(tryLoad(3000, 0).message), "a triangle 3000 → 0 acts at 1.33 m, in front of the axle");
  ok(/must be 6000/.test(tryLoad(1000, 1000).message));
});

test("Unit 6 debug: F_R = 4100 N and ΣFx̃ = 16100 N·m; every version's load rises left to right", () => {
  const st = find("06-distributed-loads/4-debug");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.R, 4100);
  close(r.values.M, 16100);
  for (let i = 0; i < 20; i++) {
    const s = makeVariant(st.setup, st.vary);
    ok(s.loads[0].w[1] > s.loads[0].w[0], "the triangle must sit on top of the rectangle");
    equal(solver.equations(s).map((e) => e.id), ["A_w_rect", "A_w_tri", "F", "M"]);
  }
});

test("Unit 6 solve: w = 600(x/4)² gives 800 N at 3.00 m; w = 900(x/5)³ gives 1125 N at 4.00 m", () => {
  const st = find("06-distributed-loads/6-solve");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.R, 800);
  close(r.values.pos, 3);
  const s = clone(st.setup);
  setPath(s, "loads.#w.w", 900);
  setPath(s, "loads.#w.n", 3);
  setPath(s, "loads.#w.to", 5);
  const r3 = solver.solve(s);
  close(r3.values.R, 1125);
  close(r3.values.pos, 4);
});
