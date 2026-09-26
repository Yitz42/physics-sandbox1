// concept-check.js — multiple choice, with an explanation after.
//
// Tests: do they understand WHY. Every wrong option has its own feedback
// explaining the misconception behind it.
//
// Stage fields used:
//   questions: [{ prompt, options: [{ text, correct?, feedback }], explanation,
//                 setup?  (optional picture for this question), fixedOrder? }]
//   required:  how many questions must be answered correctly (default 3)
//
// Questions come from a pool in shuffled order. After "Show answer" the
// question is swapped for a different one from the pool (a new version).

import { createWorkspace } from "./common/workspace.js";
import { createAttempts } from "./common/attempts.js";
import { el, button } from "../ui/controls.js";
import { renderMixed } from "../render/panel.js";
import { showMessage } from "../ui/feedback.js";

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mount(ctx) {
  const { stage } = ctx;
  const pool = stage.questions;
  const required = Math.min(stage.required || 3, pool.length);
  // ctx.memory survives "new versions", so progress through the pool is kept.
  const mem = ctx.memory;
  if (!mem.order) Object.assign(mem, { order: shuffle(pool.map((_, i) => i)), pos: 0, correct: 0 });

  const progress = el("div", { className: "cc-progress" });
  const prompt = el("div", { className: "cc-prompt" });
  const choices = el("div", { className: "choice-list" });
  const actions = el("div", { className: "actions" });
  ctx.el.area.append(progress, prompt, choices, actions);
  let attempts = null;

  function current() {
    return pool[mem.order[mem.pos % mem.order.length]];
  }

  function show() {
    const q = current();
    progress.textContent = `Question ${mem.correct + 1} of ${required}`;
    renderMixed(prompt, q.prompt);
    choices.innerHTML = "";
    actions.innerHTML = "";
    ctx.el.feedback.innerHTML = "";
    ctx.el.explanation.innerHTML = "";
    // A picture helps many questions; hide the figure when there isn't one.
    const setup = q.setup || ctx.setup;
    ctx.el.figure.hidden = !setup;
    if (setup) createWorkspace({ ...ctx, setup }, { equations: "never", reveal: !!q.reveal, sceneOpts: q.sceneOpts || stage.sceneOpts });
    attempts = createAttempts(ctx, actions, reveal);
    const opts = q.fixedOrder ? q.options : shuffle(q.options);
    for (const o of opts) {
      const b = el("button", { type: "button", className: "btn btn-choice" });
      b.option = o; // remember which option this button is, for "Show answer"
      renderMixed(b, o.text);
      b.onclick = () => choose(o, b);
      choices.appendChild(b);
    }
  }

  function lock() {
    choices.querySelectorAll("button").forEach((b) => (b.disabled = true));
  }

  function choose(o, b) {
    if (o.correct) {
      const q = current();
      b.classList.add("is-right");
      lock();
      mem.correct++;
      mem.pos++;
      showMessage(ctx.el.feedback, "good", "Correct ✓", q.explanation || "");
      actions.innerHTML = "";
      if (mem.correct >= required) {
        ctx.finish();
      } else {
        actions.appendChild(button("Next question →", show, "btn"));
      }
    } else {
      b.classList.add("is-wrong");
      b.disabled = true;
      showMessage(ctx.el.feedback, "bad", "Not quite", o.feedback || "Think about what the question is really asking.");
      attempts.wrong();
    }
  }

  // "Show answer": reveal it, explain, then swap in a different question.
  function reveal() {
    const q = current();
    lock();
    [...choices.children].forEach((b) => b.option.correct && b.classList.add("is-right"));
    showMessage(ctx.el.feedback, "info", "Here's the answer", q.explanation || "");
    mem.pos++; // this question is replaced by a new one from the pool
    ctx.finish();
  }

  show();
}
