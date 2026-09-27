// progress.js — remembers which stages each student has finished.
//
// Saved in the browser's localStorage, so progress survives closing the tab
// but stays on this computer. Every access is wrapped in try/catch because
// private windows and some school computers block storage; the game must
// still work there (it just won't remember).
//
// Each stage has one of three statuses:
//   (nothing)   not tried yet
//   "practice"  the student needed "Show answer"; they must solve a fresh
//               version on their own before the stage counts as done
//   "complete"  solved without help

const KEY = "ems-progress-v1";

export const STATUS = { NONE: "none", PRACTICE: "practice", COMPLETE: "complete" };

function load() {
  try {
    const raw = globalThis.localStorage && localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
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

// key is "<course>/<stage id>", e.g. "statics/force-components/2-predict".
export function getStatus(key) {
  const entry = load()[key];
  return entry ? entry.status : STATUS.NONE;
}

export function setStatus(key, status) {
  const data = load();
  // Never downgrade: once complete, a later "Show answer" doesn't undo it.
  if (data[key] && data[key].status === STATUS.COMPLETE && status !== STATUS.COMPLETE) return;
  data[key] = { ...data[key], status, updated: new Date().toISOString() };
  save(data);
}

// Stages with several parts: how many parts the student has finished, so a
// student who leaves halfway comes back to the part they were on.
export function getPartsDone(key) {
  const entry = load()[key];
  return (entry && entry.partsDone) || 0;
}

export function setPartsDone(key, n) {
  const data = load();
  data[key] = { status: STATUS.NONE, ...data[key], partsDone: n, updated: new Date().toISOString() };
  save(data);
}

export function resetAll() {
  save({});
}
