// Unit 4.8, stage 4 — debug: one wrong line in a student's moment about the crank shaft
// (library/moments3d.js, crankOnShaft): the whole |M_O| used, u not a unit vector, u backwards, or
// the j term's minus lost in r × F.

import { use } from "../../../src/core/library.js";
import { crankOnShaft } from "../library/moments3d.js";

const s = use(crankOnShaft);

export default {
  id: "moment-about-axis/4-debug",
  challenge: "debug",
  solver: "statics.force3d",
  title: "Check the Triple Product",
  mission: "Find and fix the wrong line in a student's moment about an axis.",
  instructions: `${s.instructions} A student worked out the moment of $F$ about the shaft. One line is wrong.`,
  setup: s.setup,
  vary: s.vary,
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "wholeM" }, { slip: "noUnit" }, { slip: "axisBackwards" }, { slip: "mSign" }],
  },
  hints: [
    "Check $\\mathbf{r} \\times \\mathbf{F}$ first — especially the j part.",
    "$\\mathbf{u}_a$ must have length 1 and point from O to A.",
    "$M_a$ is a dot product, not the size of $\\mathbf{M}_O$.",
  ],
  explanation:
    "Moment about an axis = the moment about a point on it, dotted with a UNIT vector along it (pointing the way the axis is given). Each step has its own classic slip.",
};
