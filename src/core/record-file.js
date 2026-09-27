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
//   • old stage ids are translated (migrations.js), on the way out and on the
//     way in, so a file never carries ids the game no longer uses.
// Files are anonymous: the only identities are a random record id and random
// session ids; the only free text is what was typed into answer boxes.
//
// Format history:
//   1  answers (checks and Show answer) and progress
//   2  every event has a type (stage start / leave, check, show answer, hint,
//      explore summary, complete, confidence), a session id, versions and the
//      time zone; checks keep what was typed, the right value, units,
//      tolerance and the round's numbers; progress has "started",
//      firstStarted and completedAt. Format-1 files still load.
//
// Pure functions (no storage, no page): the home page's data panel uses them.

import { EVENT_FIELDS, EVENT_TYPES, PROGRESS_FIELDS, ALWAYS, TIMING } from "./record-dictionary.js";
import { migrateEvent, migrateProgressMap, migrateStageId, migrateUnitId, mergeProgressEntry } from "./migrations.js";

export { EVENT_FIELDS, PROGRESS_FIELDS };
export const FORMAT = "engineering-mechanics-sandbox/learning-record";
export const FORMAT_VERSION = 2;

const BY_KEY = Object.fromEntries(EVENT_FIELDS.map((f) => [f.key, f.name]));
const BY_NAME = Object.fromEntries(EVENT_FIELDS.map((f) => [f.name, f.key]));

// ---- Writing ---------------------------------------------------------------------

// One stored event → its tagged form. Unknown keys are kept under `other`.
// Fields its type always has (record-dictionary.js ALWAYS) are written as null
// when there's no value, so every check looks the same.
export function tagEvent(stored) {
  const e = migrateEvent(stored);
  const out = {};
  const other = {};
  for (const [k, v] of Object.entries(e)) {
    if (k === "t") out.time = new Date(v).toISOString();
    else if (BY_KEY[k]) out[BY_KEY[k]] = v;
    else other[k] = v;
  }
  for (const name of [...ALWAYS["*"], ...(ALWAYS[out.eventType] || [])]) if (out[name] === undefined) out[name] = null;
  if (Object.keys(other).length) out.other = other;
  return out;
}

// Stages that have parts, by "<course>/<stage id>" (from the catalog).
function stagesWithParts(catalog) {
  const out = new Set();
  for (const c of catalog) for (const u of c.units || []) for (const s of u.stages || []) if ((s.parts || []).length > 1) out.add(`${c.id}/${s.id}`);
  return out;
}

// The whole file.
//   events:   the stored events (evidence.js)
//   progress: the stored progress map { "<course>/<stage id>": { status, partsDone?, updated, … } }
//   catalog:  the game as it is now: [{ id, title, units: [{ id, title, number, chapter, stages:
//             [{ id, file, title, challenge, parts: [titles] }] }] }]
//   kinds:    the kinds of mistake { id: { area, label } } (diagnosis.js)
//   recordId: this browser's random anonymous id
export function buildRecordFile({ events = [], progress = {}, catalog = [], kinds = {}, recordId, now = new Date() }) {
  // Today's ids only; partsDone only where the stage has parts (and some are done).
  const withParts = stagesWithParts(catalog);
  const known = catalog.length > 0;
  const prog = Object.entries(migrateProgressMap(progress).map).map(([key, v]) => {
    const i = key.indexOf("/");
    const entry = { course: key.slice(0, i), stage: key.slice(i + 1), ...v };
    if (!(entry.partsDone > 0) || (known && !withParts.has(key))) delete entry.partsDone;
    return entry;
  });
  return {
    format: FORMAT,
    formatVersion: FORMAT_VERSION,
    encoding: "none", // later: compressed and/or encrypted files will say so here
    about: "An anonymous learning record from the Engineering Mechanics Sandbox: stages opened and finished, and every checked answer, hint, Show answer and explore session, with timing and the kind of each mistake.",
    recordId,
    exportedAt: now.toISOString(),
    counts: { events: events.length, progress: prog.length },
    dictionaries: {
      eventTypes: EVENT_TYPES,
      eventFields: EVENT_FIELDS.map(({ name, about }) => ({ name, about })),
      timing: TIMING,
      progressFields: PROGRESS_FIELDS,
      mistakeKinds: kinds,
    },
    game: { name: "Engineering Mechanics Sandbox", courses: catalog },
    progress: prog,
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
  // Old ids: first the migration table (migrations.js), then, for stages
  // renamed since the file was made, a match by title.
  const stageOf = (course, id) => {
    const migrated = migrateStageId(course, id);
    const to = map.stages[`${course}/${migrated}`];
    if (to) moved++;
    return to || migrated;
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
    if (e.u) e.u = map.units[`${e.c}/${e.u}`] || (e.s ? e.s.split("/")[0] : migrateUnitId(e.c, e.u));
    // Format 1 had no event types (a check, or Show answer) and left some
    // fields out: fill them in (null) — see migrateEvent.
    events.push(migrateEvent(e));
  }

  // Two old entries can land on the same stage: they are merged (migrations.js).
  const raw = {};
  for (const p of file.progress || []) {
    if (!p.course || !p.stage) continue;
    const { course, stage, ...rest } = p;
    const key = `${course}/${stageOf(course, stage)}`;
    raw[key] = mergeProgressEntry(raw[key], rest);
  }
  const progress = migrateProgressMap(raw).map;
  if (moved) warnings.push(`${moved} answer(s) were for stages that have since been renamed or moved; they were matched to today's stages by title.`);
  return { events, progress, warnings, recordId: file.recordId || null };
}

// ---- Merging into what the browser already has ------------------------------------

// Both lists together, without doubles (the same event imported twice), oldest first.
export function mergeEvents(existing, incoming) {
  const sig = (e) => JSON.stringify([e.e ?? null, e.t, e.c, e.s, e.p ?? null, e.r ?? null, e.q ?? null, e.chk ?? null, e.a ?? null, e.ok ?? null]);
  const seen = new Set(existing.map(sig));
  const added = incoming.filter((e) => !seen.has(sig(e)) && seen.add(sig(e)));
  return { events: [...existing, ...added].sort((a, b) => a.t - b.t), added: added.length };
}

// Progress maps together, stage by stage: the better status, the latest
// update, the earliest start and completion, the most parts done (migrations.js).
export function mergeProgress(existing, incoming) {
  const out = { ...existing };
  for (const [key, inc] of Object.entries(incoming)) out[key] = mergeProgressEntry(out[key], inc);
  return out;
}
