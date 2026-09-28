// Unit 4.7, stage 4 — debug: one wrong line in a student's r × F for the rope on the pipe
// (library/moments3d.js, pipeAndRope): r backwards, F × r, the j term's minus lost, or a
// component paired with the wrong parts.

import { use } from "../../../src/core/library.js";
import { pipeAndRope } from "../library/moments3d.js";

const s = use(pipeAndRope);

export default {
  id: "moments-3d/4-debug",
  challenge: "debug",
  solver: "statics.force3d",
  title: "Check the Cross Product",
  mission: "Find and fix the wrong line in a student's r × F.",
  instructions: `${s.instructions} A student worked out the rope's moment about O. One line is wrong.`,
  setup: { ...s.setup, showR: false },
  vary: s.vary,
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "jSign" }, { slip: "order" }, { slip: "backwards" }, { slip: "pairing" }],
  },
  hints: [
    "Check r first: from O to B, END minus START.",
    "The determinant's rows: i j k, then r, then F — in that order.",
    "Expand it: $M_x = r_y F_z - r_z F_y$, $M_y = -(r_x F_z - r_z F_x)$, $M_z = r_x F_y - r_y F_x$.",
  ],
  explanation:
    "Four places to slip, each with one rule: r goes from the moment point to the force; the order is $\\mathbf{r} \\times \\mathbf{F}$; the j term has a minus; each part pairs r with the OTHER two parts of F.",
};
