// confidence.js — an optional "Sure / Not sure" tap before checking an answer
// (predict and solve). The choice goes on the next check in the learning
// record (cf), so later analysis can tell confident mistakes from guesses.
//
// Off for now: set ASK_CONFIDENCE to true to show it.

import { el, button } from "./controls.js";

export const ASK_CONFIDENCE = false;

// Returns { element (null when switched off), reset() } — reset after each
// check, so every check gets its own answer (or none).
export function confidencePicker(ctx) {
  if (!ASK_CONFIDENCE) return { element: null, reset() {} };
  const choices = [["sure", "Sure"], ["notSure", "Not sure"]];
  const buttons = choices.map(([value, label]) => {
    const b = button(label, () => {
      // Tapping the chosen one again takes it back.
      ctx.setConfidence(ctx.confidence === value ? null : value);
      paint();
    }, "toggle-btn");
    b.value = value;
    return b;
  });
  const paint = () => buttons.forEach((b) => b.classList.toggle("on", b.value === ctx.confidence));
  const element = el("div", { className: "confidence" }, [
    el("span", { className: "confidence-label", textContent: "How sure are you? (optional)" }),
    el("div", { className: "toggle", role: "group" }, buttons),
  ]);
  return {
    element,
    reset() {
      ctx.confidence = null;
      paint();
    },
  };
}
