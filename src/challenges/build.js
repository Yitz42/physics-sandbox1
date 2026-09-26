// build.js — design something that meets a goal with limited parts.
//
// Tests: can they design with it. The student adjusts the parts they're
// allowed to change (sliders / dragging), then presses Play. Results stay
// hidden until Play, so they have to reason rather than just wiggle sliders.
// Design problems have many right answers, so there's no "Show answer" —
// instead each Play explains what's still wrong.
//
// Stage fields used:
//   editable, draggable        what the student may change
//   goal: { text, check(result, setup) → { ok, message, flagged?: [ids] } }

import { createWorkspace } from "./common/workspace.js";
import { el, button } from "../ui/controls.js";
import { renderMixed } from "../render/panel.js";
import { showMessage } from "../ui/feedback.js";

export function mount(ctx) {
  const { stage } = ctx;
  const goal = stage.goal;
  let solved = false;
  let playing = false; // true while Play itself is updating the picture
  let ws = null;

  ws = createWorkspace(ctx, {
    editable: stage.editable,
    draggable: stage.draggable,
    equations: "live",
    reveal: false,
    sceneOpts: stage.sceneOpts,
    onChange: () => {
      // Any edit after Play hides the results again until the next Play.
      if (ws && ws.reveal && !solved && !playing) {
        ws.sceneOpts.flagged = [];
        ws.setReveal(false);
        ctx.el.feedback.innerHTML = "";
      }
    },
  });

  const goalBox = el("div", { className: "goal" }, [el("div", { className: "area-title", textContent: "Goal" })]);
  const goalText = el("div");
  renderMixed(goalText, goal.text);
  goalBox.appendChild(goalText);
  const play = button("▶ Play", onPlay, "btn btn-play");
  ctx.el.area.append(goalBox, el("div", { className: "actions" }, [play]));

  function onPlay() {
    playing = true;
    const out = goal.check(ws.result, ws.setup);
    ws.sceneOpts.flagged = out.flagged || [];
    ws.setReveal(true);
    playing = false;
    if (out.ok) {
      solved = true;
      showMessage(ctx.el.feedback, "good", "Goal met! ▶", out.message || "");
      ctx.explain();
      ctx.finish();
    } else {
      showMessage(ctx.el.feedback, "bad", "Not yet", out.message || "The goal isn't met yet. Adjust and press Play again.");
    }
  }
}
