// record-dictionary.js — what every name in a learning-record file means.
//
// Inside the browser, events use short keys (evidence.js) to save space; the
// file spells them out and carries these explanations, so the file can be
// understood (and read back) long after the game has changed.

import { FAST_GUESS_MS } from "./classify.js";

// How time is counted — the same everywhere (the `about` of activeMs / hiddenMs).
export const TIMING =
  "activeMs counts only time with the game's page visible; hiddenMs counts time it was hidden (another tab or window). " +
  "On a check or showAnswer: the time since the previous check (or Show answer) in the same round, or since the round started for its first one — " +
  "numbers checked with one press of a button share one time. On stageLeave and complete: the whole visit to the stage, since it was opened. " +
  "On exploreAction: since that round (version) started.";

// The short key of each event field and its name in the file.
export const EVENT_FIELDS = [
  { key: "e", name: "eventType", about: "What happened: see dictionaries.eventTypes." },
  { key: "t", name: "time", about: "When it happened (ISO 8601, UTC)." },
  { key: "tz", name: "tzOffsetMin", about: "The browser's time zone, in minutes ahead of UTC (e.g. -240 for UTC−4). Times themselves stay in UTC." },
  { key: "sid", name: "sessionId", about: "Random id, new each time the game is opened (one sitting). Not tied to a person or device." },
  { key: "av", name: "appVersion", about: "Version of the game's code that recorded it." },
  { key: "cv", name: "contentVersion", about: "Version of the stages' content (date of the last change to stage ids or questions), so later renames can be migrated." },
  { key: "c", name: "course", about: "Course id, e.g. statics." },
  { key: "u", name: "unit", about: "Unit id (its folder), e.g. force-components." },
  { key: "s", name: "stage", about: "Stage id, <unit>/<file>, e.g. force-components/2-predict." },
  { key: "p", name: "part", about: "Which part of a stage with several parts (0 = the first; always 0 for a stage without parts)." },
  { key: "v", name: "situation", about: "Which situation (picture) this version of the stage used; null when the stage has only one." },
  { key: "ch", name: "challenge", about: "Challenge type: explore, predict, build, debug, concept-check or solve." },
  { key: "r", name: "round", about: "Id of one version (round) of the stage: the numbers the student got. Events in the same round share it; null before the first round starts." },
  { key: "q", name: "question", about: "What was answered: a quantity (e.g. T_AB), fbd, equations, choices, debug, design, 'question 3' (a concept question's number in the stage's list) …; on showAnswer the question(s) shown, comma-separated, or '*' for the whole round." },
  { key: "ok", name: "correct", about: "true if the answer was right." },
  { key: "k", name: "mistakeKinds", about: "Kinds of mistake the wrong answer looked like (see dictionaries.mistakeKinds); [] when right." },
  { key: "sub", name: "submitted", about: "What the student entered, exactly as typed (a number box: the text typed; concept-check: the choice picked; debug: the item flagged or the fix chosen). The only free text in the file." },
  { key: "exp", name: "expected", about: "The right value (to 6 significant digits), or the right choice / item." },
  { key: "un", name: "units", about: "Units of the answer: N, m, N·m, deg …; null when it has none." },
  { key: "tol", name: "tolerance", about: "How far from `expected` an answer may be and still count as right, in its units (0 = must match exactly)." },
  { key: "rp", name: "roundParams", about: "The numbers that generated this round, by setup path (e.g. {\"forces.#W.mass\": 20}). On the round's first check or showAnswer only; later events refer to it by `round`. null: the stage always uses the same numbers." },
  { key: "fg", name: "fastGuess", about: `true when this was the round's first check and came within ${FAST_GUESS_MS / 1000} seconds of the round starting.` },
  { key: "cf", name: "confidence", about: "The student's optional 'Sure / Not sure' tap before checking: sure, notSure, or null (not asked or not tapped)." },
  { key: "a", name: "attempt", about: "Which try at this question it was (1 = the first)." },
  { key: "ms", name: "activeMs", about: `Milliseconds with the page visible. ${TIMING}` },
  { key: "h", name: "hiddenMs", about: "Milliseconds the page was hidden, over the same span as activeMs." },
  { key: "chk", name: "checkPress", about: "Which press of a check button in the round (numbers checked together share it)." },
  { key: "shown", name: "answerShown", about: "true on a showAnswer event (kept for files and tools from format 1)." },
  { key: "pl", name: "placed", about: "FBD checks: the arrows the student drew, each { id, type, deg } — type: the kind of force (cable, weight, component, push, pull …; notActing for a force that doesn't act there), deg: direction in degrees from +x, counterclockwise; a moment has turn: ccw / cw." },
  { key: "ef", name: "expectedForces", about: "FBD checks: the arrows a correct diagram has, in the same form; either: true where a reaction may be drawn either way." },
  { key: "st", name: "debugStep", about: "Debug checks: find (flagging the mistake) or fix (choosing the correction)." },
  { key: "fl", name: "flagged", about: "Debug fix checks: the item the student had (correctly) flagged as wrong." },
  { key: "dp", name: "design", about: "Build checks (question: design): the design submitted, by setup path — each slider's value and each dragged item's position or size and direction." },
  { key: "gl", name: "goalResult", about: "Build checks: { met, flagged (parts that failed), notes (each reason the goal wasn't met) }." },
  { key: "ex", name: "exploreSummary", about: "exploreAction: { changes (separate adjustments; moving the same control again within a second counts once), params (the setup paths changed), final (their last values), ms (active time in the round) }." },
  { key: "hi", name: "hintNumber", about: "hint: which hint was opened (1 = the first)." },
  { key: "ps", name: "statusBefore", about: "stageStart: the stage's progress status before this visit (none, started, practice or complete)." },
  { key: "fin", name: "finished", about: "stageLeave: true if the stage was completed during this visit." },
  { key: "x", name: "expectedSeconds", about: "Seconds the stage says its questions should take (used to judge pace), when it says so." },
];

