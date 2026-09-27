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
// find("force-components/2-predict") → its first part; find(id, 2) → part 2.
const find = (id, part = 1) => stages.find((s) => s.stage.id === id && s.stage.part.index === part - 1).stage;

test(`found ${stages.length} stage parts (6 stages per unit)`, () => ok(stages.length >= 12));

test("every unit has all six challenge types, in order", async () => {
  const order = ["explore", "predict", "build", "debug", "concept-check", "solve"];
  const byUnit = {};
  for (const { unit, whole, stage } of stages) if (stage.part.index === 0) (byUnit[unit.id] ||= []).push(whole.challenge);
  for (const [u, types] of Object.entries(byUnit)) equal(types, order, `unit ${u}:`);
});

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

test("Cables predict: 60 kg at 30°/45° → T_AB = 430.9 N, T_AC = 527.7 N", () => {
  const r = getSolver("statics.particle").solve(find("cables/2-predict").setup);
  close(r.values.T_AB, 430.88);
  close(r.values.T_AC, 527.73);
});

test("Force components build: the start fails the goal; F2 = 390 N at 53° above −x meets it", () => {
  const st = find("force-components/3-build");
  const solver = getSolver(st.solver);
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "starting position should not already meet the goal");
  const s = clone(st.setup);
  setPath(s, "forces.#F2.magnitude", 390);
  setPath(s, "forces.#F2.direction", { angle: 53, from: "-x", toward: "+y" });
  ok(st.goal.check(solver.solve(s), s).ok, "hand-worked answer should meet the goal");
});

