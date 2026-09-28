// runner.js — plays one stage.
//
// It picks the challenge type named in the stage file, gives it a "context"
// (the stage, its solver, the page areas to draw in, and the setup to use),
// and handles what happens when the challenge ends:
//   • solved without help → stage "complete", offer the next stage
//   • answer was shown     → stage "needs practice", offer a NEW version
//                            (different numbers from the stage's `vary` rules,
//                            and a different situation if the stage has several)
// Every version — the first one too — gets random numbers from `vary`, so
// students sitting side by side get different questions and can't copy.
//
// A stage may have several PARTS (see stageParts in content.js). They are
// played in order: finishing a part without help shows "Next part →"; the
// stage is complete after the last part. Showing the answer gives a new
// version of the same part. The part reached is saved, so a student who
// leaves comes back to it.
//
// It also keeps the quiet learning record (core/evidence.js; never shown to
// the student): the stage opening (stageStart) and being left (stageLeave, via
// the leave() it returns), every checked answer (check), "Show answer"
// (showAnswer), hints (hint), an explore summary (exploreAction), the
// optional confidence tap (confidence) and finishing the stage (complete).

import { getSolver } from "./registry.js";
import { getStatus, setStatus, getPartsDone, setPartsDone, markStarted, STATUS } from "./progress.js";
import { stageParts, stageSituations, nextSituation } from "./content.js";
import { makeVariant, clone, getPath } from "./paths.js";
import { recordEvent, newRoundId, activeNow, hiddenNow } from "./evidence.js";
import { isFastGuess } from "./classify.js";
import { createCanvas } from "../render/canvas.js";
import { showExplanation, buildHints, showMessage, showCenterCard } from "../ui/feedback.js";
import { button } from "../ui/controls.js";
import * as explore from "../challenges/explore.js";
import * as predict from "../challenges/predict.js";
import * as build from "../challenges/build.js";
import * as debug from "../challenges/debug.js";
import * as conceptCheck from "../challenges/concept-check.js";
import * as solve from "../challenges/solve.js";

const CHALLENGES = { explore, predict, build, debug, "concept-check": conceptCheck, solve };

// The numbers that made this version (round) of a stage: the value at each
// `vary` path, e.g. { "forces.#W.mass": 20, "forces.#T_AC.direction.angle": 40 }.
// null for a stage without `vary` (its numbers are always the stage file's own).
export function roundParams(stage, setup) {
  if (!setup || !stage.vary || !stage.vary.length) return null;
  const out = {};
  for (const rule of stage.vary) {
    const path = (rule.paths || [rule.path])[0];
    if (path) out[path] = getPath(setup, path) ?? null;
  }
  return out;
}

