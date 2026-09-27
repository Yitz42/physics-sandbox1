// Unit 5.2, stage 4 — debug: a student's inspection for zero-force members, one line wrong.
// The bridge with P at G (library/trusses.js): correct working —
//   Joint B: AB, BC in line ⇒ F_BF = 0;  Joint D: CD, DE in line ⇒ F_DH = 0;  count 2.
// Mistakes (one per version):
//   loaded    at G, "FG, GH in line ⇒ F_CG = 0" — but P acts at G, across that line (F_CG = −P)
//   support   at A, "only AB, AF ⇒ both zero" — but A is a support
//   notInLine at F, "AF, FG in line ⇒ F_CF = 0" — AF slants, FG is level
//   wrongOne  at B, "AB, BF in line ⇒ F_BC = 0" — the two in line are AB and BC

import { bridgeSetup, BRIDGE_VIEW } from "../library/trusses.js";

export default {
  id: "zero-force-members/4-debug",
  challenge: "debug",
  solver: "statics.truss",
  title: "Check the Inspection",
  mission: "Find the wrong line in a student's search for zero-force members.",
  instructions:
    "The bridge carries a load $P$ on its top chord at G. A student looked joint by joint for members that carry no force. One line of the working is wrong. Click it, then choose the fix.",
  setup: bridgeSetup("G"),
  view: BRIDGE_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 20 }],
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [
      { kind: "loaded", joint: "G", line: ["FG", "GH"], member: "CG" },
      { kind: "support", joint: "A" },
      { kind: "notInLine", joint: "F", line: ["AF", "FG"], member: "CF" },
      { kind: "wrongOne", joint: "B", line: ["AB", "BF"], member: "BC" },
    ],
  },
  hints: [
    "Each rule needs a joint with NO load and NO support. Check what acts at each joint the student used.",
    "\"In line\" means one straight line through the joint. Check the picture.",
    "In a three-member joint, the zero one is the member OFF the line.",
  ],
  explanation:
    "The rules only work at a joint where nothing but the members acts: a load or a support there can be what the odd member holds. " +
    "And the members \"in line\" must truly lie along one straight line through the joint.",
};
