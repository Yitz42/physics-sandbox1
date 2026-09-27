// Unit 6.4, stage 4 — debug: one mistake in a student's equations for leg BC of the ladder.
// The ladder with the load on top (library/frames.js, ladderTop); B_y = P/2 is found first.
// Leg BC (forces on it: B_y up at B; the pin's −C_x, −C_y at C; the crossbar's pull at E, toward D):
//   ΣF_x: −C_x − F_DE = 0     ΣF_y: B_y − C_y = 0     ΣM_C: 2B_y − 2F_DE = 0   (B_y's arm: 2 m, not 4.47 m)

import { use } from "../../../src/core/library.js";
import { ladderTop } from "../library/frames.js";

const s = use(ladderTop);

export default {
  id: "frames/4-debug",
  challenge: "debug",
  solver: "statics.frame",
  title: "Check Leg BC",
  mission: "Find and fix the mistake in a student's equations for one leg.",
  instructions:
    `${s.instructions} A student took leg BC apart (with $B_y$ already found from the whole ladder) and wrote its three equations. One term is wrong. Click it, then choose the fix.`,
  setup: { ...s.setup, body: "BC", knownReactions: true, showReactions: "always" },
  view: s.view,
  vary: s.vary,
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's equations for leg BC ($C_x$, $C_y$ are the pin's forces on leg AC):",
    mutations: [
      { equation: "BC_x", kind: "sign", term: "C_x",
        explain: "$C_x$ is the pin's push on leg AC. On leg BC the pin pushes the OPPOSITE way — Newton's third law — so it enters BC's equations as $-C_x$." },
      { equation: "BC_M", kind: "missing", term: "F_DE",
        explain: "The crossbar pulls on leg BC at E, 2 m below C: its moment about C belongs in $\\Sigma M_C$." },
      { equation: "BC_M", kind: "swap", term: "B_y",
        explain: "$B_y$ is vertical, so its moment arm about C is the sideways distance from C to B, 2 m — not the 4.47 m straight along the leg." },
      { equation: "BC_y", kind: "sign", term: "C_y",
        explain: "On leg BC the pin's vertical force is the reverse of the one on AC: $-C_y$." },
    ],
  },
  hints: [
    "The pin's forces on BC are the REVERSE of $C_x$ and $C_y$ (which act on AC).",
    "Every force on BC belongs: the floor's push, the pin's two forces, and the crossbar's pull.",
    "A moment arm is the perpendicular distance from C to the force's line of action.",
  ],
  explanation:
    "Taking a frame apart, each shared pin appears twice: $C_x$, $C_y$ on one body, $-C_x$, $-C_y$ on the other. Write each body's equations with ALL the forces on it — the pins, the links and the reactions — and the moment arms measured perpendicular to each force.",
};
