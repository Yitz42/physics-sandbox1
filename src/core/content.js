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
  const p = [];
  if (!stage || typeof stage !== "object") return ["the file must `export default { ... }`"];
  for (const f of ["id", "challenge", "title", "instructions"]) if (!stage[f]) p.push(`missing "${f}"`);
  if (stage.challenge && !CHALLENGES.includes(stage.challenge)) p.push(`unknown challenge "${stage.challenge}"`);
  const needsSolver = stage.challenge !== "concept-check" || stage.setup;
  if (needsSolver && !stage.solver) p.push(`missing "solver"`);
  if (needsSolver && !stage.setup) p.push(`missing "setup"`);
  if (["predict", "solve"].includes(stage.challenge) && !stage.ask) p.push(`${stage.challenge} stages need "ask"`);
  if (stage.challenge === "build" && !(stage.goal && stage.goal.check)) p.push(`build stages need "goal" with a check() function`);
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