// view: the stage page from ui/stage-view.js (it owns the DOM)
// key:  progress key, e.g. "statics/force-components/2-predict"
// next: URL of the next stage (or the course page after the last stage)
// nextLabel: its button text, e.g. "Next stage →"
// Returns { leave() }: call it when the student leaves the stage (another
// page, or closing the tab) — it records how long they spent and whether they finished.
export function runStage({ stage: whole, view, key, next, nextLabel = "Next stage →" }) {
  const challenge = CHALLENGES[whole.challenge];
  const parts = stageParts(whole);
  const before = getStatus(key);
  // Start where the student left off, unless the stage is already complete
  // (then replaying starts from part 1).
  let partIndex = before === STATUS.COMPLETE ? 0 : Math.min(getPartsDone(key), parts.length - 1);
  let memory, round, lastSetup;

  // This visit to the stage: opened now; "started" in progress unless it's further along.
  const [courseId, unitId] = key.split("/");
  let where = { c: courseId, u: unitId, s: whole.id, p: partIndex, v: null, ch: whole.challenge, r: null };
  const visit = { since: activeNow(), hidden: hiddenNow(), finished: false, left: false };
  const visitTime = () => ({ ms: Math.round(activeNow() - visit.since), h: Math.round(hiddenNow() - visit.hidden) });
  markStarted(key);
  // ps: the stage's status before this visit (a first try, or coming back to it).
  recordEvent({ e: "stageStart", ...where, ps: before });
  // Explore stages sum up what was changed once per version (see flushExplore).
  let exploreFlush = null;
  const flushExplore = () => {
    if (exploreFlush) exploreFlush();
    exploreFlush = null;
  };

  function startPart(i) {
    partIndex = i;
    memory = {}; // survives new versions of this part (concept-check, debug and situations use it)
    round = 0;
    lastSetup = null;
    startRound();
  }

  function startRound() {
    flushExplore(); // the version being replaced gets its summary first
    // A stage with several situations plays a different one each version
    // (see stageSituations in content.js); the rest of this round uses it.
    const situations = stageSituations(parts[partIndex]);
    const stage = situations[nextSituation(memory, situations.length)];
    const solver = stage.solver ? getSolver(stage.solver) : null;
    // Random numbers for every version (never the same as the last one).
    let setup = stage.setup ? clone(stage.setup) : null;
    if (setup && stage.vary) setup = makeVariant(stage.setup, stage.vary, Math.random, lastSetup);
    lastSetup = setup;

    const el = view.resetBody(stage, { index: partIndex, count: parts.length, titles: parts.map((p) => p.partTitle) });
    // Where this version is, for the quiet record of answers (core/evidence.js).
    // v: the situation's name, or null when the stage has only one.
    where = { c: courseId, u: unitId, s: stage.id, p: partIndex, v: stage.situation ? stage.situation.name : null, ch: stage.challenge, r: newRoundId() };
    const here = where; // (this version's; `where` moves on with the next one)
    // Timing each try (ms): from the start of the version (or the previous
    // check, or "Show answer") to this check, counting only time the page is
    // visible. Numbers checked with one press of Test share one time.
    // core/pace.js judges fast and slow. Time on another tab or window during
    // the try is kept too (h), the same way.
    const clock = { since: activeNow(), hiddenSince: hiddenNow(), lastAt: -Infinity, lastMs: 0, lastHidden: 0, chk: 0, tries: {} };
    const roundStart = clock.since;
    // The numbers behind this version go on its first check (or Show answer) only.
    let params = { rp: roundParams(stage, setup) };
    const paramsOnce = () => {
      const out = params;
      params = {};
      return out;
    };
    const timeTry = () => {
      const now = activeNow();
      if (now - clock.lastAt > 80) {
        // A new press of a check button.
        clock.lastMs = now - clock.since;
        clock.lastHidden = hiddenNow() - clock.hiddenSince;
        clock.since = now;
        clock.hiddenSince = hiddenNow();
        clock.chk++;
      }
      clock.lastAt = now;
      return { ms: Math.round(clock.lastMs), h: Math.round(clock.lastHidden), chk: clock.chk };
    };
    if (stage.expectedTime) here.x = stage.expectedTime; // seconds; a stage can say how long its questions should take
    const ctx = {
      stage, solver, setup, round, memory, el, key,
      canvas: createCanvas(el.figure),
      revealed: false,
      confidence: null, // the optional "Sure / Not sure" tap (ui/confidence.js)
      // "Needs practice" is kept as an internal record only (never shown to the
      // student): it makes the stage start with fresh numbers next time, and
      // a future instructor dashboard can use it.
      // q: which question the answer was shown for ("*" = the whole round).
      markRevealed(q = "*") {
        ctx.revealed = true;
        setStatus(key, STATUS.PRACTICE);
        recordEvent({ ...here, e: "showAnswer", q, shown: true, ...timeTry(), ...paramsOnce() });
      },
      // Challenges call this for every answer they check: { q, ok, kinds }, plus
      // what they know about it (sub, exp, un, tol, pl, ef, dp, gl …; see evidence.js).
      // It's never shown to the student; comprehension.js scores it.
      record({ q, ok, kinds = [], ...detail }) {
        const a = (clock.tries[q] = (clock.tries[q] || 0) + 1); // 1 = first try at this question
        const time = timeTry();
        // A fast guess: the round's first check, within seconds of it starting.
        const fg = time.chk === 1 && isFastGuess(activeNow() - roundStart);
        recordEvent({ ...here, e: "check", q, ok: !!ok, k: ok ? [] : kinds, a, ...time, fg, cf: ctx.confidence, ...detail, ...paramsOnce() });
      },
      // A prediction in an explore stage (challenges/common/predict-first.js): recorded to
      // see how intuition grows, never scored — guessing wrong is part of learning.
      recordGuess({ q, ok, sub, exp }) {
        recordEvent({ ...here, e: "guess", q, ok: !!ok, sub, exp });
      },
      setConfidence(value) {
        ctx.confidence = value;
        recordEvent({ ...here, e: "confidence", cf: value });
      },
      // Hints are pointless once a question is answered; challenges hide them
      // after a correct answer and bring them back for the next question.
      hideHints() {
        el.hints.innerHTML = "";
        el.hintList.innerHTML = "";
      },
      // list: hints for just this step (a solve stage's solve.hints[step]); default the stage's.
      showHints(list = stage.hints) {
        buildHints(el.hints, list, el.hintList, (n) => recordEvent({ ...here, e: "hint", hi: n }));
      },
      explain() {
        showExplanation(el.explanation, stage.explanation);
      },
      // message: optional extra line for the "Stage complete" card
      finish({ message = "" } = {}) {
        el.actions.innerHTML = "";
        ctx.hideHints(); // finished: hints are no longer needed
        if (ctx.revealed) {
          showMessage(el.status, "info", "Your turn", "Now try one on your own, with new numbers.");
          el.actions.appendChild(button("Try a new version →", newRound, "btn btn-play"));
          el.actions.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return;
        }
        if (partIndex + 1 < parts.length) {
          // More parts to go: save the progress, and move on only when the
          // student presses the button (nothing moves by itself).
          setPartsDone(key, partIndex + 1);
          const upNext = parts[partIndex + 1].partTitle;
          showMessage(el.status, "success", `Part ${partIndex + 1} of ${parts.length} done`, upNext ? `Next: ${upNext}` : "");
          el.actions.appendChild(button("Next part →", () => startPart(partIndex + 1), "btn btn-play"));
          el.actions.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return;
        }
        if (parts.length > 1) setPartsDone(key, 0); // (only stages with parts keep a part count)
        setStatus(key, STATUS.COMPLETE);
        view.setStatus(STATUS.COMPLETE);
        flushExplore();
        visit.finished = true;
        recordEvent({ ...here, e: "complete", ...visitTime() });
        const goNext = () => (location.hash = next);
        const openCard = () => showCenterCard({
          title: "Stage complete",
          body: message,
          // A stage with parts may give one explanation for the whole stage.
          explanation: whole.parts && whole.explanation ? whole.explanation : stage.explanation,
          buttons: [
            ...(next ? [{ label: nextLabel, onClick: goNext, primary: true }] : []),
            { label: parts.length > 1 ? "Play it again" : "Play a new version", onClick: playAgain },
          ],
        });
        // Nothing jumps: the student reads the feedback and the picture, and
        // opens the "Stage complete" card when ready. Afterwards the panel
        // keeps Next stage / Play a new version.
        const ready = button("Continue →", () => {
          el.actions.innerHTML = "";
          if (next) el.actions.appendChild(button(nextLabel, goNext, "btn btn-play"));
          el.actions.appendChild(button(parts.length > 1 ? "Play it again" : "Play a new version", playAgain, "btn btn-quiet"));
          openCard();
        }, "btn btn-play");
        el.actions.appendChild(ready);
        el.actions.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
    };
    ctx.showHints();
    challenge.mount(ctx);
    // Explore: one summary of what was changed in this version (logged when
    // the student finishes, leaves or starts another version).
    if (ctx.exploreSummary) exploreFlush = () => recordEvent({ ...here, e: "exploreAction", ex: { ...ctx.exploreSummary(), ms: Math.round(activeNow() - roundStart) } });
  }

  function newRound() {
    round++;
    startRound();
  }

  // After the whole stage: one part → a new version of it; several → from part 1.
  function playAgain() {
    if (parts.length > 1) startPart(0);
    else newRound();
  }

  view.setStatus(getStatus(key));
  startPart(partIndex);

  return {
    // The student left (another page, or the tab closed): once per visit.
    leave() {
      if (visit.left) return;
      visit.left = true;
      flushExplore();
      recordEvent({ ...where, e: "stageLeave", ...visitTime(), fin: visit.finished });
    },
    // Back again without reloading (the browser restored the page from its
    // cache): a new visit.
    resume() {
      if (!visit.left) return;
      Object.assign(visit, { since: activeNow(), hidden: hiddenNow(), left: false });
      recordEvent({ e: "stageStart", ...where, ps: getStatus(key) });
    },
  };
}