test("Cables build: start fails; 44°/44° meets it; 40°/45° overloads AC; 50°/50° hits the skylight", () => {
  const st = find("cables/3-build");
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

test("Moments seesaw: every new version puts child B on the 3 m half-plank", () => {
  const st = find("moments/2-predict");
  const solver = getSolver(st.solver);
  for (let i = 0; i < 40; i++) {
    const x = solver.solve(makeVariant(st.setup, st.vary)).values["W_B.pos"];
    ok(x > 0 && x <= 3, `x_B = ${x}`);
  }
});

test("Moments build: the start tips; 10 kg at 0, 20 kg at 1.5 m, 30 kg at 1 m balances", () => {
  const st = find("moments/3-build");
  const solver = getSolver(st.solver);
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok);
  const s = clone(st.setup);
  setPath(s, "forces.#B10.at.0", 0);
  setPath(s, "forces.#B20.at.0", 1.5);
  setPath(s, "forces.#B30.at.0", 1);
  ok(st.goal.check(solver.solve(s), s).ok, "hand-worked answer should balance");
});

test("Moments solve: default numbers give M_O = 114.95 N·m", () => {
  const st = find("moments/6-solve");
  close(getSolver(st.solver).solve(st.setup).values.M, 114.952);
});

test("Couples explore: M_P = 50 N·m wherever P is dragged", () => {
  const st = find("couples/1-explore");
  const solver = getSolver(st.solver);
  for (const P of [[0.25, 0.3], [-0.45, -0.35], [1.2, 0.45], [0, 0.1], [0.5, -0.2]]) {
    const s = clone(st.setup);
    solver.drag(s, "P", P);
    close(solver.solve(s).values.M, 50, 1e-9, `P = ${P}:`);
  }
});

test("Couples predict: F' = 200 N; every new version turns the same way as the original", () => {
  const st = find("couples/2-predict");
  const solver = getSolver(st.solver);
  close(solver.solve(st.setup).values.C2, 200);
  for (let i = 0; i < 25; i++) {
    const r = solver.solve(makeVariant(st.setup, st.vary));
    ok(!r.message, r.message);
    close(r.values.M_C2, r.values.M_C1);
  }
});

test("Couples build: start fails; 150 N down/up and 200 N right/left both work; same-way or wrong-sense forces fail", () => {
  const st = find("couples/3-build");
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

test("Couples debug: every version's first line (M_P) agrees with M = Fd = +60 N·m", () => {
  const st = find("couples/4-debug");
  const solver = getSolver(st.solver);
  for (let i = 0; i < 20; i++) {
    const s = makeVariant(st.setup, st.vary);
    const [Mp, Mc] = solver.equations(s);
    close(Mp.result.value, 60);
    close(Mc.result.value, 60);
  }
});

test("Couples solve: M_R = −68.04 N·m; every version stays clearly clockwise", () => {
  const st = find("couples/6-solve");
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

test("Equivalent systems predict: F_R = 1200 N at x̄ = 2.67 m; every version's resultant lands on the beam", () => {
  const st = find("equivalent-systems/2-predict");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.R, 1200);
  close(r.values.pos, 2.66667);
  for (let i = 0; i < 30; i++) {
    const x = solver.solve(makeVariant(st.setup, st.vary)).values.pos;
    ok(x > 1 && x < 5, `x̄ = ${x}`);
  }
});

test("Equivalent systems build: start tilts; 10 kg at 2.5, 20 kg at 1.0, 30 kg at 1.5 hangs level; crates too close fail", () => {
  const st = find("equivalent-systems/3-build");
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

test("Equivalent systems debug: (M_R)_O = −630.4 N·m; F2's arm is 3 sin 60° = 2.598 m", () => {
  const st = find("equivalent-systems/4-debug");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values.M, -630.385);
  close(r.values.d_F2, 2.59808);
  close(r.values["R.y"], -376.795);
});

test("Equivalent systems solve: F_Rx = 240 N, F_Ry = −430 N, (M_R)_O = −448 N·m", () => {
  const st = find("equivalent-systems/6-solve");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values["R.x"], 240);
  close(r.values["R.y"], -430);
  close(r.values.M, -448);
});

test("every unit is in a chapter; planned units have a title and a description; built chapters have a textbook link", async () => {
  for (const c of await loadCourseList()) {
    if (c.comingSoon) continue;
    const course = await loadCourse(c.id);
    if (!course.chapters) continue;
    const built = course.chapters.flatMap((ch) => ch.units.filter((u) => typeof u === "string"));
    equal(course.units, built, "course.units must list the chapters' built units in order:");
    for (const ch of course.chapters) {
      for (const u of ch.units.filter((x) => typeof x !== "string")) ok(u.comingSoon && u.title && u.concept, `a planned unit in ${ch.id} needs a title and a concept`);
      const r = course.reading && course.reading.chapters[ch.id];
      if (ch.units.some((u) => typeof u === "string")) ok(r && r.chapter, `chapter ${ch.id} has built units but no textbook chapter in reading.js`);
      if (r && r.url) ok(/^https:\/\//.test(r.url), `chapter ${ch.id}: link must be https`);
    }
    // A book is either free online (an https link) or not (url: null: students use their own copy).
    if (course.reading) ok(course.reading.book.url === null || /^https:\/\//.test(course.reading.book.url), "the book's link must be https (or null)");
    if (course.reading && course.reading.book.free) ok(/^https:\/\//.test(course.reading.book.free.url), "the free alternative needs an https link");
  }
});

// ---- Cartesian vectors --------------------------------------

test("Cartesian vectors predict part 2: every version's cable has a length and components (A never on B)", () => {
  const st = find("cartesian-vectors/2-predict", 2);
  const solver = getSolver(st.solver);
  for (let i = 0; i < 40; i++) {
    const s = makeVariant(st.setup, st.vary);
    equal(s.point.at, s.forces[0].direction.points[0], "the ring and the start of the cable must be the same point:");
    ok(solver.solve(s).values["F.r"] > 1, "cable length");
  }
});

test("Cartesian vectors build: start fails; B at (0, 4) or (1.5, 2) pulls with {−120 i + 160 j} N; (6, −4) direction fails", () => {
  const st = find("cartesian-vectors/3-build");
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

test("Cartesian vectors solve: F_R = {20 i + 390 j} N, 390.5 N at 87.1°", () => {
  const st = find("cartesian-vectors/6-solve");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values["R.x"], 20);
  close(r.values["R.y"], 390);
  close(r.values.R, 390.512, 1e-3);
  close(r.values["R.angle"], 87.0643, 1e-3);
});

// ---- Springs and pulleys --------------------------------------

test("Springs build: k = 980 N/m reaches C (l = 0.800 m); 500 and 1100 N/m don't", () => {
  const st = find("springs/3-build");
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

test("Pulleys: rope AD always pulls (AB steeper than AC) in every version", () => {
  for (const [id, n] of [["pulleys/2-predict", 1], ["pulleys/4-debug", 1], ["pulleys/6-solve", 1]]) {
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

test("Springs predict: 20 kg at 40°, k = 800 N/m → T_AB = 305.2 N, s = 0.292 m", () => {
  const st = find("springs/2-predict");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values.T_AB, 305.23, 1e-2);
  close(r.values["F_AC.s"], 0.29227, 1e-4); // 233.82 / 800
});

// ---- Varignon and moving a force -------------------------

test("Varignon predict: moments of F_y and F_x add up to M_O in every version", () => {
  const st = find("varignon/2-predict");
  const solver = getSolver(st.solver);
  close(solver.solve(st.setup).values.M, 52.9423, 1e-3);
  for (let i = 0; i < 30; i++) {
    const s = makeVariant(st.setup, st.vary);
    equal(s.forces[0].at[0], s.body.points[2][0], "A sits on the bracket's corner:");
    const v = solver.solve(s).values;
    close(v.My_F + v.Mx_F, v.M);
  }
});

test("Moving a force explore: O under A needs no couple; O 2 m left of A needs 600 N·m clockwise", () => {
  const st = find("moving-forces/1-explore");
  const solver = getSolver(st.solver);
  const at = (x) => {
    const s = clone(st.setup);
    s.about.at[0] = x;
    return solver.solve(s).values.M;
  };
  close(at(3), 0);
  close(at(1), -600);
  close(at(4), 300);
});

test("Moving a force predict: 250 N at 40° below +x at (0.8, 0.6) → F_R = 250 N, (M_R)_O = −243.5 N·m", () => {
  const st = find("moving-forces/2-predict");
  const v = getSolver(st.solver).solve(st.setup).values;
  close(v.R, 250);
  close(v.M, -243.4642, 1e-6);
});

// ---- New stages (chapters 2 and 3) ---------------------------------------------------

test("Springs solve: 15 kg lamp, k = 500 N/m → T_AC = 118.92 N, F_AB = 105.11 N, spring 0.610 m long", () => {
  const v = getSolver("statics.particle").solve(find("springs/6-solve").setup).values;
  close(v.T_AC, 118.917, 1e-4);
  close(v.F_AB, 105.107, 1e-4);
  close(v["F_AB.l"], 0.610214, 1e-4);
});

test("Pulleys build: start fails; 30°/30° works; 20°/20° overloads the cable (501.9 N); 30°/35° needs rope AD", () => {
  const st = find("pulleys/3-build");
  const solver = getSolver(st.solver);
  const angles = (ab, ac) => {
    const s = clone(st.setup);
    setPath(s, "forces.#T_AB.direction.angle", ab);
    setPath(s, "forces.#T_AC.direction.angle", ac);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the start should not already work");
  ok(angles(30, 30).ok, "30/30: T = 343.35 N, rope slack");
  ok(/rating/.test(angles(20, 20).message), "20/20: T = 501.9 N");
  ok(/PUSH/.test(angles(30, 35).message), "AC steeper: rope would push");
  ok(/still pulls/.test(angles(35, 30).message), "AB steeper: rope still pulls");
});

test("Varignon build: start fails; 70° above +x and 26° above −x give 60 ± 1 N·m; straight up doesn't", () => {
  const st = find("varignon/3-build");
  const solver = getSolver(st.solver);
  const pull = (dir) => {
    const s = clone(st.setup);
    s.forces[0].direction = dir;
    return st.goal.check(solver.solve(s), s).ok;
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok);
  ok(pull({ angle: 70, from: "+x", toward: "+y" }), "70° above +x: 60.2 N·m");
  ok(pull({ angle: 26, from: "-x", toward: "+y" }), "26° above −x: 59.8 N·m");
  ok(!pull("up"), "straight up: 0.5(150) = 75 N·m");
});

test("Varignon debug: both lines agree, M_O = −144.6 N·m, in every version", () => {
  const st = find("varignon/4-debug");
  const solver = getSolver(st.solver);
  close(solver.solve(st.setup).values.M, -144.641, 1e-4);
  for (let i = 0; i < 20; i++) {
    const [Md, Mxy] = solver.equations(makeVariant(st.setup, st.vary));
    close(Md.result.value, Mxy.result.value);
  }
});

test("Varignon solve: 260 N on 5-12-13 at (0.45, 0.3) → M(F_y) = 108, M(F_x) = 30, M_O = 138 N·m, d = 0.531 m", () => {
  const st = find("varignon/6-solve");
  const v = getSolver(st.solver).solve(st.setup).values;
  close(v.My_F, 108);
  close(v.Mx_F, 30);
  close(v.M, 138);
  close(v.d_F, 138 / 260);
  for (let i = 0; i < 30; i++) {
    const s = makeVariant(st.setup, st.vary);
    equal(s.forces[0].at[0], s.body.points[2][0], "A sits on the bracket's corner:");
  }
});

test("Moving a force build: bolt at 1 m fails (−846 N·m); 3.8–4.0 m works; 3.75 m is just too far", () => {
  const st = find("moving-forces/3-build");
  const solver = getSolver(st.solver);
  const bolt = (x) => {
    const s = clone(st.setup);
    s.about.at[0] = x;
    return st.goal.check(solver.solve(s), s);
  };
  ok(!bolt(1).ok);
  close(solver.solve(st.setup).values.M, 250 * 1 - 1096.41, 1e-4);
  for (const x of [3.8, 3.9, 4]) ok(bolt(x).ok, `bolt at ${x} m`);
  ok(!bolt(3.75).ok, "3.75 m: −158.9 N·m");
});

test("Moving a force debug and solve: (M_R)_O = −288 N·m (d = 0.96 m); and {210 i + 280 j} N with 161 N·m", () => {
  const d = getSolver("statics.equivalent").solve(find("moving-forces/4-debug").setup).values;
  close(d.M, -288);
  close(d.d_F, 0.96);
  const v = getSolver("statics.equivalent").solve(find("moving-forces/6-solve").setup).values;
  close(v["R.x"], 210);
  close(v["R.y"], 280);
  close(v.M, 161);
});
