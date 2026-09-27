// build.js — design something that meets a goal with limited parts.
//
// Tests: can they design with it. The student adjusts the parts they're
// allowed to change (sliders / dragging), then presses Test. Results stay
// hidden until Test, so they have to reason rather than just wiggle sliders.
// Design problems have many right answers, so there's no "Show answer" for
// the design — instead each Test explains what's still wrong.
//
// Stage fields used:
//   editable, draggable        what the student may change
//   goal: { text, check(result, setup) → { ok, message, flagged?: [ids] },
//           predict? }
//   goal.predict (optional): numbers the student must work out for THEIR OWN
//     design before it is load-tested, e.g. [{ quantity: "T_AB" }, …] (same
//     format as a predict stage's `ask`). Test checks them first (with the
//     usual slip feedback and shadow arrows), and only a design checked on
//     paper gets tested — so the goal can't be met by guessing slider
//     positions. Changing the design means checking it again. After 2 wrong
//     tries, "Show answer" fills in the numbers for the current design (the
//     stage then counts as "needs practice").

import { createWorkspace } from "./common/workspace.js";
import { answerInputs, checkRows, guessesFrom } from "./common/answers.js";
import { createAttempts } from "./common/attempts.js";
import { el, testButton } from "../ui/controls.js";
import { renderMixed } from "../render/panel.js";
import { showMessage } from "../ui/feedback.js";

export function mount(ctx) {
  const { stage, solver } = ctx;
  const goal = stage.goal;
  let solved = false;
  let playing = false; // true while Test itself is updating the picture
  let ws = null;
  let inputs = null; // the "check it on paper" boxes (goal.predict)

  ws = createWorkspace(ctx, {
    editable: stage.editable,
    draggable: stage.draggable,
    equations: "live",
    reveal: false,
    sceneOpts: stage.sceneOpts,
    onChange: () => {
      if (!ws || solved || playing) return;
      // Any edit after Test hides the results again until the next Test.
      if (ws.reveal) {
        ws.sceneOpts.flagged = [];
        ws.setReveal(false);
        ctx.el.feedback.innerHTML = "";
      }
      // A new design needs its numbers checked again.
      if (inputs) {
        inputs.reset();
        if (ws.sceneOpts.guesses) {
          delete ws.sceneOpts.guesses;
          ws.redraw();
        }
      }
    },
  });

  const goalBox = el("div", { className: "goal" }, [el("div", { className: "area-title", textContent: "Challenge objective:" })]);
  const goalText = el("div");
  renderMixed(goalText, goal.text);
  goalBox.appendChild(goalText);
  ctx.el.area.append(goalBox);

  if (goal.predict) {
    const quantities = solver.quantities ? solver.quantities(ws.setup) : {};
    ctx.el.area.appendChild(el("div", { className: "area-title", textContent: "Check your design on paper first:" }));
    inputs = answerInputs(ctx.el.area, [].concat(goal.predict), quantities);
    inputs.rows.forEach((r) => r.input.addEventListener("keydown", (e) => e.key === "Enter" && onTest()));
  }
  // Test sits at the bottom right of the panel (Continue → replaces it when
  // done); "Show answer" for the paper check appears in `actions`.
  const testBtn = testButton(onTest);
  ctx.el.actions.appendChild(testBtn);
  const actions = el("div", { className: "actions" });
  ctx.el.area.append(actions);

  const attempts = inputs && createAttempts(ctx, actions, () => {
    delete ws.sceneOpts.guesses;
    inputs.fill(ws.result.values);
    ws.redraw();
    showMessage(ctx.el.feedback, "info", "Here are the numbers for this design",
      "Switch the equations to **Numbers** to see how they come out. Now press **Test** to load it — and if you change the design, you'll need to work out its numbers again.");
  });

  // The student's numbers for their own design. Returns true when they're all right.
  function checkPrediction() {
    if (inputs.rows.some((r) => !r.done && !r.input.readOnly && r.input.value.trim() === "")) {
      showMessage(ctx.el.feedback, "info", "Work out your design first", "Type a number in every box, for the design you've set up, then press Test.");
      return false;
    }
    if (inputs.rows.every((r) => r.done || r.input.readOnly)) return true; // checked (or shown) already
    const ok = checkRows(inputs, ws.result, (q) => (solver.mistakes ? solver.mistakes(ws.setup, q) : []), solver.texts && solver.texts.otherwise, ctx.record);
    if (ok) {
      delete ws.sceneOpts.guesses;
      return true;
    }
    ws.sceneOpts.guesses = guessesFrom(inputs); // faint arrows: what their numbers would look like
    ws.redraw();
    showMessage(ctx.el.feedback, "bad", "Check your numbers first",
      "Your numbers don't match this design yet, and a design only gets load-tested once it's been checked on paper. Read the note under each red box, fix it, and press Test again.");
    attempts.wrong();
    return false;
  }

  function onTest() {
    if (inputs && !checkPrediction()) return;
    playing = true;
    const out = goal.check(ws.result, ws.setup);
    ctx.record({ q: "design", ok: !!out.ok, kinds: [] }); // a design that fails isn't a math/object slip
    ws.sceneOpts.flagged = out.flagged || [];
    ws.setReveal(true);
    playing = false;
    if (out.ok) {
      solved = true;
      showMessage(ctx.el.feedback, "good", "Goal met!", out.message || "");
      ctx.explain();
      ctx.finish();
    } else {
      showMessage(ctx.el.feedback, "bad", "Not yet", out.message || "The goal isn't met yet. Adjust and press Test again.");
    }
  }
}
