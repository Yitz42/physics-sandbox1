// Unit 7.1, stage 6 — solve: the shear and bending moment inside a balcony beam, choosing
// the piece first (library/internal.js, balcony).
// Right piece (cut at 1.5 m): V = P + w(2.5) = 800 + 500 = 1300 N;  M = −(P(2.5) + w(2.5)²/2) = −2625 N·m.

import { use } from "../../../src/core/library.js";
import { balcony } from "../library/internal.js";

const s = use(balcony);

export default {
  id: "internal-forces/6-solve",
  challenge: "solve",
  solver: "statics.internal",
  title: "The Balcony Beam",
  mission: "Find the shear and bending moment inside a balcony beam.",
  instructions: `${s.instructions} Find the shear $V$ and bending moment $M$ where it's cut at C: choose a piece, write its equations, and solve.`,
  setup: s.setup,
  vary: s.vary,
  solve: {
    steps: ["choices", "equations", "answer"],
    choicesName: "Choose a piece",
    choices: [
      {
        title: "Which piece lets you find V and M WITHOUT first finding the wall's reactions?",
        options: [
          { tex: "\\text{the right piece (C to the free end)}", correct: true },
          { tex: "\\text{the left piece (the wall to C)}", kind: "concept", feedback: "The left piece works too — but the wall's $A_y$ and $M_A$ act on it, so you'd have to find them first. The right piece has no support on it." },
          { tex: "\\text{neither — you always need the reactions first}", kind: "concept", feedback: "Not when a piece has no support: the right piece carries only its loads and the internal forces." },
        ],
      },
    ],
    choicesDone: "The right piece: only P, the load on it, and V and M at C (V up, M clockwise, as positive on a right piece).",
    equationMode: "numeric",
    intros: { equations: "Choose the correct version of each of the right piece's equations." },
  },
  ask: [{ quantity: "V" }, { quantity: "M" }],
  hints: [
    "On a RIGHT piece's cut face, positive V points up and positive M is clockwise.",
    "The load on the right piece: $w$ times its length, at its middle.",
    "$\\Sigma M_C$: P and the load both bend the piece into a frown — M comes out negative.",
  ],
  explanation:
    "The free piece of a cantilever needs no reactions: $V = P + wL_{piece}$ and $M = -(P\\,L_{piece} + w\\tfrac{L_{piece}^2}{2})$. " +
    "M is negative (hogging): a balcony bends into a frown, most of all at the wall.",
};
