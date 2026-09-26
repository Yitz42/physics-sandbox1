// solve.js — a full textbook problem, step by step:
//   1. draw the free-body diagram   ("fbd")
//   2. choose the right equations   ("equations")
//   3. solve for the unknowns        ("answer")
//
// Tests: can they do the whole process. Stages can skip steps that don't
// apply (Unit 1 has no FBD to draw, so it uses ["equations", "answer"]).
// "Show answer" on any step lets them continue, but then the stage becomes
// "needs practice" and they must finish a new version without help.
//
// Stage fields used:
//   solve: { steps, candidates }   candidates = forces offered in the FBD palette
//   ask:   what to solve for (as in predict)

import { createWorkspace } from "./common/workspace.js";
import { createAttempts } from "./common/attempts.js";
import { createFbdTool } from "./common/fbd-tool.js";
import { createEquationPick } from "./common/equation-pick.js";
import { answerInputs, checkRows } from "./common/answers.js";
import { el, button } from "../ui/controls.js";
import { showMessage } from "../ui/feedback.js";

const STEP_NAMES = { fbd: "Draw the FBD", equations: "Write the equations", answer: "Solve" };
const STEP_INTRO = {
  fbd: "Draw the free-body diagram: isolate the point and show **every** force acting on it.",
  equations: "Choose the correct equation for each direction.",
  answer: "Solve the equations. Enter your answers:",
};

export function mount(ctx) {
  const { stage, solver } = ctx;
  const steps = stage.solve.steps || ["fbd", "equations", "answer"];
  const ws = createWorkspace(ctx, { equations: "hidden", reveal: false, sceneOpts: stage.sceneOpts });

  // Step tracker ("1 Draw the FBD › 2 Write the equations › 3 Solve").
  const tracker = el("ol", { className: "steps" }, steps.map((s) => el("li", { textContent: STEP_NAMES[s] })));
  const intro = el("div", { className: "step-intro" });
  const body = el("div", { className: "step-body" });
  const actions = el("div", { className: "actions" });
  ctx.el.area.append(tracker, intro, body, actions);

  let index = -1;
  let current = null; // the active step's tool (has .reveal())
  const attempts = createAttempts(ctx, actions, () => current && current.reveal());

  const symbolOf = (id) => (ws.setup.forces.find((f) => f.id === id) || { symbol: id }).symbol;
  const wrong = (problems) => {
    showMessage(ctx.el.feedback, "bad", "Not yet", problems.map((p) => "• " + p).join("\n\n"));
    attempts.wrong();
  };

  function next() {
    index++;
    attempts.resetCount();
    [...tracker.children].forEach((li, i) => {
      li.classList.toggle("done", i < index);
      li.classList.toggle("now", i === index);
    });
    if (index >= steps.length) return; // all done: leave the last step's work on screen
    body.innerHTML = "";
    const step = steps[index];
    showMessage(intro, "info", `Step ${index + 1}: ${STEP_NAMES[step]}`, STEP_INTRO[step]);
    ctx.el.feedback.innerHTML = "";

    if (step === "fbd") {
      current = createFbdTool(ctx, ws, stage.solve.candidates, {
        onCorrect: () => {
          ws.sceneOpts.hide = [];
          ws.extraShapes = () => [];
          ws.onPointer = null;
          ws.update();
          showMessage(ctx.el.feedback, "good", "FBD correct ✓", "The unknown forces are shown in orange.");
          setTimeout(next, 900);
        },
        onWrong: wrong,
      });
      body.appendChild(current.element);
    } else if (step === "equations") {
      current = createEquationPick(solver.equations(ws.setup, ws.result), symbolOf, {
        onCorrect: () => {
          ws.showEquations(true);
          showMessage(ctx.el.feedback, "good", "Equations correct ✓", "They're now in the Equations panel. Click a term to see its arrow.");
          setTimeout(next, 900);
        },
        onWrong: wrong,
      });
      body.appendChild(current.element);
    } else if (step === "answer") {
      const inputs = answerInputs(body, [].concat(stage.ask), solver.quantities(ws.setup));
      const check = () => {
        if (checkRows(inputs, ws.result, (q) => solver.mistakes(ws.setup, q))) done(false);
        else wrong(["Read the note under each red box, fix it, and check again."]);
      };
      const checkBtn = button("Check answers", check, "btn btn-play");
      inputs.rows.forEach((r) => r.input.addEventListener("keydown", (e) => e.key === "Enter" && check()));
      body.appendChild(el("div", { className: "actions" }, [checkBtn]));
      current = {
        reveal() {
          inputs.fill(ws.result.values);
          done(true);
        },
      };
      const done = (shown) => {
        checkBtn.remove();
        ws.showEquations(true);
        ws.setReveal(true);
        if (!shown) showMessage(ctx.el.feedback, "good", "Solved! ✓", "Switch the equations to **Numbers** to see every value substituted.");
        ctx.explain();
        next();
        ctx.finish();
      };
      inputs.focus();
    }
  }
  next();
}
