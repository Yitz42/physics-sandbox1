// Unit 6.2, stage 1 — explore: move the load around a Pratt bridge and watch which
// members carry nothing (grey), with the inspection working under the equations.
// The bridge and its hand checks are in the lesson library (library/trusses.js):
//   P at C, F or H: BF, DH and CG are zero (3);  P at B: DH and CG (2);  P at D: BF and CG (2);
//   P at G: BF and DH (2), and CG pushes with P.   With P at C, F_FG = −P (> 1500 N push once P > 1500 N).

import { bridgeSetup, BRIDGE_VIEW } from "../library/trusses.js";

const at = (label, joint) => ({ label, set: { "forces.#P.joint": joint, "forces.#P.push": ["F", "G", "H"].includes(joint) } });

export default {
  id: "zero-force-members/1-explore",
  challenge: "explore",
  solver: "statics.truss",
  title: "Members That Do Nothing",
  mission: "Find where the load leaves members carrying nothing — and see why.",
  instructions:
    "A Pratt bridge truss is pinned at A and rests on a roller at E. Choose the joint that carries the load $P$. " +
    "Grey members carry **no force**; under the equations, the working shows how each one is spotted by looking at a single joint.",
  setup: { ...bridgeSetup("D"), showZero: true }, // (starts at D: no task done yet)
  view: BRIDGE_VIEW,
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "At an unloaded joint, three members meet: two in a straight line and a third off to the side. **The third one carries…**",
    options: [
      { text: "nothing", correct: true },
      { text: "the same as the other two", feedback: "Across the straight line, the third member is the ONLY force: with nothing to balance it, it must be zero." },
      { text: "half the load", feedback: "The joint has no load — and across the line, nothing could balance the third member's pull." },
    ],
    explain: "Sum the forces across the straight line: only the third member has a part there, so it must be zero.",
  },
  editable: [
    { label: "Load P at joint", options: [at("B — bottom, left", "B"), at("C — bottom, middle", "C"), at("D — bottom, right", "D"), at("F — top, left", "F"), at("G — top, middle", "G"), at("H — top, right", "H")] },
    { path: "forces.#P.magnitude", label: "Size of P", min: 400, max: 2000, step: 50, unit: "N" },
  ],
  tasks: [
    { text: "Put the load where **three** members carry nothing.", check: (v) => v.zeroCount === 3 },
    { text: "Make the middle vertical CG carry force.", check: (v) => Math.abs(v.F_CG) > 1 },
    { text: "Make the vertical BF carry force.", check: (v) => Math.abs(v.F_BF) > 1 },
    { text: "With three members idle, make the top chord FG push with more than **1500 N**.", check: (v) => v.zeroCount === 3 && v.F_FG < -1500 },
  ],
  hints: [
    "Look at joint B: AB and BC lie in one straight line. If nothing else acts at B, what can balance BF?",
    "A load at a joint stops the rule there: it acts across the line, so the third member must hold it.",
    "With P at C, the top chord pushes with exactly $P$. Make $P$ big enough.",
  ],
  explanation:
    "At an unloaded joint where two members are in line, the third has nothing to balance its pull or push across that line — so it carries nothing. " +
    "Which members are idle depends on where the load is: a load at a joint makes the member off the line hold it. That's why idle members stay in the truss.",
};
