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

// Load every stage of a unit (for the unit page's list).
export async function loadUnitStages(courseId, unit) {
  return Promise.all(unit.stages.map((file) => loadStage(courseId, unit.id, file)));
}

const CHALLENGES = ["explore", "predict", "build", "debug", "concept-check", "solve"];

// Catch typos in stage files early, with a readable message.
// Returns a list of problems (empty = fine). Also used by the test page.
export function checkStage(stage) {
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
