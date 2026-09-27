// attempts.js — the "Show answer" rule, shared by every challenge with a
// right answer (predict, debug, concept-check, solve).
//
// The rule (decided by the course owner):
//   • Unlimited tries. Each wrong try gets specific feedback.
//   • After 2 wrong tries a "Show answer" button appears.
//   • Showing the answer marks the stage "needs practice", and the student
//     is given a NEW version of the problem (different numbers) to solve on
//     their own. Only solving a version without help completes the stage.

import { button } from "../../ui/controls.js";

const TRIES_BEFORE_REVEAL = 2;

// holder: element where the button goes
// onReveal(): show the answer (the challenge decides how)
// question() (optional): which question the answer is shown for, for the
//   learning record (e.g. "T_AB,T_AC", "fbd", "question 3"); "*" = the whole round
export function createAttempts(ctx, holder, onReveal, question = () => "*") {
  let wrong = 0;
  let btn = null;
  const a = {
    get wrongCount() {
      return wrong;
    },
    // Call after every wrong try.
    wrong() {
      wrong++;
      if (wrong >= TRIES_BEFORE_REVEAL && !btn && !ctx.revealed) {
        btn = button("Show answer", () => a.reveal(), "btn btn-quiet");
        holder.appendChild(btn);
      }
    },
    // Reset for a new step (the solve challenge has several).
    resetCount() {
      wrong = 0;
      if (btn) btn.remove();
      btn = null;
    },
    reveal() {
      if (btn) btn.remove();
      btn = null;
      ctx.markRevealed(question()); // stage becomes "needs practice" (internal record only)
      ctx.el.feedback.innerHTML = ""; // the red "Not yet" box no longer applies
      onReveal();
    },
  };
  return a;
}
