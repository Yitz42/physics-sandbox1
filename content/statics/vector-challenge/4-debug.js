// Unit 2.4, stage 4 — debug: working backwards to the rope tensions on the boat
// (library/backwards.js, boatRopes), one slip in the student's equations. The fractions come
// from coordinates, so the slips are: the two fractions swapped (x ↔ y), a sign, a missing term.

import { use } from "../../../src/core/library.js";
import { boatRopes } from "../library/backwards.js";

const s = use(boatRopes);

export default {
  id: "vector-challenge/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "Check the Rope Equations",
  mission: "Find and fix the slip in a student's equations for two rope tensions.",
  instructions: `${s.instructions} A student set up the two equations for the unknown tensions $T_{AB}$ and $T_{AC}$. One term is wrong.`,
  setup: s.setup,
  vary: s.vary,
  debug: {
    view: "equations",
    intro: "The student's equations (the resultant is along +x, so $F_{Rx} = F_R$ and $F_{Ry} = 0$):",
    mutations: [
      { kind: "swap", equation: "Rx", term: "T_AC" },
      { kind: "sign", equation: "Ry", term: "T_AC" },
      { kind: "swap", equation: "Ry", term: "T_AB" },
      { kind: "sign", equation: "Rx", term: "T_AB" },
    ],
    notes: {
      T_AB: "That term is right in this equation. $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$: its x-part over $r_{AB}$ goes in x, its y-part over $r_{AB}$ in y.",
      T_AC: "That term is right in this equation. $\\mathbf{r}_{AC} = \\mathbf{r}_C - \\mathbf{r}_A$: C is below A, so the y-part is negative.",
    },
  },
  hints: [
    "Work out $\\mathbf{r}_{AB}$ and $\\mathbf{r}_{AC}$ yourself from the coordinates, then compare each fraction.",
    "The x-equation uses the x-parts ($x_B - x_A$), the y-equation the y-parts.",
    "Signs come from the coordinates: C is BELOW A, so rope AC pulls down.",
  ],
  explanation:
    "Working backwards uses exactly the same equations as adding forces — only the unknowns have moved. Each term still needs the right fraction and the right sign, " +
    "and with coordinates both come straight from $\\mathbf{r} = \\mathbf{r}_{end} - \\mathbf{r}_{start}$. A slip in either equation gives wrong values for BOTH tensions, because they're solved together.",
};
