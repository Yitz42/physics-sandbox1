// Unit 3.5, stage 6 — solve, in two parts:
//   1. a pulley on a cable to coordinates, held by a level rope: FBD, equations, answers;
//   2. the heaviest crate two rated cables can hold: decide which cable limits, then solve.
// Hand checks in library/mixed-rings.js (pulleyByCoordinates, heaviestCrate).

import { use } from "../../../src/core/library.js";
import { pulleyByCoordinates, heaviestCrate } from "../library/mixed-rings.js";

export default {
  id: "particle-challenge/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "Pulleys and Limits",
  mission: "Solve two full equilibrium problems that need ideas from the whole chapter and Chapter 2.",
  explanation:
    "Every particle problem is the same two equations, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ — the skill is getting every force into them correctly: " +
    "directions from coordinates, both sides of a cable over a pulley, and, for a limit, which force is at its limit.",
  parts: [
    {
      ...use(pulleyByCoordinates, "solve"),
      title: "The pulley on coordinates",
      mission: "Find the cable tension and the rope's pull on a pulley, from coordinates.",
      explanation:
        "The coordinates give each side's direction, $\\mathbf{u} = \\mathbf{r}/r$; the pulley rule says both sides pull with the same $T$. " +
        "The rope is level, so $\\Sigma F_y = 0$ finds $T$ alone, and $\\Sigma F_x = 0$ then gives the rope's pull.",
    },
    {
      ...use(heaviestCrate, "solve"),
      title: "The heaviest crate",
      mission: "Find the heaviest crate two 500 N cables can hold.",
      explanation:
        "The tensions keep a fixed ratio set by the angles, so the steeper cable always reaches its rating first. Setting it to 500 N turns the weight into the unknown: " +
        "$\\Sigma F_x = 0$ gives the other tension (safely under 500 N), and $\\Sigma F_y = 0$ gives the heaviest $W$.",
    },
  ],
};
