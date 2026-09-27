// Checks every stage file of every course: it loads, its solver can solve it,
// the answers it asks for exist, "new versions" stay solvable, and the build
// goals can actually be met. This catches typos in content files.
import { test, ok, equal, close, setFile } from "../harness.js";
import { loadCourseList, loadCourse, loadUnit, loadStage, checkStage, stageParts, stageSituations } from "../../src/core/content.js";
import { getSolver } from "../../src/core/registry.js";
import { makeVariant, clone, setPath } from "../../src/core/paths.js";
import { isKnownKind } from "../../src/core/diagnosis.js";

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
        // A stage with several parts is checked part by part, and a part with
        // several situations (a different picture each version) situation by situation.
        for (const part of stageParts(whole)) for (const stage of stageSituations(part)) out.push({ course, unit, file, whole, stage });
      }
    }
  }
  return out;
}
const stages = await allStages();
// find("force-components/2-predict") → its first part; find(id, 2) → part 2;
// find(id, 1, "balloon") → the part's situation named "balloon".
const find = (id, part = 1, situation = null) => stages.find((s) => s.stage.id === id && s.stage.part.index === part - 1 &&
  (situation == null || (s.stage.situation && s.stage.situation.name === situation))).stage;

test(`found ${stages.length} stage parts (6 stages per unit)`, () => ok(stages.length >= 12));

test("every unit has all six challenge types, in order", async () => {
  const order = ["explore", "predict", "build", "debug", "concept-check", "solve"];
  const byUnit = {};
  for (const { unit, whole, stage } of stages) if (stage.part.index === 0 && !(stage.situation && stage.situation.index > 0)) (byUnit[unit.id] ||= []).push(whole.challenge);
  for (const [u, types] of Object.entries(byUnit)) equal(types, order, `unit ${u}:`);
});

