// record-file.js — the learning record as a file you can download and load again.
//
// Everything this browser has gathered (finished stages, and every checked
// answer with its timing and kind of mistake) goes into ONE self-describing
// JSON file. It is built to be read back even after the game changes:
//   • every value has a spelled-out name ("course", "stage", "correct" …)
//     instead of the short keys used inside the browser ("c", "s", "ok" …),
//     and the file carries a dictionary saying what each name means;
//   • it carries a snapshot of the game as it was (every course, unit and
//     stage, with titles), so stages that were later renamed or moved can be
//     matched up again by title;
//   • it names its format and version, and says whether it is compressed or
//     encrypted (not yet: "none"), so a later version of the game knows how to
//     read it — or says clearly that it can't;
//   • anything it doesn't recognise is kept, not thrown away.
// Files are anonymous: the only identity is a random record id.
//
// Pure functions (no storage, no page): the home page's data panel uses them.

export const FORMAT = "engineering-mechanics-sandbox/learning-record";
export const FORMAT_VERSION = 1;

// The short keys of an answer event (see evidence.js) and their names in the file.
// `time` is written as an ISO date; everything else as it is.
export const EVENT_FIELDS = [
  { key: "t", name: "time", about: "When the answer was checked (ISO 8601 date and time)." },
  { key: "c", name: "course", about: "Course id, e.g. statics." },
  { key: "u", name: "unit", about: "Unit id (its folder), e.g. force-components." },
  { key: "s", name: "stage", about: "Stage id, <unit>/<file>, e.g. force-components/2-predict." },
  { key: "p", name: "part", about: "Which part of a stage with several parts (0 = the first)." },
  { key: "v", name: "situation", about: "Which situation (picture) this version of the stage used." },
  { key: "ch", name: "challenge", about: "Challenge type: explore, predict, build, debug, concept-check or solve." },
  { key: "r", name: "round", about: "Id of one version (round) of the stage; answers in the same round share it." },
  { key: "q", name: "question", about: "What was answered: a quantity (e.g. T_AB), fbd, equations, choices, debug, design, 'question 3' …; '*' when the answer was shown." },
  { key: "ok", name: "correct", about: "true if the answer was right." },
  { key: "k", name: "mistakeKinds", about: "Kinds of mistake the wrong answer looked like (see dictionaries.mistakeKinds)." },
  { key: "shown", name: "answerShown", about: "true when the student pressed Show answer." },
  { key: "ms", name: "activeMs", about: "Milliseconds spent on this try with the page visible." },
  { key: "h", name: "hiddenMs", about: "Milliseconds the page was hidden (another tab or window) during this try." },
  { key: "chk", name: "checkPress", about: "Which press of a check button in the round (numbers checked together share it)." },
  { key: "a", name: "attempt", about: "Which try at this question it was (1 = the first)." },
];
const BY_KEY = Object.fromEntries(EVENT_FIELDS.map((f) => [f.key, f.name]));
const BY_NAME = Object.fromEntries(EVENT_FIELDS.map((f) => [f.name, f.key]));

export const PROGRESS_FIELDS = [
  { name: "course", about: "Course id." },
  { name: "stage", about: "Stage id, <unit>/<file>." },
  { name: "status", about: "complete (solved without help), practice (needed Show answer) or none." },
  { name: "partsDone", about: "For a stage with several parts: how many parts are finished." },
  { name: "updated", about: "When this was last saved (ISO 8601)." },
];

// ---- Writing ---------------------------------------------------------------------

// One stored event → its tagged form. Unknown keys are kept under `other`.
export function tagEvent(e) {
  const out = {};
  const other = {};
  for (const [k, v] of Object.entries(e)) {
    if (k === "t") out.time = new Date(v).toISOString();
    else if (BY_KEY[k]) out[BY_KEY[k]] = v;
    else other[k] = v;
  }
  if (Object.keys(other).length) out.other = other;
  return out;
}

// The whole file.
//   events:   the stored answer events (evidence.js)
//   progress: the stored progress map { "<course>/<stage id>": { status, partsDone?, updated } }
//   catalog:  the game as it is now: [{ id, title, units: [{ id, title, number, chapter, stages:
//             [{ id, file, title, challenge, parts: [titles] }] }] }]
//   kinds:    the kinds of mistake { id: { area, label } } (diagnosis.js)
//   recordId: this browser's random anonymous id
export function buildRecordFile({ events = [], progress = {}, catalog = [], kinds = {}, recordId, now = new Date() }) {
  return {
    format: FORMAT,
    formatVersion: FORMAT_VERSION,
    encoding: "none", // later: compressed and/or encrypted files will say so here
    about: "An anonymous learning record from the Engineering Mechanics Sandbox: finished stages and every checked answer, with timing and the kind of each mistake.",
    recordId,
    exportedAt: now.toISOString(),
    counts: { events: events.length, progress: Object.keys(progress).length },
    dictionaries: {
      eventFields: EVENT_FIELDS.map(({ name, about }) => ({ name, about })),
      progressFields: PROGRESS_FIELDS,
      mistakeKinds: kinds,
    },
    game: { name: "Engineering Mechanics Sandbox", courses: catalog },
    progress: Object.entries(progress).map(([key, v]) => {
      const i = key.indexOf("/");
      return { course: key.slice(0, i), stage: key.slice(i + 1), ...v };
    }),
    events: events.map(tagEvent),
  };
}

