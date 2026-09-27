// evidence.js — a quiet record of every answer, for working out comprehension.
//
// Students just play: complete stages, finish units. In the background, every
// answer they check is written down here — which unit, stage, situation and
// challenge it was, whether it was right, and if not, what kind of mistake it
// looked like (see diagnosis.js). comprehension.js turns this record into a
// score per unit and chapter, and a breakdown of math vs. object errors.
//
// Saved in the browser's localStorage like progress.js (so it stays on this
// computer), wrapped in try/catch, and capped so it never grows without limit.
//
// One event:
//   { t: time (ms), c: course, u: unit, s: stage id, p: part index, v: situation name,
//     ch: challenge type, r: round id (one "version" of a stage), q: which question
//     ("T_AB", "fbd", "debug", "question 3" …), ok: right?, k: [mistake kinds],
//     shown?: true when the student pressed "Show answer" (q is then "*"),
//     ms: how long this try took (see activeNow below), chk: which press of a
//     check button in the round (numbers checked together share it),
//     a: which try at this question it was (1 = first),
//     h: how long the page was hidden during this try — another tab or window }

const KEY = "ems-evidence-v1";
const MAX_EVENTS = 4000; // the oldest are dropped first

function load() {
  try {
    const raw = globalThis.localStorage && localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Storage blocked or full: keep playing without recording.
  }
}

// Add one event (the runner fills in where it happened; see ctx.record).
export function recordEvent(event) {
  const events = load();
  events.push({ t: Date.now(), ...event });
  save(events);
}

export function getEvents() {
  return load();
}

export function clearEvents() {
  save([]);
}

// A new id for each round (version of a stage), so answers can be grouped by it.
export function newRoundId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Time spent -----------------------------------------------------------------
//
// A clock that stops while the page is hidden (another tab, a minimised
// window), so time spent elsewhere doesn't count as time on a question.
// (Time with the page open but nobody there can't be seen; pace.js treats
// very long tries as "away" instead of "slow".)
let hiddenTotal = 0;
let hiddenSince = null;
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hiddenSince = Date.now();
    else if (hiddenSince != null) {
      hiddenTotal += Date.now() - hiddenSince;
      hiddenSince = null;
    }
  });
}

// Milliseconds of time with the page visible (only differences between two
// readings mean anything).
export function activeNow() {
  const now = Date.now();
  return now - hiddenTotal - (hiddenSince != null ? now - hiddenSince : 0);
}

// Milliseconds the page has been hidden so far (differences between readings:
// time spent in another tab or window while working on a question).
export function hiddenNow() {
  return hiddenTotal + (hiddenSince != null ? Date.now() - hiddenSince : 0);
}
