// runner.js — plays one stage.
//
// It picks the challenge type named in the stage file, gives it a "context"
// (the stage, its solver, the page areas to draw in, and the setup to use),
// and handles what happens when the challenge ends:
//   • solved without help → stage "complete", offer the next stage
//   • answer was shown     → stage "needs practice", offer a NEW version
//                            (different numbers from the stage's `vary` rules)

import { getSolver } from "./registry.js";
import { getStatus, setStatus, STATUS } from "./progress.js";
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
export function runStage({ stage, view, key, next, nextLabel = "Next stage →" }) {
  const challenge = CHALLENGES[stage.challenge];
  const solver = stage.solver ? getSolver(stage.solver) : null;
  const memory = {}; // survives new versions during this visit (concept-check uses it)
  let round = 0;
  let lastSetup = null;

  function startRound() {
    // Students who needed help last time start with a fresh version.
    const fresh = round > 0 || getStatus(key) === STATUS.PRACTICE;
    let setup = stage.setup ? clone(stage.setup) : null;
    if (setup && fresh && stage.vary) setup = makeVariant(stage.setup, stage.vary, Math.random, lastSetup);
    lastSetup = setup;

    const el = view.resetBody(stage);
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
        setStatus(key, STATUS.COMPLETE);
        view.setStatus(STATUS.COMPLETE);
        const goNext = () => (location.hash = next);
        const openCard = () => showCenterCard({
          title: "Stage complete",
          body: message,
          explanation: stage.explanation,
          buttons: [
            ...(next ? [{ label: nextLabel, onClick: goNext, primary: true }] : []),
            { label: "Play a new version", onClick: newRound },
          ],
        });
        // Nothing jumps: the student reads the feedback and the picture, and
        // opens the "Stage complete" card when ready. Afterwards the panel
        // keeps Next stage / Play a new version.
        const ready = button("Continue →", () => {
          el.actions.innerHTML = "";
          if (next) el.actions.appendChild(button(nextLabel, goNext, "btn btn-play"));
          el.actions.appendChild(button("Play a new version", newRound, "btn btn-quiet"));
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

  view.setStatus(getStatus(key));
  startRound();
}
