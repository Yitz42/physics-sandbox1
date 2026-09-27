// solve.js — a full textbook problem, step by step:
//   1. draw the free-body diagram   ("fbd")
//   2. choose the right equations   ("equations")
//      or choose each line of the working, from the solver ("choices": e.g. each
//      step of a block diagram reduction; needs solver.choices)
//   3. solve for the unknowns        ("answer")
//
// Tests: can they do the whole process. Stages can skip steps that don't
// apply (Unit 1 has no FBD to draw, so it uses ["equations", "answer"]).
// "Show answer" on any step lets them continue, but then the stage becomes
// "needs practice" and they must finish a new version without help.
//
// Stage fields used:
//   solve: { steps, candidates, choicesName, intros? }   candidates = forces offered in the FBD
//          palette; choicesName = what the "choices" step is called (e.g. "Reduce the diagram");
//          intros: { fbd: "…" } replaces a step's standard introduction
//   ask:   what to solve for (as in predict)

import { createWorkspace } from "./common/workspace.js";
import { createAttempts } from "./common/attempts.js";
import { createFbdTool } from "./common/fbd-tool.js";
import { createEquationPick } from "./common/equation-pick.js";
import { createChoicePick } from "./common/choice-pick.js";
import { answerInputs, checkRows, guessesFrom } from "./common/answers.js";
import { el, button } from "../ui/controls.js";
import { showMessage } from "../ui/feedback.js";

const STEP_NAMES = { fbd: "Draw the FBD", equations: "Write the equations", choices: "Work it out", answer: "Solve" };
const STEP_INTRO = {
  fbd: "Draw the free-body diagram: isolate the point and show **every** force acting on it.",
  equations: "Choose the correct equation in each group.",
  choices: "Choose the correct line in each group.",
  answer: "Solve the equations. Enter your answers:",
};

export function mount(ctx) {
  const { stage, solver } = ctx;
  const steps = stage.solve.steps || ["fbd", "equations", "answer"];
  const names = { ...STEP_NAMES, ...(stage.solve.choicesName ? { choices: stage.solve.choicesName } : {}) };
  const ws = createWorkspace(ctx, { equations: "hidden", reveal: false, sceneOpts: stage.sceneOpts });

  // Step tracker ("1 Draw the FBD › 2 Write the equations › 3 Solve").
  const tracker = el("ol", { className: "steps" }, steps.map((s) => el("li", { textContent: names[s] })));
  const intro = el("div", { className: "step-intro" });
  const body = el("div", { className: "step-body" });
  const actions = el("div", { className: "actions" });
  ctx.el.area.append(tracker, intro, body, actions);

  let index = -1;
  let current = null; // the active step's tool (has .reveal())
  const attempts = createAttempts(ctx, actions, () => current && current.reveal());

  // A term's symbol, for messages: from the setup's forces, else from the
  // equations themselves (support reactions, pieces of a distributed load …).
  const symbolOf = (id) => {
    const f = (ws.setup.forces || []).find((x) => x.id === id);
    if (f) return f.symbol;
    const t = solver.equations(ws.setup, ws.result).flatMap((e) => e.terms).find((x) => x.id === id);
    return t ? t.symbol : id;
  };
  const wrong = (problems) => {
    showMessage(ctx.el.feedback, "bad", "Not yet", problems.map((p) => "• " + p).join("\n\n"));
    attempts.wrong();
  };
  // A step's check, for the comprehension record (the answer step records each
  // number itself, in checkRows). kinds: what sort of mistakes (core/diagnosis.js).
  const stepWrong = (problems, kinds = []) => {
    ctx.record({ q: steps[index], ok: false, kinds: kinds.length ? kinds : ["unexplained"] });
    wrong(problems);
  };
  const stepRight = () => ctx.record({ q: steps[index], ok: true, kinds: [] });

  // After a step is right, let the student read the feedback, then move on
  // when THEY are ready (no automatic jump).
  function waitForNext() {
    actions.innerHTML = "";
    const b = button("Next step →", () => {
      actions.innerHTML = "";
      next();
    }, "btn btn-play");
    actions.appendChild(b);
    b.focus();
  }

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
    // A stage can word a step's introduction itself (solve.intros), e.g. "isolate the beam".
    showMessage(intro, "info", `Step ${index + 1}: ${names[step]}`, (stage.solve.intros || {})[step] || STEP_INTRO[step]);
    ctx.el.feedback.innerHTML = "";

    if (step === "fbd") {
      current = createFbdTool(ctx, ws, stage.solve.candidates, {
        onCorrect: () => {
          stepRight();
          ws.sceneOpts.hide = [];
          ws.extraShapes = () => [];
          ws.onPointer = null;
          ws.update();
          showMessage(ctx.el.feedback, "good", "FBD correct ✓", "The unknown forces are shown in orange.");
          waitForNext();
        },
        onWrong: stepWrong,
      });
      body.appendChild(current.element);
    } else if (step === "equations") {
      current = createEquationPick(solver.equations(ws.setup, ws.result), symbolOf, {
        mode: stage.solve.equationMode || "symbolic",
        onCorrect: () => {
          stepRight();
          ws.showEquations(true);
          showMessage(ctx.el.feedback, "good", "Equations correct ✓", "They're now in the Equations panel. Click a term to see its arrow.");
          waitForNext();
        },
        onWrong: stepWrong,
      });
      body.appendChild(current.element);
    } else if (step === "choices") {
      current = createChoicePick(solver.choices(ws.setup, ws.result), {
        onCorrect: () => {
          stepRight();
          ws.showEquations(true);
          ws.setReveal(true);
          showMessage(ctx.el.feedback, "good", "All correct ✓", "The working is now in the Equations panel.");
          waitForNext();
        },
        onWrong: stepWrong,
      });
      body.appendChild(current.element);
    } else if (step === "answer") {
      const inputs = answerInputs(body, [].concat(stage.ask), solver.quantities(ws.setup));
      const check = () => {
        if (checkRows(inputs, ws.result, (q) => solver.mistakes(ws.setup, q), solver.texts && solver.texts.otherwise, ctx.record)) done(false);
        else {
          ws.sceneOpts.guesses = guessesFrom(inputs); // faint "shadow" of their answer
          ws.redraw();
          wrong([(solver.texts && solver.texts.wrong) || "The faint red dashed arrows show what your numbers would look like. Read the note under each red box, fix it, and check again."]);
        }
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
        delete ws.sceneOpts.guesses;
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
