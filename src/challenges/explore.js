// explore.js — free sandbox. Sliders and draggable arrows; equations update live.
//
// Tests: intuition. The stage can list small tasks ("make Fx negative") that
// tick off as the student discovers them; when all are ticked the stage is done.
//
// Stage fields used:
//   editable   slider/select specs            draggable  force ids with a drag handle
//   tasks      [{ text, check(values, setup, result) → true/false }]
//   sceneOpts  e.g. { components: true } to draw Fx and Fy

import { createWorkspace } from "./common/workspace.js";
import { el, button } from "../ui/controls.js";
import { renderMixed } from "../render/panel.js";
import { showMessage } from "../ui/feedback.js";
import { changeTally } from "./common/design.js";

export function mount(ctx) {
  const { stage } = ctx;
  const tasks = stage.tasks || [];
  const done = new Set();
  const list = el("ul", { className: "task-list" });
  const items = tasks.map((t) => {
    const li = el("li", { className: "task" });
    renderMixed(li, t.text);
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
    equations: "live",
    reveal: true,
    sceneOpts: stage.sceneOpts,
    onChange: (result) => {
      if (ws) tally.note(ws.setup);
      // Tick off any task that is now true. Ticks stay, even if later untrue.
      tasks.forEach((t, i) => {
        let ok = false;
        try {
          ok = t.check(result.values, ws ? ws.setup : ctx.setup, result);
        } catch {
          ok = false;
        }
        if (ok && !done.has(i)) {
          done.add(i);
          items[i].classList.add("done");
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
