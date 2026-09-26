// predict.js — the student enters numbers BEFORE pressing Test.
// Test checks them and reveals the answer on the picture and in the equations.
//
// Tests: can they compute it.
// Stage fields used:
//   ask        { quantity, label?, unit?, precision? }  (precision: ± allowed, default 0.1) or a list of them
//   hints      shown one at a time
//   correctMessage  (optional) what to say after a correct prediction

import { createWorkspace } from "./common/workspace.js";
import { answerInputs, checkRows, guessesFrom } from "./common/answers.js";
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
  const testBtn = button("Test", onTest, "btn btn-play");
  actions.appendChild(testBtn);
  ctx.el.area.appendChild(actions);

  const attempts = createAttempts(ctx, actions, () => {
    delete ws.sceneOpts.guesses; // the real answer replaces the shadow
    inputs.fill(ws.result.values);
    ws.setReveal(true);
    ws.showEquations(true);
    testBtn.disabled = true;
    showMessage(ctx.el.feedback, "info", "Here's the answer", "Study the equations (switch to **Numbers** to see the values substituted).");
    ctx.explain();
    ctx.finish();
  });

  // Enter key = Test, so students can type and go.
  inputs.rows.forEach((r) => r.input.addEventListener("keydown", (e) => e.key === "Enter" && onTest()));

  function onTest() {
    if (inputs.rows.some((r) => !r.done && r.input.value.trim() === "")) {
      showMessage(ctx.el.feedback, "info", "Make your prediction first", "Type a number in every box, then press Test.");
      return;
    }
    const allOk = checkRows(inputs, ws.result, (q) => (solver.mistakes ? solver.mistakes(ws.setup, q) : []));
    if (allOk) {
      delete ws.sceneOpts.guesses;
      testBtn.disabled = true;
      ws.setReveal(true);
      showMessage(ctx.el.feedback, "good", "Correct!", stage.correctMessage || "The picture now shows the solved values. Switch the equations to **Numbers** to see the substitution.");
      ctx.explain();
      ctx.finish();
    } else {
      // Draw a faint "shadow" of what their numbers would look like.
      ws.sceneOpts.guesses = guessesFrom(inputs);
      ws.redraw();
      showMessage(ctx.el.feedback, "bad", "Not yet", "The faint red dashed arrows show what your numbers would look like — compare them with the picture. Read the note under each red box, fix it, and press Test again.");
      attempts.wrong();
    }
  }
  inputs.focus();
}
