// Unit 2.3, stage 4 — debug: one wrong line in a student's working for a cable force from
// coordinates (library/forces3d.js, flagpoleCable). Correct (default): r_AB = {2 i − 3 j − 6 k} m,
// r_AB = 7 m, u_AB = {0.286 i − 0.429 j − 0.857 k}, T = 700 u_AB = {200 i − 300 j − 600 k} N.

import { use } from "../../../src/core/library.js";
import { flagpoleCable } from "../library/forces3d.js";

const s = use(flagpoleCable);

export default {
  id: "forces-3d/4-debug",
  challenge: "debug",
  solver: "statics.force3d",
  title: "Check the Cable",
  mission: "Find and fix the mistake in a student's cable force from coordinates.",
  instructions: `${s.instructions} A student worked out the cable's pull on the pole as a Cartesian vector. One line is wrong.`,
  setup: { ...s.setup, showComponents: false },
  vary: s.vary,
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "backwards" }, { slip: "noRoot" }, { slip: "sign" }, { slip: "noUnit" }],
  },
  hints: [
    "The position vector goes from the start of the line to its end: END minus START.",
    "Check each difference against the coordinates in the key, sign and all.",
    "A unit vector has length 1: its parts are all between −1 and 1.",
  ],
  explanation:
    "Four steps, each with one rule: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$; $r_{AB} = \\sqrt{x^2 + y^2 + z^2}$; $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$; $\\mathbf{T} = T\\,\\mathbf{u}_{AB}$. " +
    "A quick check: the force's components must point the way the cable goes from A — here toward the ground, so $T_z < 0$.",
};
