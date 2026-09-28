// Unit 3.4, stage 4 — debug: one slip in a student's three equilibrium equations for the crate on
// three cables (library/particles3d.js, crateThreeCables): a sign, the weight left out, or a
// position-vector part used without dividing by the length.

import { use } from "../../../src/core/library.js";
import { crateThreeCables } from "../library/particles3d.js";

const s = use(crateThreeCables);

export default {
  id: "particles-3d/4-debug",
  challenge: "debug",
  solver: "statics.force3d",
  title: "Check the Three Equations",
  mission: "Find and fix the slip in a student's three equilibrium equations.",
  instructions: `${s.instructions} A student wrote the three equilibrium equations for ring A. One term is wrong — or missing.`,
  setup: s.setup,
  vary: s.vary,
  debug: {
    view: "equations",
    intro: "The student's equations:",
    mutations: [
      { kind: "sign", equation: "sumFz", term: "T_AC" },
      { kind: "missing", equation: "sumFz", term: "W" },
      { kind: "swap", equation: "sumFx", term: "T_AB" },
      { kind: "sign", equation: "sumFy", term: "T_AD" },
    ],
    missingChoices: [
      { id: "W", label: "The crate's weight W" },
      { id: "T_AB", label: "Cable AB's pull" },
      { id: "T_AC", label: "Cable AC's pull" },
      { id: "T_AD", label: "Cable AD's pull" },
    ],
    notes: {
      T_AB: "That term is right: its fraction is (the change in that coordinate from A to B) ÷ $r_{AB}$, with its sign.",
      T_AC: "That term is right: its fraction is (the change in that coordinate from A to C) ÷ $r_{AC}$, with its sign.",
      T_AD: "That term is right: its fraction is (the change in that coordinate from A to D) ÷ $r_{AD}$, with its sign.",
      W: "$W$ is right: the weight acts straight down, so it appears only in $\\Sigma F_z$, with a minus sign.",
    },
  },
  hints: [
    "Work out the three position vectors from the coordinates first, then check every term's fraction and sign against them.",
    "All three anchors are on the ceiling, above A: every cable pulls UP, so every cable's z-part is positive.",
    "Which forces belong in $\\Sigma F_z$? Every force with a vertical part — including the weight.",
  ],
  explanation:
    "Each term is a tension times the matching part of its unit vector, $\\Delta/r$, with the sign of $\\Delta$ (END minus START). The weight appears only in $\\Sigma F_z$. " +
    "One slip in any of the three equations spoils all three tensions, because they are solved together.",
};
