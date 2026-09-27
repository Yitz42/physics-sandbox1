// comprehension.js — turns the record of answers (evidence.js) into
// comprehension scores for each unit, chapter and course, and a breakdown of
// the mistakes: math, object and physics errors (diagnosis.js). Pure functions:
// they take the events and return numbers, so they're easy to test.
//
// How a unit's score is worked out:
//   • Every question in a version of a stage (each number asked for, each FBD,
//     each debug, each concept question) scores
//         1.0  right first time
//         0.6  right after one wrong try
//         0.3  right after two or more
//         0    finished only with "Show answer"
//     (questions left unfinished don't count, and build designs don't either:
//     trial and error is part of designing; their worked-out numbers do count).
//   • The unit's comprehension is the average of its 20 most recent questions,
//     so it follows the student as they improve.
// A chapter's score is the average of its units that have answers; a course's,
// the average of its chapters.

import { errorKind, AREAS } from "./diagnosis.js";
import { paceSignals, usualPace } from "./pace.js";

const RECENT = 20; // questions per unit that count
const NOT_SCORED = new Set(["design"]);

// Only answer checks and "Show answer" presses are scored (not stage starts,
// hints, explore summaries …). Events from before event types had none: all answers.
export const isAnswer = (e) => !e.e || e.e === "check" || e.e === "showAnswer";

const scoreFor = (wrongs) => (wrongs === 0 ? 1 : wrongs === 1 ? 0.6 : 0.3);

// Each finished question: { u, s, v, ch, score, end } (end: its position in the record).
export function questionScores(events) {
  const shownAt = {}; // round → index of its first "Show answer"
  const groups = new Map(); // round|question → { meta, wrongs, okAt }
  events.forEach((e, i) => {
    if (!isAnswer(e)) return;
    if (e.shown) {
      if (shownAt[e.r] == null) shownAt[e.r] = i;
      return;
    }
    if (NOT_SCORED.has(e.q)) return;
    const key = `${e.r}|${e.q}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { meta: e, wrongs: 0, okAt: null }));
    if (g.okAt != null) return; // already answered right
    if (e.ok) g.okAt = i;
    else g.wrongs++;
  });
  const out = [];
  for (const g of groups.values()) {
    const shown = shownAt[g.meta.r];
    let score, end;
    if (g.okAt != null) {
      end = g.okAt;
      score = shown != null && shown < g.okAt ? 0 : scoreFor(g.wrongs); // right only after seeing the answer
    } else if (shown != null) {
      end = shown;
      score = 0;
    } else continue; // unfinished
    const { c, u, s, v, ch } = g.meta;
    out.push({ c, u, s, v, ch, score, end });
  }
  return out.sort((a, b) => a.end - b.end);
}

// The mistakes in some events: by area (math / object / physics / unknown) and by kind,
// most frequent first. `rounds` = in how many different versions it happened
// (the same slip in several problems is a pattern, not a one-off).
export function mistakeBreakdown(events) {
  const byArea = { math: 0, object: 0, physics: 0, unknown: 0 };
  const kinds = {};
  for (const e of events) {
    if (e.ok || e.shown || !e.k || !isAnswer(e)) continue;
    for (const k of e.k) {
      const info = errorKind(k);
      byArea[info.area]++;
      const row = (kinds[k] ||= { kind: k, label: info.label, area: info.area, count: 0, rounds: new Set() });
      row.count++;
      row.rounds.add(e.r);
    }
  }
  const byKind = Object.values(kinds)
    .map((r) => ({ ...r, rounds: r.rounds.size }))
    .sort((a, b) => b.count - a.count || b.rounds - a.rounds);
  const total = byArea.math + byArea.object + byArea.physics + byArea.unknown;
  return { total, byArea, byKind };
}

// A word for a score, e.g. 72 → "Good". Few answers → "Just started".
export function levelOf(score, answered) {
  if (score == null || answered === 0) return "Not started";
  if (answered < 3) return "Just started";
  if (score >= 85) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 40) return "Developing";
  return "Needs work";
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// One unit: { score (0–100 or null), answered, types (challenge types seen),
// situations (different problems seen), level, mistakes, pace (pace.js) }.
// usual: the student's usual pace across the course (pace.js usualPace), or null.
export function unitComprehension(events, courseId, unitId, usual = null) {
  const mine = events.filter((e) => e.c === courseId && e.u === unitId);
  const qs = questionScores(mine);
  const recent = qs.slice(-RECENT);
  const m = mean(recent.map((q) => q.score));
  const score = m == null ? null : Math.round(m * 100);
  return {
    score,
    answered: qs.length,
    types: new Set(qs.map((q) => q.ch)).size,
    situations: new Set(qs.map((q) => `${q.s}|${q.v || ""}`)).size,
    level: levelOf(score, qs.length),
    mistakes: mistakeBreakdown(mine),
    pace: paceSignals(mine, usual),
  };
}

// A whole course, chapter by chapter.
//   course: { id, chapters: [{ id, title, units: [folder | { title, comingSoon }] }] }
//   units:  loaded unit objects ({ id, title }) for the built ones
export function courseComprehension(events, course, units = []) {
  const byId = Object.fromEntries(units.map((u) => [u.id, u]));
  const mine = events.filter((e) => e.c === course.id);
  const usual = usualPace(mine); // this student's usual pace, to spot answers far off it
  const chapters = (course.chapters || [{ id: "all", title: course.title, units: course.units || [] }]).map((ch, c) => {
    const list = ch.units.map((u, i) => {
      const number = `${c + 1}.${i + 1}`;
      if (typeof u !== "string") return { number, title: u.title, comingSoon: true };
      return { number, id: u, title: (byId[u] && byId[u].title) || u, ...unitComprehension(events, course.id, u, usual) };
    });
    const scored = list.filter((u) => u.score != null);
    const score = scored.length ? Math.round(mean(scored.map((u) => u.score))) : null;
    const answered = scored.reduce((n, u) => n + u.answered, 0);
    return {
      id: ch.id, title: ch.title, number: c + 1, units: list, score, answered,
      built: list.filter((u) => !u.comingSoon).length, tried: scored.length,
      level: levelOf(score, answered),
    };
  });
  const scored = chapters.filter((c) => c.score != null);
  const score = scored.length ? Math.round(mean(scored.map((c) => c.score))) : null;
  const answered = scored.reduce((n, c) => n + c.answered, 0);
  return { score, answered, level: levelOf(score, answered), chapters, mistakes: mistakeBreakdown(mine), pace: paceSignals(mine, usual) };
}

export { AREAS };
