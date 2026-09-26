// Checks every stage file of every course: it loads, its solver can solve it,
// the answers it asks for exist, "new versions" stay solvable, and the build
// goals can actually be met. This catches typos in content files.
import { test, ok, equal, close, setFile } from "../harness.js";
import { loadCourseList, loadCourse, loadUnit, loadStage, checkStage, stageParts } from "../../src/core/content.js";
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
      for (const file of unit.stages) {
        const whole = await loadStage(c.id, unitId, file);
        // A stage with several parts is checked part by part.
        for (const stage of stageParts(whole)) out.push({ course, unit, file, whole, stage });
      }
    }
  }
  return out;
}
const stages = await allStages();
// find("01-force-vectors/2-predict") → its first part; find(id, 2) → part 2.
const find = (id, part = 1) => stages.find((s) => s.stage.id === id && s.stage.part.index === part - 1).stage;

test(`found ${stages.length} stage parts (6 stages per unit)`, () => ok(stages.length >= 12));

for (const { unit, file, whole, stage: part } of stages) {
  // Name each part in the test list: "…/2-predict part 2".
  const stage = { ...part, id: part.part.count > 1 ? `${part.id} part ${part.part.index + 1}` : part.id };
  if (part.part.index === 0) test(`${part.id}: stage file is valid`, () => {
    equal(checkStage(whole), []);
    equal(whole.id, `${unit.id}/${file}`, "id must be <unit folder>/<file name>:");
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

test("every unit has a textbook chapter to read, with a web link", async () => {
  for (const c of await loadCourseList()) {
    if (c.comingSoon) continue;
    const course = await loadCourse(c.id);
    if (!course.reading) continue;
    ok(/^https:\/\//.test(course.reading.book.url), "the book needs an https link");
    for (const u of course.units) {
      const r = course.reading.units[u];
      ok(r && r.chapter, `unit ${u} has no chapter in reading.js`);
      if (r.url) ok(/^https:\/\//.test(r.url), `unit ${u}: chapter link must be https`);
    }
  }
});

// ---- New parts: Unit 1 Cartesian vectors --------------------------------------

test("Unit 1 predict part 3: every version's cable has a length and components (A never on B)", () => {
  const st = find("01-force-vectors/2-predict", 3);
  const solver = getSolver(st.solver);
  for (let i = 0; i < 40; i++) {
    const s = makeVariant(st.setup, st.vary);
    equal(s.point.at, s.forces[0].direction.points[0], "the ring and the start of the cable must be the same point:");
    ok(solver.solve(s).values["F.r"] > 1, "cable length");
  }
});

test("Unit 1 build part 2: start fails; B at (0, 4) or (1.5, 2) pulls with {−120 i + 160 j} N; (6, −4) direction fails", () => {
  const st = find("01-force-vectors/3-build", 2);
  const solver = getSolver(st.solver);
  const at = (B) => {
    const s = clone(st.setup);
    s.forces[0].direction.points[1] = B;
    return st.goal.check(solver.solve(s), s).ok;
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the start should not already work");
  ok(at([0, 4]), "(0, 4): 3 left, 4 up");
  ok(at([1.5, 2]), "(1.5, 2): half as far, same direction");
  ok(!at([6, 4]), "(6, 4) pulls right");
});

test("Unit 1 solve part 2: F_R = {20 i + 390 j} N, 390.5 N at 87.1°", () => {
  const st = find("01-force-vectors/6-solve", 2);
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values["R.x"], 20);
  close(r.values["R.y"], 390);
  close(r.values.R, 390.512, 1e-3);
  close(r.values["R.angle"], 87.0643, 1e-3);
});

// ---- New parts: Unit 2 springs and pulleys --------------------------------------

test("Unit 2 build part 2: k = 980 N/m reaches C (l = 0.800 m); 500 and 1100 N/m don't", () => {
  const st = find("02-particle-equilibrium/3-build", 2);
  const solver = getSolver(st.solver);
  const withK = (k) => {
    const s = clone(st.setup);
    setPath(s, "forces.#F_AC.k", k);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the start should not already work");
  ok(withK(980).ok, "980 N/m: s = 196.2/980 = 0.2002 m");
  ok(/too soft/.test(withK(500).message), "500 N/m stretches too far");
  ok(/too stiff/.test(withK(1100).message), "1100 N/m stretches too little");
});

test("Unit 2 pulley parts: rope AD always pulls (AB steeper than AC) in every version", () => {
  for (const [id, n] of [["02-particle-equilibrium/2-predict", 3], ["02-particle-equilibrium/4-debug", 2], ["02-particle-equilibrium/6-solve", 2]]) {
    const st = find(id, n);
    const solver = getSolver(st.solver);
    for (let i = 0; i < 30; i++) {
      const r = solver.solve(makeVariant(st.setup, st.vary));
      equal(r.status, "determinate");
      ok(r.values.T_AD > 1, `${id}: T_AD = ${r.values.T_AD}`);
      close(r.values.T_AB, r.values.T_AC); // one cable, one tension
    }
  }
});

test("Unit 2 predict part 2: 20 kg at 40°, k = 800 N/m → T_AB = 305.2 N, s = 0.292 m", () => {
  const st = find("02-particle-equilibrium/2-predict", 2);
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values.T_AB, 305.23, 1e-2);
  close(r.values["F_AC.s"], 0.29227, 1e-4); // 233.82 / 800
});
