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
export function createAttempts(ctx, holder, onReveal) {
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
      ctx.markRevealed(); // stage becomes "needs practice"
      onReveal();
    },
  };
  return a;
}