for (const { unit, file, whole, stage: part } of stages) {
  // Name each part in the test list: "…/2-predict part 2", "…/2-predict (balloon)".
  const named = part.part.count > 1 ? `${part.id} part ${part.part.index + 1}` : part.id;
  const stage = { ...part, id: part.situation ? `${named} (${part.situation.name || part.situation.index + 1})` : named };
  if (part.part.index === 0 && !(part.situation && part.situation.index > 0)) test(`${part.id}: stage file is valid`, () => {
    equal(checkStage(whole), []);
    equal(whole.id, `${unit.id}/${file}`, "id must be <unit folder>/<file name>:");
    // The one-line MISSION shown at the top of the panel (the stage's, or each part's own).
    const missions = stageParts(whole).map((p) => p.mission || whole.mission);
    ok(missions.every((m) => typeof m === "string" && m.length > 0 && m.length <= 120), "needs a one-line mission (up to 120 characters)");
  });

  if (!stage.setup) continue;
  const solver = getSolver(stage.solver);

  test(`${stage.id}: solves, and every asked quantity has a value`, () => {
    const r = solver.solve(stage.setup);
    // Explore and build stages may START with a structure that can't be solved
    // (the student fixes it); every other stage must be solvable as given.
    const fine = ["explore", "build"].includes(stage.challenge) ? ["resultant", "determinate", "unstable", "indeterminate"] : ["resultant", "determinate"];
    ok(fine.includes(r.status), `status was ${r.status}: ${r.message}`);
    for (const ask of [].concat(stage.ask || [])) ok(Number.isFinite(r.values[ask.quantity]), `no value for ${ask.quantity}`);
  });

  if (stage.vary) {
    test(`${stage.id}: 25 random new versions all solve with pulling cables`, () => {
      for (let i = 0; i < 25; i++) {
        const s = makeVariant(stage.setup, stage.vary);
        const r = solver.solve(s);
        // (As above: explore and build stages may start unsolved — the student fixes it.)
        const fine = ["explore", "build"].includes(stage.challenge) ? ["resultant", "determinate", "unstable", "indeterminate"] : ["resultant", "determinate"];
        ok(fine.includes(r.status), `version ${JSON.stringify(s)} → ${r.status}`);
        for (const f of s.forces || []) if (f.kind === "cable") ok(r.values[f.id] > 0, `cable ${f.id} not pulling`);
        for (const ask of [].concat(stage.ask || [])) ok(Number.isFinite(r.values[ask.quantity]));
      }
    });
  }

  // Every slip the game can recognise names a known kind of mistake (math or
  // object — see src/core/diagnosis.js), so the comprehension page can use it.
  if (stage.ask && solver.mistakes) {
    test(`${stage.id}: every recognised mistake has a known kind`, () => {
      for (const ask of [].concat(stage.ask)) {
        for (const m of solver.mistakes(stage.setup, ask.quantity)) {
          ok(isKnownKind(m.kind), `${ask.quantity}: "${m.message.slice(0, 50)}…" has kind ${m.kind}`);
          if (m.also) ok(isKnownKind(m.also), `also: ${m.also}`);
        }
      }
    });
  }
  // The FBD the student draws on may be drawn at its own size (render/panels.js): the
  // drawing tool's points must land exactly on the FBD's letters, at every canvas size.
  if (stage.challenge === "solve" && stage.solve && (stage.solve.steps || []).includes("fbd") && solver.fbd && solver.scene) {
    test(`${stage.id}: the FBD tool's points sit on the drawn FBD`, () => {
      for (const canvasSize of [{ width: 760, height: 440 }, { width: 343, height: 340 }, { width: 1000, height: 580 }]) {
        const info = solver.fbd(stage.setup, { canvasSize });
        const shapes = solver.scene(stage.setup, null, { canvasSize, hide: info.forces.map((f) => f.id) });
        for (const [id, q] of Object.entries(info.points || {})) {
          const drawn = shapes.find((sh) => sh.type === "point" && sh.panel === "right" && sh.label === id);
          if (!drawn) continue;
          close(q.at[0], drawn.at[0], 1e-6, `${id} x (${canvasSize.width} px):`);
          close(q.at[1], drawn.at[1], 1e-6, `${id} y (${canvasSize.width} px):`);
        }
      }
    });
  }
  if (stage.challenge === "solve" && solver.choices) {
    test(`${stage.id}: every wrong line to choose from has a known kind`, () => {
      for (const g of solver.choices(stage.setup)) for (const o of g.options) if (!o.correct) ok(isKnownKind(o.kind), `${g.title}: ${o.kind}`);
    });
  }
  if (stage.debug && stage.debug.view === "steps") {
    test(`${stage.id}: every planted mistake has a known kind`, () => {
      for (const m of stage.debug.mutations) ok(isKnownKind(solver.debugSteps(stage.setup, m).kind), JSON.stringify(m));
    });
  }

  if (stage.debug) {
    test(`${stage.id}: every debug mutation names a real force/term`, () => {
      const eqs = solver.equations(stage.setup);
      for (const m of stage.debug.mutations) {
        // A force named by the stage, or one the solver puts on the FBD (a support reaction).
        const onFbd = (id) => (stage.setup.forces || []).some((f) => f.id === id) || (solver.fbd ? solver.fbd(stage.setup, {}).forces.some((f) => f.id === id) : false);
        if (m.kind === "extra") ok(m.extra && m.extra.support && !onFbd(m.force), `extra ${m.force} must be a reaction that isn't really there`);
        else if (m.force) ok(onFbd(m.force), `no force ${m.force}`);
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

test("Chapter 2 challenge build: the start fails; C (2, −3) at 700 N and C (4, −6) at 470 N straighten the mast; every version has a design", () => {
  const st = find("vector-challenge/3-build");
  const solver = getSolver(st.solver);
  const design = (base, C, T) => {
    const s = clone(base);
    setPath(s, "points.C", [C[0], C[1], 0]);
    setPath(s, "forces.1.magnitude", T);
    const r = solver.solve(s);
    return { r, out: st.goal.check(r, s) };
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "starting design should fail");
  const a = design(st.setup, [2, -3], 700);
  ok(a.out.ok, a.out.message);
  close(a.r.values["R.z"], -1200, 1e-6);
  const b = design(st.setup, [4, -6], 470); // r_AC = √88 = 9.381 m; sideways part 0.7 N
  ok(b.out.ok, b.out.message);
  close(b.r.values["R.z"], -600 - (470 * 6) / Math.sqrt(88), 1e-6);
  ok(/OPPOSITE/.test(design(st.setup, [3, -3], 700).out.message), "off the line: told to line C up");
  ok(/too big/.test(design(st.setup, [2, -3], 900).out.message), "on the line, too hard: told to pull less");
  // Every version: C straight across from B, with the same tension, works.
  for (let i = 0; i < 25; i++) {
    const s = makeVariant(st.setup, st.vary);
    const B = s.points.B;
    ok(design(s, [-B[0], -B[1]], s.forces[0].magnitude).out.ok, `B ${B}, T ${s.forces[0].magnitude}`);
  }
});

test("Cables build: off-centre skylight; 45°/35° holds (734.4 N, 633.9 N); 39°/35° snaps AB; 45°/36° hits the skylight; must be worked out first", () => {
  const st = find("cables/3-build");
  const solver = getSolver(st.solver);
  const design = (ab, ac, forbidden = [-1.0, 1.4], mass = 90) => {
    const s = clone(st.setup);
    setPath(s, "ceiling.forbidden", forbidden);
    setPath(s, "forces.#W.mass", mass);
    setPath(s, "forces.#T_AB.direction.angle", ab);
    setPath(s, "forces.#T_AC.direction.angle", ac);
    const r = solver.solve(s);
    return { r, out: st.goal.check(r, s) };
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the starting design fails");
  const good = design(45, 35);
  ok(good.out.ok, "45/35 should work");
  close(good.r.values.T_AB, 734.4, 1e-4);
  close(good.r.values.T_AC, 633.9, 1e-4);
  const snap = design(39, 35);
  ok(!snap.out.ok && snap.out.flagged.includes("T_AB"), "39/35 overloads AB (752.4 N)");
  close(snap.r.values.T_AB, 752.4, 1e-4);
  const sky = design(45, 36);
  ok(!sky.out.ok && /skylight/.test(sky.out.message) && !sky.out.flagged.length, "45/36 puts C in the skylight");
  ok(!design(44, 44).out.ok, "the old symmetric answer no longer works");
  ok(design(35, 45, [-1.4, 1.0]).out.ok, "mirrored skylight: 35/45 works");
  // The student must work out both tensions before each Test.
  equal(st.goal.predict.map((a) => a.quantity).join(","), "T_AB,T_AC");
  // The hardest and easiest versions still have designs that work (a few, not most).
  const count = (forbidden, mass) => {
    let n = 0;
    for (let ab = 20; ab <= 80; ab++) for (let ac = 20; ac <= 80; ac++) if (design(ab, ac, forbidden, mass).out.ok) n++;
    return n;
  };
  equal(count([-1.0, 1.4], 90), 8, "1.4 m, 90 kg");
  equal(count([-1.4, 1.0], 90), 8, "mirrored");
  equal(count([-1.0, 1.2], 80), 169, "1.2 m, 80 kg");
});

test("Cables build, balloon: pond −1.0 to +1.4 m; 880 N lift, 45°/35° below level holds (732.0 N, 631.8 N); 45°/36° hits the pond", () => {
  const st = find("cables/3-build", 1, "balloon");
  const solver = getSolver(st.solver);
  const design = (ab, ac, lift = 880, pond = [-1.0, 1.4]) => {
    const s = clone(st.setup);
    setPath(s, "ground.forbidden", pond);
    setPath(s, "forces.#F_L.magnitude", lift);
    setPath(s, "forces.#T_AB.direction.angle", ab);
    setPath(s, "forces.#T_AC.direction.angle", ac);
    const r = solver.solve(s);
    return { r, out: st.goal.check(r, s) };
  };
  const good = design(45, 35);
  ok(good.out.ok, good.out.message);
  close(good.r.values.T_AB, 732.0, 1e-4);
  close(good.r.values.T_AC, 631.8, 1e-4);
  const pond = design(45, 36);
  ok(!pond.out.ok && /pond/.test(pond.out.message), "45/36 puts C in the pond");
  ok(design(35, 45, 880, [-1.4, 1.0]).out.ok, "mirrored pond: 35/45 works");
  // The hardest versions (biggest lift, widest pond, either side) still have designs that work.
  for (const p of [[-1.0, 1.4], [-1.4, 1.0]]) {
    let n = 0;
    for (let ab = 20; ab <= 80; ab++) for (let ac = 20; ac <= 80; ac++) if (design(ab, ac, 880, p).out.ok) n++;
    ok(n >= 8, `pond ${p}: ${n} designs work`);
  }
});

test("Cables predict, every situation: crate 430.9/527.7 N, traffic light 560.5/571.5 N, balloon 345.5/461.4 N, lamp aside 135.9/68.0 N", () => {
  const solver = getSolver("statics.particle");
  const expect = { crate: [430.9, 527.7], "traffic light": [560.5, 571.5], balloon: [345.5, 461.4], "lamp aside": [135.9, 68.0] };
  for (const [name, [ab, ac]] of Object.entries(expect)) {
    const v = solver.solve(find("cables/2-predict", 1, name).setup).values;
    ok(Math.abs(v.T_AB - ab) < 0.05, `${name} T_AB = ${v.T_AB}, expected ${ab}`); // to the 0.1 N the answer box asks for
    ok(Math.abs(v.T_AC - ac) < 0.05, `${name} T_AC = ${v.T_AC}, expected ${ac}`);
  }
});

test("Cables solve, every situation: lamp 140.1/158.6 N, traffic light 272.3/267.5 N, balloon 462.0/431.3 N", () => {
  const solver = getSolver("statics.particle");
  const expect = { lamp: [140.1, 158.6], "traffic light": [272.3, 267.5], balloon: [462.0, 431.3] };
  for (const [name, [ab, ac]] of Object.entries(expect)) {
    const st = find("cables/6-solve", 1, name);
    const v = solver.solve(st.setup).values;
    ok(Math.abs(v.T_AB - ab) < 0.05, `${name} T_AB = ${v.T_AB}, expected ${ab}`); // to the 0.1 N the answer box asks for
    ok(Math.abs(v.T_AC - ac) < 0.05, `${name} T_AC = ${v.T_AC}, expected ${ac}`);
    // Every force on A is in the FBD palette (and the palette's extra forces aren't in the setup).
    for (const f of st.setup.forces) ok(st.solve.candidates.some((c) => c.id === f.id), `${name}: ${f.id} missing from the palette`);
  }
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
  // A part with several situations counts the versions of all of them together.
  const byPart = {};
  for (const { stage } of stages) {
    if (!stage.vary) continue;
    const k = `${stage.id} part ${stage.part.index + 1}`;
    byPart[k] = (byPart[k] || 0) + stage.vary.reduce((n, r) => n * count(r), 1);
  }
  for (const [k, versions] of Object.entries(byPart)) ok(versions >= 50, `${k} has only ${versions} versions`);
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
    course.chapters.forEach((ch, c) => {
      for (const u of ch.units.filter((x) => typeof x !== "string")) ok(u.comingSoon && u.title && u.concept, `a planned unit in ${ch.id} needs a title and a concept`);
      const r = course.reading && course.reading.chapters[ch.id];
      // Chapters match the book chapter for chapter (agreed with the owner): the
      // course's Chapter 5 is read with the book's Chapter 5.
      const booksNumber = r && r.chapter && /^Chapter (\d+)\b/.exec(r.chapter);
      if (booksNumber) equal(Number(booksNumber[1]), c + 1, `${course.id} chapter ${c + 1} (${ch.id}) is read with the book's "${r.chapter}": the numbers must match`);
      if (ch.units.some((u) => typeof u === "string")) ok(r && r.chapter, `chapter ${ch.id} has built units but no textbook chapter in reading.js`);
      if (r && r.url) ok(/^https:\/\//.test(r.url), `chapter ${ch.id}: link must be https`);
    });
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

// ---- Automatic controls, chapter 5 -------------------------------------------------

test("Block diagrams predict: 8·2 with H = 0.25 → T = 3.2; K/(s(s + 3)), H = 1 → 20/(s² + 3s + 20); inner loop → 6/(s + 11)", () => {
  const solver = getSolver("controls.blockDiagram");
  close(solver.solve(find("block-diagrams/2-predict", 1).setup).values.dc, 3.2);
  const v2 = solver.solve(find("block-diagrams/2-predict", 2).setup).values;
  equal([v2.b0, v2.a1, v2.a0], [20, 3, 20]);
  const v3 = solver.solve(find("block-diagrams/2-predict", 3).setup).values;
  close(v3.b0, 6);
  close(v3.a0, 11);
});

test("Block diagrams build: start fails; K = 25, K_t = 0.2 gives 25/(s² + 6s + 25)", () => {
  const st = find("block-diagrams/3-build");
  const solver = getSolver(st.solver);
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok);
  const s = clone(st.setup);
  s.params = { K: 25, Kt: 0.2 };
  ok(st.goal.check(solver.solve(s), s).ok);
});

test("Block diagrams solve: default numbers give T = (10s + 50)/(s² + 8s + 25)", () => {
  const v = getSolver("controls.blockDiagram").solve(find("block-diagrams/6-solve").setup).values;
  equal([v.b1, v.b0, v.a1, v.a0].map((x) => +x.toFixed(9)), [10, 50, 8, 25]);
});

test("Mason predict: 2 paths, 3 loops, 1 pair; build: k = 0.3 gives T = 2; solve: Δ = 4.2, T = 1.929", () => {
  const solver = getSolver("controls.signalFlow");
  const c = solver.solve(find("signal-flow-graphs/2-predict", 1).setup).values;
  equal([c.paths, c.loops, c.pairs], [2, 3, 1]);
  const st = find("signal-flow-graphs/3-build");
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the start should not already work");
  const s = clone(st.setup);
  s.symbols.k.value = 0.3;
  ok(st.goal.check(solver.solve(s), s).ok, "k = 0.3");
  const v = solver.solve(find("signal-flow-graphs/6-solve").setup).values;
  close(v.Delta, 4.2);
  close(v.T, (6 + 0.5 * 4.2) / 4.2);
});

test("controls debug stages: every mutation builds a working with the wrong line in it, and one right fix", () => {
  for (const id of ["block-diagrams/4-debug", "signal-flow-graphs/4-debug"]) {
    const st = find(id);
    const solver = getSolver(st.solver);
    for (const m of st.debug.mutations) {
      const w = solver.debugSteps(st.setup, m);
      ok(w.lines.some((l) => l.id === w.wrong), `${id}: the wrong line is listed`);
      equal(w.fixes.filter((f) => f.correct).length, 1);
      equal(w.corrected.length, w.lines.length);
    }
  }
});

test("controls solve stages: every choice group has exactly one right option, in every version", () => {
  for (const id of ["block-diagrams/6-solve", "signal-flow-graphs/6-solve"]) {
    const st = find(id);
    const solver = getSolver(st.solver);
    for (let i = 0; i < 10; i++) {
      for (const g of solver.choices(makeVariant(st.setup, st.vary))) {
        equal(g.options.filter((o) => o.correct).length, 1, `${id} "${g.title}":`);
        ok(g.options.length >= 2, `${id} "${g.title}" needs a wrong option`);
      }
    }
  }
});

// ---- Distributed loads and supports --------------------------------------

test("Distributed loads explore: 200 → 600 N/m over 6 m gives F_R = 2400 N at x̄ = 3.5 m", () => {
  const st = find("distributed-loads/1-explore");
  const r = getSolver(st.solver).solve(st.setup);
  close(r.values.R, 2400);
  close(r.values.pos, 3.5);
});

test("Distributed loads predict: F_R = ½(600)(6) = 1800 N at x̄ = 4 m; every version's resultant is on the load", () => {
  const st = find("distributed-loads/2-predict");
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

test("Distributed loads build: the start fails; w_F = 2400, w_B = 600 N/m puts 6000 N over the axle; 3000/0 is too far forward", () => {
  const st = find("distributed-loads/3-build");
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

test("Distributed loads debug: F_R = 4100 N and ΣFx̃ = 16100 N·m; every version's load rises left to right", () => {
  const st = find("distributed-loads/4-debug");
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

test("Distributed loads solve: w = 600(x/4)² gives 800 N at 3.00 m; w = 900(x/5)³ gives 1125 N at 4.00 m", () => {
  const st = find("distributed-loads/6-solve");
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

test("Supports explore: the start can't hold the beam; pin + roller gives A_x = −480, A_y = 426.7, B_y = 213.3 N", () => {
  const st = find("supports/1-explore");
  const solver = getSolver(st.solver);
  equal(solver.solve(st.setup).status, "unstable");
  const s = clone(st.setup);
  setPath(s, "supports.#A.type", "pin");
  const r = solver.solve(s);
  equal(r.status, "determinate");
  close(r.values.A_x, -480);
  close(r.values.A_y, 426.6667);
  close(r.values.B_y, 213.3333);
});

test("Supports predict: every version's counts are pin 2, roller/surface/cable 1, fixed 3", () => {
  const st = find("supports/2-predict");
  const solver = getSolver(st.solver);
  const expected = { pin: 2, roller: 1, smooth: 1, cable: 1, fixed: 3 };
  for (const pair of st.vary[0].values) {
    const s = clone(st.setup);
    s.supports = pair;
    const v = solver.solve(s).values;
    equal([v.n_A, v.n_B], [expected[pair[0].type], expected[pair[1].type]], `${pair[0].type} + ${pair[1].type}:`);
    // Every other count has its own explanation.
    for (let n = 0; n <= 3; n++) if (n !== v.n_A) ok(solver.mistakes(s, "n_A").some((m) => m.value === n), `no explanation for ${n} at A (${pair[0].type})`);
  }
});

test("Supports build: pin + roller (either way round) meets the goal; pin + pin, fixed + roller, roller + roller and fixed + nothing don't", () => {
  const st = find("supports/3-build");
  const solver = getSolver(st.solver);
  const tryPair = (a, b) => {
    const s = clone(st.setup);
    setPath(s, "supports.#A.type", a);
    setPath(s, "supports.#B.type", b);
    if (a === "fixed") setPath(s, "supports.#A.normal", [1, 0]);
    return st.goal.check(solver.solve(s), s);
  };
  ok(!st.goal.check(solver.solve(st.setup), st.setup).ok, "the start (pin + pin) must not meet the goal");
  ok(tryPair("pin", "roller").ok && tryPair("roller", "pin").ok);
  ok(/grow longer/.test(tryPair("pin", "pin").message));
  ok(/indeterminate/.test(tryPair("fixed", "roller").message));
  ok(/moves/.test(tryPair("roller", "roller").message));
  ok(/both piers/.test(tryPair("fixed", "none").message));
});

test("Supports debug: T_C = 870.3 N, A_x = 696.2 N, A_y = 372.2 N; each planted mistake changes the FBD as planned", () => {
  const st = find("supports/4-debug");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.T_C, 870.25);
  close(r.values.A_x, 696.2);
  close(r.values.A_y, 372.15);
  const unknowns = (m) => solver.solve(solver.mutate(st.setup, m)).unknowns.length;
  const [extraCx, noAx, reversedT, noW, extraMA] = st.debug.mutations;
  equal([unknowns(extraCx), unknowns(noAx), unknowns(reversedT), unknowns(noW), unknowns(extraMA)], [4, 2, 3, 3, 4]);
  ok(!solver.solve(solver.mutate(st.setup, noW)).equations[1].terms.some((t) => t.id === "W"), "no W in ΣF_y once it's removed");
});

test("Supports solve: A_x = −300 N, A_y = 462.9 N, B_y = 329.5 N; every version's roller pushes", () => {
  const st = find("supports/6-solve");
  const solver = getSolver(st.solver);
  const r = solver.solve(st.setup);
  close(r.values.A_x, -300);
  close(r.values.A_y, 462.8667);
  close(r.values.B_y, 329.5333);
  for (let i = 0; i < 30; i++) ok(solver.solve(makeVariant(st.setup, st.vary)).values.B_y > 0);
});
