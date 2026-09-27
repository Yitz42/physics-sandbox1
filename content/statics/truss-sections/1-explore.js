// Unit 5.3, stage 1 — explore: cut the Pratt bridge, keep one part, and choose the
// moment point; watch which cut members each equation holds.
// The bridge and its hand checks are in the lesson library (library/trusses.js), P at C:
//   left cut (FG, CF, BC):  about C → only F_FG (= −P);  about F → only F_BC (= +P/2);  about B → F_FG and F_CF
//   right cut (GH, CH, CD): about C → only F_GH (= −P);  about H → only F_CD (= +P/2)
//   "cut" GH, DH, DE: misses CH, which still joins the parts — not a section.
// F_FG = F_GH = −P: they push with more than 1500 N once P > 1500 N.

import { bridgeSetup, BRIDGE_VIEW, LEFT_CUT, RIGHT_CUT } from "../library/trusses.js";

const cut = (label, c) => ({ label, set: { "section.members": c.members, "section.keep": c.keep } });
const about = (J, note = "") => ({ label: `${J}${note}`, set: { "section.about": J } });

export default {
  id: "truss-sections/1-explore",
  challenge: "explore",
  solver: "statics.truss",
  title: "Cut It in Two",
  mission: "Cut the truss and pick the moment point that leaves one member force.",
  instructions:
    "A Pratt bridge carries a load $P$ at C. Choose where to **cut** it: the part kept is drawn solid, and each cut member pulls on it (tension assumed). " +
    "Then choose the point to take moments about, and watch which member forces each equation holds (under the equations). The support reactions are found first, from the whole truss.",
  setup: { ...bridgeSetup("C"), section: { ...LEFT_CUT, about: "B" }, showSectionUnknowns: true, showReactions: "always", knownReactions: true },
  view: BRIDGE_VIEW,
  editable: [
    { label: "Cut through", options: [cut("FG, CF, BC — keep the left part", LEFT_CUT), cut("GH, CH, CD — keep the right part", RIGHT_CUT), cut("GH, DH, DE — keep the right end", { members: ["GH", "DH", "DE"], keep: "E" })] },
    { label: "Take moments about", options: ["A", "B", "C", "F", "G", "H", "D", "E"].map((J) => about(J)) },
    { path: "forces.#P.magnitude", label: "Size of P", min: 400, max: 2000, step: 50, unit: "N" },
  ],
  tasks: [
    { text: "Choose a moment point where $\\Sigma M$ holds just **one** member force.", check: (v) => v.secOk === 1 && v.secM === 1 },
    { text: "Try a cut that **doesn't** split the truss in two.", check: (v) => v.secOk === 0 },
    { text: "Get $F_{GH}$ alone from one moment equation.", check: (v, s, r) => v.secOk === 1 && v.secM === 1 && r.sectionUnknowns[2][0] === "F_GH" },
    { text: "Make the top chord in your cut push with more than **1500 N**.", check: (v, s) => v.secOk === 1 && ((s.section.members.includes("FG") && v.F_FG < -1500) || (s.section.members.includes("GH") && v.F_GH < -1500)) },
  ],
  hints: [
    "A member force has no moment about a point on its own line. Where do two of the cut members meet?",
    "The left cut's members FG and CF meet at F; CF and BC meet at C.",
    "A section must cut EVERY member joining the two parts: look for one the cut misses.",
  ],
  explanation:
    "Cutting through three members exposes their forces as the only unknowns of either part. About the joint where two of them meet, only the third has a moment: " +
    "about C, $\\Sigma M_C$ gives $F_{FG}$ straight away; about F it gives $F_{BC}$. The cut must separate the truss completely — a member left joining the parts carries an unknown force too.",
};
