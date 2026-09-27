// migrations.js — old stage ids → today's, in ONE place.
//
// Stage ids are "<unit folder>/<file>". When units are renamed or reorganised,
// saved progress, stored answers and exported records still hold the old ids.
// They are translated here: when progress is loaded, when answers are loaded,
// and when a record file is imported — so old ids never reach a new export.
//
// History (from git):
//   2026-09-26  "Chapters and one-concept units": the numbered unit folders
//               became named units; every stage file kept its file name.
//   2026-09-27  Units 3.6 and 4.1 joined the chapter structure under new names.

export const UNIT_MIGRATIONS = {
  statics: {
    "01-force-vectors": "force-components",
    "02-particle-equilibrium": "cables",
    "03-moments": "moments",
    "04-couples": "couples",
    "05-equivalent-systems": "equivalent-systems",
    "06-distributed-loads": "distributed-loads",
    "07-supports-fbd": "supports",
  },
};

// Stage-by-stage exceptions (a stage that moved to a different unit or file):
// { course: { "old-unit/2-predict": "new-unit/2-predict" } }. None so far.
export const STAGE_ID_MIGRATIONS = {};

// Today's id for a unit.
export function migrateUnitId(course, unit) {
  return (UNIT_MIGRATIONS[course] && UNIT_MIGRATIONS[course][unit]) || unit;
}

// Today's id for a stage ("unit/file").
export function migrateStageId(course, id) {
  if (typeof id !== "string") return id;
  const exact = STAGE_ID_MIGRATIONS[course] && STAGE_ID_MIGRATIONS[course][id];
  if (exact) return exact;
  const i = id.indexOf("/");
  if (i < 0) return id;
  return `${migrateUnitId(course, id.slice(0, i))}${id.slice(i)}`;
}

// ---- Progress ------------------------------------------------------------------

// Better statuses win when two entries meet: complete > practice > started > none.
export const STATUS_RANK = { none: 0, started: 1, practice: 2, complete: 3 };

const earliest = (a, b) => [a, b].filter(Boolean).sort()[0];
const latest = (a, b) => [a, b].filter(Boolean).sort().pop();

// Two progress entries for the same stage, merged: the better status, the
// latest `updated`, the earliest `firstStarted` and `completedAt`, the most parts done.
export function mergeProgressEntry(a, b) {
  if (!a) return b;
  if (!b) return a;
  const status = (STATUS_RANK[b.status] || 0) > (STATUS_RANK[a.status] || 0) ? b.status : a.status;
  const out = { ...a, ...b, status };
  for (const [k, pick] of [["updated", latest], ["firstStarted", earliest], ["completedAt", earliest]]) {
    const v = pick(a[k], b[k]);
    if (v) out[k] = v;
    else delete out[k];
  }
  const parts = Math.max(a.partsDone || 0, b.partsDone || 0);
  if (parts > 0) out.partsDone = parts;
  else delete out.partsDone;
  return out;
}

// A whole progress map ("<course>/<stage id>" → entry) with every key migrated;
// entries that land on the same key are merged. Returns { map, changed }.
export function migrateProgressMap(map) {
  const out = {};
  let changed = false;
  for (const [key, entry] of Object.entries(map || {})) {
    const i = key.indexOf("/");
    const course = key.slice(0, i);
    const to = `${course}/${migrateStageId(course, key.slice(i + 1))}`;
    if (to !== key) changed = true;
    if (out[to]) changed = true;
    out[to] = mergeProgressEntry(out[to], entry);
    // partsDone only when some parts are done (older saves wrote 0 for every stage)
    if ("partsDone" in out[to] && !(out[to].partsDone > 0)) {
      out[to] = { ...out[to] };
      delete out[to].partsDone;
      changed = true;
    }
  }
  return { map: out, changed };
}

// ---- Answer events ---------------------------------------------------------------

// One stored event with today's ids, and the fields every event must have.
// (Short keys: see evidence.js.) Old events had no type: a "Show answer"
// press or an answer check.
export function migrateEvent(e) {
  const out = { ...e };
  if (!out.e) out.e = out.shown ? "showAnswer" : "check";
  if (out.c && out.s) out.s = migrateStageId(out.c, out.s);
  if (out.c && out.u) out.u = migrateUnitId(out.c, out.u);
  if (out.v === "" || out.v === undefined) out.v = null; // no situation: null, never ""
  if (out.e === "check" || out.e === "showAnswer") {
    for (const k of ["a", "ms", "h", "chk"]) if (out[k] === undefined) out[k] = null;
  }
  return out;
}
