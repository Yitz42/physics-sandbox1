// Unit 5.4, stage 6 — solve: the ladder with a load hanging from leg AC (library/frames.js,
// ladderLeg). B_y is found first from the whole ladder (B_y = 0.375P). Then leg BC:
//   ΣM_C: 2B_y − 2F_DE = 0 → F_DE = B_y;  ΣF_x: −C_x − F_DE = 0 → C_x = −F_DE;  ΣF_y: B_y − C_y = 0 → C_y = B_y
//   (P = 800: F_DE = 300 N, C_x = −300 N, C_y = 300 N)

import { use } from "../../../src/core/library.js";
import { ladderLeg } from "../library/frames.js";

const s = use(ladderLeg);

export default {
  id: "frames/6-solve",
  challenge: "solve",
  solver: "statics.frame",
  title: "Leg by Leg",
  mission: "Take leg BC apart, draw its FBD, and find the crossbar's pull and the pin's forces.",
  instructions:
    `${s.instructions} The floor's push $B_y$ has been found from the whole ladder. Take leg BC apart, draw its free-body diagram, choose its equations, and find $F_{DE}$ (tension positive) ` +
    "and the pin's forces $C_x$, $C_y$ — as they act on leg AC (positive right and up).",
  setup: { ...s.setup, body: "BC", knownReactions: true, showReactions: "always" },
  view: s.view,
  vary: s.vary,
  solve: {
    steps: ["choices", "fbd", "equations", "answer"],
    choicesName: "Spot the two-force member",
    choices: [
      {
        title: "Which member is a **two-force member** (one force, along itself)?",
        options: [
          { tex: "DE\\ \\text{(the crossbar)}", correct: true },
          { tex: "AC", kind: "concept", feedback: "AC is loaded at A, D, F and C — four points. It's a multi-force member: it bends." },
          { tex: "BC", kind: "concept", feedback: "BC is loaded at B, E and C — three points, not two. It's a multi-force member." },
        ],
      },
    ],
    choicesDone: "The crossbar pulls (or pushes) along DE: one unknown, $F_{DE}$, acting level at E.",
    equationMode: "numeric",
    intros: {
      fbd: "Draw the free-body diagram of leg BC alone: the floor's push (already found), the pin's two forces at C, and the crossbar's force at E.",
      equations: "Choose the correct version of each of leg BC's equations (moments about C).",
    },
    candidates: [
      { id: "B_y" },
      { id: "C_x" },
      { id: "C_y" },
      { id: "F_DE" },
      { id: "P_leg", symbol: "P", at: "C", feedback: "$P$ hangs from leg AC, not BC. On BC's diagram only the forces ON BC appear — AC's load reaches BC through the pin and the crossbar." },
      { id: "A_y", symbol: "A_y", at: "C", feedback: "$A_y$ acts on leg AC at A. It isn't a force on BC." },
    ],
  },
  ask: [{ quantity: "F_DE" }, { quantity: "C_x" }, { quantity: "C_y" }],
  hints: [
    "On BC: $B_y$ up at B; at C the pin pushes with $-C_x$, $-C_y$ (the reverse of its push on AC); at E the crossbar pulls toward D.",
    "Moments about C: $B_y$ acts 2 m to the side, the crossbar 2 m below. $\\Sigma M_C$: $2B_y - 2F_{DE} = 0$.",
    "Then $\\Sigma F_x$: $-C_x - F_{DE} = 0$ and $\\Sigma F_y$: $B_y - C_y = 0$.",
  ],
  explanation:
    "Leg BC carries no load of its own, so it's the easy leg: about C only $B_y$ and the crossbar have moments, giving $F_{DE}$. The pin's forces then balance the rest — " +
    "and remember they're equal and opposite: $C_x$ comes out negative because the pin pushes leg AC to the LEFT (and leg BC to the right).",
};