// ---- Reading ---------------------------------------------------------------------

// A friendly error for a file that isn't a learning record (or can't be read yet).
export class RecordFileError extends Error {}

// Stage ids in the file that no longer exist are matched to today's stages by
// title (and challenge type), unit by unit. Returns { stageId: newStageId } and
// { unitId: newUnitId } per course.
function remapIds(fileCourses = [], catalog = []) {
  const stages = {}, units = {};
  for (const fc of fileCourses) {
    const cc = catalog.find((c) => c.id === fc.id);
    if (!cc) continue;
    const allNow = cc.units.flatMap((u) => u.stages.map((s) => ({ ...s, unit: u })));
    for (const fu of fc.units || []) {
      const cu = cc.units.find((u) => u.id === fu.id) || cc.units.find((u) => u.title === fu.title);
      if (cu && cu.id !== fu.id) units[`${fc.id}/${fu.id}`] = cu.id;
      for (const fs of fu.stages || []) {
        if (allNow.some((s) => s.id === fs.id)) continue; // still there
        const match = (cu && cu.stages.find((s) => s.title === fs.title && s.challenge === fs.challenge))
          || allNow.find((s) => s.title === fs.title && s.challenge === fs.challenge && s.unit.title === fu.title);
        if (match) stages[`${fc.id}/${fs.id}`] = match.id;
      }
    }
  }
  return { stages, units };
}

// File object → { events (stored form), progress (stored map), warnings, recordId }.
// catalog: the game as it is now (to match renamed stages).
export function readRecordFile(file, catalog = []) {
  if (!file || typeof file !== "object" || file.format !== FORMAT) {
    throw new RecordFileError("This isn't a learning record from the Engineering Mechanics Sandbox.");
  }
  if (file.encoding && file.encoding !== "none") {
    throw new RecordFileError(`This record is ${file.encoding}; this version of the game can't open it yet.`);
  }
  const warnings = [];
  if (file.formatVersion > FORMAT_VERSION) warnings.push(`The file was made by a newer version of the game (format ${file.formatVersion}); anything this version doesn't understand was kept as it is.`);
  const map = remapIds(file.game && file.game.courses, catalog);
  let moved = 0;
  const stageOf = (course, id) => {
    const to = map.stages[`${course}/${id}`];
    if (to) moved++;
    return to || id;
  };

  const events = [];
  for (const te of file.events || []) {
    const e = {};
    for (const [name, v] of Object.entries(te)) {
      if (name === "time") e.t = typeof v === "number" ? v : Date.parse(v);
      else if (name === "other" && v && typeof v === "object") Object.assign(e, v);
      else if (BY_NAME[name]) e[BY_NAME[name]] = v;
      else e[name] = v; // a field this version doesn't know: kept
    }
    if (!Number.isFinite(e.t) || !e.c) continue; // can't place it in time or in a course
    if (e.s) e.s = stageOf(e.c, e.s);
    if (e.u) e.u = map.units[`${e.c}/${e.u}`] || (e.s ? e.s.split("/")[0] : e.u);
    events.push(e);
  }

  const progress = {};
  for (const p of file.progress || []) {
    if (!p.course || !p.stage) continue;
    const { course, stage, ...rest } = p;
    progress[`${course}/${stageOf(course, stage)}`] = rest;
  }
  if (moved) warnings.push(`${moved} answer(s) were for stages that have since been renamed or moved; they were matched to today's stages by title.`);
  return { events, progress, warnings, recordId: file.recordId || null };
}

// ---- Merging into what the browser already has ------------------------------------

// Both lists together, without doubles (the same answer imported twice), oldest first.
export function mergeEvents(existing, incoming) {
  const sig = (e) => JSON.stringify([e.t, e.c, e.s, e.p ?? null, e.r ?? null, e.q, e.chk ?? null, e.a ?? null, e.ok ?? null]);
  const seen = new Set(existing.map(sig));
  const added = incoming.filter((e) => !seen.has(sig(e)) && seen.add(sig(e)));
  return { events: [...existing, ...added].sort((a, b) => a.t - b.t), added: added.length };
}

const RANK = { none: 0, practice: 1, complete: 2 };

// Progress maps together: the better status wins, and the most parts done.
export function mergeProgress(existing, incoming) {
  const out = { ...existing };
  for (const [key, inc] of Object.entries(incoming)) {
    const cur = out[key];
    if (!cur) {
      out[key] = inc;
      continue;
    }
    const best = (RANK[inc.status] || 0) > (RANK[cur.status] || 0) ? inc.status : cur.status;
    const partsDone = Math.max(cur.partsDone || 0, inc.partsDone || 0);
    const updated = [cur.updated, inc.updated].filter(Boolean).sort().pop();
    out[key] = { ...cur, ...inc, status: best, ...(partsDone ? { partsDone } : {}), ...(updated ? { updated } : {}) };
  }
  return out;
}
