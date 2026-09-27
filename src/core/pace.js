// pace.js — how long answers take, and what that might mean.
//
// Every try is timed (see the clock in runner.js: only time with the page
// visible counts, and time spent on another tab is kept separately). Each
// check of an answer is compared two ways:
//   1. with the time a question of its kind should take (EXPECTED below, or
//      the stage's own expectedTime), and
//   2. with the student's own usual pace (their typical ratio of actual to
//      expected time, once there are enough answers to know it).
// From that come SIGNALS — things worth a look, not proof of anything:
//   fastRight        right first time, far faster than expected
//                    → possibly outside help (AI, a friend, copied answers)
//   fastWrong        wrong, far faster than expected, or several quick wrong
//                    retries in a row → rushing or guessing ("lazy")
//   slow             far slower than expected → struggling with the idea
//   leftPage         left the page during a question, came back and got it
//                    right → possibly looked it up (notes, or AI)
//   fasterThanUsual  far faster than this student's own usual pace
//                    → worth checking someone else isn't doing the work
//   slowerThanUsual  far slower than their usual pace → a sticking point
// Pure functions over the record (evidence.js), so they're easy to test.

// Seconds a first try of each kind should take (a typical student, working it
// out). "number" is per number checked together (two tensions → twice as long).
export const EXPECTED = { number: 60, fbd: 60, equations: 45, choices: 45, debug: 40, concept: 25 };
const FAST = 0.25; // under a quarter of the expected time
const SLOW = 4; // over four times the expected time
const AWAY_MS = 20 * 60 * 1000; // a try over 20 minutes: probably away, not slow
const LEFT_MS = 10 * 1000; // over 10 s on another tab or window
const QUICK_RETRY_MS = 8 * 1000; // a wrong retry this fast is probably a guess
const GUESS_RETRIES = 3; // this many quick wrong retries on one question = guessing
const BASELINE_MIN = 8; // first tries needed before "usual pace" means anything
const UNUSUAL = 3; // three times faster or slower than usual

// What kind of question a record's `q` is.
export function questionType(q) {
  if (["fbd", "equations", "choices", "debug", "design"].includes(q)) return q;
  if (/^question /.test(q)) return "concept";
  return "number";
}

// The record grouped into checks (one press of a check button).
// Each: { r, u, type, numbers, first, ok, ms, h, expected (s), ratio }.
export function checks(events) {
  const map = new Map();
  for (const e of events) {
    if (e.shown || e.ms == null) continue;
    const type = questionType(e.q);
    if (type === "design") continue; // designs are trial and error by nature
    const key = `${e.r}|${e.chk}`;
    let c = map.get(key);
    if (!c) map.set(key, (c = { r: e.r, u: e.u, c: e.c, type, numbers: 0, first: true, ok: true, ms: e.ms, h: e.h || 0, x: e.x, qs: [] }));
    if (type === "number") c.numbers++;
    if (e.a > 1) c.first = false;
    if (!e.ok) c.ok = false;
    c.qs.push(e.q);
  }
  return [...map.values()].map((c) => {
    const expected = c.x || EXPECTED[c.type] * (c.type === "number" ? Math.max(1, c.numbers) : 1);
    return { ...c, expected, ratio: c.ms / 1000 / expected };
  });
}

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// The student's usual pace: the median ratio (actual ÷ expected) of their
// first tries, or null while there are too few to tell.
export function usualPace(events) {
  const firsts = checks(events).filter((c) => c.first && c.ms < AWAY_MS);
  return firsts.length >= BASELINE_MIN ? median(firsts.map((c) => c.ratio)) : null;
}

// Signals for some events (a unit, a course). usual: the student's usual pace
// (from usualPace over the whole course), or null.
// Returns { checks, typical: { type: { seconds, expected } }, counts: { signal: n } }.
export function paceSignals(events, usual = null) {
  const all = checks(events);
  const counts = { fastRight: 0, fastWrong: 0, slow: 0, leftPage: 0, fasterThanUsual: 0, slowerThanUsual: 0, away: 0 };
  for (const c of all) {
    if (c.ms >= AWAY_MS) {
      counts.away++;
      continue;
    }
    if (!c.first) continue; // later tries follow feedback: their times mean less
    if (c.ratio < FAST) counts[c.ok ? "fastRight" : "fastWrong"]++;
    else if (c.ratio > SLOW) counts.slow++;
    if (c.ok && c.h > LEFT_MS) counts.leftPage++;
    if (usual) {
      if (c.ratio < usual / UNUSUAL) counts.fasterThanUsual++;
      else if (c.ratio > usual * UNUSUAL) counts.slowerThanUsual++;
    }
  }
  // Guessing: several quick wrong retries at one question.
  const retries = {};
  for (const e of events) {
    if (e.shown || e.ok || !(e.a > 1) || e.ms == null || e.ms >= QUICK_RETRY_MS) continue;
    const k = `${e.r}|${e.q}`;
    retries[k] = (retries[k] || 0) + 1;
  }
  counts.fastWrong += Object.values(retries).filter((n) => n >= GUESS_RETRIES).length;
  // Typical first-try time per kind of question (median, seconds) vs. expected.
  const typical = {};
  for (const type of Object.keys(EXPECTED)) {
    const cs = all.filter((c) => c.type === type && c.first && c.ms < AWAY_MS);
    if (!cs.length) continue;
    typical[type] = {
      seconds: Math.round(median(cs.map((c) => c.ms / 1000))),
      expected: Math.round(median(cs.map((c) => c.expected))),
      count: cs.length,
    };
  }
  return { checks: all.length, typical, counts, usual };
}

// Plain words for each signal (shown on the comprehension page).
export const SIGNALS = {
  fastRight: { label: "Very fast and right", about: "Right first time in under a quarter of the expected time — possibly outside help (AI, a friend, copied answers)." },
  fastWrong: { label: "Rushing (fast and wrong)", about: "Wrong after only a quick look, or several quick wrong guesses in a row — not working it out." },
  slow: { label: "Much slower than expected", about: "Over four times the expected time — struggling with the idea." },
  leftPage: { label: "Left the page, came back right", about: "More than 10 s on another tab or window during a question, then right — possibly looked it up (notes, or AI)." },
  fasterThanUsual: { label: "Much faster than usual", about: "Three times faster than this student's own usual pace — check someone else isn't doing the work." },
  slowerThanUsual: { label: "Much slower than usual", about: "Three times slower than their usual pace — this may be the sticking point." },
};

export const PACE_RULES = { FAST, SLOW, AWAY_MS, LEFT_MS, QUICK_RETRY_MS, GUESS_RETRIES, BASELINE_MIN, UNUSUAL };
