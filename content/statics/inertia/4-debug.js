// Unit 10.1, stage 4 — debug: one wrong line in a student's working for a T-beam's Ī_x.
// Correct (default flange 150 × 20 on a web 20 × 180): ȳ = 135.45 mm; web 9.72 + 7.438; flange 0.1 + 8.926
//   → Ī_x = 26.18 ×10⁶ mm⁴ (library/sections.js).

import { use } from "../../../src/core/library.js";
import { tBeam } from "../library/sections.js";

const tee = use(tBeam, "tee");

export default {
  id: "inertia/4-debug",
  challenge: "debug",
  solver: "statics.inertia",
  title: "Check the T-Beam",
  mission: "Find and fix the mistake in a student's moment-of-inertia working.",
  instructions: "A T-beam's section (mm). A student worked out its moment of inertia $\\bar{I}_x$ about the horizontal axis through its centroid (ȳ measured from the bottom). One line is wrong.",
  setup: tee.setup,
  vary: [
    { path: "section.b", values: [120, 135, 150, 165, 180] },
    { path: "section.hw", values: [150, 165, 180] },
    { path: "section.tf", values: [15, 20] },
    { path: "section.tw", values: [15, 20] },
  ],
  debug: {
    view: "steps",
    intro: "The student's working (Ī in mm⁴):",
    mutations: [{ slip: "noTransfer" }, { slip: "baseD" }, { slip: "third" }, { slip: "swapBH" }],
  },
  hints: [
    "Is each part's Ī about its OWN centroid ($bh^3/12$), with h its vertical size?",
    "What is d measured from?",
    "Does the total include every part's $A d^2$?",
  ],
  explanation:
    "Each rectangle: $\\bar{I} = bh^3/12$ about its own centroid (h vertical), then $+A d^2$ with $d = \\tilde{y} - \\bar{y}$ to the section's centroid. " +
    "The total is the sum of both for every part.",
};
