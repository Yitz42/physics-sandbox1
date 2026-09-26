// runner.js — plays one stage.
//
// It picks the challenge type named in the stage file, gives it a "context"
// (the stage, its solver, the page areas to draw in, and the setup to use),
// and handles what happens when the challenge ends:
//   • solved without help → stage "complete", offer the next stage
//   • answer was shown     → stage "needs practice", offer a NEW version
//                            (different numbers from the stage's `vary` rules)
// Every version — the first one too — gets random numbers from `vary`, so
// students sitting side by side get different questions and can't copy.
//
// A stage may have several PARTS (see stageParts in content.js). They are
// played in order: finishing a part without help shows "Next part →"; the
// stage is complete after the last part. Showing the answer gives a new
// version of the same part. The part reached is saved, so a student who
// leaves comes back to it.

import { getSolver } from "./registry.js";
import { getStatus, setStatus, getPartsDone, setPartsDone, STATUS } from "./progress.js";
import { stageParts } from "./content.js";
import { makeVariant, clone } from "./paths.js";
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

// view: the stage page from ui/stage-view.js (it owns the DOM)
// key:  progress key, e.g. "statics/01-force-vectors/2-predict"
// next: URL of the next stage (or the course page after the last stage)
// nextLabel: its button text, e.g. "Next stage →"
export function runStage({ stage: whole, view, key, next, nextLabel = "Next stage →" }) {
  const challenge = CHALLENGES[whole.challenge];
  const parts = stageParts(whole);
  // Start where the student left off, unless the stage is already complete
  // (then replaying starts from part 1).
  let partIndex = getStatus(key) === STATUS.COMPLETE ? 0 : Math.min(getPartsDone(key), parts.length - 1);
  let stage, solver, memory, round, lastSetup;

  function startPart(i) {
    partIndex = i;
    stage = parts[i];
    solver = stage.solver ? getSolver(stage.solver) : null;
    memory = {}; // survives new versions of this part (concept-check and debug use it)
    round = 0;
    lastSetup = null;
    startRound();
  }

  function startRound() {
    // Random numbers for every version (never the same as the last one).
    let setup = stage.setup ? clone(stage.setup) : null;
    if (setup && stage.vary) setup = makeVariant(stage.setup, stage.vary, Math.random, lastSetup);
    lastSetup = setup;

    const el = view.resetBody(stage, { index: partIndex, count: parts.length, titles: parts.map((p) => p.partTitle) });
    const ctx = {
      stage, solver, setup, round, memory, el, key,
      canvas: createCanvas(el.figure),
      revealed: false,
      // "Needs practice" is kept as an internal record only (never shown to the
      // student): it makes the stage start with fresh numbers next time, and
      // a future instructor dashboard can use it.
      markRevealed() {
        ctx.revealed = true;
        setStatus(key, STATUS.PRACTICE);
      },
      // Hints are pointless once a question is answered; challenges hide them
      // after a correct answer and bring them back for the next question.
      hideHints() {
        el.hints.innerHTML = "";
      },
      showHints() {
        buildHints(el.hints, stage.hints);
      },
      explain() {
        showExplanation(el.explanation, stage.explanation);
      },
      // message: optional extra line for the "Stage complete" card
      finish({ message = "" } = {}) {
        el.actions.innerHTML = "";
        el.hints.innerHTML = ""; // finished: hints are no longer needed
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
        setPartsDone(key, 0);
        setStatus(key, STATUS.COMPLETE);
        view.setStatus(STATUS.COMPLETE);
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
}
