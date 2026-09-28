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
// One event (short keys, to keep storage small; record-file.js spells them out):
//   e: event type — "stageStart", "stageLeave", "check", "showAnswer", "hint",
//      "exploreAction", "complete", "confidence" or "guess" (an explore prediction, never scored)
//   common to every event:
//     t: time (ms, UTC), tz: the browser's time-zone offset in minutes,
//     sid: session id (random, new each time the game is opened — never a person),
//     av / cv: app and content versions (version.js)
//   where it happened: c: course, u: unit, s: stage id, p: part index,
//     v: situation name (null when the stage has none), ch: challenge type,
//     r: round id (one "version" of a stage)
//   check events: q: which question ("T_AB", "fbd", "debug", "question 3" …),
//     ok: right?, k: [mistake kinds], a: which try at this question (1 = first),
//     ms / h: active and hidden milliseconds since the previous check in this
//     round (or since the round started, for its first check),
//     chk: which press of a check button in the round (numbers checked together
//     share it), fg: fast guess (checked within FAST_GUESS_MS of the round
//     starting), cf: confidence ("sure" / "notSure", or null),
//     sub / exp / un / tol: the answer as entered, the right value, its units
//     and the tolerance used; rp: the numbers that generated this round (on the
//     first check of each round); plus, by challenge: pl / ef (FBD arrows drawn /
//     expected), fl (debug: what was flagged), pick / ans (concept check: the
//     choice picked / the right one), dp (build: the design submitted)
//   showAnswer: q (which question, "*" = the whole round), ms, h, chk
//   hint: hi (which hint, 1 = first)
//   exploreAction: ex { changes, params, ms } — a summary, logged when the
//     student leaves or finishes an explore stage (not every slider move)
//   stageLeave: ms / h (active and hidden time for the whole visit), fin (finished?)

import { migrateEvent } from "./migrations.js";
import { APP_VERSION, CONTENT_VERSION } from "./version.js";

const KEY = "ems-evidence-v1";
export const MAX_EVENTS = 5000; // beyond this, the oldest explore summaries go first, then the oldest events

function load() {
  try {
    const raw = globalThis.localStorage && localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return Array.isArray(data) ? data.map(migrateEvent) : [];
  } catch {
    return [];
  }
}

// Keep storage bounded: drop the oldest exploreAction events first (they're
// the least useful), then the oldest of the rest.
export function compact(events, max = MAX_EVENTS) {
  if (events.length <= max) return events;
  let extra = events.length - max;
  const out = events.filter((e) => {
    if (extra > 0 && e.e === "exploreAction") {
      extra--;
      return false;
    }
    return true;
  });
  return out.slice(-max);
}

function save(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify(compact(events)));
  } catch {
    // Storage blocked or full: keep playing without recording.
  }
}

// A random id for this opening of the game (not tied to a person or device).
export const SESSION_ID = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Add one event (the runner fills in where it happened; see ctx.record).
// Every event gets its type (default "check"), time, time zone, session and versions.
export function recordEvent(event) {
  const events = load();
  events.push({ e: "check", t: Date.now(), tz: -new Date().getTimezoneOffset(), sid: SESSION_ID, av: APP_VERSION, cv: CONTENT_VERSION, ...event });
  save(events);
}

export function getEvents() {
  return load();
}

// Only the answers (checks and "Show answer" presses): what comprehension.js
// and pace.js score. Stage starts, hints, explore summaries … aren't answers.
export function answerEvents(events = load()) {
  return events.filter((e) => e.e === "check" || e.e === "showAnswer");
}

export function clearEvents() {
  try {
    localStorage.setItem(KEY, "[]");
  } catch {
    // storage blocked
  }
}

// Replace the whole record (loading a learning-record file, see record-file.js).
// Returns how many events were kept (at most MAX_EVENTS; see compact).
export function setEvents(events) {
  save(events.map(migrateEvent));
  return Math.min(events.length, MAX_EVENTS);
}

// This browser's anonymous id for its record: random, made once, never a name.
export function getRecordId() {
  const KEY_ID = "ems-record-id";
  try {
    let id = localStorage.getItem(KEY_ID);
    if (!id) {
      id = `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY_ID, id);
    }
    return id;
  } catch {
    return "rec-unsaved";
  }
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
