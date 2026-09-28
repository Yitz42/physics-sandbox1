// explore.js — free sandbox. Sliders and draggable arrows; equations update live.
//
// Tests: intuition. The stage can list small tasks ("make Fx negative") that
// tick off as the student discovers them; when all are ticked the stage is done.
//
// Stage fields used:
//   editable   slider/select specs            draggable  force ids with a drag handle
//   tasks      [{ text, check(values, setup, result) → true/false }]
//   sceneOpts  e.g. { components: true } to draw Fx and Fy
//   guess      a quick guess before the sliders unlock (style A, common/predict-first.js)
//   tasks[i].predict  predict which way a quantity goes before making the change (style B)

import { createWorkspace } from "./common/workspace.js";
import { el, button } from "../ui/controls.js";
import { renderMixed } from "../render/panel.js";
import { showMessage } from "../ui/feedback.js";
import { changeTally } from "./common/design.js";
import { mountGuess, mountTaskPrediction } from "./common/predict-first.js";
import { clone } from "../core/paths.js";

export function mount(ctx) {
  const { stage } = ctx;
  const tasks = stage.tasks || [];
  const done = new Set();
  // Style A: until the student has guessed, the numbers are hidden and the sliders locked.
  let guessing = !!stage.guess;
  if (guessing) {
    mountGuess(ctx, stage.guess, () => {
      guessing = false;
      ctx.el.controls.classList.remove("locked");
      ws.setReveal(true);
    });
    ctx.el.controls.classList.add("locked");
  }
  const list = el("ul", { className: "task-list" });
  const predictions = [];
  const items = tasks.map((t, i) => {
    const li = el("li", { className: "task" });
    const text = el("div");
    renderMixed(text, t.text);
    li.appendChild(text);
    // Style B: a one-tap prediction before the change (it counts only once predicted).
    if (t.predict) predictions[i] = mountTaskPrediction(ctx, li, t, i, () => clone(ws.setup), (id) => ws.result.values[id]);
    list.appendChild(li);
    return li;
  });
  if (tasks.length) ctx.el.area.append(el("div", { className: "area-title", textContent: "Challenge objectives:" }), list);

  let ws = null; // set just below; onChange runs once during creation, before ws exists
  let finished = false;
  // What the student changes, summed up in ONE record event (exploreAction)
  // when they finish or leave (see runner.js), instead of one per slider step.
  const tally = changeTally(stage, ctx.setup);
  ctx.exploreSummary = () => tally.summary();
  ws = createWorkspace(ctx, {
    editable: stage.editable,
    draggable: stage.draggable,
    equations: stage.guess ? "hidden" : "live",
    reveal: !stage.guess,
    sceneOpts: stage.sceneOpts,
    onChange: (result) => {
      if (ws) tally.note(ws.setup);
      // Tick off any task that is now true. Ticks stay, even if later untrue.
      if (guessing) return; // (nothing counts before the guess)
      tasks.forEach((t, i) => {
        const pr = predictions[i];
        if (pr && !pr.ready()) return; // predict first, then make the change
        let ok = false;
        try {
          ok = t.check(result.values, ws ? ws.setup : ctx.setup, result, pr && pr.before());
        } catch {
          ok = false;
        }
        if (ok && !done.has(i)) {
          done.add(i);
          items[i].classList.add("done");
          if (pr) pr.settle();
        }
      });
      // The solver's note (e.g. "It moves!") shows only while it applies.
      if (result.message) showMessage(ctx.el.feedback, "warn", statusTitle(result.status), result.message);
      else ctx.el.feedback.innerHTML = "";
      if (tasks.length && done.size === tasks.length && !finished) finish();
    },
  });

  function finish() {
    finished = true;
    ctx.finish({ message: tasks.length ? "All tasks done — nice exploring! Keep playing, or move on." : "" });
  }
  // Without tasks, the student decides when they've explored enough.
  if (!tasks.length) ctx.el.area.appendChild(button("I've explored enough ✓", () => !finished && finish(), "btn"));
  ws.update(); // re-run the task checks now that ws exists
}

function statusTitle(status) {
  return { unstable: "It moves!", indeterminate: "Statically indeterminate" }[status] || "Note";
}
