// content.js — loads courses, units and stages from the content/ folder.
//
// Content files are plain ES modules that `export default` an object, so
// adding a stage means adding a file and listing it in its unit.js — no
// engine changes. See CLAUDE.md, "Stage file format".

const ROOT = "../../content/"; // relative to this file (src/core/)

// content/courses.js lists every course: [{ id, title, subject, description }]
export async function loadCourseList() {
  return (await import(`${ROOT}courses.js`)).default;
}

// A course also loads its subject plug-in, which registers the solvers.
export async function loadCourse(courseId) {
  const course = (await import(`${ROOT}${courseId}/course.js`)).default;
  await import(`../subjects/${course.subject}/index.js`);
  return course;
}

export async function loadUnit(courseId, unitId) {
  const unit = (await import(`${ROOT}${courseId}/${unitId}/unit.js`)).default;
  return { ...unit, id: unitId };
}

export async function loadStage(courseId, unitId, stageFile) {
  const stage = (await import(`${ROOT}${courseId}/${unitId}/${stageFile}.js`)).default;
  const problems = checkStage(stage);
  if (problems.length) throw new Error(`Stage ${unitId}/${stageFile} has problems:\n• ${problems.join("\n• ")}`);
  return stage;
}

// ---- Chapters -------------------------------------------------------------------
//
// A course may group its units into chapters (course.chapters: [{ id, title,
// units: [...] }]). Units are then numbered by chapter: "1.1", "1.2", "2.1" …
// A course without chapters numbers its units 1, 2, 3 …

// { chapter, chapterNumber, number } for a unit, e.g. number "2.3".
export function unitPlace(course, unitId) {
  const chapters = course.chapters || [];
  for (let c = 0; c < chapters.length; c++) {
    const i = chapters[c].units.indexOf(unitId);
    if (i >= 0) return { chapter: chapters[c], chapterNumber: c + 1, number: `${c + 1}.${i + 1}` };
  }
  return { chapter: null, chapterNumber: null, number: String(course.units.indexOf(unitId) + 1) };
}

// The textbook chapter to read with a unit or chapter, or null:
//   { book, chapter, url, free }  url is null for a book that isn't free online
//   (students use their own copy); free is an optional free alternative { title, url }.
export function readingFor(course, chapter) {
  const r = course.reading;
  const entry = r && chapter && r.chapters && r.chapters[chapter.id];
  return entry ? { book: r.book, chapter: entry.chapter, url: entry.url || r.book.url || null, free: r.book.free || null } : null;
}

// Load every stage of a unit (for the unit page's list).
export async function loadUnitStages(courseId, unit) {
  return Promise.all(unit.stages.map((file) => loadStage(courseId, unit.id, file)));
}

const CHALLENGES = ["explore", "predict", "build", "debug", "concept-check", "solve"];

// ---- Stages with several parts ------------------------------------------------
//
// A stage can be split into PARTS, so one stage can test several ideas the same
// way (e.g. a Predict stage: part 1 components, part 2 the unit vector, part 3 a
// force along a cable). The stage file then looks like
//   { id, challenge, title, solver, explanation, parts: [ {...}, {...} ] }
// Each part is written like a whole stage (title, instructions, setup, vary,
// ask, hints, explanation …) and runs one after another. A part takes only
// these from the stage itself, unless it sets its own: the stage's id,
// challenge type and title (always), and its solver (as a default).
// The part's own `title` becomes its `partTitle` (shown as "Part 2 of 3: …").
const SHARED = ["solver"];

// Every part of a stage, each ready to play like a one-part stage. A stage
// without parts is one part: itself (with part = { index: 0, count: 1 }).
export function stageParts(stage) {
  if (!stage.parts) return [{ ...stage, part: { index: 0, count: 1 } }];
  const shared = {};
  for (const k of SHARED) if (stage[k] !== undefined) shared[k] = stage[k];
  return stage.parts.map((p, i) => ({
    ...shared,
    ...p,
    id: stage.id,
    challenge: stage.challenge,
    title: stage.title,
    partTitle: p.title || "",
    part: { index: i, count: stage.parts.length },
  }));
}

