// predict-first.js — a quick guess at the start of an explore stage, so students build
// intuition by committing to what they EXPECT before they see it (Predict–Observe–Explain).
// The owner chose this style, 2026-09-27: ONE question before the numbers show and the sliders
// unlock; once answered, the choices disappear and a single short line takes their place —
// the guess, the answer, and why — so it stays small while the student explores.
//   stage.guess: { prompt, options: [{ text, correct?, feedback? }], explain }
//     feedback: why a wrong choice is tempting but wrong;  explain: the idea, for a right guess
// Guesses are recorded (event "guess"), never scored: a wrong prediction is how intuition grows.

import { el, button } from "../../ui/controls.js";
import { renderMixed } from "../../render/panel.js";

// The question box. onDone() runs once the student has picked.
export function mountGuess(ctx, guess, onDone) {
  const box = el("div", { className: "guess-box" });
  const title = el("div", { className: "area-title", textContent: "First, your guess:" });
  const prompt = el("div", { className: "guess-prompt" });
  renderMixed(prompt, guess.prompt);
  const choices = el("div", { className: "guess-choices" });
  box.append(title, prompt, choices);
  guess.options.forEach((o) => {
    const b = button("", () => pick(o), "btn btn-choice guess-choice");
    renderMixed(b, o.text);
    choices.appendChild(b);
  });
  ctx.el.area.appendChild(box);

  function pick(o) {
    const right = guess.options.find((x) => x.correct);
    ctx.recordGuess({ q: "guess", ok: !!o.correct, sub: o.text, exp: right && right.text });
    // The choices go; one short line remains: the guess, the answer if it differs, and why.
    choices.remove();
    title.textContent = "Your guess:";
    const why = o.correct ? guess.explain || "" : o.feedback || guess.explain || "";
    const line = o.correct
      ? `✓ **${o.text}** — right. ${why}`
      : `✗ ${o.text} → the answer is **${right.text}**. ${why}`;
    const result = el("div", { className: `guess-result ${o.correct ? "good" : "surprise"}` });
    renderMixed(result, line);
    box.appendChild(result);
    onDone();
  }
  return box;
}
