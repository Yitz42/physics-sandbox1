// predict.js — the student enters numbers BEFORE pressing Play.
// Play checks them and reveals the answer on the picture and in the equations.
//
// Tests: can they compute it.
// Stage fields used:
//   ask        { quantity, label?, unit?, tolerance? } or a list of them
//   hints      shown one at a time

import { createWorkspace } from "./common/workspace.js";
import { answerInputs, checkRows } from "./common/answers.js";
import { createAttempts } from "./common/attempts.js";
import { el, button } from "../ui/controls.js";
import { showMessage } from "../ui/feedback.js";

export function mount(ctx) {
  const { stage, solver } = ctx;
  const asks = [].concat(stage.ask);
  const ws = createWorkspace(ctx, { equations: "hidden", reveal: false, sceneOpts: stage.sceneOpts });
  const quantities = solver.quantities ? solver.quantities(ws.setup) : {};

  ctx.el.area.appendChild(el("div", { className: "area-title", textContent: "Your prediction:" }));
  const inputs = answerInputs(ctx.el.area, asks, quantities);
  const actions = el("div", { className: "actions" });
  const play = button("▶ Play", onPlay, "btn btn-play");
  actions.appendChild(play);
  ctx.el.area.appendChild(actions);

  const attempts = createAttempts(ctx, actions, () => {
    inputs.fill(ws.result.values);
    ws.setReveal(true);
    ws.showEquations(true);
    play.disabled = true;
    showMessage(ctx.el.feedback, "info", "Here's the answer", "Study the equations (switch to **Numbers** to see the values substituted). Then try a new version on your own.");
    ctx.explain();
    ctx.finish();
  });

  // Enter key = Play, so students can type and go.
  inputs.rows.forEach((r) => r.input.addEventListener("keydown", (e) => e.key === "Enter" && onPlay()));

  function onPlay() {
    if (inputs.rows.some((r) => !r.done && r.input.value.trim() === "")) {
      showMessage(ctx.el.feedback, "info", "Make your prediction first", "Type a number in every box, then press Play.");
      return;
    }
    const allOk = checkRows(inputs, ws.result, (q) => (solver.mistakes ? solver.mistakes(ws.setup, q) : []));
    if (allOk) {
      play.disabled = true;
      ws.setReveal(true);
      showMessage(ctx.el.feedback, "good", "Correct! ▶", "The picture now shows the solved values. Switch the equations to **Numbers** to see the substitution.");
      ctx.explain();
      ctx.finish();
    } else {
      showMessage(ctx.el.feedback, "bad", "Not yet", "Read the note under each red box, fix it, and press Play again.");
      attempts.wrong();
    }
  }
  inputs.focus();
}
