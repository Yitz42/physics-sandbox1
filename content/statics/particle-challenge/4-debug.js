// Unit 3.5, stage 4 — debug: a student's FBD of the pulley on a cable to coordinates
// (library/mixed-rings.js, pulleyByCoordinates) has one mistake: a side of the cable missing
// (the pulley idea), or an arrow pointing the wrong way.

import { use } from "../../../src/core/library.js";
import { pulleyByCoordinates } from "../library/mixed-rings.js";

const s = use(pulleyByCoordinates);

export default {
  id: "particle-challenge/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "The Pulley on Coordinates",
  mission: "Find the mistake in a student's free-body diagram of a pulley on a cable to coordinates.",
  instructions: `${s.instructions} A student drew the free-body diagram of the pulley (right) and wrote its equations. Compare it with the real setup (left) and find the mistake.`,
  setup: s.setup,
  vary: s.vary,
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "remove", force: "T_AB" },
      { kind: "reverse", force: "T_AD" },
      { kind: "remove", force: "T_AC" },
      { kind: "reverse", force: "T_AC" },
    ],
    missingChoices: [
      { id: "T_AB", label: "The cable's pull toward B, with the same tension T" },
      { id: "T_AC", label: "The cable's pull toward C, with the same tension T" },
      { id: "W", label: "The weight W of the crate" },
      { id: "r", label: "The position vector r_AB", feedback: "$\\mathbf{r}_{AB}$ is in metres: it only gives the direction of the cable's pull. It isn't a force on the pulley." },
    ],
    notes: {
      T_AB: "That pull is right: the cable pulls the pulley toward B, along $\\mathbf{r}_{AB}$, with tension $T$.",
      T_AC: "That pull is right: the cable pulls the pulley toward C, along $\\mathbf{r}_{AC}$, with the same tension $T$.",
      T_AD: "$T_{AD}$ is drawn correctly: rope AD pulls the pulley toward D.",
      W: "$W$ is drawn correctly: the crate's weight pulls straight down.",
    },
  },
  hints: [
    "Count the cable's pulls on the pulley: it comes from B, wraps over the pulley, and leaves toward C.",
    "Every cable and rope pulls AWAY from the pulley, toward its anchor: $\\mathbf{r} = \\mathbf{r}_{anchor} - \\mathbf{r}_A$.",
    "Coordinates don't change the pulley rule: two pulls, both with tension $T$.",
  ],
  explanation:
    "Coordinates give each side's direction, but the FBD still follows Chapter 3's rules: the cable over the pulley pulls TWICE with the same $T$, and every cable pulls away from the point toward its anchor.",
};
