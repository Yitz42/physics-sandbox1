// Unit 5.2, stage 6 — solve: the bridge with P at C (library/trusses.js). First spot
// the zero-force members (BF, CG, DH), then solve joint A, then use B.
//   A_y = P/2 (found first, shown). Joint A: ΣF_y: A_y + (1/√2)F_AF = 0 → F_AF = −0.7071P;
//   ΣF_x: A_x + F_AB + (1/√2)F_AF = 0 (A_x = 0) → F_AB = +P/2.
//   Joint B: F_BF = 0, so F_BC = F_AB = +P/2.   (P = 1200: −848.5, 600, 600 N)

import { bridgeSetup, BRIDGE_VIEW } from "../library/trusses.js";

export default {
  id: "zero-force-members/6-solve",
  challenge: "solve",
  solver: "statics.truss",
  title: "Idle Members First",
  mission: "Spot the zero-force members, then find the forces in AF, AB and BC.",
  instructions:
    "The Pratt bridge carries a load $P$ hanging at C, and its support reactions are already found. Spot the zero-force members first, then draw joint A's free-body diagram, " +
    "choose its equations and find $F_{AF}$ and $F_{AB}$ — and then $F_{BC}$ (tension positive).",
  setup: { ...bridgeSetup("C"), joint: "A", knownReactions: true, showReactions: "always", showZero: "reveal" },
  view: BRIDGE_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 20 }],
  solve: {
    steps: ["choices", "fbd", "equations", "answer"],
    choicesName: "Spot the idle members",
    choices: [
      {
        title: "Which members carry **no force** under this load?",
        options: [
          { tex: "BF,\\ CG\\ \\text{and}\\ DH", correct: true },
          { tex: "BF\\ \\text{and}\\ DH\\ \\text{only}", kind: "concept", feedback: "Look at G too: FG and GH are in line, and no load acts at G — so CG carries nothing either." },
          { tex: "CG\\ \\text{only}", kind: "concept", feedback: "B and D follow the same rule as G: two members in line (the bottom chord) and nothing else, so BF and DH carry nothing too." },
          { tex: "CF\\ \\text{and}\\ CH", kind: "concept", feedback: "The diagonals meet at C, where the load hangs: they're what holds it up. Look for unloaded joints with two members in line." },
        ],
      },
    ],
    choicesDone: "BF, CG and DH carry nothing. At B, that means $F_{BC} = F_{AB}$ — which you'll get from joint A.",
    intros: {
      fbd: "Draw the free-body diagram of joint A: every member that meets there pulls on it (tension assumed), and the pin's reactions (already found) act on it.",
      equations: "Choose joint A's two equations.",
    },
    candidates: [
      { id: "F_AB" },
      { id: "F_AF" },
      { id: "A_x" },
      { id: "A_y" },
      { id: "F_BF", symbol: "F_{BF}", at: "A", feedback: "BF runs from B up to F: it doesn't touch joint A. Only AB and AF meet at A." },
      { id: "P", symbol: "P", at: "A", feedback: "The load hangs at C, not at A. At A, it's felt only through the members and the reaction." },
    ],
  },
  ask: [{ quantity: "F_AF" }, { quantity: "F_AB" }, { quantity: "F_BC" }],
  hints: [
    "At A: $A_y = P/2$ up, $A_x = 0$; AF slopes at 45° up to F; AB runs level to B.",
    "ΣF_y at A: $A_y + \\tfrac{1}{\\sqrt{2}}F_{AF} = 0$. Then ΣF_x: $F_{AB} + \\tfrac{1}{\\sqrt{2}}F_{AF} = 0$.",
    "At B, BF is a zero-force member and AB, BC are in line: so $F_{BC} = F_{AB}$.",
  ],
  explanation:
    "Spotting BF, CG and DH first means joint B needs no work at all: $F_{BC} = F_{AB}$. Joint A gives $F_{AF}$ (compression — the end post pushes) and $F_{AB}$ (tension — the bottom chord pulls).",
};