// ---- Situations: a different picture each version -----------------------------
//
// A stage (or one of its parts) can give several SITUATIONS: the same idea in
// different settings, each with its own picture — e.g. a crate on two cables,
// a traffic light on two wires, a balloon held down by two tethers. Every new
// version picks a different situation (and then new numbers from its `vary`),
// so students have to think each one through instead of repeating the last.
//   situations: [{ name, instructions?, setup, vary?, ask?, hints?, solve?,
//                  goal?, editable?, explanation? }, …]
// Each situation is written like a stage and replaces the stage's own fields
// that it sets; anything it leaves out comes from the stage.
export function stageSituations(stage) {
  if (!Array.isArray(stage.situations) || !stage.situations.length) return [stage];
  const { situations, ...base } = stage;
  return situations.map((s, i) => ({ ...base, ...s, situation: { index: i, count: situations.length, name: s.name || "" } }));
}

// Which situation the next version uses: every one is seen once, in a random
// order, before any repeats — and never the same one twice in a row.
// memory: an object kept between versions (the runner's part memory).
export function nextSituation(memory, count, random = Math.random) {
  if (count <= 1) return 0;
  if (!memory.situationOrder || !memory.situationOrder.length) {
    const order = [...Array(count).keys()];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // A fresh round must not start with the situation just played.
    if (order[0] === memory.lastSituation) order.push(order.shift());
    memory.situationOrder = order;
  }
  memory.lastSituation = memory.situationOrder.shift();
  return memory.lastSituation;
}

// Catch typos in stage files early, with a readable message.
// Returns a list of problems (empty = fine). Also used by the test page.
export function checkStage(stage) {
  if (stage && Array.isArray(stage.parts)) {
    const p = [];
    for (const f of ["id", "challenge", "title"]) if (!stage[f]) p.push(`missing "${f}"`);
    if (!stage.parts.length) p.push(`"parts" is empty`);
    if (p.length) return p;
    stageParts(stage).forEach((part, i) => {
      for (const msg of checkOne(part)) p.push(`part ${i + 1}: ${msg}`);
    });
    return p;
  }
  return checkOne(stage);
}

function checkOne(stage) {
  if (stage && Array.isArray(stage.situations)) {
    if (!stage.situations.length) return [`"situations" is empty`];
    const p = [];
    stageSituations(stage).forEach((v, i) => {
      for (const msg of checkOne(v)) p.push(`situation ${i + 1}${v.situation.name ? ` (${v.situation.name})` : ""}: ${msg}`);
    });
    return p;
  }
  const p = [];
  if (!stage || typeof stage !== "object") return ["the file must `export default { ... }`"];
  for (const f of ["id", "challenge", "title", "instructions"]) if (!stage[f]) p.push(`missing "${f}"`);
  if (stage.challenge && !CHALLENGES.includes(stage.challenge)) p.push(`unknown challenge "${stage.challenge}"`);
  const needsSolver = stage.challenge !== "concept-check" || stage.setup;
  if (needsSolver && !stage.solver) p.push(`missing "solver"`);
  if (needsSolver && !stage.setup) p.push(`missing "setup"`);
  if (["predict", "solve"].includes(stage.challenge) && !stage.ask) p.push(`${stage.challenge} stages need "ask"`);
  // (The free block diagram workbench is a build stage without a goal.)
  if (stage.challenge === "build" && !stage.workbench && !(stage.goal && stage.goal.check)) p.push(`build stages need "goal" with a check() function`);
  if (stage.workbench && stage.goal && !stage.goal.check) p.push(`a workbench goal needs a check() function`);
  if (stage.challenge === "debug" && !(stage.debug && stage.debug.mutations && stage.debug.mutations.length)) p.push(`debug stages need "debug.mutations"`);
  if (stage.challenge === "concept-check" && !(stage.questions && stage.questions.length)) p.push(`concept-check stages need "questions"`);
  if (stage.challenge === "solve" && !stage.solve) p.push(`solve stages need "solve" (steps, candidates)`);
  if (stage.challenge === "concept-check") {
    (stage.questions || []).forEach((q, i) => {
      if (q.options.filter((o) => o.correct).length !== 1) p.push(`question ${i + 1} must have exactly one correct option`);
    });
  }
  return p;
}
