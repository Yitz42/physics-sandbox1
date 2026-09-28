// Unit 9.2, stage 6 — solve: a crate pulled by a rope tied to its top front corner, at 30° above the level.
// Default 500 N, 1.0 m cube, μs = 0.5 (library/tipping.js, "crate pulled by a rope at its top").
// Equations (P unknown): ΣF_y: N + P sin 30° − W = 0;  ΣF_x: F + P cos 30° = 0;  ΣM_O: −N x − P cos 30°(1.0) + W(0.5) = 0.
//   slip: F = −μs N → P cos 30° = 0.5(500 − P sin 30°) → P = 250 / 1.1160 = 224.0 N
//   tip:  x = 0 → P cos 30°(1.0) = 500(0.5) → P = 288.7 N  → it slips first, at 224.0 N.
// Also the tall crate pushed level 1.2 m up (slip 240 N, tip 200 N: it tips first).
// Versions: the library's.

import { use } from "../../../src/core/library.js";
import { ropeCrate, tallCrate } from "../library/tipping.js";

const HINTS = [
  "Across the floor: N balances the weight, less any upward part of the pull ($P\\sin\\alpha$ for a rope at angle α).",
  "Moments about O: N acts $x$ behind O; friction acts along the floor, through O. The pull's level part has an arm equal to its height; a rope's upward part acts straight above O.",
  "Slipping: $F = \\mu_s N$ (against the pull) — solve for P. Tipping: $x = 0$ — solve $\\Sigma M_O$ for P. The smaller one happens first.",
];

export default {
  id: "tipping/6-solve",
  challenge: "solve",
  solver: "statics.friction",
  title: "The Rope on the Crate",
  mission: "Write the three equations for a crate pulled by a rope, then find whether it slips or tips first.",
  // (Two pictures: a rope at the top corner, and a level push high on a tall crate. The FBD shows
  // from the start, with N, F and x unknown.)
  situations: [
    use(ropeCrate, "which", {
      instructions: "A crate on a rough floor is pulled by a rope tied to its top front corner, at an angle above the level. O is its front bottom corner, right under the rope. " +
        "Choose its equations — $N$ acting a distance $x$ behind O — then find the pull that slips it, the pull that tips it, and the pull at which it first moves.",
      setup: { ...ropeCrate.setup, showFbd: "unknowns" }, hints: HINTS }),
    use(tallCrate, "which", {
      instructions: "A tall crate on a rough floor is pushed level, high up. O is its front bottom corner. " +
        "Choose its equations — $N$ acting a distance $x$ behind O — then find the push that slips it, the push that tips it, and the push at which it first moves.",
      setup: { ...tallCrate.setup, showFbd: "unknowns" }, hints: HINTS }),
  ],
  solve: {
    steps: ["equations", "answer"],
    equationMode: "symbolic",
    intros: {
      equations: "Choose the correct equation in each group. The moments are about O, the corner the crate would tip over.",
    },
  },
  explanation:
    "Pulling up at an angle lightens the crate on the floor (less friction to overcome) — but pulling from the top gives the rope a long arm about O. " +
    "Work out both limits: the smaller pull is where the crate first moves. A wider crate, or a lower rope, makes tipping harder.",
};