export const EVENT_TYPES = [
  { name: "stageStart", about: "A stage was opened. Has statusBefore." },
  { name: "stageLeave", about: "The student left the stage (another page, or closed the tab). Has activeMs, hiddenMs (the whole visit) and finished." },
  { name: "check", about: "One answer checked. Always has attempt, activeMs, hiddenMs, checkPress, correct, mistakeKinds, submitted, expected, units, tolerance, fastGuess and confidence (null where they don't apply); plus the challenge's own details (placed / expectedForces, debugStep / flagged, design / goalResult)." },
  { name: "showAnswer", about: "The student pressed Show answer. question says for what; answerShown is true. The stage then counts as needing practice." },
  { name: "hint", about: "A hint was opened (hintNumber)." },
  { name: "exploreAction", about: "An explore stage's summary for one round (exploreSummary), logged when the student finishes, leaves or starts another round." },
  { name: "complete", about: "The stage was completed without help. activeMs / hiddenMs: the visit so far." },
  { name: "confidence", about: "The student tapped Sure / Not sure (confidence); the next check carries it too." },
  { name: "guess", about: "A prediction in an explore stage, before seeing the answer (question: guess, or task N; submitted: what they predicted; expected: what happened; correct). Recorded to follow intuition, never scored." },
];

export const PROGRESS_FIELDS = [
  { name: "course", about: "Course id." },
  { name: "stage", about: "Stage id, <unit>/<file>." },
  { name: "status", about: "complete (solved without help), practice (needed Show answer), started (opened, not finished) or none." },
  { name: "partsDone", about: "Only for a stage with several parts, when some are done: how many parts are finished." },
  { name: "firstStarted", about: "When the stage was first opened (ISO 8601); missing for stages opened before format 2." },
  { name: "completedAt", about: "When it was first completed (ISO 8601); missing when not complete, or completed before format 2." },
  { name: "updated", about: "When this was last saved (ISO 8601)." },
];

// Fields every event of a type carries in the file (null when there's no value).
export const ALWAYS = {
  "*": ["situation"],
  check: ["attempt", "activeMs", "hiddenMs", "checkPress", "mistakeKinds", "submitted", "expected", "units", "tolerance", "fastGuess", "confidence"],
  showAnswer: ["attempt", "activeMs", "hiddenMs", "checkPress"],
};
