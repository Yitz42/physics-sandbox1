// predict-first.js — quick predictions in explore stages, so students build intuition by
// committing to what they EXPECT before they see it (the Predict–Observe–Explain cycle).
// Two styles (the owner is choosing between them, 2026-09-27):
//
//   A. "Guess first" (stage.guess): one question about the picture before the sliders unlock;
//      the numbers stay hidden until the student has guessed. ~10 seconds.
//        guess: { prompt, options: [{ text, correct?, feedback? }], explain }
//
//   B. "Predict each change" (task.predict): each objective asks, in one tap, which way a
//      quantity will go (up / down / stays the same) BEFORE the student makes the change;
//      when the change is made, the game shows what really happened next to the guess.
//        { text, predict: { watch: "F_AC", name: "the spring's force $F_{AC}$", explain },
//          check(values, setup, result, before) }   before: the setup when they predicted
//
// Guesses are recorded (event "guess"), never scored: a wrong prediction is how intuition grows.

import { el, button } from "../../ui/controls.js";
import { renderMixed } from "../../render/panel.js";
import { showMessage } from "../../ui/feedback.js";
import { format } from "../../core/units.js";

// Which way a quantity went: "up", "down" or "same" (within 0.5 % — rounding isn't a change).
export function trend(before, after) {
  const tol = 0.005 * Math.max(Math.abs(before), Math.abs(after), 1e-9);
  if (after > before + tol) return "up";
  if (after < before - tol) return "down";
  return "same";
}

const WORDS = { up: "goes up", down: "goes down", same: "stays the same" };
const ARROWS = { up: "↑", down: "↓", same: "=" };

// Style A: the question box. onDone() runs once the student has picked.
export function mountGuess(ctx, guess, onDone) {
  const box = el("div", { className: "guess-box" });
  const title = el("div", { className: "area-title", textContent: "Before you touch anything — your guess:" });
  const prompt = el("div", { className: "guess-prompt" });
  renderMixed(prompt, guess.prompt);
  const choices = el("div", { className: "guess-choices" });
  const said = el("div", { className: "guess-feedback" }); // (inside the box: it stays while they explore)
  box.append(title, prompt, choices, said);
  guess.options.forEach((o, i) => {
    const b = button("", () => pick(o, i), "btn btn-choice guess-choice");
    renderMixed(b, o.text);
    choices.appendChild(b);
  });
  ctx.el.area.appendChild(box);

  function pick(o, i) {
    const right = guess.options.find((x) => x.correct);
    [...choices.children].forEach((b, j) => {
      b.disabled = true;
      b.classList.toggle("selected", j === i);
      b.classList.toggle("is-right", guess.options[j] === right);
      b.classList.toggle("is-wrong", j === i && !o.correct);
    });
    ctx.recordGuess({ q: "guess", ok: !!o.correct, sub: o.text, exp: right && right.text });
    const head = o.correct ? "Good instinct ✓" : "Not quite — and that's fine";
    // (A wrong pick's own feedback already explains; a right one gets the general why.)
    const body = o.correct ? guess.explain || "" : o.feedback || guess.explain || "";
    onDone();
    showMessage(said, o.correct ? "good" : "info", head, `${body}\n\nNow test it: the numbers are showing and the sliders are yours.`);
  }
  return box;
}

// Style B: the tap-to-predict row inside one objective. Returns
//   { ready() → has the student predicted?, before (setup snapshot), settle(result) }
export function mountTaskPrediction(ctx, li, task, index, snapshot, valueOf) {
  const p = task.predict;
  const row = el("div", { className: "predict-row" });
  const ask = el("span", { className: "predict-ask" });
  renderMixed(ask, `First predict: ${p.name}…`);
  const taps = el("span", { className: "predict-taps" });
  const outcome = el("div", { className: "predict-outcome" });
  row.append(ask, taps);
  li.append(row, outcome);
  const state = { picked: null, before: null, start: null, done: false };
  for (const dir of ["up", "down", "same"]) {
    taps.appendChild(button(`${ARROWS[dir]} ${WORDS[dir]}`, () => {
      if (state.done) return;
      state.picked = dir;
      state.before = snapshot();
      state.start = valueOf(p.watch);
      [...taps.children].forEach((b) => b.classList.toggle("selected", b.textContent.endsWith(WORDS[dir])));
      li.classList.add("predicted");
    }, "btn btn-chip predict-tap"));
  }
  return {
    ready: () => state.picked != null,
    before: () => state.before,
    settle() {
      if (state.done || state.picked == null) return;
      state.done = true;
      const end = valueOf(p.watch);
      const went = trend(state.start, end);
      const ok = went === state.picked;
      [...taps.children].forEach((b) => (b.disabled = true));
      ctx.recordGuess({ q: `task ${index + 1}`, ok, sub: state.picked, exp: went });
      const unit = p.unit ?? "N";
      const nums = `${format(state.start, unit)} → ${format(end, unit)}`;
      const what = `${p.name} ${WORDS[went]} (${nums}).`;
      renderMixed(outcome, `${ok ? `✓ Right: ${what}` : `You said it ${WORDS[state.picked]} — in fact ${what}`} ${p.explain || ""}`);
      outcome.classList.add(ok ? "good" : "surprise");
    },
  };
}
