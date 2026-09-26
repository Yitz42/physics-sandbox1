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
  if (tasks.length) ctx.el.area.append(el("div", { className: "area-title", textContent: "Try to:" }), list);

  let ws = null; // set just below; onChange runs once during creation, before ws exists
  let finished = false;
  ws = createWorkspace(ctx, {
    editable: stage.editable,
    draggable: stage.draggable,
    equations: "live",
    reveal: true,
    sceneOpts: stage.sceneOpts,
    onChange: (result) => {
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
      if (result.message) showMessage(ctx.el.feedback, "warn", statusTitle(result.status), result.message);
      else if (done.size < tasks.length || !tasks.length) ctx.el.feedback.innerHTML = "";
      if (tasks.length && done.size === tasks.length && !finished) finish();
    },
  });

  function finish() {
    finished = true;
    showMessage(ctx.el.feedback, "good", "All tasks done!", "Nice exploring. Keep playing, or move on to the next stage.");
    ctx.finish();
  }
  // Without tasks, the student decides when they've explored enough.
  if (!tasks.length) ctx.el.area.appendChild(button("I've explored enough ✓", () => !finished && finish(), "btn"));
  ws.update(); // re-run the task checks now that ws exists
}

function statusTitle(status) {
  return { unstable: "It moves!", indeterminate: "Statically indeterminate" }[status] || "Note";
}
