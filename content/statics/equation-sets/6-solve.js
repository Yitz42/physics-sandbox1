// Unit 5.3, stage 6 — solve: a loading ramp, from FBD to reactions, choosing the
// three equations first. The ramp and its hand check are in the lesson library
// (beams.js, loadingRamp): w = 200 N/m, P = 500 N on a 3-4-5 slope → B_y = 1000 N, A_y = 200 N, A_x = −300 N
// (new versions use other slopes and angles: the formulas are in beams.js),
// with ΣM_A (only B_y), ΣM_B (only A_y) and ΣF_x (only A_x).

import { use } from "../../../src/core/library.js";
import { loadingRamp, withSet } from "../library/beams.js";

const ramp = use(withSet(loadingRamp, [{ M: "A" }, { M: "B" }, { F: "x" }]));

export default {
  id: "equation-sets/6-solve",
  challenge: "solve",
  solver: "statics.rigidBody",
  title: "The Loading Ramp",
  mission: "Draw the ramp's FBD, choose three equations with one unknown each, and find the reactions.",
  instructions:
    `${ramp.instructions} Draw its free-body diagram, choose your three equations, then find the reactions ($A_x$ and $A_y$ positive right and up).`,
  setup: ramp.setup,
  view: ramp.view,
  vary: ramp.vary,
  solve: {
    steps: ["fbd", "choices", "equations", "answer"],
    choicesName: "Choose the equations",
    equationMode: "numeric",
    intros: {
      fbd: "Draw the free-body diagram: replace the pin and the roller with their reactions, and show **every** force on the ramp (the uniform load acts as its resultant $F_w$).",
      choices: "Plan before you write: you'll take moments about A (only $B_y$ is left) and about B (only $A_y$ is left). Which third equation finishes the job?",
      equations: "Choose the correct version of each of your three equations.",
    },
    choices: [
      {
        title: "With $\\Sigma M_A = 0$ and $\\Sigma M_B = 0$, the third equation is…",
        options: [
          { tex: "\\Sigma F_x = 0", correct: true },
          { tex: "\\Sigma F_y = 0", kind: "concept",
            feedback: "A and B are level with each other, so $\\Sigma F_y$ says nothing that $\\Sigma M_A$ and $\\Sigma M_B$ don't already say — and nothing would find $A_x$." },
          { tex: "\\Sigma M_C = 0 \\text{ (C, the ramp's end)}", kind: "concept",
            feedback: "A, B and C are all on the ramp's line, so a third moment about C adds nothing new. $A_x$ runs along that line: no moment about any of them finds it." },
        ],
      },
    ],
    choicesDone: "$\\Sigma F_x$ holds only $A_x$ (and $P$'s sideways part), so each of your three equations has one unknown.",
    candidates: [
      { id: "A_x" },
      { id: "A_y" },
      { id: "B_y", wrongDirection: "A roller can only **push** on the ramp: $B_y$ points up." },
      { id: "B_x", symbol: "B_x", at: "B", feedback: "The roller rolls freely sideways: it can only push straight up, $B_y$." },
      { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "A pin lets the ramp turn, so it can't hold a moment." },
    ],
  },
  ask: [{ quantity: "B_y", min: 0 }, { quantity: "A_y" }, { quantity: "A_x" }],
  hints: [
    "The uniform load acts as $F_w = w \\times 4$ m at the middle of AB. Split $P$ into a part to the right and a part down, from its slope triangle or angle.",
    "$\\Sigma M_A$: $B_y$ (4 m), $F_w$ (2 m) and $P$'s down part (6 m). $\\Sigma M_B$: $A_y$ (4 m, clockwise), $F_w$ (2 m, counterclockwise) and $P$'s down part (2 m, clockwise).",
    "$\\Sigma F_x$: $A_x$ plus $P$'s part to the right $= 0$. A negative $A_x$ means the pin pulls left.",
  ],
  explanation:
    "Moments about A found $B_y$, moments about B found $A_y$, and $\\Sigma F_x$ found $A_x$ — one unknown each, no simultaneous equations. " +
    "$\\Sigma F_y$ is left over as a free check: $A_y + B_y - F_w$ minus $P$'s down part $= 0$.",
};
