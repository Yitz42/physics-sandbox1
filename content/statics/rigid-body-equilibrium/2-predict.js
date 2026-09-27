// Unit 5.2, stage 2 — predict the reactions of an overhanging beam (with both
// loads, or just the end load) and of a cantilever. The beams come from the
// lesson library (content/statics/library/beams.js), where their hand checks are.
// (Same numbers as tests/statics/rigid-body.test.js.)

import { use } from "../../../src/core/library.js";
import { overhang, overhangEndLoad, cantilever } from "../library/beams.js";

export default {
  id: "rigid-body-equilibrium/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "Predict the Reactions",
  mission: "Predict the support reactions, using the smartest moment point.",
  instructions: "Predict the support reactions. (Each version is a different beam.)",
  // Each beam's "reactions" question: its words, what's asked, numbers and hints.
  situations: [overhang, overhangEndLoad, cantilever].map((s) => use(s, "reactions")),
  hints: [],
  explanation:
    "For each beam, taking moments about the support with the most unknowns leaves ONE unknown in $\\Sigma M$: $B_y$ for the overhanging beam, $M_A$ for the cantilever. " +
    "$\\Sigma F_y = 0$ then gives the vertical reaction at A. A distributed load acts, for these equations, like its resultant: its area at its centroid.",
};
