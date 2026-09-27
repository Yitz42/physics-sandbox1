// progress.js — remembers which stages each student has opened and finished.
//
// Saved in the browser's localStorage, so progress survives closing the tab
// but stays on this computer. Every access is wrapped in try/catch because
// private windows and some school computers block storage; the game must
// still work there (it just won't remember).
//
// Each stage has one of four statuses (a better one is never replaced by a worse one):
//   "none"      not opened yet (nothing saved)
//   "started"   opened, not finished
//   "practice"  the student needed "Show answer"; they must solve a fresh
//               version on their own before the stage counts as done
//   "complete"  solved without help
// An entry also keeps: updated (last save), firstStarted (first opened),
// completedAt (first completed) and, for a stage with several parts only,
// partsDone (how many parts are finished, so a student comes back to the part
// they were on).
//
// Old stage ids (from before a reorganisation) are translated when progress
// is loaded — see migrations.js.

import { clearEvents } from "./evidence.js";
import { migrateProgressMap, STATUS_RANK } from "./migrations.js";

const KEY = "ems-progress-v1";

export const STATUS = { NONE: "none", STARTED: "started", PRACTICE: "practice", COMPLETE: "complete" };

function load() {
  try {
    const raw = globalThis.localStorage && localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : {};
    const { map, changed } = migrateProgressMap(data);
    if (changed) save(map); // old ids are fixed once, for good
    return map;
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage blocked or full: keep playing without saving.
  }
}

const nowIso = () => new Date().toISOString();

// key is "<course>/<stage id>", e.g. "statics/force-components/2-predict".
export function getStatus(key) {
  const entry = load()[key];
  return entry ? entry.status : STATUS.NONE;
}

// Never downgrades: once complete, a later "Show answer" doesn't undo it; a
// stage in practice doesn't go back to merely "started".
export function setStatus(key, status) {
  const data = load();
  const cur = data[key] || {};
  if ((STATUS_RANK[cur.status] || 0) > (STATUS_RANK[status] || 0)) return;
  const now = nowIso();
  data[key] = { ...cur, status, updated: now };
  // First opened now — unless the entry is from before these dates were kept
  // (it has a status but no firstStarted): then the date is unknown, not now.
  if (!cur.firstStarted && !cur.status) data[key].firstStarted = now;
  // First completed now (a stage completed before these dates were kept stays without one).
  if (status === STATUS.COMPLETE && cur.status !== STATUS.COMPLETE) data[key].completedAt = now;
  save(data);
}

// The stage was opened: "started" (unless it's already further along).
export function markStarted(key) {
  setStatus(key, STATUS.STARTED);
}

// Stages with several parts: how many parts the student has finished.
export function getPartsDone(key) {
  const entry = load()[key];
  return (entry && entry.partsDone) || 0;
}

// Only for stages that HAVE parts; 0 removes it (the stage was finished).
export function setPartsDone(key, n) {
  const data = load();
  const entry = { status: STATUS.STARTED, ...data[key], updated: nowIso() };
  if (n > 0) entry.partsDone = n;
  else delete entry.partsDone;
  data[key] = entry;
  save(data);
}

// The whole progress map, and replacing it (loading a learning-record file).
export function getAllProgress() {
  return load();
}
export function setAllProgress(data) {
  save(migrateProgressMap(data).map);
}

// "Reset my progress" also clears the record of answers behind the comprehension page.
export function resetAll() {
  save({});
  clearEvents();
}
